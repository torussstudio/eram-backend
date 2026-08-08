import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  submitHostEvent,
  getHostEvents,
  getHostEventById,
  updateHostEventStatus,
  deleteHostEvent,
} from "../controllers/hostEventController.js";

const router = express.Router();

router.post("/", submitHostEvent); // public — modal submits here
router.get("/", protect, getHostEvents); // admin listing
router.get("/:id", protect, getHostEventById); // admin single view
router.patch("/:id/status", protect, updateHostEventStatus); // admin status update
router.delete("/:id", protect, deleteHostEvent); // admin delete

export default router;