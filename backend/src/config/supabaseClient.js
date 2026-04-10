import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-side only

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);