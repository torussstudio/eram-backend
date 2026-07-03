// import express from "express";
// import protect from "../middleware/authMiddleware.js";
// import {
//   createEvent,
//   getEvents,
//   updateEvent,
//   deleteEvent,
// } from "../controllers/eventController.js";

// const router = express.Router();

// router.get("/", getEvents);
// router.post("/", protect, createEvent);
// router.put("/:id", protect, updateEvent);
// router.delete("/:id", protect, deleteEvent);

// export default router;

import express from "express";
import protect from "../middleware/authMiddleware.js";
import { handleEventImageUpload } from "../middleware/upload.js";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  uploadEventImageHandler,
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/upload-image", protect, handleEventImageUpload, uploadEventImageHandler);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;