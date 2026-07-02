// import mongoose from "mongoose";

// const downloadSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     category: {
//       type: String,
//       enum: ["prospectus", "forms", "circulars", "policies"],
//       required: true,
//     },
//     institution: {
//       type: String,
//       enum: ["general", "ease", "mmhss", "mmite", "mmps", "amlp"],
//       default: "general",
//     },
//     fileType: { type: String, default: "PDF" },
//     fileUrl: { type: String, required: true },
//     publicId: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Download", downloadSchema);

import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["prospectus", "forms", "circulars", "policies"],
      required: true,
    },
    institution: {
      type: String,
      enum: ["general", "ease", "mmhss", "mmite", "mmps", "amlp"],
      default: "general",
    },
    fileType: { type: String, default: "PDF" }, // display label: PDF, PNG, JPEG, DOC, DOCX, XLS, XLSX
    fileExtension: { type: String, required: true, default: ".pdf" }, // used to build correct filename + Content-Type on download
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Download", downloadSchema);