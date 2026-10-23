import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db";
import { auth } from "@/auth";
import { findWeddingForEmail } from "@/db/find-wedding";
import { verifyWorkspaceToken, createWorkspaceToken } from "@/lib/auth-token";

// In-memory rate limiting against invite code brute-forcing (5 attempts per minute per IP)
const pairRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkPairRateLimit(ip: string, limit = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const entry = pairRateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    pairRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    if (!checkPairRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan memasangkan kode. Silakan tunggu 1 menit untuk mencoba kembali." },
        { status: 429 }
      );
    }

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
    const { inviteCode, userName, userRole, userAvatarCardId } = body;

    if (!inviteCode || !inviteCode.trim()) {
      return NextResponse.json({ success: false, message: "Kode pasangan wajib diisi" }, { status: 400 });
    }

    if (!sql) {
      return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503 });
    }

    const cleanCode = inviteCode.trim().toUpperCase();

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

    let targetWedding = targetWeddings[0];
    const targetOwnerEmail = (targetWedding.primary_user_email || "").toLowerCase().trim();

    // Prevent pairing with self
    if (cleanUserEmail && targetOwnerEmail && cleanUserEmail === targetOwnerEmail) {
      return NextResponse.json(
        { success: false, message: "Ini adalah kode pasangan milik Anda sendiri. Bagikan kode ini ke pasangan Anda." },
        { status: 400 }
      );
    }

    // Resolve target wedding deterministically from target owner's email
    if (targetOwnerEmail) {
      const ownerWedding = await findWeddingForEmail(targetOwnerEmail);
      if (ownerWedding) {
        targetWedding = ownerWedding;
      }
    }

    // Check if the user is already actively connected to this workspace
    const existingPartnerEmail = (targetWedding.partner_user_email || targetWedding.partner_email || "").toLowerCase().trim();
    if (targetWedding.is_partner_connected && existingPartnerEmail && existingPartnerEmail === cleanUserEmail) {
      const u1Email = (targetWedding.primary_user_email || targetOwnerEmail || "").toLowerCase().trim();
      let u1Row = null;
      let u2Row = null;
      if (u1Email) {
        const r1 = await sql`SELECT * FROM users WHERE LOWER(email) = ${u1Email} LIMIT 1`;
        if (r1 && r1.length > 0) u1Row = r1[0];
      }
      if (cleanUserEmail) {
        const r2 = await sql`SELECT * FROM users WHERE LOWER(email) = ${cleanUserEmail} LIMIT 1`;
        if (r2 && r2.length > 0) u2Row = r2[0];
      }
      const ownerRole = u1Row?.role || "GROOM";
      const partnerDisplayName = u1Row?.name || targetWedding.groom_name || targetWedding.bride_name || "Pasangan Anda";
      const user1Info = {
        name: u1Row?.name || (ownerRole === "GROOM" ? targetWedding.groom_name : targetWedding.bride_name) || "Pasangan",
        role: ownerRole as "GROOM" | "BRIDE",
        email: u1Email,
        avatarCardId: u1Row?.avatar_card_id || (ownerRole === "GROOM" ? "penguin-groom" : "duck-bride"),
      };
      const user2Info = {
        name: u2Row?.name || targetWedding.partner_name || "Saya",
        role: (u2Row?.role || targetWedding.partner_role || "BRIDE") as "GROOM" | "BRIDE",
        email: cleanUserEmail,
        avatarCardId: u2Row?.avatar_card_id || targetWedding.partner_avatar_card_id || "cat-princess",
      };

      let parsedPlanData = null;
      if (targetWedding.plan_data) {
        try { parsedPlanData = JSON.parse(targetWedding.plan_data); } catch {}
      }

      return NextResponse.json({
        success: true,
        message: `Anda sudah terhubung dengan ${partnerDisplayName} di workspace pernikahan ini.`,
        isRestoredFromSamePartner: false,
        wedding: {
          id: targetWedding.id,
          title: targetWedding.title || "Pernikahan Kita",
          groomName: targetWedding.groom_name || "",
          brideName: targetWedding.bride_name || "",
          weddingDate: targetWedding.wedding_date || "",
          city: targetWedding.city || "",
          targetBudget: parseFloat(targetWedding.target_budget || "0"),
          currentSavings: parseFloat(targetWedding.current_savings || "0"),
          inviteCode: targetWedding.invite_code,
          slug: targetWedding.slug || "",
          venueName: targetWedding.venue_name || "",
          venueAddress: targetWedding.venue_address || "",
          maharDetails: targetWedding.mahar_details || "",
          waliNikah: targetWedding.wali_nikah || "",
          penghulu: targetWedding.penghulu || "",
          saksiNikah: targetWedding.saksi_nikah || "",
          isPartnerConnected: true,
          primaryUserEmail: u1Email,
          partnerUserEmail: cleanUserEmail,
          version: typeof targetWedding.version === "number" ? targetWedding.version : 0,
          partnerInfo: user1Info,
          couple: {
            user1: user1Info,
            user2: user2Info,
          },
        },
        planData: parsedPlanData,
        token: createWorkspaceToken(cleanUserEmail, targetWedding.id),
      });
    }

    // Check if the current user is already actively paired with another workspace
    const userActiveWedding = await findWeddingForEmail(cleanUserEmail);
    if (userActiveWedding && userActiveWedding.is_partner_connected && userActiveWedding.id !== targetWedding.id) {
      return NextResponse.json(
        { success: false, message: "Anda sudah terhubung dengan pasangan lain. Harap batalkan hubungan sebelumnya terlebih dahulu." },
        { status: 400 }
      );
    }

    // Prevent partner hijacking: check if the target workspace already has another active partner
    if (targetWedding.is_partner_connected && existingPartnerEmail && existingPartnerEmail !== cleanUserEmail) {
      return NextResponse.json(
        { success: false, message: "Workspace pernikahan ini sudah terhubung dengan pasangan lain. Harap minta pemilik membatalkan pasangan sebelumnya terlebih dahulu." },
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

    // Fetch target workspace owner from users table
    let targetOwnerRow = null;
    if (targetOwnerEmail) {
      const rOwner = await sql`SELECT * FROM users WHERE LOWER(email) = ${targetOwnerEmail} LIMIT 1`;
      if (rOwner && rOwner.length > 0) targetOwnerRow = rOwner[0];
    }

    const resolvedOwnerRole = (targetOwnerRow?.role || (targetWedding.groom_name ? "GROOM" : (targetWedding.bride_name ? "BRIDE" : "GROOM"))) as "GROOM" | "BRIDE";
    // Joining user role MUST be complementary to the owner role so wedding has 1 GROOM and 1 BRIDE
    const effectiveUser2Role: "GROOM" | "BRIDE" = resolvedOwnerRole === "GROOM" ? "BRIDE" : "GROOM";
    const effectiveUser2Avatar = userAvatarCardId || (effectiveUser2Role === "GROOM" ? "cat-prince" : "cat-princess");
    const effectiveUser2Name = userName || (effectiveUser2Role === "GROOM" ? "Calon Suami" : "Calon Istri");

    await sql`
      INSERT INTO users (name, nickname, email, avatar_card_id, role, updated_at)
      VALUES (
        ${effectiveUser2Name},
        ${effectiveUser2Name.split(" ")[0] || "Saya"},
        ${cleanUserEmail},
        ${effectiveUser2Avatar},
        ${effectiveUser2Role},
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        name = CASE 
          WHEN EXCLUDED.name IN ('Calon Suami', 'Calon Istri', 'Calon Pengantin', 'Saya') AND users.name IS NOT NULL AND users.name != '' AND users.name NOT IN ('Calon Suami', 'Calon Istri', 'Calon Pengantin', 'Saya')
          THEN users.name
          ELSE COALESCE(NULLIF(EXCLUDED.name, ''), users.name)
        END,
        avatar_card_id = COALESCE(${userAvatarCardId || null}, users.avatar_card_id),
        role = ${effectiveUser2Role},
        updated_at = NOW();
    `;

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
          partner_name = COALESCE(${effectiveUser2Name}, partner_name),
          partner_email = ${cleanUserEmail},
          partner_user_email = ${cleanUserEmail},
          partner_role = ${effectiveUser2Role},
          partner_avatar_card_id = ${effectiveUser2Avatar},
          groom_name = CASE WHEN ${effectiveUser2Role === "GROOM"} THEN ${effectiveUser2Name} ELSE groom_name END,
          bride_name = CASE WHEN ${effectiveUser2Role === "BRIDE"} THEN ${effectiveUser2Name} ELSE bride_name END,
          updated_at = NOW()
        WHERE id = ${activeWeddingId}::uuid
      `;
    } else {
      // SCENARIO 2: New / Different person -> Isolate data from any ex-partner!
      activeWeddingId = targetWedding.id;
      chosenWeddingRow = targetWedding;

      // Ensure no stale ACTIVE couple records remain on this workspace before pairing a new partner
      await sql`
        UPDATE couple_history
        SET status = 'UNPAIRED', unpaired_at = NOW(), updated_at = NOW()
        WHERE wedding_id = ${activeWeddingId}::uuid AND status = 'ACTIVE'
      `;

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
          partner_name = ${effectiveUser2Name},
          partner_email = ${cleanUserEmail},
          partner_user_email = ${cleanUserEmail},
          partner_role = ${effectiveUser2Role},
          partner_avatar_card_id = ${effectiveUser2Avatar},
          primary_user_email = COALESCE(primary_user_email, ${targetOwnerEmail || null}),
          groom_name = CASE WHEN ${effectiveUser2Role === "GROOM"} THEN ${effectiveUser2Name} ELSE groom_name END,
          bride_name = CASE WHEN ${effectiveUser2Role === "BRIDE"} THEN ${effectiveUser2Name} ELSE bride_name END,
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

    // Fetch User 1 (owner) and User 2 (joining user) from users table
    const user1Email = (finalWedding.primary_user_email || targetOwnerEmail || "").toLowerCase().trim();
    const user2Email = cleanUserEmail;

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

    // Joining user is User 2, so their partner is User 1 (primary owner)
    const ownerRole = user1Row?.role || (effectiveUser2Role === "BRIDE" ? "GROOM" : "BRIDE");
    const partnerDisplayName = user1Row?.name || (ownerRole === "GROOM" ? finalWedding.groom_name : finalWedding.bride_name) || "Pasangan Anda";
    const partnerRoleDisplay = ownerRole;
    const partnerAvatarDisplay = user1Row?.avatar_card_id || (ownerRole === "GROOM" ? "cat-prince" : "cat-princess");
    const partnerEmailDisplay = user1Email;

    const user1Info = {
      name: partnerDisplayName,
      role: partnerRoleDisplay as "GROOM" | "BRIDE",
      email: partnerEmailDisplay,
      avatarCardId: partnerAvatarDisplay,
    };

    const user2Info = {
      name: user2Row?.name || effectiveUser2Name,
      role: effectiveUser2Role as "GROOM" | "BRIDE",
      email: user2Email,
      avatarCardId: effectiveUser2Avatar,
    };

    const effectiveGroom = finalWedding.groom_name ||
      (user1Row?.role === "GROOM" ? user1Row.name : (effectiveUser2Role === "GROOM" ? effectiveUser2Name : ""));
    const effectiveBride = finalWedding.bride_name ||
      (user1Row?.role === "BRIDE" ? user1Row.name : (effectiveUser2Role === "BRIDE" ? effectiveUser2Name : ""));

    // Ensure groom_name and bride_name in DB are populated if they were empty
    if ((!finalWedding.groom_name && effectiveGroom) || (!finalWedding.bride_name && effectiveBride)) {
      await sql`
        UPDATE weddings SET
          groom_name = COALESCE(NULLIF(groom_name, ''), ${effectiveGroom || null}),
          bride_name = COALESCE(NULLIF(bride_name, ''), ${effectiveBride || null}),
          updated_at = NOW()
        WHERE id = ${activeWeddingId}::uuid
      `;
    }

    const response = NextResponse.json({
      success: true,
      message: `Selamat! Anda berhasil terhubung dengan ${partnerDisplayName}. Workspace pernikahan kini tersinkron!`,
      isRestoredFromSamePartner: Boolean(historicalWedding),
      wedding: {
        id: finalWedding.id,
        title: finalWedding.title || "Pernikahan Kita",
        groomName: effectiveGroom,
        brideName: effectiveBride,
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
        primaryUserEmail: user1Email,
        partnerUserEmail: user2Email,
        version: typeof finalWedding.version === "number" ? finalWedding.version : 0,
        partnerInfo: user1Info,
        couple: {
          user1: user1Info,
          user2: user2Info,
        },
      },
      planData: parsedPlanData,
      token: createWorkspaceToken(cleanUserEmail, finalWedding.id),
    });

    const pairToken = createWorkspaceToken(cleanUserEmail, finalWedding.id);
    response.cookies.set("hajat_workspace_token", pairToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Error in POST /api/partner/pair:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
