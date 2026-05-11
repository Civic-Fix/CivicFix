import express from "express";
import { approveMemberAccess, createTeamMember, deleteTeamMember, listTeamMembers, requestMemberAccess } from "../controllers/teamController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public — unverified member has no token
router.post("/members/:id/request-access", requestMemberAccess);

router.use(requireAuth);

router.get("/members", listTeamMembers);
router.post("/members", createTeamMember);
router.delete("/members/:id", deleteTeamMember);
router.patch("/members/:id/verify", approveMemberAccess);

export default router;
