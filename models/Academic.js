import mongoose from "mongoose";

const academicSchema = new mongoose.Schema(
  {
    school: {
      type: String,
      enum: ["mmhss", "mmps", "amlp", "mmite"],
      required: true,
    },
    section: {
      type: String,
      enum: ["benchmark", "excellence", "stat"],
      required: true,
    },

    // ── Benchmark fields ──────────────────────────
    tag: { type: String }, // benchmark tag / excellence tag e.g. "National Level · Sports"
    title: { type: String }, // benchmark title / excellence student name
    desc: { type: String }, // benchmark desc / excellence achievement line

    // ── Excellence fields ─────────────────────────
    sub: { type: String }, // e.g. "Grade 11"
    image: { type: String },
    publicId: { type: String },

    // ── Stat fields ────────────────────────────────
    value: { type: String }, // e.g. "50"
    unit: { type: String }, // e.g. "+"
    label: { type: String }, // e.g. "Blood Donations Annually under NSS Program"

    // ── Display order (lower shows first) ─────────
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Academic", academicSchema);