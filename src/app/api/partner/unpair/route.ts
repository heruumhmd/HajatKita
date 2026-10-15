import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db";
import { auth } from "@/auth";
import { findWeddingForEmail } from "@/db/find-wedding";

import { createWorkspaceToken, verifyWorkspaceToken } from "@/lib/auth-token";

export async function POST(req: NextRequest) {
  try {
    let session = null;
    try {
      session = await auth();
    } catch {}

    const rawToken =
      req.headers.get("x-hajat-token") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    let tokenEmail: string | undefined;
    if (rawToken) {
      const verified = verifyWorkspaceToken(rawToken);
      if (verified.valid && verified.email) {
        tokenEmail = verified.email;
      }
    }

    const cleanUserEmail = session?.user?.email?.toLowerCase().trim() || tokenEmail;
    if (!cleanUserEmail) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { weddingId } = body;

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (weddingId) {
      if (typeof weddingId !== "string" || !UUID_REGEX.test(weddingId.trim())) {
        return NextResponse.json({ success: false, message: "Format weddingId tidak valid" }, { status: 400 });
      }
    }

    if (!sql) {
      return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503 });
    }

    let targetWedding = null;

    if (weddingId) {
      const rows = await sql`SELECT * FROM weddings WHERE id = ${weddingId.trim()}::uuid LIMIT 1`;
      if (rows && rows.length > 0) targetWedding = rows[0];
    }

    if (!targetWedding) {
      targetWedding = await findWeddingForEmail(cleanUserEmail);
    }

    if (!targetWedding) {
      return NextResponse.json({ success: true, message: "Tidak ada koneksi pasangan aktif yang ditemukan." });
    }

    const u1 = (targetWedding.primary_user_email || "").toLowerCase().trim();
    const u2 = (targetWedding.partner_user_email || targetWedding.partner_email || "").toLowerCase().trim();

    // Verify user belongs to this wedding
    if (u1 !== cleanUserEmail && u2 !== cleanUserEmail) {
      return NextResponse.json({ success: false, message: "Forbidden: You are not authorized to unpair this wedding" }, { status: 403 });
    }

    // 1. Mark couple_history as UNPAIRED (preserving data in database!)
    if (u1 && u2) {
      await sql`
        UPDATE couple_history
        SET status = 'UNPAIRED', unpaired_at = NOW(), updated_at = NOW()
        WHERE ((LOWER(user1_email) = ${u1} AND LOWER(user2_email) = ${u2})
            OR (LOWER(user1_email) = ${u2} AND LOWER(user2_email) = ${u1}))
          AND status = 'ACTIVE'
      `;
    }

    // 2. Mark wedding as disconnected, but keep wedding row & plan_data safe in Neon!
    await sql`
      UPDATE weddings SET
        is_partner_connected = FALSE,
        updated_at = NOW()
      WHERE id = ${targetWedding.id}::uuid
    `;

    return NextResponse.json({
      success: true,
      message: "Hubungan pasangan berhasil dibatalkan. Data bersama Anda tetap tersimpan aman di database dan akan dipulihkan otomatis jika terhubung kembali dengan orang yang sama.",
      unpairedWeddingId: targetWedding.id,
    });
  } catch (error: any) {
    console.error("Error in POST /api/partner/unpair:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
