import {
  createIssue as createIssueRecord,
  getIssueMapPoints as getIssueMapPointsRecords,
  getNearbyIssues as getNearbyIssueRecords,
  IssueServiceError,
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

export const getNearbyIssues = async (req, res) => {
  try {
    const issues = await getNearbyIssueRecords(req.query);

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
