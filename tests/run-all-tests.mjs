import { execSync } from "child_process";

console.log("==================================================================");
console.log("🚀 HAJATKITA AUTOMATED COMPREHENSIVE TEST SUITE");
console.log("==================================================================\n");

const startTime = Date.now();
const results = [];

function runSuite(name, cmd) {
  console.log(`\n▶️  [RUNNING] ${name}...`);
  console.log(`   Command: ${cmd}`);
  const sStart = Date.now();
  try {
    const output = execSync(cmd, { encoding: "utf8", stdio: ["inherit", "inherit", "inherit"] });
    const sDur = ((Date.now() - sStart) / 1000).toFixed(1);
    console.log(`✅ [PASSED] ${name} (${sDur}s)`);
    results.push({ name, status: "PASSED", duration: `${sDur}s` });
    return true;
  } catch (err) {
    const sDur = ((Date.now() - sStart) / 1000).toFixed(1);
    console.error(`❌ [FAILED] ${name} (${sDur}s)`);
    results.push({ name, status: "FAILED", duration: `${sDur}s` });
    return false;
  }
}

// 1. Unit Tests (No DB needed)
const unitPassed = runSuite("1. Unit Suite (Token, Merge, Validation)", "npx tsx --test tests/unit/token.test.mjs tests/unit/merge.test.mjs tests/unit/validation.test.mjs");

// 2. Static Code Quality & Security Tests
const staticPassed = runSuite("2. Static Suite (TypeCheck, Secrets, Headers, Routes)", "npx tsx tests/static/run-static-checks.mjs");

// 3. API Security & Authorization Tests
const apiPassed = runSuite("3. API Suite (Auth Bypass, Logout CSRF, UUID Safety)", "npx tsx tests/api/run-api-tests.mjs");

// 4. E2E Tests (Playwright)
const e2ePassed = runSuite("4. E2E Suite (Playwright Viewports & A11y)", "npx playwright test");

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

console.log("\n==================================================================");
console.log("📊 SUITE EXECUTION SUMMARY");
console.log("==================================================================");
for (const r of results) {
  const icon = r.status === "PASSED" ? "✅" : "❌";
  console.log(`  ${icon} ${r.name.padEnd(52)} : ${r.status} (${r.duration})`);
}
console.log(`\nTotal Elapsed Time: ${totalDuration}s`);
console.log("==================================================================");

const allPassed = unitPassed && staticPassed && apiPassed && e2ePassed;
if (allPassed) {
  console.log("🎉 ALL AUTOMATED SUITES COMPLETED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.error("⚠️ Some suites encountered failures. Review logs above and TEST-REPORT.md.");
  process.exit(1);
}
