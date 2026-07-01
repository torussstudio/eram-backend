import cloudinary from "../config/cloudinary.js";
import Download from "../models/Download.js";
import fs from "fs";
import path from "path";

const streamUpload = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "eram-downloads", resource_type: "raw" },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    stream.end(buffer);
  });

export const uploadDownload = async (req, res) => {
  try {
    const { title, description, category, institution } = req.body;
    if (!req.file) return res.status(400).json({ message: "File required" });

    let fileUrl;
    let publicId;

    if (process.env.CLOUDINARY_API_KEY) {
      const result = await streamUpload(req.file.buffer);
      fileUrl = result.secure_url;
      publicId = result.public_id;
    } else {
      // Local fallback
      const ext = path.extname(req.file.originalname) || ".pdf";
      const filename = `download-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const dir = path.join(process.cwd(), "public", "uploads", "downloads");

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filepath = path.join(dir, filename);
      fs.writeFileSync(filepath, req.file.buffer);

      const backendBaseUrl =
        process.env.NODE_ENV === "production"
          ? process.env.BACKEND_URL
          : `http://localhost:${process.env.PORT || 5000}`;

      if (!backendBaseUrl) {
        throw new Error("BACKEND_URL is not configured");
      }

      fileUrl = `${backendBaseUrl}/uploads/downloads/${filename}`;
      publicId = filename;
    }

    const newDownload = await Download.create({
      title,
      description,
      category,
      institution: institution || "general",
      fileType: "PDF",
      fileUrl,
      publicId,
    });

    res.status(201).json(newDownload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDownloads = async (req, res) => {
  try {
    const { category, institution } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (institution && institution !== "all") filter.institution = institution;

    const downloads = await Download.find(filter).sort({ createdAt: -1 });
    res.json(downloads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDownload = async (req, res) => {
  try {
    const doc = await Download.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (process.env.CLOUDINARY_API_KEY && doc.publicId && !doc.publicId.startsWith("download-")) {
      await cloudinary.uploader.destroy(doc.publicId, { resource_type: "raw" });
    } else {
      const filepath = path.join(process.cwd(), "public", "uploads", "downloads", doc.publicId);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await doc.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};