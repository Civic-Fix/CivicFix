import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log("📊 Checking database...\n");

  // Check organizations
  console.log("🏢 Organizations:");
  const { data: orgs, error: orgsError } = await supabase
    .from("organizations")
    .select("*");
  if (orgsError) console.error(orgsError);
  else console.log(JSON.stringify(orgs, null, 2));

  console.log("\n👥 Users:");
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*");
  if (usersError) console.error(usersError);
  else console.log(JSON.stringify(users, null, 2));

  console.log("\n📍 Issues:");
  const { data: issues, error: issuesError } = await supabase
    .from("issues")
    .select("*");
  if (issuesError) console.error(issuesError);
  else console.log(`Found ${issues?.length || 0} issues:`);
  if (issues?.length > 0) {
    console.log(JSON.stringify(issues, null, 2));
  } else {
    console.log("No issues found!");
  }

  console.log("\n📎 Attachments:");
  const { data: attachments, error: attachmentsError } = await supabase
    .from("attachments")
    .select("*");
  if (attachmentsError) console.error(attachmentsError);
  else console.log(`Found ${attachments?.length || 0} attachments`);
}

checkDatabase();
