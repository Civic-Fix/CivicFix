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

async function setupStorage() {
  try {
    console.log("Creating 'issue-attachments' bucket...");

    const { data, error } = await supabase.storage.createBucket(
      "issue-attachments",
      {
        public: true,
      }
    );

    if (error) {
      if (error.message.includes("already exists")) {
        console.log("✓ Bucket 'issue-attachments' already exists");
      } else {
        throw error;
      }
    } else {
      console.log("✓ Bucket 'issue-attachments' created successfully");
    }

    // Set bucket to public
    console.log("\nConfiguring bucket permissions...");
    const { data: updateData, error: updateError } =
      await supabase.storage.updateBucket("issue-attachments", {
        public: true,
      });

    if (updateError) {
      console.warn("Warning: Could not update bucket:", updateError.message);
    } else {
      console.log("✓ Bucket is now public");
    }

    console.log("\n✓ Storage setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up storage:", error.message);
    process.exit(1);
  }
}

setupStorage();
