import express from "express";
import { handleDownloadFileUpload } from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";
import {
  uploadDownload,
  getDownloads,
  deleteDownload,
   downloadFile,
} from "../controllers/downloadController.js";

const router = express.Router();

router.get("/", getDownloads);
router.get("/:id/download", downloadFile);
router.post("/", protect, handleDownloadFileUpload, uploadDownload);
router.delete("/:id", protect, deleteDownload);

export default router;