import express from "express";
import { createIssue } from "../controllers/issueController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, createIssue);

export default router;
