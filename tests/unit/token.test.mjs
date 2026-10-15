import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { createWorkspaceToken, verifyWorkspaceToken } from "../../src/lib/auth-token.ts";

test("Token Suite: Unit Tests", async (t) => {
  const originalEnvSecret = process.env.AUTH_SECRET;

  await t.test("Valid token roundtrip succeeds with correct email and weddingId", () => {
    process.env.AUTH_SECRET = "super-secret-key-at-least-32-chars-long-test";
    const token = createWorkspaceToken("Bride@Example.Com ", "wed-uuid-1234");
    const result = verifyWorkspaceToken(token);

    assert.equal(result.valid, true);
    assert.equal(result.email, "bride@example.com");
    assert.equal(result.weddingId, "wed-uuid-1234");
  });

  await t.test("Tampered email is rejected", () => {
    process.env.AUTH_SECRET = "super-secret-key-at-least-32-chars-long-test";
    const token = createWorkspaceToken("alice@example.test", "wed-123");
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    payload.email = "attacker@example.test";
    const tampered = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const result = verifyWorkspaceToken(tampered);
    assert.equal(result.valid, false);
  });

  await t.test("Tampered weddingId is rejected", () => {
    process.env.AUTH_SECRET = "super-secret-key-at-least-32-chars-long-test";
    const token = createWorkspaceToken("alice@example.test", "wed-123");
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    payload.weddingId = "wed-victim-999";
    const tampered = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const result = verifyWorkspaceToken(tampered);
    assert.equal(result.valid, false);
  });

  await t.test("Tampered expiration date is rejected", () => {
    process.env.AUTH_SECRET = "super-secret-key-at-least-32-chars-long-test";
    const token = createWorkspaceToken("alice@example.test", "wed-123");
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    payload.expiresAt = payload.expiresAt + 1000000;
    const tampered = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const result = verifyWorkspaceToken(tampered);
    assert.equal(result.valid, false);
  });

  await t.test("Expired token is rejected even with valid signature", () => {
    process.env.AUTH_SECRET = "super-secret-key-at-least-32-chars-long-test";
    const expiredToken = createWorkspaceToken("alice@example.test", "wed-123", -1);
    const result = verifyWorkspaceToken(expiredToken);
    assert.equal(result.valid, false);
  });

  await t.test("Signature with invalid length or non-hex bytes is rejected safely without crash", () => {
    process.env.AUTH_SECRET = "super-secret-key-at-least-32-chars-long-test";
    const token = createWorkspaceToken("alice@example.test", "wed-123");
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));

    // Odd length hex string
    payload.signature = "abc";
    let bad = Buffer.from(JSON.stringify(payload)).toString("base64url");
    assert.equal(verifyWorkspaceToken(bad).valid, false);

    // Too long signature
    payload.signature = "a".repeat(128);
    bad = Buffer.from(JSON.stringify(payload)).toString("base64url");
    assert.equal(verifyWorkspaceToken(bad).valid, false);

    // Non-hex signature
    payload.signature = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";
    bad = Buffer.from(JSON.stringify(payload)).toString("base64url");
    assert.equal(verifyWorkspaceToken(bad).valid, false);
  });

  await t.test("Malformed base64 and non-string inputs are rejected", () => {
    assert.equal(verifyWorkspaceToken("").valid, false);
    assert.equal(verifyWorkspaceToken("not-base-64-json!@#$%^").valid, false);
    assert.equal(verifyWorkspaceToken(null).valid, false);
    assert.equal(verifyWorkspaceToken(undefined).valid, false);
    assert.equal(verifyWorkspaceToken(12345).valid, false);
  });

  await t.test("Token created with different secret is rejected", () => {
    const SECRET_A = "secret-key-alpha-32-characters-long";
    const SECRET_B = "secret-key-beta-32-characters-long";

    const email = "qa-user@example.test";
    const weddingId = "wed-alpha";
    const exp = Date.now() + 100000;
    const data = `${email}:${weddingId}:${exp}`;
    const sigA = crypto.createHmac("sha256", SECRET_A).update(data).digest("hex");
    const forgedWithA = Buffer.from(JSON.stringify({ email, weddingId, expiresAt: exp, signature: sigA })).toString("base64url");

    process.env.AUTH_SECRET = SECRET_B;
    const verified = verifyWorkspaceToken(forgedWithA);
    assert.equal(verified.valid, false);
  });

  await t.test("SECURITY CRITICAL: Token generation MUST throw if AUTH_SECRET is not set (hardcoded fallback forbidden)", () => {
    delete process.env.AUTH_SECRET;
    // Calling createWorkspaceToken without AUTH_SECRET configured must throw
    assert.throws(
      () => {
        createWorkspaceToken("user@example.test", "wed-test");
      },
      /AUTH_SECRET/i,
      "Expected createWorkspaceToken to throw an error when AUTH_SECRET is unset"
    );
  });

  // Restore env
  if (originalEnvSecret) {
    process.env.AUTH_SECRET = originalEnvSecret;
  }
});
