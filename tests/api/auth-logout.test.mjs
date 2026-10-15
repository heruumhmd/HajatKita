import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET, POST } from "../../src/app/api/auth/logout/route.ts";

test("API Suite: /api/auth/logout Security Tests", async (t) => {
  await t.test("POST /api/auth/logout succeeds and clears session cookies", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });

    const res = await POST(req);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);

    // Verify Set-Cookie headers contain expired cookies for authjs and next-auth
    const setCookie = res.headers.get("set-cookie") || "";
    assert.match(setCookie, /authjs\.session-token=;/i);
  });

  await t.test("SECURITY AUDIT: GET /api/auth/logout MUST be rejected (405 Method Not Allowed) to prevent cross-site logout CSRF", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "GET",
    });

    const res = await GET(req);
    assert.equal(
      res.status,
      405,
      `Expected status 405 Method Not Allowed for GET /api/auth/logout, got ${res.status}`
    );
  });
});
