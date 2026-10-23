import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as loginPOST } from "../../src/app/api/auth/login/route.ts";
import { GET as syncGET } from "../../src/app/api/wedding/sync/route.ts";
import { verifyWorkspaceToken } from "../../src/lib/auth-token.ts";

test("API Suite: Login & Device Switch Authentication Tests", async (t) => {
  process.env.AUTH_SECRET = "super-secure-auth-secret-key-at-least-32-chars-long";

  await t.test("Rejects missing or invalid email with 400 Bad Request", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const res = await loginPOST(req);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  await t.test("Valid credentials login returns signed workspace token and sets HTTP-only cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nurul@example.test",
        name: "Nurul Fathonah",
        role: "BRIDE",
      }),
    });

    const res = await loginPOST(req);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.ok(body.token, "Must return signed workspace token");

    // Verify token validity
    const verified = verifyWorkspaceToken(body.token);
    assert.equal(verified.valid, true);
    assert.equal(verified.email, "nurul@example.test");

    // Verify BRIDE default avatar
    assert.equal(body.user.avatarCardId, "cat-princess");
    assert.equal(body.user.role, "BRIDE");

    // Verify cookie set
    const setCookie = res.cookies.get("hajat_workspace_token");
    assert.ok(setCookie, "Must set hajat_workspace_token cookie");
    assert.equal(setCookie.value, body.token);
  });

  await t.test("GROOM role defaults avatar to cat-prince", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "heru@example.test",
        name: "Muhammad Heru",
        role: "GROOM",
      }),
    });

    const res = await loginPOST(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.user.avatarCardId, "cat-prince");
    assert.equal(body.user.role, "GROOM");
  });

  await t.test("Switch Device Flow: Token from login authorizes subsequent sync GET without 401", async () => {
    // 1. Device 2 starts with clean browser (no session, no token)
    // 2. User logs in
    const loginReq = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nurul@example.test",
        name: "Nurul Fathonah",
        role: "BRIDE",
      }),
    });
    const loginRes = await loginPOST(loginReq);
    const loginBody = await loginRes.json();
    const token = loginBody.token;
    assert.ok(token);

    // 3. Device 2 sends sync GET with the issued token in header
    const syncReqHeader = new NextRequest("http://localhost:3000/api/wedding/sync?email=nurul@example.test", {
      method: "GET",
      headers: {
        "x-hajat-token": token,
      },
    });
    const syncResHeader = await syncGET(syncReqHeader);
    // Should NOT be 401 Unauthorized
    assert.notEqual(syncResHeader.status, 401, "Sync request with signed token must NOT be rejected with 401");

    // 4. Device 2 sends sync GET with cookie only
    const syncReqCookie = new NextRequest("http://localhost:3000/api/wedding/sync?email=nurul@example.test", {
      method: "GET",
      headers: {
        cookie: `hajat_workspace_token=${token}`,
      },
    });
    const syncResCookie = await syncGET(syncReqCookie);
    assert.notEqual(syncResCookie.status, 401, "Sync request with token cookie must NOT be rejected with 401");
  });
});
