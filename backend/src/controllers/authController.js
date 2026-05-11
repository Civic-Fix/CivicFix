import { signIn, signUp } from "../services/authService.js";

export const login = async (req, res) => {
  const { email, password, accountType } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const authData = await signIn(email, password, accountType);
    return res.status(200).json(authData);
  } catch (err) {
    console.error("[AuthController] login error", { body: req.body, error: err });
    if (err.message === "NOT_VERIFIED") {
      return res.status(403).json({
        code: "NOT_VERIFIED",
        memberId: err.memberId,
        error: "Your account is pending approval from your organization admin.",
      });
    }
    return res.status(401).json({ error: err.message || "Unable to login" });
  }
};

export const signup = async (req, res) => {
  const { name, email, phone, password, accountType, organization_id, role } =
    req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const authData = await signUp({
      name,
      email,
      phone,
      password,
      accountType,
      organization_id,
      role,
    });
    return res.status(201).json(authData);
  } catch (err) {
    console.error("[AuthController] signup error", { body: req.body, error: err });
    return res.status(400).json({ error: err.message || "Unable to sign up" });
  }
};
