import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db";

export async function POST(req: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { userEmail, weddingId } = body;

    const cleanUserEmail = (userEmail || "").toLowerCase().trim();

    if (!cleanUserEmail && !weddingId) {
      return NextResponse.json({ success: false, message: "Email atau Wedding ID diperlukan" }, { status: 400 });
    }

    let targetWedding = null;

    if (weddingId) {
      const rows = await sql`SELECT * FROM weddings WHERE id = ${weddingId}::uuid LIMIT 1`;
      if (rows && rows.length > 0) targetWedding = rows[0];
    }

    if (!targetWedding && cleanUserEmail) {
      const rows = await sql`
        SELECT * FROM weddings 
        WHERE (LOWER(primary_user_email) = ${cleanUserEmail} OR LOWER(partner_user_email) = ${cleanUserEmail})
          AND is_partner_connected = TRUE
        LIMIT 1
      `;
      if (rows && rows.length > 0) targetWedding = rows[0];
    }

    if (!targetWedding) {
      return NextResponse.json({ success: true, message: "Tidak ada koneksi pasangan aktif yang ditemukan." });
    }

    const u1 = (targetWedding.primary_user_email || "").toLowerCase().trim();
    const u2 = (targetWedding.partner_user_email || "").toLowerCase().trim();

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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
