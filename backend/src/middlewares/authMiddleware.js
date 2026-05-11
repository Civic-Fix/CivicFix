import { verifyToken } from "../services/authService.js";

const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: "Missing or invalid token format" });
    }

    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    req.userId = user.id;
    req.accessToken = token;

    next();
  } catch (err) {
    console.error("[AuthMiddleware]", err.message);

    if (err.message?.includes("expired")) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next();
    }

    const user = await verifyToken(token);

    if (user) {
      req.user = user;
      req.userId = user.id;
      req.accessToken = token;
    }

    return next();
  } catch (err) {
    console.warn("[AuthMiddleware] optionalAuth ignored invalid token", err.message);
    return next();
  }
};
