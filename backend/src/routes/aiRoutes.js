import express from "express";
import {
  analyzeIssue,
  classifyIssue,
  detectDuplicateIssue,
} from "../controllers/aiController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/classify", requireAuth, classifyIssue);
router.post("/duplicates", requireAuth, detectDuplicateIssue);
router.post("/issues/:id/analyze", requireAuth, analyzeIssue);

export default router;
