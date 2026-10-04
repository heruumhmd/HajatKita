import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db";

export async function POST(req: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { inviteCode, userEmail, userName, userRole, userAvatarCardId } = body;

    if (!inviteCode || !inviteCode.trim()) {
      return NextResponse.json({ success: false, message: "Kode pasangan wajib diisi" }, { status: 400 });
    }

    const cleanCode = inviteCode.trim().toUpperCase();
    const cleanUserEmail = (userEmail || "").toLowerCase().trim();

    // 1. Find wedding matching the invite code
    const targetWeddings = await sql`
      SELECT * FROM weddings WHERE UPPER(invite_code) = ${cleanCode} LIMIT 1
    `;

    if (!targetWeddings || targetWeddings.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kode pasangan tidak ditemukan. Pastikan kode yang dimasukkan sudah tepat." },
        { status: 404 }
      );
    }

    const targetWedding = targetWeddings[0];
    const targetOwnerEmail = (targetWedding.primary_user_email || "").toLowerCase().trim();

    // Prevent pairing with self
    if (cleanUserEmail && targetOwnerEmail && cleanUserEmail === targetOwnerEmail) {
      return NextResponse.json(
        { success: false, message: "Ini adalah kode pasangan milik Anda sendiri. Bagikan kode ini ke pasangan Anda." },
        { status: 400 }
      );
    }

    // 2. Check couple history between cleanUserEmail and targetOwnerEmail
    let historicalWedding = null;
    let coupleRecord = null;

    if (cleanUserEmail && targetOwnerEmail) {
      const historyRows = await sql`
        SELECT * FROM couple_history
        WHERE (LOWER(user1_email) = ${cleanUserEmail} AND LOWER(user2_email) = ${targetOwnerEmail})
           OR (LOWER(user1_email) = ${targetOwnerEmail} AND LOWER(user2_email) = ${cleanUserEmail})
        ORDER BY updated_at DESC LIMIT 1
      `;

      if (historyRows && historyRows.length > 0) {
        coupleRecord = historyRows[0];
        // Re-connecting with the SAME person: retrieve preserved shared wedding!
        const preservedWeddings = await sql`
          SELECT * FROM weddings WHERE id = ${coupleRecord.wedding_id}::uuid LIMIT 1
        `;
        if (preservedWeddings && preservedWeddings.length > 0) {
          historicalWedding = preservedWeddings[0];
        }
      }
    }

    let activeWeddingId: string;
    let chosenWeddingRow = null;

    if (historicalWedding) {
      // SCENARIO 1: Same person re-connecting -> RESTORE ALL PRESERVED DATA!
      activeWeddingId = historicalWedding.id;
      chosenWeddingRow = historicalWedding;

      // Reactivate couple history record
      if (coupleRecord) {
        await sql`
          UPDATE couple_history 
          SET status = 'ACTIVE', unpaired_at = NULL, updated_at = NOW()
          WHERE id = ${coupleRecord.id}::uuid
        `;
      }

      // Reactivate workspace
      await sql`
        UPDATE weddings SET
          is_partner_connected = TRUE,
          partner_name = COALESCE(${userName}, partner_name),
          partner_email = ${cleanUserEmail},
          partner_role = ${userRole || "BRIDE"},
          partner_avatar_card_id = ${userAvatarCardId || "cat-princess"},
          updated_at = NOW()
        WHERE id = ${activeWeddingId}::uuid
      `;
    } else {
      // SCENARIO 2: New / Different person -> Isolate data from any ex-partner!
      activeWeddingId = targetWedding.id;
      chosenWeddingRow = targetWedding;

      // Record in couple_history
      if (cleanUserEmail && targetOwnerEmail) {
        await sql`
          INSERT INTO couple_history (user1_email, user2_email, wedding_id, status, updated_at)
          VALUES (${targetOwnerEmail}, ${cleanUserEmail}, ${activeWeddingId}::uuid, 'ACTIVE', NOW())
        `;
      }

      // Connect partner in target workspace
      await sql`
        UPDATE weddings SET
          is_partner_connected = TRUE,
          partner_name = ${userName || "Pasangan"},
          partner_email = ${cleanUserEmail},
          partner_role = ${userRole || (targetWedding.groom_name ? "BRIDE" : "GROOM")},
          partner_avatar_card_id = ${userAvatarCardId || "cat-princess"},
          updated_at = NOW()
        WHERE id = ${activeWeddingId}::uuid
      `;
    }

    // Fetch the updated wedding row to return to client
    const updatedRows = await sql`SELECT * FROM weddings WHERE id = ${activeWeddingId}::uuid LIMIT 1`;
    const finalWedding = updatedRows[0];

    let parsedPlanData = null;
    if (finalWedding.plan_data) {
      try {
        parsedPlanData = JSON.parse(finalWedding.plan_data);
      } catch (e) {
        console.error("Failed to parse plan_data", e);
      }
    }

    const partnerName = targetOwnerEmail === cleanUserEmail ? finalWedding.partner_name : (finalWedding.groom_name || finalWedding.partner_name || "Pasangan");

    return NextResponse.json({
      success: true,
      message: `Selamat! Anda berhasil terhubung dengan ${partnerName}. Workspace pernikahan kini tersinkron!`,
      isRestoredFromSamePartner: Boolean(historicalWedding),
      wedding: {
        id: finalWedding.id,
        title: finalWedding.title,
        groomName: finalWedding.groom_name || "",
        brideName: finalWedding.bride_name || "",
        weddingDate: finalWedding.wedding_date || "",
        city: finalWedding.city || "",
        targetBudget: parseFloat(finalWedding.target_budget || "0"),
        currentSavings: parseFloat(finalWedding.current_savings || "0"),
        inviteCode: finalWedding.invite_code,
        slug: finalWedding.slug || "",
        venueName: finalWedding.venue_name || "",
        venueAddress: finalWedding.venue_address || "",
        maharDetails: finalWedding.mahar_details || "",
        waliNikah: finalWedding.wali_nikah || "",
        penghulu: finalWedding.penghulu || "",
        saksiNikah: finalWedding.saksi_nikah || "",
        isPartnerConnected: true,
        partnerInfo: {
          name: finalWedding.partner_name || "Pasangan",
          role: finalWedding.partner_role || "BRIDE",
          email: finalWedding.partner_email || "",
          avatarCardId: finalWedding.partner_avatar_card_id || "cat-princess",
        },
      },
      planData: parsedPlanData,
    });
  } catch (error: any) {
    console.error("Error in POST /api/partner/pair:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
