import crypto from "crypto";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
    throw new Error("AUTH_SECRET environment variable is required to generate workspace tokens");
  }
  return secret;
}

/**
 * Creates a cryptographically signed workspace token for secure mobile and background sync.
 * Tamper-proof: any modification of email, weddingId, or expiration will invalidate the signature.
 */
export function createWorkspaceToken(email: string, weddingId: string, ttlDays = 30): string {
  const secret = getAuthSecret();
  const cleanEmail = email.toLowerCase().trim();
  const cleanWeddingId = weddingId.trim();
  const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;

  const data = `${cleanEmail}:${cleanWeddingId}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");

  const payload = JSON.stringify({ email: cleanEmail, weddingId: cleanWeddingId, expiresAt, signature });
  return Buffer.from(payload, "utf8").toString("base64url");
}

/**
 * Verifies a workspace token's signature and expiration.
 */
export function verifyWorkspaceToken(token: string): { valid: boolean; email?: string; weddingId?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
    return { valid: false };
  }

  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const { email, weddingId, expiresAt, signature } = JSON.parse(raw);

    if (!email || !expiresAt || !signature) {
      return { valid: false };
    }

    if (Date.now() > Number(expiresAt)) {
      return { valid: false }; // Expired
    }

    const data = `${email}:${weddingId || ""}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");
    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: true, email: String(email).toLowerCase().trim(), weddingId: String(weddingId || "") };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}
