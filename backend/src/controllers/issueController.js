import {
  createIssue as createIssueRecord,
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
