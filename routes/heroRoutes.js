import express from "express";
import {
  getHero,
  updateHero,
  uploadSlideImage,
  fixImageUrls,
} from "../controllers/heroController.js";
import { handleHeroImageUpload } from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getHero); // public — website displays this
router.put("/", protect, updateHero);
router.post("/upload-image", protect, handleHeroImageUpload, uploadSlideImage);
router.post("/fix-urls", protect, fixImageUrls);

export default router;