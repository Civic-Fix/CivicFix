import { signIn, signUp } from "../services/authService.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const authData = await signIn(email, password);
    return res.status(200).json(authData);
  } catch (err) {
    console.error("[AuthController] login error", { body: req.body, error: err });
    return res.status(401).json({ error: err.message || "Unable to login" });
  }
};

export const signup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const authData = await signUp({ name, email, phone, password });
    return res.status(201).json(authData);
  } catch (err) {
    console.error("[AuthController] signup error", { body: req.body, error: err });
    return res.status(400).json({ error: err.message || "Unable to sign up" });
  }
};
