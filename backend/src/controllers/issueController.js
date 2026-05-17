import {
  addIssueAttachment as addIssueAttachmentRecord,
  addIssueUpdate as addIssueUpdateRecord,
  addIssueVote as addIssueVoteRecord,
  createIssue as createIssueRecord,
  deleteIssue as deleteIssueRecord,
  getIssueById as getIssueByIdRecord,
  getIssues as getIssuesRecords,
  searchIssues as searchIssuesRecord,
  getIssueMapPoints as getIssueMapPointsRecords,
  listIssueUpdates as listIssueUpdatesRecords,
  listAllUpdates as listAllUpdateRecords,
  getNearbyIssues as getNearbyIssueRecord,
  IssueServiceError,
  removeIssueVote as removeIssueVoteRecord,
  updateIssue as updateIssueRecord,
  uploadIssueAttachmentAsset as uploadIssueAttachmentAssetRecord,
} from "../services/issueService.js";

export const createIssue = async (req, res) => {
  try {
    const issue = await createIssueRecord(req.body, req.userId);

    return res.status(201).json({
      message: "Issue created successfully",
      issue,
    });
  } catch (err) {
    console.error("[IssueController] createIssue error", {
      body: req.body,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
      error: err.message || "Unable to create issue",
    });
  }
};

export const getIssues = async (req, res) => {
  try {
    console.log(req.query)
    console.log(req.userId)
    const result = await getIssuesRecords(req.query, req.userId || null);
    console.log("req.query:", req.query);
    console.log("RESULT:", result);

    return res.status(200).json(result);
  } catch (err) {
    console.error("[IssueController] getIssues error", {
      query: req.query,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to fetch issues",
      });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await getIssueByIdRecord(req.params.id, req.userId || null);

    return res.status(200).json({
      issue,
    });
  } catch (err) {
    console.error("[IssueController] getIssueById error", {
      params: req.params,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to fetch issue",
      });
  }
};

export const updateIssue = async (req, res) => {
  console.log("[IssueController] updateIssue called", {
    issueId: req.params.id,
    userId: req.userId,
    body: req.body,
  });
  try {
    const issue = await updateIssueRecord(req.params.id, req.body, req.userId, req.accessToken);
    console.log("[IssueController] updateIssue success", { issueId: issue.id, status: issue.status });

    return res.status(200).json({
      message: "Issue updated successfully",
      issue,
    });
  } catch (err) {
    console.error("[IssueController] updateIssue error", {
      params: req.params,
      body: req.body,
      userId: req.userId,
      errorMessage: err.message,
      errorCode: err.statusCode,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to update issue",
      });
  }
};

export const getIssueUpdates = async (req, res) => {
  try {
    const updates = await listIssueUpdatesRecords(req.params.id);

    return res.status(200).json({
      updates,
    });
  } catch (err) {
    console.error("[IssueController] getIssueUpdates error", {
      params: req.params,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to fetch issue updates",
      });
  }
};

export const getUpdates = async (req, res) => {
  try {
    const updates = await listAllUpdateRecords();

    return res.status(200).json({
      updates,
    });
  } catch (err) {
    console.error("[IssueController] getUpdates error", {
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to fetch updates",
      });
  }
};

export const addIssueUpdate = async (req, res) => {
  try {
    const update = await addIssueUpdateRecord(req.params.id, req.body?.content, req.userId);

    return res.status(201).json({
      message: "Issue update added successfully",
      update,
    });
  } catch (err) {
    console.error("[IssueController] addIssueUpdate error", {
      params: req.params,
      body: req.body,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to add issue update",
      });
  }
};

export const getNearbyIssues = async (req, res) => {
  try {
    const issues = await getNearbyIssueRecords(req.query, req.userId || null);

    return res.status(200).json({
      issues,
    });
  } catch (err) {
    console.error("[IssueController] getNearbyIssues error", {
      query: req.query,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to fetch nearby issues",
      });
  }
};

export const getIssueMapPoints = async (req, res) => {
  try {
    const issues = await getIssueMapPointsRecords(req.query.limit);

    return res.status(200).json({
      issues,
    });
  } catch (err) {
    console.error("[IssueController] getIssueMapPoints error", {
      query: req.query,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to fetch issue map points",
      });
  }
};

export const searchIssues = async (req, res) => {
  try {
    const searchTerm = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!searchTerm) {
      return res.status(200).json({ issues: [] });
    }

    const issues = await searchIssuesRecord(searchTerm, req.userId || null);

    return res.status(200).json({
      issues,
    });
  } catch (err) {
    console.error("[IssueController] searchIssues error", {
      query: req.query,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to search issues",
      });
  }
};

export const addIssueVote = async (req, res) => {
  try {
    const voteType = req.body?.vote_type || 'upvote';
    const result = await addIssueVoteRecord(req.params.id, req.userId, voteType);

    return res.status(201).json({
      message: "Vote added successfully",
      ...result,
    });
  } catch (err) {
    console.error("[IssueController] addIssueVote error", {
      params: req.params,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to add vote",
      });
  }
};

export const removeIssueVote = async (req, res) => {
  try {
    const voteType = req.query?.vote_type || req.body?.vote_type || 'upvote';
    const result = await removeIssueVoteRecord(req.params.id, req.userId, voteType);

    return res.status(200).json({
      message: "Vote removed successfully",
      ...result,
    });
  } catch (err) {
    console.error("[IssueController] removeIssueVote error", {
      params: req.params,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to remove vote",
      });
  }
};

export const addIssueAttachment = async (req, res) => {
  try {
    const result = await addIssueAttachmentRecord(
      req.params.id,
      req.body,
      req.userId
    );

    return res.status(201).json({
      message: "Attachment added successfully",
      ...result,
    });
  } catch (err) {
    console.error("[IssueController] addIssueAttachment error", {
      params: req.params,
      body: req.body,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to add attachment",
      });
  }
};

export const uploadIssueAttachmentAsset = async (req, res) => {
  try {
    const asset = await uploadIssueAttachmentAssetRecord(req.body, req.userId);

    return res.status(201).json({
      message: "Attachment uploaded successfully",
      asset,
    });
  } catch (err) {
    console.error("[IssueController] uploadIssueAttachmentAsset error", {
      body: req.body,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to upload attachment",
      });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    const result = await deleteIssueRecord(req.params.id, req.userId);

    return res.status(200).json({
      message: "Issue deleted successfully",
      ...result,
    });
  } catch (err) {
    console.error("[IssueController] deleteIssue error", {
      params: req.params,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof IssueServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to delete issue",
      });
  }
};
