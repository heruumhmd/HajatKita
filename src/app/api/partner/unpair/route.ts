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
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      req.cookies.get("hajat_workspace_token")?.value;

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

    // If wedding is already not connected, return clean 200 OK
    if (!targetWedding.is_partner_connected) {
      return NextResponse.json({
        success: true,
        message: "Koneksi pasangan pada workspace ini sudah tidak aktif.",
        unpairedWeddingId: targetWedding.id,
      });
    }

    const u1 = (targetWedding.primary_user_email || "").toLowerCase().trim();
    const u2 = (targetWedding.partner_user_email || targetWedding.partner_email || "").toLowerCase().trim();

    // Verify user belongs to this wedding (either as primary owner, partner user, or historical couple member)
    const isOwner = cleanUserEmail === u1;
    const isPartner = cleanUserEmail === u2;

    if (!isOwner && !isPartner) {
      // Also check couple_history for active couple relation
      const historyCheck = await sql`
        SELECT id FROM couple_history
        WHERE wedding_id = ${targetWedding.id}::uuid
          AND (LOWER(user1_email) = ${cleanUserEmail} OR LOWER(user2_email) = ${cleanUserEmail})
          AND status = 'ACTIVE'
        LIMIT 1
      `;
      if (!historyCheck || historyCheck.length === 0) {
        return NextResponse.json({ success: false, message: "Forbidden: You are not authorized to unpair this wedding" }, { status: 403 });
      }
    }

    // 1. Mark all active couple_history for this wedding as UNPAIRED (preserving audit data in DB!)
    await sql`
      UPDATE couple_history
      SET status = 'UNPAIRED', unpaired_at = NOW(), updated_at = NOW()
      WHERE wedding_id = ${targetWedding.id}::uuid AND status = 'ACTIVE'
    `;

    // 2. Mark wedding as disconnected, but keep wedding row & plan_data safe in Neon!
    await sql`
      UPDATE weddings SET
        is_partner_connected = FALSE,
        partner_name = NULL,
        partner_email = NULL,
        partner_user_email = NULL,
        partner_role = NULL,
        partner_avatar_card_id = NULL,
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
