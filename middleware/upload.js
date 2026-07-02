// import multer from "multer";

// const storage = multer.memoryStorage();
// const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// // Hero section — single image field named "image"
// export const handleHeroImageUpload = upload.single("image");

// // Gallery — also single image field named "image"
// // export const handleGalleryImageUpload = upload.single("image");
// export const handleGalleryImageUpload = (req, res, next) => {
//   upload.single("image")(req, res, (err) => {
//     next(err);
//   });
// };

// // Downloads — single PDF field named "file"
// export const handleDownloadFileUpload = (req, res, next) => {
//   upload.single("file")(req, res, (err) => {
//     console.log("=== DOWNLOAD UPLOAD DEBUG ===");
//     console.log("Multer error:", err);
//     console.log("req.file:", req.file);
//     console.log("req.body:", req.body);
//     next(err);
//   });
// };

// export default upload;

import multer from "multer";
import path from "path";
import { isAllowedExtension, ALLOWED_EXTENSIONS } from "../utils/fileTypes.js";

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Hero section — single image field named "image"
export const handleHeroImageUpload = upload.single("image");

// Gallery — also single image field named "image"
export const handleGalleryImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    next(err);
  });
};

// Downloads — single file field named "file"
// Allows PDF, PNG, JPEG, DOC/DOCX, XLS/XLSX (see utils/fileTypes.js)
const downloadUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB — doc/xlsx files can be bigger than a PDF
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!isAllowedExtension(ext)) {
      return cb(
        new Error(
          `File type ${ext || "unknown"} not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`
        )
      );
    }
    cb(null, true);
  },
});

export const handleDownloadFileUpload = (req, res, next) => {
  downloadUpload.single("file")(req, res, (err) => {
    console.log("=== DOWNLOAD UPLOAD DEBUG ===");
    console.log("Multer error:", err);
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    next(err);
  });
};

export default upload;