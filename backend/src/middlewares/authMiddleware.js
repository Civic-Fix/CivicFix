import { verifyToken } from "../services/authService.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    req.userId = user.id;

    next();
  } catch (err) {
    console.error("[AuthMiddleware]", err.message);

    if (err.message?.includes("expired")) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
};