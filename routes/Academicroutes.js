import express from "express";
import { handleAcademicImageUpload } from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";
import {
  createAcademic,
  getAcademics,
  updateAcademic,
  deleteAcademic,
} from "../controllers/academicController.js";

const router = express.Router();

router.post("/", protect, handleAcademicImageUpload, createAcademic);
router.get("/", getAcademics); // public — ?school=mmhss&section=excellence
router.put("/:id", protect, handleAcademicImageUpload, updateAcademic);
router.delete("/:id", protect, deleteAcademic);

export default router;