import HostEvent from "../models/Hostevent.js";
import { sendMail } from "../services/mailService.js";

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

    try {
      const mailResult = await sendMail({
        to: process.env.MAIL_TO || process.env.SMTP_USER,
        subject: `New Host Event Request — ${eventName}`,
        replyTo: email,
        text: `
New Host Event Request

Name: ${fullName}
Organisation: ${organisation || "-"}
Email: ${email}
Phone: ${phone}
Role: ${role || "-"}

Event: ${eventName}
Type: ${eventType}
Sport: ${sport}
Expected Participants: ${expectedParticipants}
Expected Audience: ${expectedAudience || "-"}

Preferred Date: ${preferredDate}
Alternative Date: ${alternativeDate || "-"}
Start Time: ${startTime}
End Time: ${endTime}
Duration: ${duration || "one-day"}

Facilities:
${facilities.join(", ")}

Additional Details:
${additionalDetails || "-"}

Hear About Us:
${hearAboutUs || "-"}

Specific Requests:
${specificRequests || "-"}
        `,
      });

      console.log(
        "Host event notification email sent:",
        mailResult.messageId
      );
    } catch (mailError) {
      console.error("Host event notification email failed:", mailError.message);
    }

        // Send confirmation email to the person who submitted the request
    try {
      const confirmationMailResult = await sendMail({
        to: email,
        subject: `Thank You for Your Event Request — ${eventName}`,
        replyTo: process.env.MAIL_FROM || process.env.SMTP_USER,
        text: `
Dear ${fullName},

Thank you for contacting ERAM Education regarding "${eventName}".

We have successfully received your event request and our team will review the details shortly.

Our team will get in touch with you soon to discuss your requirements, availability, and further arrangements.

Request Details:
Event: ${eventName}
Sport: ${sport}
Preferred Date: ${preferredDate}
Start Time: ${startTime}
End Time: ${endTime}

Thank you for your interest in ERAM Education.

Regards,
ERAM Education
        `.trim(),
      });

      console.log(
        "Host event confirmation email sent to user:",
        confirmationMailResult.messageId
      );
    } catch (confirmationMailError) {
      console.error(
        "Host event confirmation email failed:",
        confirmationMailError.message
      );
    }

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
