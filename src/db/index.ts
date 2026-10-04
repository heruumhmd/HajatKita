import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is not set (e.g., in local dev before user inputs credentials),
// create safe fallback so build doesn't throw at compile time.
export const sql = connectionString ? neon(connectionString) : null;
export const db = sql ? drizzle(sql, { schema }) : null;
