import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), "db", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Found ${files.length} migration files`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    console.log(`\n📝 Running migration: ${file}`);

    try {
      // Execute the SQL using Supabase's query execution
      const { error } = await supabase.rpc("exec_sql", { sql_string: sql });

      if (error) {
        console.error(`❌ Migration failed: ${error.message}`);
      } else {
        console.log(`✅ Migration completed: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error running migration: ${err.message}`);
      console.error("Note: Supabase doesn't expose raw SQL execution via JS SDK");
      console.error("Please run this SQL manually via the Supabase dashboard:");
      console.error("---");
      console.error(sql);
      console.error("---");
    }
  }
}

runMigrations().catch(console.error);
