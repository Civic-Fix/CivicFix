import {
  deleteCitizenAccount,
  refreshSession,
  signIn,
  signUp,
  updateAuthenticatedPassword,
  updateCitizenProfile,
} from "../services/authService.js";
import { createClient } from "@supabase/supabase-js";

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
  const { name, email, phone, password, accountType, organization_id, role, redirectTo } =
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
      redirectTo,
    });
    return res.status(201).json(authData);
  } catch (err) {
    console.error("[AuthController] signup error", { body: req.body, error: err });
    return res.status(400).json({ error: err.message || "Unable to sign up" });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const session = await refreshSession(refreshToken);
    return res.status(200).json({ session });
  } catch (err) {
    console.error("[AuthController] refresh error", { error: err });
    return res.status(401).json({ error: err.message || "Unable to refresh session" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await updateCitizenProfile(req.userId, {
      name: req.body.name,
      avatarUrl: req.body.avatarUrl,
    });

    return res.status(200).json({ profile });
  } catch (err) {
    console.error("[AuthController] updateProfile error", {
      userId: req.userId,
      error: err,
    });
    return res.status(400).json({ error: err.message || "Unable to update profile" });
  }
};

export const uploadAvatar = async (req, res) => {
  const { file_data_base64, mime_type } = req.body;
  const userId = req.user.id;

  if (!file_data_base64 || !mime_type) {
    return res.status(400).json({ error: "Missing file data or mime type." });
  }

  try {
    // Create a temporary admin client for this operation to handle storage.
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // 1. Decode the Base64 string into a buffer.
    const fileContent = Buffer.from(file_data_base64, "base64");

    // 2. Create a unique and deterministic file path.
    const fileExt = mime_type.split("/")[1] || "png";
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const filePath = `${userId}/avatar-${uniqueId}.${fileExt}`;

    // 3. Upload the file to the 'avatars' bucket in Supabase Storage.
    const { data: uploadData, error: uploadError } =
      await supabaseAdmin.storage
        .from("avatars")
        .upload(filePath, fileContent, {
          contentType: mime_type,
          upsert: true, // Overwrite the file if it already exists.
        });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError.message);
      throw new Error("Failed to upload avatar to storage.");
    }

    // 4. Get the public URL of the newly uploaded file.
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(uploadData.path);

    if (!urlData.publicUrl) {
      throw new Error("Could not retrieve public URL for avatar.");
    }

    // 5. Return the public URL in the response.
    return res.status(200).json({ avatarUrl: urlData.publicUrl });
  } catch (error) {
    console.error("[AuthController] uploadAvatar error:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred during avatar upload." });
  }
};

export const recoverPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // Create a temporary admin client for this operation
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      // The redirectTo URL should point to your frontend where the password can be reset.
      // Supabase will append the necessary hash fragments for the recovery flow.
      redirectTo: process.env.CLIENT_URL, 
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({ message: "Password recovery email sent." });
  } catch (err) {
    console.error("[AuthController] recoverPassword error", { email, error: err });
    return res.status(500).json({ error: err.message || "Error sending recovery email." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await updateAuthenticatedPassword(req.userId, req.body.newPassword);
    return res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error("[AuthController] resetPassword error", {
      userId: req.userId,
      error: err,
    });
    return res.status(400).json({ error: err.message || "Unable to update password" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await deleteCitizenAccount(req.userId);
    return res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    console.error("[AuthController] deleteAccount error", {
      userId: req.userId,
      error: err,
    });
    return res.status(400).json({ error: err.message || "Unable to delete account" });
  }
};
