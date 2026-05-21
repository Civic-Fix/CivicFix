import { GoogleGenAI } from "@google/genai";
import { supabase } from "../config/supabaseClient.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const GEMINI_MODELS = (process.env.GEMINI_MODEL || DEFAULT_MODELS.join(","))
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const CATEGORY_OPTIONS = [
  { value: "roads", label: "Roads", keywords: ["pothole", "road", "street", "asphalt", "footpath", "sidewalk", "speed breaker"] },
  { value: "sanitation", label: "Sanitation", keywords: ["garbage", "trash", "waste", "dump", "litter", "cleaning", "sanitation"] },
  { value: "street_lighting", label: "Street Lighting", keywords: ["streetlight", "street light", "lamp", "dark", "lighting", "pole"] },
  { value: "drainage", label: "Drainage", keywords: ["drain", "sewage", "sewer", "gutter", "waterlogging", "flood", "overflow"] },
  { value: "water_supply", label: "Water Supply", keywords: ["water", "leak", "pipeline", "tap", "supply", "contamination"] },
  { value: "public_safety", label: "Public Safety", keywords: ["danger", "unsafe", "accident", "hazard", "fire", "crime", "school"] },
  { value: "traffic", label: "Traffic", keywords: ["traffic", "signal", "parking", "congestion", "vehicle", "jam"] },
  { value: "parks", label: "Parks", keywords: ["park", "garden", "playground", "tree", "bench"] },
  { value: "utilities", label: "Utilities", keywords: ["electric", "wire", "cable", "internet", "utility"] },
  { value: "noise", label: "Noise", keywords: ["noise", "loud", "speaker", "construction sound"] },
  { value: "encroachment", label: "Encroachment", keywords: ["encroachment", "illegal", "blocked", "vendor", "obstruction"] },
  { value: "other", label: "Other", keywords: [] },
];

const SEVERITY_OPTIONS = ["low", "medium", "high", "critical"];
const DUPLICATE_THRESHOLD = 0.72;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class AiServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AiServiceError";
    this.statusCode = statusCode;
  }
}

const compactText = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const getIssueText = (issue = {}) =>
  [issue.title, issue.description, issue.locality]
    .map(compactText)
    .filter(Boolean)
    .join(" ");

const clampNumber = (value, min, max, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
};

const normalizeCategory = (category) => {
  const normalized = compactText(category).toLowerCase().replace(/[\s-]+/g, "_");
  return CATEGORY_OPTIONS.some((item) => item.value === normalized) ? normalized : "other";
};

const normalizeSeverity = (severity) => {
  const normalized = compactText(severity).toLowerCase();
  return SEVERITY_OPTIONS.includes(normalized) ? normalized : "medium";
};

const getCategoryLabel = (category) =>
  CATEGORY_OPTIONS.find((item) => item.value === category)?.label || "Other";

const safeJsonParse = (text) => {
  const trimmed = compactText(text);
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const tokenize = (text) => {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "at",
    "for",
    "from",
    "in",
    "is",
    "near",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ]);

  return compactText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
};

const jaccardSimilarity = (leftText, rightText) => {
  const left = new Set(tokenize(leftText));
  const right = new Set(tokenize(rightText));

  if (!left.size || !right.size) return 0;

  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) intersection += 1;
  }

  return intersection / (left.size + right.size - intersection);
};

