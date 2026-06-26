import express from "express";
import {
  deleteAccount,
  login,
  recoverPassword,
  resetPassword,
  signup,
  updateProfile,
  uploadAvatar,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/recover", recoverPassword);
router.patch("/me", requireAuth, updateProfile);
router.post("/me/avatar", requireAuth, uploadAvatar);
router.post("/me/reset-password", requireAuth, resetPassword);
router.delete("/me", requireAuth, deleteAccount);

export default router;
