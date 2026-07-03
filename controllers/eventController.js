import Event from "../models/Event.js";

// "isNew" is computed, not stored — true if created within the last 7 days
const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const withComputed = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  const isNew = Date.now() - new Date(obj.createdAt).getTime() < NEW_WINDOW_MS;
  return { ...obj, isNew };
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, category, type, institution, date, tag, isPinned } =
      req.body;

    if (!title || !description || !category || !type || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newEvent = await Event.create({
      title,
      description,
      category,
      type,
      institution: institution || "All Institutions",
      date,
      tag,
      isPinned: isPinned === true || isPinned === "true",
    });

    res.status(201).json(withComputed(newEvent));
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
      "tag",
      "isPinned",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) event[f] = req.body[f];
    });

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

    await event.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};