const haversineDistanceMeters = (lat1, lng1, lat2, lng2) => {
  if (![lat1, lng1, lat2, lng2].every((value) => Number.isFinite(Number(value)))) {
    return null;
  }

  const earthRadiusMeters = 6371000;
  const toRadians = (degrees) => (Number(degrees) * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const originLat = toRadians(lat1);
  const targetLat = toRadians(lat2);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(targetLat) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
};

const buildClassificationPrompt = (issue) => `
Classify this civic complaint.

Return only valid JSON with this exact shape:
{
  "category": one of ${CATEGORY_OPTIONS.map((item) => item.value).join(", ")},
  "severity": one of ${SEVERITY_OPTIONS.join(", ")},
  "confidence": number from 0 to 1,
  "summary": concise one-sentence operational summary,
  "tags": array of up to 5 short lowercase tags
}

Complaint:
Title: ${compactText(issue.title) || "N/A"}
Description: ${compactText(issue.description) || "N/A"}
Locality: ${compactText(issue.locality) || "N/A"}
Image count: ${Array.isArray(issue.attachments) ? issue.attachments.length : 0}
`;

const callGeminiJson = async (prompt, logPrefix) => {
  if (!ai) return null;

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const text = typeof response.text === "function" ? response.text() : response.text;
      const parsed = safeJsonParse(text);

      if (parsed) {
        return { parsed, model };
      }
    } catch (error) {
      lastError = error;
      console.error(`[${logPrefix}] ${model} failed`, {
        status: error?.status,
        message: error?.message,
      });
    }
  }

  console.error(`[${logPrefix}] falling back to local analysis`, {
    status: lastError?.status,
    message: lastError?.message,
  });

  return null;
};

const classifyWithRules = (issue) => {
  const text = getIssueText(issue).toLowerCase();
  const categoryScores = CATEGORY_OPTIONS.map((category) => {
    const score = category.keywords.reduce((total, keyword) => {
      return total + (text.includes(keyword) ? 1 : 0);
    }, 0);

    return { ...category, score };
  }).sort((left, right) => right.score - left.score);

  const winner =
    categoryScores[0]?.score > 0
      ? categoryScores[0]
      : CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
  const criticalSignals = ["life", "fire", "accident", "danger", "injury", "school children", "hospital"];
  const highSignals = ["overflow", "flood", "blocked", "unsafe", "major", "urgent", "weeks"];
  const severity = criticalSignals.some((word) => text.includes(word))
    ? "critical"
    : highSignals.some((word) => text.includes(word))
      ? "high"
      : text.length > 140
        ? "medium"
        : "low";

  const tags = tokenize(text).slice(0, 5);

  return {
    category: winner.value,
    category_label: winner.label,
    severity,
    confidence: winner.score > 1 ? 0.78 : winner.score === 1 ? 0.62 : 0.45,
    summary: compactText(issue.description) || compactText(issue.title) || "Civic issue reported by a resident.",
    tags,
    provider: "local_rules",
    model: null,
    used_ai: false,
  };
};

const normalizeClassification = (raw, fallback, model = null) => {
  const category = normalizeCategory(raw?.category ?? fallback.category);
  const tags = Array.isArray(raw?.tags)
    ? raw.tags.map(compactText).filter(Boolean).slice(0, 5)
    : fallback.tags;

  return {
    category,
    category_label: getCategoryLabel(category),
    severity: normalizeSeverity(raw?.severity ?? fallback.severity),
    confidence: clampNumber(raw?.confidence, 0, 1, fallback.confidence),
    summary: compactText(raw?.summary) || fallback.summary,
    tags,
    provider: model ? "gemini" : fallback.provider,
    model,
    used_ai: Boolean(model),
  };
};

export const classifyIssue = async (issue = {}) => {
  const fallback = classifyWithRules(issue);
  const geminiResult = await callGeminiJson(
    buildClassificationPrompt(issue),
    "AiService:classifyIssue"
  );

  return normalizeClassification(geminiResult?.parsed, fallback, geminiResult?.model || null);
};

