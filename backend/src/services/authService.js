import { supabase } from "../config/supabaseClient.js";

export const signIn = async (email, password) => {
  console.log("[AuthService] signIn request", { email });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  console.log("[AuthService] signIn response", { data: { user: data?.user }, error });

  if (error || !data.session) {
    console.error("[AuthService] signIn failed", { error, data });
    throw new Error(error?.message || "Invalid login credentials");
  }

  return {
    user: data.user,
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    },
  };
};

export const signUp = async ({ name, email, phone, password }) => {
  console.log("[AuthService] signUp request", { name, email, phone });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
      },
    },
  });

  console.log("[AuthService] signUp response", {
    data: { user: data?.user, session: data?.session },
    error,
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Unable to create user");
  }

  // ✅ Update profile (trigger already created row)
  await supabase
    .from("users")
    .update({
      name,
      phone,
    })
    .eq("id", data.user.id);

  return {
    user: data.user,
    session: data.session
      ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        }
      : null,
  };
};

export const verifyToken = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new Error("Invalid token");
    }

    return data.user;
  } catch (err) {
    throw err;
  }
};