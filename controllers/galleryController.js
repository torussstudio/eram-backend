import cloudinary from "../config/cloudinary.js";
import Gallery from "../models/Gallery.js";
import fs from "fs";
import path from "path";

const streamUpload = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "eram-gallery" },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    stream.end(buffer);
  });

export const uploadImage = async (req, res) => {
  try {
    const { title, category, type, aspect } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image required" });

    let imageUrl;
    let publicId;
    let finalAspect = aspect;

    if (process.env.CLOUDINARY_API_KEY) {
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
      publicId = result.public_id;

      if (!finalAspect && result.width && result.height) {
        const ratio = result.width / result.height;
        finalAspect = ratio > 1.15 ? "landscape" : ratio < 0.85 ? "portrait" : "square";
      }
    } else {
      // Local fallback
      const ext = path.extname(req.file.originalname) || ".jpg";
      const filename = `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const dir = path.join(process.cwd(), "public", "uploads", "gallery");
      
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

imageUrl = `${backendBaseUrl}/uploads/gallery/${filename}`;
      publicId = filename; // use filename as identifier for deletion
    }

    const newImage = await Gallery.create({
      title,
      category,
      type,
      image: imageUrl,
      publicId: publicId,
      aspect: finalAspect || "landscape",
    });

    res.status(201).json(newImage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getImages = async (req, res) => {
  try {
    const { category, type } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (type && type !== "all") filter.type = type;

    const images = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLatestByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const images = await Gallery.find({ category }).sort({ createdAt: -1 }).limit(4);
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const img = await Gallery.findById(req.params.id);
    if (!img) return res.status(404).json({ message: "Not found" });

    // Only attempt Cloudinary delete if the key is present and publicId doesn't look like local file
    if (process.env.CLOUDINARY_API_KEY && img.publicId && !img.publicId.startsWith("gallery-")) {
      await cloudinary.uploader.destroy(img.publicId);
    } else {
      // Local deletion fallback
      const filepath = path.join(process.cwd(), "public", "uploads", "gallery", img.publicId);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await img.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};