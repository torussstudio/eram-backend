import mongoose from "mongoose";

const hostEventSchema = new mongoose.Schema(
  {
    // Section 1: Your Details
    fullName: { type: String, required: true, trim: true },
    organisation: { type: String, trim: true }, // optional
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, trim: true }, // Individual / Teacher-Coach / Institution Admin / Event Organiser / Other

    // Section 2: Event Details
    eventName: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true }, // Tournament / Sports Meet / Training-Coaching / ...
    sport: { type: String, required: true, trim: true }, // Football / Basketball / ...
    expectedParticipants: { type: Number, required: true },
    expectedAudience: { type: Number }, // optional

    // Section 3: Preferred Schedule
    preferredDate: { type: Date, required: true },
    alternativeDate: { type: Date }, // optional
    startTime: { type: String, required: true }, // "HH:mm" from <input type="time">
    endTime: { type: String, required: true },
    duration: {
      type: String,
      enum: ["one-day", "multi-day", "recurring"],
      default: "one-day",
    },
    endDate: { type: Date }, // required only when duration === "multi-day" (validated in controller)

    // Section 4: Venue Requirements
    facilities: [{ type: String, trim: true }], // multi-select checkboxes, at least one required
    additionalDetails: { type: String, trim: true }, // optional

    // Section 5: Additional Information
    hearAboutUs: { type: String, trim: true }, // optional
    specificRequests: { type: String, trim: true }, // optional

    agree: { type: Boolean, required: true },

    // Admin workflow
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("HostEvent", hostEventSchema);


