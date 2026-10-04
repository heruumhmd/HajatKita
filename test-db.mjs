import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_pnTeU45ircOm@ep-old-wildflower-b4xkhid1-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("Connected successfully! Tables:", result);
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
}

main();
