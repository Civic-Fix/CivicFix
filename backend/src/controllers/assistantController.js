import { generateAssistantReply } from "../services/assistantService.js";

const getPublicAssistantError = (error) => {
  const message = error?.message || "";

  if (message.includes("GEMINI_API_KEY")) {
    return "CivicBot is not configured yet on the server.";
  }

  if (message.toLowerCase().includes("quota")) {
    return "CivicBot has reached its current usage limit. Please try again later.";
  }

  if (message.toLowerCase().includes("api key")) {
    return "CivicBot could not authenticate with the AI service.";
  }

  if (message.toLowerCase().includes("not found") || error?.status === 404) {
    return "CivicBot is using an unavailable AI model. Update GEMINI_MODEL on the server.";
  }

  return "Unable to generate assistant response right now.";
};

export const chatWithAssistant = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const reply = await generateAssistantReply({
      message: message.trim(),
      history,
    });

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("[AssistantController] chat error", error);
    return res.status(500).json({
      error: getPublicAssistantError(error),
    });
  }
};
