import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ERAM Dashboard",
    admin: req.admin,
  });
});

export default router;