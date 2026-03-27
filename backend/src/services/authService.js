import { supabase } from "../config/supabaseClient.js";

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