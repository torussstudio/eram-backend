import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["trust", "mmhss", "mmps", "amlp", "mmite", "ease"],
      required: true,
    },
    type: {
      type: String,
      enum: ["general", "sports", "cultural", "social", "academic"],
      required: true,
    },
    image: { type: String, required: true },
    publicId: { type: String, required: true },
    aspect: {
      type: String,
      enum: ["portrait", "landscape", "square"],
      default: "landscape",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);