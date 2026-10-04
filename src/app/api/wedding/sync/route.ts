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
           OR LOWER(partner_email) = ${email}
        ORDER BY updated_at DESC LIMIT 1
      `;
      if (rows && rows.length > 0) {
        weddingRow = rows[0];
      } else {
        // Fallback: Check couple_history for active connection
        const historyRows = await sql`
          SELECT * FROM couple_history
          WHERE (LOWER(user1_email) = ${email} OR LOWER(user2_email) = ${email})
            AND status = 'ACTIVE'
          ORDER BY updated_at DESC LIMIT 1
        `;
        if (historyRows && historyRows.length > 0) {
          const wRows = await sql`
            SELECT * FROM weddings WHERE id = ${historyRows[0].wedding_id}::uuid LIMIT 1
          `;
          if (wRows && wRows.length > 0) {
            weddingRow = wRows[0];
          }
        }
      }
    }

    // Retrieve user's own profile from users table if email is present
    let userProfile = null;
    if (email) {
      const uRows = await sql`SELECT * FROM users WHERE LOWER(email) = ${email} LIMIT 1`;
      if (uRows && uRows.length > 0) {
        const u = uRows[0];
        userProfile = {
          id: u.id,
          name: u.name,
          nickname: u.nickname || u.name?.split(" ")[0] || "Saya",
          email: u.email,
          image: u.image || undefined,
          avatarCardId: u.avatar_card_id || "cat-prince",
          role: u.role || "GROOM",
          phone: u.phone || "",
          bio: u.bio || "",
        };
      }
    }

    if (!weddingRow) {
      return NextResponse.json({ success: true, exists: false, data: null, user: userProfile });
    }

    let parsedPlanData = null;
    if (weddingRow.plan_data) {
      try {
        parsedPlanData = JSON.parse(weddingRow.plan_data);
      } catch (e) {
        console.error("Failed to parse plan_data", e);
      }
    }

    // Check couple_history for active couple on this wedding
    const coupleHistoryRows = await sql`
      SELECT * FROM couple_history
      WHERE wedding_id = ${weddingRow.id}::uuid AND status = 'ACTIVE'
      ORDER BY updated_at DESC LIMIT 1
    `;
    const isCoupleActiveInHistory = coupleHistoryRows && coupleHistoryRows.length > 0;
    const historyRecord = isCoupleActiveInHistory ? coupleHistoryRows[0] : null;

    const isConnected = Boolean(weddingRow.is_partner_connected || isCoupleActiveInHistory);

    const user1Email = (weddingRow.primary_user_email || historyRecord?.user1_email || "").toLowerCase().trim();
    const user2Email = (weddingRow.partner_user_email || weddingRow.partner_email || historyRecord?.user2_email || "").toLowerCase().trim();

    // Fetch both users from users table for precise profile details
    let user1Row = null;
    let user2Row = null;
    if (user1Email) {
      const r1 = await sql`SELECT * FROM users WHERE LOWER(email) = ${user1Email} LIMIT 1`;
      if (r1 && r1.length > 0) user1Row = r1[0];
    }
    if (user2Email) {
      const r2 = await sql`SELECT * FROM users WHERE LOWER(email) = ${user2Email} LIMIT 1`;
      if (r2 && r2.length > 0) user2Row = r2[0];
    }

    const cleanReqEmail = (email || "").toLowerCase().trim();
    const isRequesterUser2 = cleanReqEmail && cleanReqEmail === user2Email;
    const isRequesterUser1 = cleanReqEmail && cleanReqEmail === user1Email;

    // Build reciprocal profiles for User 1 and User 2
    const u1Role = user1Row?.role || (weddingRow.partner_role === "GROOM" ? "BRIDE" : "GROOM");
    const u1Name = user1Row?.name || (u1Role === "GROOM" ? weddingRow.groom_name : weddingRow.bride_name) || (u1Role === "GROOM" ? "Calon Suami" : "Calon Istri");
    const user1Info = {
      name: u1Name,
      role: u1Role as "GROOM" | "BRIDE",
      email: user1Email,
      avatarCardId: user1Row?.avatar_card_id || (u1Role === "GROOM" ? "penguin-groom" : "duck-bride"),
    };

    const u2Role = user2Row?.role || weddingRow.partner_role || (u1Role === "GROOM" ? "BRIDE" : "GROOM");
    const u2Name = user2Row?.name || weddingRow.partner_name || (u2Role === "GROOM" ? weddingRow.groom_name : weddingRow.bride_name) || (u2Role === "GROOM" ? "Calon Suami" : "Calon Istri");
    const user2Info = {
      name: u2Name,
      role: u2Role as "GROOM" | "BRIDE",
      email: user2Email,
      avatarCardId: user2Row?.avatar_card_id || (u2Role === "GROOM" ? "penguin-groom" : "duck-bride"),
    };

    let partnerInfo = undefined;
    if (isConnected) {
      if (isRequesterUser2) {
        // User is partner (User 2) -> Partner is User 1
        partnerInfo = user1Info;
      } else if (isRequesterUser1) {
        // User is owner (User 1) -> Partner is User 2
        partnerInfo = user2Info;
      } else {
        partnerInfo = user2Info;
      }
    }

    // Auto-resolve groom and bride names from users if wedding row is missing them
    const effectiveGroom = weddingRow.groom_name ||
      (user1Info.role === "GROOM" ? user1Info.name : (user2Info.role === "GROOM" ? user2Info.name : ""));
    const effectiveBride = weddingRow.bride_name ||
      (user1Info.role === "BRIDE" ? user1Info.name : (user2Info.role === "BRIDE" ? user2Info.name : ""));

    const wedding = {
      id: weddingRow.id,
      title: weddingRow.title || "Pernikahan Kita",
      groomName: effectiveGroom,
      brideName: effectiveBride,
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
      isPartnerConnected: isConnected,
      primaryUserEmail: user1Email,
      partnerUserEmail: user2Email,
      partnerInfo,
      couple: isConnected ? {
        user1: user1Info,
        user2: user2Info,
      } : undefined,
    };

    return NextResponse.json({
      success: true,
      exists: true,
      wedding,
      user: userProfile,
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

    // 3. Check if wedding exists by id, primary_user_email, partner email, or invite_code
    let existingWedding = null;
    if (wedding?.id && wedding.id.length > 10 && wedding.id !== "w-main") {
      const rows = await sql`SELECT * FROM weddings WHERE id = ${wedding.id}::uuid LIMIT 1`;
      if (rows && rows.length > 0) existingWedding = rows[0];
    }

    if (!existingWedding && userEmail) {
      const rows = await sql`
        SELECT * FROM weddings 
        WHERE LOWER(primary_user_email) = ${userEmail} 
           OR LOWER(partner_user_email) = ${userEmail}
           OR LOWER(partner_email) = ${userEmail}
        ORDER BY updated_at DESC LIMIT 1
      `;
      if (rows && rows.length > 0) {
        existingWedding = rows[0];
      } else {
        const historyRows = await sql`
          SELECT * FROM couple_history
          WHERE (LOWER(user1_email) = ${userEmail} OR LOWER(user2_email) = ${userEmail})
            AND status = 'ACTIVE'
          ORDER BY updated_at DESC LIMIT 1
        `;
        if (historyRows && historyRows.length > 0) {
          const wRows = await sql`
            SELECT * FROM weddings WHERE id = ${historyRows[0].wedding_id}::uuid LIMIT 1
          `;
          if (wRows && wRows.length > 0) {
            existingWedding = wRows[0];
          }
        }
      }
    }

    if (!existingWedding && inviteCode) {
      const rows = await sql`
        SELECT * FROM weddings WHERE UPPER(invite_code) = ${inviteCode} LIMIT 1
      `;
      if (rows && rows.length > 0) existingWedding = rows[0];
    }

    let savedWeddingId: string;

    if (existingWedding) {
      savedWeddingId = existingWedding.id;

      // CRITICAL SAFEGUARD: Preserve connected partner state from DB and couple_history!
      // An out-of-date client state must NOT disconnect an active partner.
      const coupleHistoryRows = await sql`
        SELECT * FROM couple_history
        WHERE wedding_id = ${existingWedding.id}::uuid AND status = 'ACTIVE'
        ORDER BY updated_at DESC LIMIT 1
      `;
      const isCoupleActiveInHistory = coupleHistoryRows && coupleHistoryRows.length > 0;
      const historyRec = isCoupleActiveInHistory ? coupleHistoryRows[0] : null;

      const isPartnerConnected = existingWedding.is_partner_connected || isCoupleActiveInHistory || Boolean(wedding?.isPartnerConnected);
      const partnerEmail = isPartnerConnected
        ? (existingWedding.partner_email || existingWedding.partner_user_email || historyRec?.user2_email || wedding?.partnerInfo?.email || null)
        : null;
      const partnerUserEmail = partnerEmail;

      let resolvedPartnerName = isPartnerConnected
        ? (existingWedding.partner_name || wedding?.partnerInfo?.name || null)
        : null;
      let resolvedPartnerRole = isPartnerConnected
        ? (existingWedding.partner_role || wedding?.partnerInfo?.role || null)
        : null;
      let resolvedPartnerAvatar = isPartnerConnected
        ? (existingWedding.partner_avatar_card_id || wedding?.partnerInfo?.avatarCardId || null)
        : null;

      if (isPartnerConnected && partnerEmail && (!resolvedPartnerName || !resolvedPartnerRole || !resolvedPartnerAvatar)) {
        const uRows = await sql`SELECT * FROM users WHERE LOWER(email) = ${partnerEmail.toLowerCase().trim()} LIMIT 1`;
        if (uRows && uRows.length > 0) {
          resolvedPartnerName = resolvedPartnerName || uRows[0].name;
          resolvedPartnerRole = resolvedPartnerRole || uRows[0].role;
          resolvedPartnerAvatar = resolvedPartnerAvatar || uRows[0].avatar_card_id;
        }
      }

      if (isPartnerConnected) {
        resolvedPartnerRole = resolvedPartnerRole || (existingWedding.partner_role || (existingWedding.groom_name ? "GROOM" : "BRIDE"));
        resolvedPartnerName = resolvedPartnerName || (resolvedPartnerRole === "GROOM" ? (existingWedding.groom_name || "Muhammad Heru") : (existingWedding.bride_name || "Nurul Fathonah"));
        resolvedPartnerAvatar = resolvedPartnerAvatar || (resolvedPartnerRole === "GROOM" ? "penguin-groom" : "duck-bride");
      }

      const primaryEmail = existingWedding.primary_user_email || historyRec?.user1_email || (userEmail && userEmail !== partnerEmail ? userEmail : null);

      await sql`
        UPDATE weddings SET
          title = ${wedding?.title || existingWedding.title || "Pernikahan Kita"},
          groom_name = COALESCE(NULLIF(${wedding?.groomName || ""}, ''), groom_name),
          bride_name = COALESCE(NULLIF(${wedding?.brideName || ""}, ''), bride_name),
          wedding_date = COALESCE(NULLIF(${wedding?.weddingDate || ""}, ''), wedding_date),
          city = COALESCE(NULLIF(${wedding?.city || ""}, ''), city),
          target_budget = ${wedding?.targetBudget !== undefined ? wedding.targetBudget : existingWedding.target_budget},
          current_savings = ${wedding?.currentSavings !== undefined ? wedding.currentSavings : existingWedding.current_savings},
          slug = COALESCE(NULLIF(${wedding?.slug || ""}, ''), slug),
          venue_name = COALESCE(NULLIF(${wedding?.venueName || ""}, ''), venue_name),
          venue_address = COALESCE(NULLIF(${wedding?.venueAddress || ""}, ''), venue_address),
          mahar_details = COALESCE(NULLIF(${wedding?.maharDetails || ""}, ''), mahar_details),
          wali_nikah = COALESCE(NULLIF(${wedding?.waliNikah || ""}, ''), wali_nikah),
          penghulu = COALESCE(NULLIF(${wedding?.penghulu || ""}, ''), penghulu),
          saksi_nikah = COALESCE(NULLIF(${wedding?.saksiNikah || ""}, ''), saksi_nikah),
          is_partner_connected = ${Boolean(isPartnerConnected)},
          partner_name = ${resolvedPartnerName},
          partner_email = ${partnerEmail},
          partner_user_email = ${partnerUserEmail},
          partner_role = ${resolvedPartnerRole},
          partner_avatar_card_id = ${resolvedPartnerAvatar},
          primary_user_email = COALESCE(${primaryEmail}, primary_user_email),
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
          is_partner_connected, partner_name, partner_email, partner_user_email, partner_role,
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
