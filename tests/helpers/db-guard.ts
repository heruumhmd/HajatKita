/**
 * Security Rule #2: Test Database Safety Guard
 * 
 * Prevents accidental execution against production database.
 * Tests immediately exit if DATABASE_URL doesn't contain a permitted 'test' branch marker
 * or if NODE_ENV is set to 'production'.
 */
export function assertTestDatabase(): void {
  if (process.env.NODE_ENV === "production") {
    console.error("🛑 FATAL SAFETY VIOLATION: NODE_ENV=production! Tests strictly prohibited against production.");
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("⚠️ NOTICE: DATABASE_URL is not set. Live database integration tests will be skipped.");
    return;
  }

  // Permitted markers: 'test', 'branch-test', 'localhost', '127.0.0.1'
  const isTestDb =
    dbUrl.toLowerCase().includes("test") ||
    dbUrl.toLowerCase().includes("localhost") ||
    dbUrl.toLowerCase().includes("127.0.0.1");

  if (!isTestDb) {
    console.error(
      "🛑 FATAL SAFETY GUARD ACTIVATED: DATABASE_URL does not contain an approved test marker ('test', 'localhost', '127.0.0.1').\n" +
      "Targeting production database is strictly prohibited to protect user data integrity.\n" +
      "Please provide a dedicated test branch (e.g. Neon branch with 'test' in the name)."
    );
    process.exit(1);
  }
}
