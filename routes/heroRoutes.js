import express from "express";
import {
  getHero,
  updateHero,
  uploadSlideImage,
   fixImageUrls, 
} from "../controllers/heroController.js";
import { handleHeroImageUpload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getHero);
router.put("/", updateHero);
router.post("/upload-image", handleHeroImageUpload, uploadSlideImage);
router.post("/fix-urls", fixImageUrls);

export default router;