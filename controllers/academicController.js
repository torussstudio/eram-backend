import cloudinary from "../config/cloudinary.js";
import Academic from "../models/Academic.js";
import fs from "fs";
import path from "path";

const streamUpload = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "eram-academics" },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    stream.end(buffer);
  });

const saveLocalFile = (buffer, originalname) => {
  const ext = path.extname(originalname) || ".jpg";
  const filename = `academic-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "academics");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);

  const backendBaseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.BACKEND_URL
      : `http://localhost:${process.env.PORT || 5000}`;

  if (!backendBaseUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  return {
    url: `${backendBaseUrl}/uploads/academics/${filename}`,
    publicId: filename,
  };
};

const deleteStoredImage = async (publicId) => {
  if (!publicId) return;

  if (process.env.CLOUDINARY_API_KEY && !publicId.startsWith("academic-")) {
    await cloudinary.uploader.destroy(publicId);
  } else {
    const filepath = path.join(process.cwd(), "public", "uploads", "academics", publicId);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
};

// ── CREATE ─────────────────────────────────────────────────────
export const createAcademic = async (req, res) => {
  try {
    const { school, section, tag, title, desc, sub, value, unit, label, order } = req.body;

    if (!school || !section) {
      return res.status(400).json({ message: "school and section are required" });
    }

    if (section === "excellence" && !req.file) {
      return res.status(400).json({ message: "Image required for Excellence entries" });
    }

    let imageUrl;
    let publicId;

    if (req.file) {
      if (process.env.CLOUDINARY_API_KEY) {
        const result = await streamUpload(req.file.buffer);
        imageUrl = result.secure_url;
        publicId = result.public_id;
      } else {
        const saved = saveLocalFile(req.file.buffer, req.file.originalname);
        imageUrl = saved.url;
        publicId = saved.publicId;
      }
    }

    const entry = await Academic.create({
      school,
      section,
      tag,
      title,
      desc,
      sub,
      image: imageUrl,
      publicId,
      value,
      unit,
      label,
      order: order ?? 0,
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── READ (public) ─────────────────────────────────────────────
export const getAcademics = async (req, res) => {
  try {
    const { school, section } = req.query;
    const filter = {};
    if (school) filter.school = school;
    if (section) filter.section = section;

    const entries = await Academic.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE ─────────────────────────────────────────────────────
export const updateAcademic = async (req, res) => {
  try {
    const entry = await Academic.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Not found" });

    const { tag, title, desc, sub, value, unit, label, order } = req.body;

    if (tag !== undefined) entry.tag = tag;
    if (title !== undefined) entry.title = title;
    if (desc !== undefined) entry.desc = desc;
    if (sub !== undefined) entry.sub = sub;
    if (value !== undefined) entry.value = value;
    if (unit !== undefined) entry.unit = unit;
    if (label !== undefined) entry.label = label;
    if (order !== undefined) entry.order = order;

    // Replace image if a new file was uploaded
    if (req.file) {
      await deleteStoredImage(entry.publicId);

      if (process.env.CLOUDINARY_API_KEY) {
        const result = await streamUpload(req.file.buffer);
        entry.image = result.secure_url;
        entry.publicId = result.public_id;
      } else {
        const saved = saveLocalFile(req.file.buffer, req.file.originalname);
        entry.image = saved.url;
        entry.publicId = saved.publicId;
      }
    }

    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE ─────────────────────────────────────────────────────
export const deleteAcademic = async (req, res) => {
  try {
    const entry = await Academic.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Not found" });

    if (entry.image && entry.publicId) {
      await deleteStoredImage(entry.publicId);
    }

    await entry.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};