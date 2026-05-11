import { TeamServiceError, addTeamMember, approveMember, getTeamMembers, removeTeamMember, requestAccess } from "../services/teamService.js";

export const listTeamMembers = async (req, res) => {
  try {
    const members = await getTeamMembers(req.userId);
    return res.status(200).json({ members });
  } catch (err) {
    console.error("[TeamController] listTeamMembers error", { userId: req.userId, error: err });
    return res.status(err instanceof TeamServiceError ? err.statusCode : 500).json({
      error: err.message || "Unable to fetch team members",
    });
  }
};

export const createTeamMember = async (req, res) => {
  try {
    const member = await addTeamMember(req.body, req.userId);
    return res.status(201).json({ message: "Team member added successfully", member });
  } catch (err) {
    console.error("[TeamController] createTeamMember error", { userId: req.userId, body: req.body, error: err });
    return res.status(err instanceof TeamServiceError ? err.statusCode : 500).json({
      error: err.message || "Unable to add team member",
    });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const result = await removeTeamMember(req.params.id, req.userId);
    return res.status(200).json({ message: "Team member removed successfully", ...result });
  } catch (err) {
    console.error("[TeamController] deleteTeamMember error", { userId: req.userId, params: req.params, error: err });
    return res.status(err instanceof TeamServiceError ? err.statusCode : 500).json({
      error: err.message || "Unable to remove team member",
    });
  }
};

export const requestMemberAccess = async (req, res) => {
  try {
    await requestAccess(req.params.id);
    return res.status(200).json({ message: "Access request sent to admin." });
  } catch (err) {
    console.error("[TeamController] requestMemberAccess error", { params: req.params, error: err });
    return res.status(err instanceof TeamServiceError ? err.statusCode : 500).json({
      error: err.message || "Unable to send access request",
    });
  }
};

export const approveMemberAccess = async (req, res) => {
  try {
    await approveMember(req.params.id, req.userId);
    return res.status(200).json({ message: "Member approved successfully." });
  } catch (err) {
    console.error("[TeamController] approveMemberAccess error", { userId: req.userId, params: req.params, error: err });
    return res.status(err instanceof TeamServiceError ? err.statusCode : 500).json({
      error: err.message || "Unable to approve member",
    });
  }
};
