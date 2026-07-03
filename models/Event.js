import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["academic", "sports", "cultural", "notice"],
      required: true,
    },
    type: {
      type: String,
      enum: ["event", "notification", "circular"],
      required: true,
    },
    institution: {
      type: String,
      enum: ["general", "ease", "mmhss", "mmite", "mmps", "amlp"],
      default: "general",
    },
    date: { type: Date, required: true },
    tag: { type: String },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);