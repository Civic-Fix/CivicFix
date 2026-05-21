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
  { value: "roads", label: "Roads", keywords: ["pothole", "road", "street", "asphalt", "footpath", "sidewalk"] },
  { value: "sanitation", label: "Sanitation", keywords: ["garbage", "trash", "waste", "dump", "litter", "cleaning"] },
  { value: "street_lighting", label: "Street Lighting", keywords: ["streetlight", "street light", "lamp", "dark", "lighting", "pole"] },
  { value: "drainage", label: "Drainage", keywords: ["drain", "sewage", "sewer", "gutter", "waterlogging", "flood"] },
  { value: "water_supply", label: "Water Supply", keywords: ["water", "leak", "pipeline", "tap", "supply"] },
  { value: "public_safety", label: "Public Safety", keywords: ["danger", "unsafe", "accident", "hazard", "fire"] },
  { value: "traffic", label: "Traffic", keywords: ["traffic", "signal", "parking", "congestion", "vehicle"] },
  { value: "parks", label: "Parks", keywords: ["park", "garden", "playground", "tree"] },
  { value: "utilities", label: "Utilities", keywords: ["electric", "wire", "cable", "utility"] },
  { value: "noise", label: "Noise", keywords: ["noise", "loud", "speaker"] },
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
  [issue.title, issue.description, issue.locality].map(compactText).filter(Boolean).join(" ");

const normalizeCategory = (category) => {
  const normalized = compactText(category).toLowerCase().replace(/[\s-]+/g, "_");
  return CATEGORY_OPTIONS.some((item) => item.value === normalized) ? normalized : "other";
};

const normalizeSeverity = (severity) => {
  const normalized = compactText(severity).toLowerCase();
  return SEVERITY_OPTIONS.includes(normalized) ? normalized : "medium";
};

const clampNumber = (value, min, max, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
};

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

const tokenize = (text) =>
  compactText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

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

const callGeminiJson = async (prompt, logPrefix) => {
  if (!ai) return null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = typeof response.text === "function" ? response.text() : response.text;
      const parsed = safeJsonParse(text);
      if (parsed) return { parsed, model };
    } catch (error) {
      console.error(`[${logPrefix}] ${model} failed`, {
        status: error?.status,
        message: error?.message,
      });
    }
  }

  return null;
};

const classifyWithRules = (issue) => {
  const text = getIssueText(issue).toLowerCase();
  const categoryScores = CATEGORY_OPTIONS.map((category) => ({
    ...category,
    score: category.keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0),
  })).sort((left, right) => right.score - left.score);

  const winner =
    categoryScores[0]?.score > 0 ? categoryScores[0] : CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
  const severity =
    ["life", "fire", "accident", "danger", "injury", "hospital"].some((word) => text.includes(word))
      ? "critical"
      : ["overflow", "flood", "blocked", "unsafe", "major", "urgent"].some((word) => text.includes(word))
        ? "high"
        : text.length > 140
          ? "medium"
          : "low";

  return {
    category: winner.value,
    category_label: winner.label,
    severity,
    confidence: winner.score > 1 ? 0.78 : winner.score === 1 ? 0.62 : 0.45,
    summary: compactText(issue.description) || compactText(issue.title) || "Civic issue reported by a resident.",
    tags: tokenize(text).slice(0, 5),
    provider: "local_rules",
    model: null,
    used_ai: false,
  };
};

export const classifyIssue = async (issue = {}) => {
  const fallback = classifyWithRules(issue);
  const prompt = `
Classify this civic complaint and return only valid JSON:
{
  "category": one of ${CATEGORY_OPTIONS.map((item) => item.value).join(", ")},
  "severity": one of ${SEVERITY_OPTIONS.join(", ")},
  "confidence": number from 0 to 1,
  "summary": concise one-sentence operational summary,
  "tags": array of up to 5 short lowercase tags
}

Title: ${compactText(issue.title) || "N/A"}
Description: ${compactText(issue.description) || "N/A"}
Locality: ${compactText(issue.locality) || "N/A"}
`;
  const geminiResult = await callGeminiJson(prompt, "AiService:classifyIssue");
  const raw = geminiResult?.parsed || {};
  const category = normalizeCategory(raw.category ?? fallback.category);

  return {
    category,
    category_label: CATEGORY_OPTIONS.find((item) => item.value === category)?.label || "Other",
    severity: normalizeSeverity(raw.severity ?? fallback.severity),
    confidence: clampNumber(raw.confidence, 0, 1, fallback.confidence),
    summary: compactText(raw.summary) || fallback.summary,
    tags: Array.isArray(raw.tags) ? raw.tags.map(compactText).filter(Boolean).slice(0, 5) : fallback.tags,
    provider: geminiResult?.model ? "gemini" : fallback.provider,
    model: geminiResult?.model || null,
    used_ai: Boolean(geminiResult?.model),
  };
};

const fetchDuplicateCandidates = async (issue, excludeIssueId) => {
  const candidateExcludeId = [excludeIssueId, issue.id].find((id) => UUID_PATTERN.test(String(id || "")));
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

const scoreDuplicateCandidate = ({ issue, candidate, category }) => {
  const textScore = jaccardSimilarity(getIssueText(issue), getIssueText(candidate));
  const titleScore = jaccardSimilarity(issue.title, candidate.title) * 0.16;
  const localityScore =
    compactText(issue.locality).toLowerCase() === compactText(candidate.locality).toLowerCase() ? 0.14 : 0;
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
  const categoryScore = category && candidate.category && category === candidate.category ? 0.12 : 0;
  const score = Math.min(0.98, textScore * 0.42 + titleScore + localityScore + distanceScore + categoryScore);

  return {
    issue_id: candidate.id,
    title: candidate.title,
    locality: candidate.locality,
    status: candidate.status,
    created_at: candidate.created_at,
    distance_meters: distanceMeters === null ? null : Math.round(distanceMeters),
    score: Number(score.toFixed(2)),
    reason: distanceMeters !== null && distanceMeters <= 250 ? "Similar report near the same location" : "Similar complaint wording",
  };
};

export const detectDuplicateIssue = async (issue = {}, { category = null, excludeIssueId = null } = {}) => {
  const candidates = await fetchDuplicateCandidates(issue, excludeIssueId);
  const scoredCandidates = candidates
    .map((candidate) => scoreDuplicateCandidate({ issue, candidate, category }))
    .filter((candidate) => candidate.score >= 0.28)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
  const topCandidate = scoredCandidates[0] || null;

  return {
    is_duplicate: Boolean(topCandidate && topCandidate.score >= DUPLICATE_THRESHOLD),
    duplicate_of: topCandidate?.score >= DUPLICATE_THRESHOLD ? topCandidate.issue_id : null,
    duplicate_score: topCandidate?.score || 0,
    candidates: scoredCandidates,
    reason: topCandidate ? topCandidate.reason : "No similar reports found nearby.",
    provider: "local_similarity",
    model: null,
    used_ai: false,
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
    throw new AiServiceError(updateError.message || "Unable to update issue AI metadata", 500);
  }

  return { issue: updatedIssue, analysis };
};

export { AiServiceError, CATEGORY_OPTIONS, SEVERITY_OPTIONS };
