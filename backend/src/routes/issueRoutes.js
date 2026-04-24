import express from "express";
import {
  createIssue,
  getIssueMapPoints,
  getNearbyIssues,
} from "../controllers/issueController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/nearby", getNearbyIssues);
router.get("/map", getIssueMapPoints);
router.post("/", requireAuth, createIssue);

export default router;
