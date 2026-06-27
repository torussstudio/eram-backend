import mongoose from "mongoose";

const slideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },

    titleLine1: {
      type: String,
      required: true,
    },

    titleLine2: {
      type: String,
      required: true,
    },

    subline: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    primaryButton: {
      text: String,
      link: String,
    },

    secondaryButton: {
      text: String,
      link: String,
    },
  },
  { _id: false }
);

const heroSchema = new mongoose.Schema(
  {
    slides: [slideSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Hero", heroSchema);