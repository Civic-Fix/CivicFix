import express from "express";
import {
  addIssueAttachment,
  addIssueVote,
  createIssue,
  deleteIssue,
  getIssueById,
  getIssues,
  getIssueMapPoints,
  getNearbyIssues,
  removeIssueVote,
  uploadIssueAttachmentAsset,
} from "../controllers/issueController.js";
import { optionalAuth, requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getIssues);
router.get("/nearby", optionalAuth, getNearbyIssues);
router.get("/map", getIssueMapPoints);
router.post("/attachments/upload", requireAuth, uploadIssueAttachmentAsset);
router.post("/", requireAuth, createIssue);
router.get("/:id", optionalAuth, getIssueById);
router.delete("/:id", requireAuth, deleteIssue);
router.post("/:id/votes", requireAuth, addIssueVote);
router.delete("/:id/votes", requireAuth, removeIssueVote);
router.post("/:id/attachments", requireAuth, addIssueAttachment);

export default router;
