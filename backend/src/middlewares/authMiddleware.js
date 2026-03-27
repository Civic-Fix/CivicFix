import { verifyToken } from "../services/authService.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    const user = await verifyToken(token);

    // Attach user to request (like Flask g)
    req.user = user;
    req.userId = user.id;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};