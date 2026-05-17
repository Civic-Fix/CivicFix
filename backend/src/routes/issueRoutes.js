import express from "express";
import {
  addIssueAttachment,
  addIssueUpdate,
  addIssueVote,
  createIssue,
  deleteIssue,
  getIssueById,
  getIssueUpdates,
  getIssues,
  getIssueMapPoints,
  getNearbyIssues,
  getUpdates,
  removeIssueVote,
  searchIssues,
  updateIssue,
  uploadIssueAttachmentAsset,
} from "../controllers/issueController.js";
import { optionalAuth, requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getIssues);
router.get("/search", requireAuth, searchIssues);
router.get("/nearby", optionalAuth, getNearbyIssues);
router.get("/map", getIssueMapPoints);
router.post("/attachments/upload", requireAuth, uploadIssueAttachmentAsset);
router.post("/", requireAuth, createIssue);
router.get("/updates", requireAuth, getUpdates);
router.get("/:id", optionalAuth, getIssueById);
router.patch("/:id", requireAuth, updateIssue);
router.get("/:id/updates", requireAuth, getIssueUpdates);
router.post("/:id/updates", requireAuth, addIssueUpdate);
router.delete("/:id", requireAuth, deleteIssue);
router.post("/:id/votes", requireAuth, addIssueVote);
router.delete("/:id/votes", requireAuth, removeIssueVote);
router.post("/:id/attachments", requireAuth, addIssueAttachment);

export default router;
