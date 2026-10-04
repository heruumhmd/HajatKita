import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    let email = searchParams.get("email")?.toLowerCase().trim();

    // If email not in query params, try NextAuth session
    if (!email) {
      const session = await auth();
      email = session?.user?.email?.toLowerCase().trim();
    }

    const inviteCode = searchParams.get("code")?.trim().toUpperCase();

    let weddingRow = null;

    if (inviteCode) {
      const rows = await sql`
        SELECT * FROM weddings WHERE UPPER(invite_code) = ${inviteCode} LIMIT 1
      `;
      if (rows && rows.length > 0) {
        weddingRow = rows[0];
      }
    } else if (email) {
      // Find wedding where user is primary or partner
      const rows = await sql`
        SELECT * FROM weddings 
        WHERE LOWER(primary_user_email) = ${email} 
           OR LOWER(partner_user_email) = ${email}
        ORDER BY updated_at DESC LIMIT 1
      `;
      if (rows && rows.length > 0) {
        weddingRow = rows[0];
      }
    }

    if (!weddingRow) {
      return NextResponse.json({ success: true, exists: false, data: null });
    }

    let parsedPlanData = null;
    if (weddingRow.plan_data) {
      try {
        parsedPlanData = JSON.parse(weddingRow.plan_data);
      } catch (e) {
        console.error("Failed to parse plan_data", e);
      }
    }

    const wedding = {
      id: weddingRow.id,
      title: weddingRow.title || "Pernikahan Kita",
      groomName: weddingRow.groom_name || "",
      brideName: weddingRow.bride_name || "",
      weddingDate: weddingRow.wedding_date || "",
      city: weddingRow.city || "",
      targetBudget: parseFloat(weddingRow.target_budget || "0"),
      currentSavings: parseFloat(weddingRow.current_savings || "0"),
      inviteCode: weddingRow.invite_code,
      slug: weddingRow.slug || "",
      venueName: weddingRow.venue_name || "",
      venueAddress: weddingRow.venue_address || "",
      maharDetails: weddingRow.mahar_details || "",
      waliNikah: weddingRow.wali_nikah || "",
      penghulu: weddingRow.penghulu || "",
      saksiNikah: weddingRow.saksi_nikah || "",
      isPartnerConnected: Boolean(weddingRow.is_partner_connected),
      partnerInfo: weddingRow.partner_email ? {
        name: weddingRow.partner_name || "Pasangan",
        role: weddingRow.partner_role || "BRIDE",
        email: weddingRow.partner_email || "",
        avatarCardId: weddingRow.partner_avatar_card_id || "cat-princess",
      } : undefined,
    };

    return NextResponse.json({
      success: true,
      exists: true,
      wedding,
      planData: parsedPlanData,
    });
  } catch (error: any) {
    console.error("Error in GET /api/wedding/sync:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const {
      wedding,
      savingContributions,
      checklist,
      seserahan,
      postWedding,
      guests,
      familyQuota,
      rundown,
      budgetCategories,
      vendors,
      alignmentTopics,
      adminSteps,
      activityLogs,
      user,
    } = body;

    const userEmail = (user?.email || wedding?.primaryUserEmail || "").toLowerCase().trim();

    // 1. Upsert User if email is provided
    if (userEmail) {
      await sql`
        INSERT INTO users (name, nickname, email, image, avatar_card_id, role, phone, bio, updated_at)
        VALUES (
          ${user?.name || "Calon Pengantin"},
          ${user?.nickname || user?.name?.split(" ")[0] || "Saya"},
          ${userEmail},
          ${user?.image || null},
          ${user?.avatarCardId || "cat-prince"},
          ${user?.role || "GROOM"},
          ${user?.phone || null},
          ${user?.bio || null},
          NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          nickname = COALESCE(EXCLUDED.nickname, users.nickname),
          image = COALESCE(EXCLUDED.image, users.image),
          avatar_card_id = COALESCE(EXCLUDED.avatar_card_id, users.avatar_card_id),
          role = COALESCE(EXCLUDED.role, users.role),
          phone = COALESCE(EXCLUDED.phone, users.phone),
          bio = COALESCE(EXCLUDED.bio, users.bio),
          updated_at = NOW();
      `;
    }

    // 2. Package planData JSON
    const planDataJson = JSON.stringify({
      savingContributions: savingContributions || [],
      checklist: checklist || [],
      seserahan: seserahan || [],
      postWedding: postWedding || [],
      guests: guests || [],
      familyQuota: familyQuota || null,
      rundown: rundown || [],
      budgetCategories: budgetCategories || [],
      vendors: vendors || [],
      alignmentTopics: alignmentTopics || [],
      adminSteps: adminSteps || [],
      activityLogs: activityLogs || [],
    });

    const inviteCode = (wedding?.inviteCode || "HAJAT-" + Math.random().toString(36).substring(2, 8).toUpperCase()).toUpperCase();

    // 3. Check if wedding exists by id, primary_user_email, or invite_code
    let existingWedding = null;
    if (wedding?.id && wedding.id.length > 10 && wedding.id !== "w-main") {
      const rows = await sql`SELECT id FROM weddings WHERE id = ${wedding.id}::uuid LIMIT 1`;
      if (rows && rows.length > 0) existingWedding = rows[0];
    }

    if (!existingWedding && userEmail) {
      const rows = await sql`
        SELECT id FROM weddings 
        WHERE LOWER(primary_user_email) = ${userEmail} 
           OR LOWER(partner_user_email) = ${userEmail}
        ORDER BY updated_at DESC LIMIT 1
      `;
      if (rows && rows.length > 0) existingWedding = rows[0];
    }

    if (!existingWedding && inviteCode) {
      const rows = await sql`
        SELECT id FROM weddings WHERE UPPER(invite_code) = ${inviteCode} LIMIT 1
      `;
      if (rows && rows.length > 0) existingWedding = rows[0];
    }

    let savedWeddingId: string;

    if (existingWedding) {
      savedWeddingId = existingWedding.id;
      await sql`
        UPDATE weddings SET
          title = ${wedding.title || "Pernikahan Kita"},
          groom_name = ${wedding.groomName || ""},
          bride_name = ${wedding.brideName || ""},
          wedding_date = ${wedding.weddingDate || ""},
          city = ${wedding.city || ""},
          target_budget = ${wedding.targetBudget || 0},
          current_savings = ${wedding.currentSavings || 0},
          slug = ${wedding.slug || ""},
          venue_name = ${wedding.venueName || ""},
          venue_address = ${wedding.venueAddress || ""},
          mahar_details = ${wedding.maharDetails || ""},
          wali_nikah = ${wedding.waliNikah || ""},
          penghulu = ${wedding.penghulu || ""},
          saksi_nikah = ${wedding.saksiNikah || ""},
          is_partner_connected = ${Boolean(wedding.isPartnerConnected)},
          partner_name = ${wedding.partnerInfo?.name || null},
          partner_email = ${wedding.partnerInfo?.email || null},
          partner_role = ${wedding.partnerInfo?.role || null},
          partner_avatar_card_id = ${wedding.partnerInfo?.avatarCardId || null},
          plan_data = ${planDataJson},
          updated_at = NOW()
        WHERE id = ${savedWeddingId}::uuid
      `;
    } else {
      const insertRows = await sql`
        INSERT INTO weddings (
          title, invite_code, groom_name, bride_name, wedding_date, city,
          target_budget, current_savings, slug, venue_name, venue_address,
          mahar_details, wali_nikah, penghulu, saksi_nikah,
          is_partner_connected, partner_name, partner_email, partner_role,
          partner_avatar_card_id, primary_user_email, plan_data, updated_at
        ) VALUES (
          ${wedding?.title || "Pernikahan Kita"},
          ${inviteCode},
          ${wedding?.groomName || ""},
          ${wedding?.brideName || ""},
          ${wedding?.weddingDate || ""},
          ${wedding?.city || ""},
          ${wedding?.targetBudget || 0},
          ${wedding?.currentSavings || 0},
          ${wedding?.slug || ""},
          ${wedding?.venueName || ""},
          ${wedding?.venueAddress || ""},
          ${wedding?.maharDetails || ""},
          ${wedding?.waliNikah || ""},
          ${wedding?.penghulu || ""},
          ${wedding?.saksiNikah || ""},
          ${Boolean(wedding?.isPartnerConnected)},
          ${wedding?.partnerInfo?.name || null},
          ${wedding?.partnerInfo?.email || null},
          ${wedding?.partnerInfo?.role || null},
          ${wedding?.partnerInfo?.avatarCardId || null},
          ${userEmail || null},
          ${planDataJson},
          NOW()
        )
        RETURNING id
      `;
      savedWeddingId = insertRows[0].id;
    }

    return NextResponse.json({
      success: true,
      weddingId: savedWeddingId,
      inviteCode,
    });
  } catch (error: any) {
    console.error("Error in POST /api/wedding/sync:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
