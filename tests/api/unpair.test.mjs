import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../../src/app/api/partner/unpair/route.ts";
import { createWorkspaceToken } from "../../src/lib/auth-token.ts";

test("API Suite: /api/partner/unpair Security Tests", async (t) => {
  process.env.AUTH_SECRET = "super-secure-auth-secret-key-at-least-32-chars-long";

  await t.test("Unauthenticated POST /api/partner/unpair returns 401 Unauthorized", async () => {
    const req = new NextRequest("http://localhost:3000/api/partner/unpair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId: "11111111-2222-3333-4444-555555555555" }),
    });

    const res = await POST(req);
    assert.equal(res.status, 401);
  });

  await t.test("Authenticated POST with invalid weddingId UUID format returns 400 Bad Request instead of 500 crash", async () => {
    const token = createWorkspaceToken("qa-user@example.test", "11111111-2222-3333-4444-555555555555");
    const headers = {
      "Content-Type": "application/json",
      "x-hajat-token": token,
    };

    const req = new NextRequest("http://localhost:3000/api/partner/unpair", {
      method: "POST",
      headers,
      body: JSON.stringify({ weddingId: "malformed-not-a-uuid" }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400, `Expected 400 Bad Request on invalid UUID, got ${res.status}`);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /valid/i);
  });
});
