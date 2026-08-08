import HostEvent from "../models/HostEvent.js";

// Public — submitted from the "Host an Event" modal on the frontend
export const submitHostEvent = async (req, res) => {
  try {
    const {
      fullName,
      organisation,
      email,
      phone,
      role,
      eventName,
      eventType,
      sport,
      expectedParticipants,
      expectedAudience,
      preferredDate,
      alternativeDate,
      startTime,
      endTime,
      duration,
      endDate,
      facilities,
      additionalDetails,
      hearAboutUs,
      specificRequests,
      agree,
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: "Missing required contact details" });
    }
    if (!eventName || !eventType || !sport || !expectedParticipants) {
      return res.status(400).json({ message: "Missing required event details" });
    }
    if (!preferredDate || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required schedule details" });
    }
    if (duration === "multi-day" && !endDate) {
      return res.status(400).json({ message: "End date is required for multi-day events" });
    }
    if (!Array.isArray(facilities) || facilities.length === 0) {
      return res.status(400).json({ message: "Select at least one facility" });
    }
    if (!agree) {
      return res.status(400).json({ message: "Consent to be contacted is required" });
    }

    const newRequest = await HostEvent.create({
      fullName,
      organisation,
      email,
      phone,
      role,
      eventName,
      eventType,
      sport,
      expectedParticipants,
      expectedAudience: expectedAudience || undefined,
      preferredDate,
      alternativeDate: alternativeDate || undefined,
      startTime,
      endTime,
      duration: duration || "one-day",
      endDate: duration === "multi-day" ? endDate : undefined,
      facilities,
      additionalDetails,
      hearAboutUs,
      specificRequests,
      agree,
    });

    res.status(201).json({
      success: true,
      message: "Your event request has been submitted successfully",
      data: newRequest,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Protected — admin dashboard listing
export const getHostEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const requests = await HostEvent.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Protected — admin view single request
export const getHostEventById = async (req, res) => {
  try {
    const request = await HostEvent.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Protected — admin updates status (pending/reviewed/approved/rejected)
export const updateHostEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await HostEvent.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });

    request.status = status;
    await request.save();

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Protected — admin deletes a request
export const deleteHostEvent = async (req, res) => {
  try {
    const request = await HostEvent.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });

    await request.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};