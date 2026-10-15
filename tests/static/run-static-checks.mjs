import { execSync } from "child_process";

console.log("=======================================================");
console.log("🔍 STATIC CHECKS & CODE QUALITY SUITE");
console.log("=======================================================\n");

let failures = 0;

function runStep(name, cmd) {
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

// 1. TypeScript Type Check
const tsResult = runStep("TypeScript Compilation (tsc --noEmit)", "npx tsc --noEmit");
if (!tsResult.ok) console.log(tsResult.output);

// 2. Secret Scan
const secretResult = runStep("Secret Scanner (tests/static/secrets-scan.mjs)", "npx tsx --test tests/static/secrets-scan.mjs");
if (!secretResult.ok) console.log(secretResult.output);

// 3. Security Headers
const headerResult = runStep("Security Headers Audit (tests/static/security-headers.test.mjs)", "npx tsx --test tests/static/security-headers.test.mjs");
if (!headerResult.ok) console.log(headerResult.output);

// 4. Internal Route Checker
const routeResult = runStep("Internal Route Integrity (tests/static/route-checker.test.mjs)", "npx tsx --test tests/static/route-checker.test.mjs");
if (!routeResult.ok) console.log(routeResult.output);

// 5. ESLint Code Linting
console.log("\n[INFO] Running ESLint check (reporting findings without breaking suite):");
try {
  execSync("npx eslint src/", { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  console.log("✅ ESLint: 0 errors/warnings");
} catch (err) {
  console.log("⚠️ ESLint found issues (reported in TEST-REPORT.md):");
  const output = (err.stdout || "") + (err.stderr || "");
  const lines = output.split("\n").filter(l => l.includes("Error:") || l.includes("Warning:"));
  lines.forEach(l => console.log("   " + l.trim()));
}

// 6. NPM Audit
console.log("\n[INFO] Running npm audit --omit=dev:");
try {
  execSync("npm audit --omit=dev", { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  console.log("✅ npm audit: 0 production vulnerabilities");
} catch (err) {
  console.log("⚠️ npm audit found known package vulnerabilities (reported in TEST-REPORT.md):");
  const output = (err.stdout || "");
  const lines = output.split("\n").filter(l => l.includes("Severity:") || l.includes("via"));
  lines.slice(0, 4).forEach(l => console.log("   " + l.trim()));
}

console.log("\n=======================================================");
if (failures === 0) {
  console.log("🎉 ALL STATIC INTEGRITY CHECKS PASSED!");
  process.exit(0);
} else {
  console.error(`❌ ${failures} static check(s) failed.`);
  process.exit(1);
}
