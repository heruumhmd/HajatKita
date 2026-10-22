import { execSync } from "child_process";
import { assertTestDatabase } from "../helpers/db-guard.ts";

console.log("=======================================================");
console.log("🌐 API SECURITY & INTEGRATION TEST SUITE");
console.log("=======================================================\n");

// Security Rule #2: Check database guard
assertTestDatabase();

let failures = 0;

function runApiSuite(name, cmd) {
  process.stdout.write(`⏳ Running: ${name}... `);
  try {
    const out = execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    console.log("✅ PASS");
    return { ok: true, output: out };
  } catch (err) {
    console.log("❌ FAIL");
    failures++;
    return { ok: false, output: (err.stdout || "") + "\n" + (err.stderr || "") };
  }
}

// 1. Auth Bypass & Privilege Escalation Tests
const bypassResult = runApiSuite(
  "Auth Bypass & Device Credential Protections",
  "npx tsx --test tests/api/auth-bypass.test.mjs"
);
if (!bypassResult.ok) console.log(bypassResult.output);

// 2. Auth Logout & CSRF Tests
const logoutResult = runApiSuite(
  "Logout CSRF & Cookie Lifecycle",
  "npx tsx --test tests/api/auth-logout.test.mjs"
);
if (!logoutResult.ok) console.log(logoutResult.output);

// 3. Partner Unpair & Validation Tests
const unpairResult = runApiSuite(
  "Partner Unpair Authorization & UUID Validation",
  "npx tsx --test tests/api/unpair.test.mjs"
);
if (!unpairResult.ok) console.log(unpairResult.output);

// 4. Partner Pair Authorization, Rate Limiting & Validation Tests
const pairResult = runApiSuite(
  "Partner Pair Authorization, Rate Limiting & Validation",
  "npx tsx --test tests/api/pair.test.mjs"
);
if (!pairResult.ok) console.log(pairResult.output);

// Database Integration Status
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.toLowerCase().includes("test")) {
  console.log("\n[INFO] Live DB Integration Tests against external Neon PostgreSQL:");
  console.log("⚠️  SKIPPED: Live database test branch is not currently provisioned.");
  console.log("   Per Security Rule #2, testing against production database is strictly blocked.");
  console.log("   Documented in TEST-REPORT.md under 'Tidak Teruji'.");
}

console.log("\n=======================================================");
if (failures === 0) {
  console.log("🎉 ALL API SECURITY SPECIFICATIONS PASSED!");
  process.exit(0);
} else {
  console.error(`❌ ${failures} API suite(s) failed.`);
  process.exit(1);
}
