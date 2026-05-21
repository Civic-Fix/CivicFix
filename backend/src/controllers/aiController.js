import {
  AiServiceError,
  analyzeAndUpdateIssue as analyzeAndUpdateIssueRecord,
  classifyIssue as classifyIssueRecord,
  detectDuplicateIssue as detectDuplicateIssueRecord,
} from "../services/aiService.js";

export const classifyIssue = async (req, res) => {
  try {
    const classification = await classifyIssueRecord(req.body || {});

    return res.status(200).json({
      classification,
    });
  } catch (err) {
    console.error("[AiController] classifyIssue error", {
      body: req.body,
      error: err,
    });

    return res
      .status(err instanceof AiServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to classify issue",
      });
  }
};

export const detectDuplicateIssue = async (req, res) => {
  try {
    const duplicate_detection = await detectDuplicateIssueRecord(req.body || {}, {
      category: req.body?.category || null,
      excludeIssueId: req.body?.id || null,
    });

    return res.status(200).json({
      duplicate_detection,
    });
  } catch (err) {
    console.error("[AiController] detectDuplicateIssue error", {
      body: req.body,
      error: err,
    });

    return res
      .status(err instanceof AiServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to detect duplicate issue",
      });
  }
};

export const analyzeIssue = async (req, res) => {
  try {
    if (req.query?.async === "true" || req.body?.async === true) {
      const issueId = req.params.id;
      const runAnalysis = () => {
        analyzeAndUpdateIssueRecord(issueId).catch((error) => {
          console.error("[AiController] async analyzeIssue failed", {
            issueId,
            userId: req.userId,
            message: error?.message,
          });
        });
      };

      if (typeof setImmediate === "function") {
        setImmediate(runAnalysis);
      } else {
        setTimeout(runAnalysis, 0);
      }

      return res.status(202).json({
        message: "Issue AI analysis queued",
        issue_id: issueId,
      });
    }

    const result = await analyzeAndUpdateIssueRecord(req.params.id);

    return res.status(200).json({
      message: "Issue AI analysis updated successfully",
      ...result,
    });
  } catch (err) {
    console.error("[AiController] analyzeIssue error", {
      params: req.params,
      userId: req.userId,
      error: err,
    });

    return res
      .status(err instanceof AiServiceError ? err.statusCode : 500)
      .json({
        error: err.message || "Unable to analyze issue",
      });
  }
};
