import express from "express";
import { handleGalleryImageUpload } from "../middleware/upload.js";
import {
  uploadImage,
  getImages,
  getLatestByCategory,
  deleteImage,
} from "../controllers/galleryController.js";

const router = express.Router();

router.post("/", handleGalleryImageUpload, uploadImage);
router.get("/", getImages);
router.get("/latest/:category", getLatestByCategory);
router.delete("/:id", deleteImage);

export default router;