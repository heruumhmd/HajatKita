import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../../src/app/api/partner/pair/route.ts";
import { createWorkspaceToken, verifyWorkspaceToken } from "../../src/lib/auth-token.ts";

test("API Suite: /api/partner/pair Security & Verification Tests", async (t) => {
  process.env.AUTH_SECRET = "super-secure-auth-secret-key-at-least-32-chars-long";

  await t.test("Unauthenticated POST /api/partner/pair returns 401 Unauthorized", async () => {
    const req = new NextRequest("http://localhost:3000/api/partner/pair", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.0.1",
      },
      body: JSON.stringify({ inviteCode: "HAJAT-ABC123" }),
    });

    const res = await POST(req);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, "Unauthorized");
  });

  await t.test("Authenticated POST with missing inviteCode returns 400 Bad Request", async () => {
    const token = createWorkspaceToken("user@example.test", "11111111-2222-3333-4444-555555555555");
    const req = new NextRequest("http://localhost:3000/api/partner/pair", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hajat-token": token,
        "x-forwarded-for": "10.0.0.2",
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /kode pasangan wajib diisi/i);
  });

  await t.test("Authenticated POST with whitespace inviteCode returns 400 Bad Request", async () => {
    const token = createWorkspaceToken("user@example.test", "11111111-2222-3333-4444-555555555555");
    const req = new NextRequest("http://localhost:3000/api/partner/pair", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hajat-token": token,
        "x-forwarded-for": "10.0.0.3",
      },
      body: JSON.stringify({ inviteCode: "   " }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /kode pasangan wajib diisi/i);
  });

  await t.test("Rate limiter blocks brute-force attempts (>5 attempts per IP in window) with 429", async () => {
    const testIp = "192.168.99.10";
    let lastStatus = 0;

    // Send 6 rapid requests from the same IP
    for (let i = 0; i < 6; i++) {
      const req = new NextRequest("http://localhost:3000/api/partner/pair", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({ inviteCode: `CODE-${i}` }),
      });
      const res = await POST(req);
      lastStatus = res.status;
    }

    assert.equal(lastStatus, 429, `Expected 429 on 6th request from same IP, got ${lastStatus}`);
  });

  await t.test("Workspace token signature verification is tamper-proof", async () => {
    const token = createWorkspaceToken("groom@example.test", "11111111-2222-3333-4444-555555555555");
    const verified = verifyWorkspaceToken(token);
    assert.equal(verified.valid, true);
    assert.equal(verified.email, "groom@example.test");
    assert.equal(verified.weddingId, "11111111-2222-3333-4444-555555555555");

    // Tampered payload with original signature
    const raw = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    raw.email = "hacker@example.test";
    const tampered = Buffer.from(JSON.stringify(raw), "utf8").toString("base64url");
    const tamperedVerified = verifyWorkspaceToken(tampered);
    assert.equal(tamperedVerified.valid, false);

    // Expired token check
    const expiredPayload = { ...raw, expiresAt: Date.now() - 1000 };
    const expiredToken = Buffer.from(JSON.stringify(expiredPayload), "utf8").toString("base64url");
    const expiredVerified = verifyWorkspaceToken(expiredToken);
    assert.equal(expiredVerified.valid, false);
  });
});
