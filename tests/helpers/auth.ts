import { encode } from "next-auth/jwt";
import { createWorkspaceToken } from "../../src/lib/auth-token";

export async function mintSession(
  email: string,
  name = "QA Tester",
  secret = process.env.AUTH_SECRET || "qa-test-auth-secret-key-at-least-32-chars-long"
): Promise<string> {
  const token = await encode({
    token: {
      sub: `qa-${Buffer.from(email).toString("hex").slice(0, 16)}`,
      email: email.toLowerCase().trim(),
      name,
    },
    secret,
    salt: "authjs.session-token",
  });
  return token;
}

export function createAuthCookieHeader(sessionToken: string): { Cookie: string } {
  return {
    Cookie: `authjs.session-token=${sessionToken}; hajat_device_credential=qa-test-device`,
  };
}

export function createTokenHeader(token: string): { "x-hajat-token": string } {
  return {
    "x-hajat-token": token,
  };
}

export { createWorkspaceToken };
