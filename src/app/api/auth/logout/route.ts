import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signOut } from "@/auth";

const AUTH_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
  "hajat_workspace_token",
  "hajat_device_credential",
];

export async function POST(req: NextRequest) {
  try {
    const cookieNames = AUTH_COOKIE_NAMES;
    // 1. Attempt server-side signOut from NextAuth
    try {
      await signOut({ redirect: false });
    } catch {
      // Non-fatal if session already invalidated
    }

    // 2. Explicitly delete all known auth cookie variants in cookie store
    try {
      const cookieStore = await cookies();
      for (const name of cookieNames) {
        try {
          cookieStore.delete(name);
        } catch {}
      }
    } catch {
      // Non-fatal if invoked outside Next.js request context (e.g. unit testing)
    }

    const response = NextResponse.json({
      success: true,
      message: "Sesi akun berhasil dihapus sepenuhnya.",
    });

    for (const name of cookieNames) {
      // Explicit expired Set-Cookie header for absolute certainty across all browsers/proxies
      response.cookies.set(name, "", {
        path: "/",
        expires: new Date(0),
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server saat keluar akun." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method Not Allowed. Permintaan keluar akun wajib menggunakan metode POST." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
