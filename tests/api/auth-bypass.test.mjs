import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST, GET } from "../../src/app/api/wedding/sync/route.ts";
import { createWorkspaceToken } from "../../src/lib/auth-token.ts";

test("API Suite: Authentication & Bypass Security Tests", async (t) => {
  process.env.AUTH_SECRET = "super-secure-auth-secret-key-at-least-32-chars-long";

  await t.test("SECURITY CRITICAL: Full-save POST without session or valid signed token MUST return 401 (rejection of unauthenticated email + weddingId bypass)", async () => {
    // Attacker crafts a request with victim's email and public wedding ID, but NO session cookie and NO token header
    const maliciousPayload = {
      wedding: {
        id: "11111111-2222-3333-4444-555555555555",
        title: "Pernikahan Diretas",
        inviteCode: "HAJAT-TEST99",
      },
      user: {
        email: "victim@example.test",
        name: "Victim User",
      },
      checklist: [{ id: "c-hacked", title: "Compromised" }],
    };

    const req = new NextRequest("http://localhost:3000/api/wedding/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(maliciousPayload),
    });

    const res = await POST(req);
    const body = await res.json();

    assert.equal(
      res.status,
      401,
      `Expected status 401 Unauthorized when attempting full-save without session or signed token, but received ${res.status} (${JSON.stringify(body)})`
    );
    assert.equal(body.success, false);
  });

  await t.test("SECURITY CRITICAL: Full-save POST with only email + inviteCode MUST return 401", async () => {
    const maliciousPayload = {
      wedding: {
        id: "11111111-2222-3333-4444-555555555555",
        inviteCode: "HAJAT-TEST99",
      },
      user: {
        email: "victim@example.test",
      },
      checklist: [{ id: "c-hacked", title: "Compromised" }],
    };

    const req = new NextRequest("http://localhost:3000/api/wedding/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(maliciousPayload),
    });

    const res = await POST(req);
    assert.equal(res.status, 401);
  });

  await t.test("GET /api/wedding/sync with unverified query parameter ?email=victim@example.test MUST return 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/wedding/sync?email=victim@example.test", {
      method: "GET",
    });

    const res = await GET(req);
    assert.equal(res.status, 401);
  });

  await t.test("GET /api/wedding/sync without any credentials or public parameters MUST return 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/wedding/sync", {
      method: "GET",
    });

    const res = await GET(req);
    assert.equal(res.status, 401);
  });

  await t.test("Full-save POST with valid signed workspace token in x-hajat-token header passes authorization check", async () => {
    const validToken = createWorkspaceToken("authorized@example.test", "11111111-2222-3333-4444-555555555555");
    const payload = {
      wedding: {
        id: "11111111-2222-3333-4444-555555555555",
        title: "Pernikahan Sah",
      },
      user: {
        email: "authorized@example.test",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/wedding/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hajat-token": validToken,
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    // If database is not configured (or returns 503), the auth layer did NOT reject with 401!
    assert.notEqual(res.status, 401, "Valid signed token header should pass auth check");
  });
});
