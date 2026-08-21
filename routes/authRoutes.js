import express from "express";
import {
  createAdmin,
  loginAdmin,
  logoutAdmin,
  getMe,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { validateLoginInput, validateRegisterInput } from "../validations/authValidation.js";

const router = express.Router();

router.post("/register", protect, validateRegisterInput, createAdmin);
router.post("/login", validateLoginInput, loginAdmin);
router.post("/logout", protect, logoutAdmin);
router.get("/me", protect, getMe);

export default router;