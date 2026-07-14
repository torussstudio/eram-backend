import cloudinary from "../config/cloudinary.js";
import Event from "../models/Event.js";
import fs from "fs";
import path from "path";

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const withComputed = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  const isNew = Date.now() - new Date(obj.createdAt).getTime() < NEW_WINDOW_MS;
  return { ...obj, isNew };
};

const streamUpload = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "eram-events" },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    stream.end(buffer);
  });

export const createEvent = async (req, res) => {
  try {
    const { title, description, category, type, institution, date, time, tag, isPinned } =
      req.body;

    if (!title || !description || !category || !type || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await Event.create({
      title,
      description,
      category,
      type,
      institution: institution || "general",
      date,
      time: type === "event" ? time || undefined : undefined,
      tag,
      isPinned: isPinned === true || isPinned === "true",
      // image/publicId come from the separate /upload-image step, sent in body once uploaded
      image: type === "event" ? req.body.image || undefined : undefined,
      publicId: type === "event" ? req.body.publicId || undefined : undefined,
    }).then((newEvent) => res.status(201).json(withComputed(newEvent)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { category, type } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (type && type !== "all") filter.type = type;

    const events = await Event.find(filter).sort({ date: -1 });
    res.json(events.map(withComputed));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Not found" });

    const fields = [
      "title",
      "description",
      "category",
      "type",
      "institution",
      "date",
      "time",
      "tag",
      "isPinned",
      "image",
      "publicId",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) event[f] = req.body[f];
    });

    // switched back to notification → drop any leftover image/time reference
    if (event.type === "notification") {
      event.image = undefined;
      event.publicId = undefined;
      event.time = undefined;
    }

    await event.save();
    res.json(withComputed(event));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Not found" });

    if (event.publicId) {
      if (process.env.CLOUDINARY_API_KEY && !event.publicId.startsWith("event-")) {
        await cloudinary.uploader.destroy(event.publicId);
      } else {
        const filepath = path.join(process.cwd(), "public", "uploads", "events", event.publicId);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    }

    await event.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadEventImageHandler = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    let imageUrl;
    let publicId;

    if (process.env.CLOUDINARY_API_KEY) {
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
      publicId = result.public_id;
    } else {
      // Local fallback — same shape as galleryController's fallback
      const ext = path.extname(req.file.originalname) || ".jpg";
      const filename = `event-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const dir = path.join(process.cwd(), "public", "uploads", "events");

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

      imageUrl = `${backendBaseUrl}/uploads/events/${filename}`;
      publicId = filename;
    }

    res.status(201).json({ image: imageUrl, publicId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};