const getCandidateScore = ({ issue, candidate, category }) => {
  const issueText = getIssueText(issue);
  const candidateText = getIssueText(candidate);
  const textScore = jaccardSimilarity(issueText, candidateText);
  const localityScore =
    compactText(issue.locality) &&
    compactText(candidate.locality) &&
    compactText(issue.locality).toLowerCase() === compactText(candidate.locality).toLowerCase()
      ? 0.14
      : compactText(issue.locality) &&
          compactText(candidate.locality) &&
          compactText(candidate.locality).toLowerCase().includes(compactText(issue.locality).toLowerCase())
        ? 0.08
        : 0;

  const distanceMeters = haversineDistanceMeters(issue.lat, issue.lng, candidate.lat, candidate.lng);
  const distanceScore =
    distanceMeters === null
      ? 0
      : distanceMeters <= 30
        ? 0.42
        : distanceMeters <= 100
          ? 0.34
          : distanceMeters <= 250
            ? 0.24
            : distanceMeters <= 500
              ? 0.12
              : 0;

  const categoryScore =
    category && candidate.category && category === candidate.category ? 0.12 : 0;
  const titleScore = jaccardSimilarity(issue.title, candidate.title) * 0.16;
  const score = Math.min(0.98, textScore * 0.42 + titleScore + localityScore + distanceScore + categoryScore);

  return {
    issue_id: candidate.id,
    title: candidate.title,
    locality: candidate.locality,
    status: candidate.status,
    created_at: candidate.created_at,
    distance_meters: distanceMeters === null ? null : Math.round(distanceMeters),
    score: Number(score.toFixed(2)),
    reason:
      distanceMeters !== null && distanceMeters <= 250
        ? "Similar text near the same location"
        : localityScore
          ? "Similar text in the same locality"
          : "Similar complaint wording",
  };
};

const fetchDuplicateCandidates = async (issue, excludeIssueId) => {
  const candidateExcludeId = [excludeIssueId, issue.id].find((id) =>
    UUID_PATTERN.test(String(id || ""))
  );

  const { data, error } = await supabase
    .from("issues")
    .select("id, title, description, locality, lat, lng, status, category, created_at")
    .neq("id", candidateExcludeId || NIL_UUID)
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    console.error("[AiService] fetchDuplicateCandidates failed", { error });
    return [];
  }

  return data || [];
};

const buildDuplicatePrompt = ({ issue, category, candidates }) => `
Decide whether the new civic complaint is a duplicate of an existing complaint.

Return only valid JSON with this exact shape:
{
  "is_duplicate": boolean,
  "duplicate_of": existing issue id string or null,
  "duplicate_score": number from 0 to 1,
  "reason": short sentence,
  "candidates": [{"issue_id": string, "score": number from 0 to 1, "reason": short sentence}]
}

Treat reports as duplicates only when they describe the same physical civic problem, not just the same category.

New issue:
ID: ${issue.id || "new"}
Category: ${category || "unknown"}
Title: ${compactText(issue.title) || "N/A"}
Description: ${compactText(issue.description) || "N/A"}
Locality: ${compactText(issue.locality) || "N/A"}
Coordinates: ${issue.lat ?? "N/A"}, ${issue.lng ?? "N/A"}

Existing candidates:
${JSON.stringify(candidates, null, 2)}
`;

const normalizeDuplicateResult = ({ raw, fallback, candidateIds }) => {
  const duplicateOf = raw?.duplicate_of && candidateIds.has(raw.duplicate_of) ? raw.duplicate_of : fallback.duplicate_of;
  const duplicateScore = clampNumber(raw?.duplicate_score, 0, 1, fallback.duplicate_score);
  const modelDecision =
    typeof raw?.is_duplicate === "boolean"
      ? Boolean(raw.is_duplicate && duplicateOf && duplicateScore >= 0.65)
      : null;
  const isDuplicate = modelDecision ?? fallback.is_duplicate;
  const candidates = Array.isArray(raw?.candidates)
    ? raw.candidates
        .filter((candidate) => candidateIds.has(candidate.issue_id))
        .map((candidate) => ({
          issue_id: candidate.issue_id,
          score: clampNumber(candidate.score, 0, 1, 0),
          reason: compactText(candidate.reason),
        }))
        .sort((left, right) => right.score - left.score)
        .slice(0, 5)
    : fallback.candidates;

  return {
    is_duplicate: isDuplicate,
    duplicate_of: isDuplicate ? duplicateOf : null,
    duplicate_score: isDuplicate ? Number(duplicateScore.toFixed(2)) : fallback.duplicate_score,
    candidates,
    reason: compactText(raw?.reason) || fallback.reason,
  };
};

