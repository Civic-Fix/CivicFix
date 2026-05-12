import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const GEMINI_MODELS = (process.env.GEMINI_MODEL || DEFAULT_MODELS.join(","))
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const SYSTEM_PROMPT = `
You are CivicBot, a civic rights and civic process assistant for the general public.
Your job is to explain civic laws, regulations, complaint processes, public rights, and escalation paths in plain language.

Rules:
- Be clear, practical, and concise.
- If the user asks legal questions, clearly say this is general informational guidance and not a substitute for a lawyer.
- Prefer step-by-step civic guidance when helpful.
- If you are unsure about a jurisdiction-specific law, say so and ask the user for their city, state, or country.
- Focus on public service complaints, sanitation, roads, water, drainage, RTI, local authorities, and citizen rights.
`;

const buildConversationText = (history, message) => {
  const recentHistory = Array.isArray(history) ? history.slice(-8) : [];

  const transcript = recentHistory
    .map((entry) => {
      const role = entry.role === "assistant" ? "Assistant" : "User";
      return `${role}: ${entry.text}`;
    })
    .join("\n");

  return `${transcript}\nUser: ${message}\nAssistant:`;
};

const isRetryableModelError = (error) =>
  error?.status === 404 ||
  error?.status === 429 ||
  error?.status === 503 ||
  /not found|quota|high demand|unavailable|overloaded/i.test(error?.message || "");

const getOfflineAssistantReply = (message) => {
  const q = message.toLowerCase();

  if (q.includes("rti")) {
    return [
      "CivicBot live AI is busy, but here is general RTI guidance:",
      "1. Identify the public authority that holds the records.",
      "2. Write a specific request for documents, status updates, action taken reports, or official records.",
      "3. Include your contact details and pay the required application fee if applicable.",
      "4. Keep the acknowledgement number and follow up within the statutory response window.",
      "This is general civic information, not legal advice.",
    ].join("\n");
  }

  if (q.includes("garbage") || q.includes("waste") || q.includes("sanitation")) {
    return "CivicBot live AI is busy, but for sanitation complaints: take clear photos, note the exact location and dates, file the complaint with your municipal body, save the complaint number, and escalate with the same evidence if there is no action.";
  }

  if (q.includes("pothole") || q.includes("road")) {
    return "CivicBot live AI is busy, but for road or pothole complaints: record the exact spot, photos, nearby landmark, safety risk, and complaint date. Submit it to the road-owning civic authority and keep the ticket number for escalation.";
  }

  if (q.includes("water") || q.includes("drainage") || q.includes("sewage")) {
    return "CivicBot live AI is busy, but for water or drainage issues: document the disruption, location, photos or videos, affected households, and health risks. Report it to the municipal water/drainage department and keep proof of submission.";
  }

  return "CivicBot live AI is busy, but I can still help with general civic guidance. Share the issue type, location, authority involved, what you already tried, and any complaint number so I can suggest a practical escalation path.";
};

export const generateAssistantReply = async ({ message, history = [] }) => {
  if (!ai) {
    return getOfflineAssistantReply(message);
  }

  const prompt = buildConversationText(history, message);
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nConversation:\n${prompt}`,
              },
            ],
          },
        ],
      });

      const reply = typeof response.text === "function" ? response.text() : response.text;

      if (reply?.trim()) {
        return reply.trim();
      }
    } catch (error) {
      lastError = error;
      console.error(`[AssistantService] ${model} failed`, {
        status: error?.status,
        message: error?.message,
      });

      if (!isRetryableModelError(error)) {
        throw error;
      }
    }
  }

  console.error("[AssistantService] falling back to offline reply", {
    status: lastError?.status,
    message: lastError?.message,
  });

  return getOfflineAssistantReply(message);
};
