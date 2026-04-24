import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorageRLS() {
  try {
    console.log("Setting up storage RLS policies...\n");

    // Execute RLS policy creation via SQL
    const { error: rls1Error } = await supabase.rpc("enable_bucket_rls", {
      bucket_name: "issue-attachments",
    });

    if (
      rls1Error &&
      !rls1Error.message.includes("does not exist") &&
      !rls1Error.message.includes("already exists")
    ) {
      console.warn("Note: RLS policy setup via RPC may need manual configuration");
    }

    // Since Supabase doesn't expose RLS policy management via JS SDK,
    // we'll inform the user to disable RLS or use the dashboard
    console.log("Storage bucket 'issue-attachments' configuration:");
    console.log("============================================");
    console.log(
      "\nPlease complete these steps in Supabase Dashboard:\n"
    );
    console.log("1. Go to Storage → Buckets → issue-attachments");
    console.log("2. Click on the bucket name to open settings");
    console.log("3. Scroll down to 'RLS Policy' section");
    console.log(
      "4. DISABLE 'Enable RLS' toggle (or add these policies):\n"
    );
    console.log("   If keeping RLS enabled, add these policies:");
    console.log("   - Allow INSERT for authenticated users");
    console.log("   - Allow SELECT for authenticated users");
    console.log("   - Allow DELETE for authenticated users (their own files)\n");
    console.log("5. Save changes and restart your backend\n");

    console.log("Alternative (Quick Fix):");
    console.log("- Simply disable RLS for this bucket in the dashboard");
    console.log(
      "- This is safe for public attachment storage like issue proofs\n"
    );

    console.log("✓ Storage setup guide complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

setupStorageRLS();
