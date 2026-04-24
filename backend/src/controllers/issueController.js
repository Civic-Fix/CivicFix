import {
  addIssueAttachment as addIssueAttachmentRecord,
  addIssueVote as addIssueVoteRecord,
  createIssue as createIssueRecord,
  deleteIssue as deleteIssueRecord,
  getIssueById as getIssueByIdRecord,
  getIssues as getIssuesRecords,
  getIssueMapPoints as getIssueMapPointsRecords,
  getNearbyIssues as getNearbyIssueRecords,
  IssueServiceError,
  removeIssueVote as removeIssueVoteRecord,
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
    const result = await getIssuesRecords(req.query, req.userId || null);

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

export const addIssueVote = async (req, res) => {
  try {
    const result = await addIssueVoteRecord(req.params.id, req.userId);

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
    const result = await removeIssueVoteRecord(req.params.id, req.userId);

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
