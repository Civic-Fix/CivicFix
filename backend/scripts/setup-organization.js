import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

async function setupOrganization() {
  try {
    console.log("Checking for existing organizations...\n");

    // Fetch organizations
    const { data: organizations, error: fetchError } = await supabase
      .from("organizations")
      .select("id, name")
      .limit(10);

    if (fetchError) {
      console.error("Error fetching organizations:", fetchError.message);
      process.exit(1);
    }

    if (organizations && organizations.length > 0) {
      console.log("Found existing organizations:");
      organizations.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.name} (ID: ${org.id})`);
      });

      const defaultOrgId = organizations[0].id;
      console.log(`\nUsing first organization as default: ${defaultOrgId}`);

      // Add to .env
      const envPath = path.join(process.cwd(), ".env");
      let envContent = fs.readFileSync(envPath, "utf-8");

      if (envContent.includes("DEFAULT_ORGANIZATION_ID")) {
        console.log("DEFAULT_ORGANIZATION_ID already exists in .env");
        envContent = envContent.replace(
          /DEFAULT_ORGANIZATION_ID=.*/,
          `DEFAULT_ORGANIZATION_ID=${defaultOrgId}`
        );
      } else {
        envContent += `\nDEFAULT_ORGANIZATION_ID=${defaultOrgId}`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log(`✓ Updated .env with DEFAULT_ORGANIZATION_ID=${defaultOrgId}`);
    } else {
      console.log(
        "No organizations found. Creating default organization...\n"
      );

      const { data: newOrg, error: createError } = await supabase
        .from("organizations")
        .insert([
          {
            name: "Default City",
            description: "Default organization for CivicFix",
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating organization:", createError.message);
        process.exit(1);
      }

      const orgId = newOrg.id;
      console.log(`✓ Created organization: ${newOrg.name} (ID: ${orgId})`);

      // Add to .env
      const envPath = path.join(process.cwd(), ".env");
      let envContent = fs.readFileSync(envPath, "utf-8");

      if (!envContent.includes("DEFAULT_ORGANIZATION_ID")) {
        envContent += `\nDEFAULT_ORGANIZATION_ID=${orgId}`;
        fs.writeFileSync(envPath, envContent);
      }

      console.log(`✓ Updated .env with DEFAULT_ORGANIZATION_ID=${orgId}`);
    }

    console.log(
      "\n✓ Organization setup complete! Restart the server to apply changes."
    );
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

setupOrganization();
