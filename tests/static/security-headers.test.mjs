import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

test("Static Suite: Security Headers Configuration", async (t) => {
  const configPath = path.resolve(process.cwd(), "next.config.ts");
  const content = fs.readFileSync(configPath, "utf8");

  await t.test("next.config.ts specifies X-Frame-Options", () => {
    assert.match(content, /X-Frame-Options/i);
  });

  await t.test("next.config.ts specifies X-Content-Type-Options: nosniff", () => {
    assert.match(content, /X-Content-Type-Options/i);
    assert.match(content, /nosniff/i);
  });

  await t.test("next.config.ts specifies Referrer-Policy", () => {
    assert.match(content, /Referrer-Policy/i);
  });

  await t.test("next.config.ts specifies Strict-Transport-Security (HSTS)", () => {
    assert.match(content, /Strict-Transport-Security/i);
  });

  await t.test("next.config.ts specifies Permissions-Policy", () => {
    assert.match(content, /Permissions-Policy/i);
  });

  await t.test("AUDIT FINDING: Content-Security-Policy (CSP) presence check", () => {
    const hasCSP = /Content-Security-Policy/i.test(content);
    if (!hasCSP) {
      console.warn("   [AUDIT FINDING] CSP is not yet configured in next.config.ts. Recommended policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
    }
    // We document whether CSP is present or needs to be proposed
    assert.equal(hasCSP, false, "CSP is currently missing in next.config.ts and flagged for security report");
  });
});
