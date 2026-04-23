import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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

export const generateAssistantReply = async ({ message, history = [] }) => {
  if (!ai) {
    throw new Error("GEMINI_API_KEY is missing on the backend.");
  }

  const prompt = buildConversationText(history, message);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
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

  return response.text?.trim() || "I could not generate a response right now.";
};
