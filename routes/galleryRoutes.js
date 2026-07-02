// import express from "express";
// import { handleGalleryImageUpload } from "../middleware/upload.js";
// import {
//   uploadImage,
//   getImages,
//   getLatestByCategory,
//   deleteImage,
// } from "../controllers/galleryController.js";

// const router = express.Router();

// router.post("/", handleGalleryImageUpload, uploadImage);
// router.get("/", getImages);
// router.get("/latest/:category", getLatestByCategory);
// router.delete("/:id", deleteImage);

// export default router;

import express from "express";
import { handleGalleryImageUpload } from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";
import {
  uploadImage,
  getImages,
  getLatestByCategory,
  deleteImage,
} from "../controllers/galleryController.js";

const router = express.Router();

router.post("/", protect, handleGalleryImageUpload, uploadImage);
router.get("/", getImages); // public
router.get("/latest/:category", getLatestByCategory); // public
router.delete("/:id", protect, deleteImage);

export default router;