export const detectDuplicateIssue = async (issue = {}, { category = null, excludeIssueId = null } = {}) => {
  const candidates = await fetchDuplicateCandidates(issue, excludeIssueId);
  const scoredCandidates = candidates
    .map((candidate) => getCandidateScore({ issue, candidate, category }))
    .filter((candidate) => candidate.score >= 0.28)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);

  const topCandidate = scoredCandidates[0] || null;
  const fallback = {
    is_duplicate: Boolean(topCandidate && topCandidate.score >= DUPLICATE_THRESHOLD),
    duplicate_of: topCandidate?.score >= DUPLICATE_THRESHOLD ? topCandidate.issue_id : null,
    duplicate_score: topCandidate?.score || 0,
    candidates: scoredCandidates.slice(0, 5),
    reason: topCandidate ? topCandidate.reason : "No similar reports found nearby.",
    provider: "local_similarity",
    model: null,
    used_ai: false,
  };

  if (!scoredCandidates.length) {
    return fallback;
  }

  const geminiResult = await callGeminiJson(
    buildDuplicatePrompt({ issue, category, candidates: scoredCandidates }),
    "AiService:detectDuplicateIssue"
  );

  if (!geminiResult?.parsed) {
    return fallback;
  }

  return {
    ...normalizeDuplicateResult({
      raw: geminiResult.parsed,
      fallback,
      candidateIds: new Set(scoredCandidates.map((candidate) => candidate.issue_id)),
    }),
    provider: "gemini",
    model: geminiResult.model,
    used_ai: true,
  };
};

export const analyzeIssue = async (issue = {}) => {
  if (!compactText(issue.title) && !compactText(issue.description)) {
    throw new AiServiceError("Issue title or description is required");
  }

  const classification = await classifyIssue(issue);
  const duplicate_detection = await detectDuplicateIssue(issue, {
    category: classification.category,
    excludeIssueId: issue.id,
  });

  return {
    classification,
    duplicate_detection,
    analyzed_at: new Date().toISOString(),
    version: "2026-05-21",
  };
};

export const buildIssueAiUpdatePayload = (analysis) => ({
  category: analysis.classification.category,
  ai_category_confidence: analysis.classification.confidence,
  ai_severity: analysis.classification.severity,
  ai_summary: analysis.classification.summary,
  ai_tags: analysis.classification.tags,
  ai_duplicate_of: analysis.duplicate_detection.duplicate_of,
  ai_duplicate_score: analysis.duplicate_detection.duplicate_score,
  ai_duplicate_candidates: analysis.duplicate_detection.candidates,
  ai_analysis: analysis,
  ai_analyzed_at: analysis.analyzed_at,
});

export const analyzeAndUpdateIssue = async (issueId) => {
  const { data: issue, error } = await supabase
    .from("issues")
    .select("id, title, description, locality, lat, lng, status, category, created_at")
    .eq("id", issueId)
    .single();

  if (error?.code === "PGRST116" || !issue) {
    throw new AiServiceError("Issue not found", 404);
  }

  if (error) {
    console.error("[AiService] analyzeAndUpdateIssue fetch failed", { issueId, error });
    throw new AiServiceError(error.message || "Unable to fetch issue", 500);
  }

  const analysis = await analyzeIssue(issue);
  const updatePayload = buildIssueAiUpdatePayload(analysis);
  const { data: updatedIssue, error: updateError } = await supabase
    .from("issues")
    .update(updatePayload)
    .eq("id", issueId)
    .select()
    .single();

  if (updateError) {
    console.error("[AiService] analyzeAndUpdateIssue update failed", {
      issueId,
      updatePayload,
      error: updateError,
    });
    throw new AiServiceError(updateError.message || "Unable to update issue AI metadata", 500);
  }

  return {
    issue: updatedIssue,
    analysis,
  };
};

export { AiServiceError, CATEGORY_OPTIONS, SEVERITY_OPTIONS };
