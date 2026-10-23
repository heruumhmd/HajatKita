import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db";
import { findWeddingForEmail } from "@/db/find-wedding";
import { createWorkspaceToken } from "@/lib/auth-token";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, nickname, role, avatarCardId, phone, bio } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Email tidak valid atau wajib diisi" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRole: "GROOM" | "BRIDE" = role === "BRIDE" ? "BRIDE" : "GROOM";
    const defaultAvatar = cleanRole === "BRIDE" ? "cat-princess" : "cat-prince";
    const cleanAvatar = avatarCardId || defaultAvatar;
    const cleanName = typeof name === "string" && name.trim() ? name.trim() : (cleanRole === "BRIDE" ? "Calon Istri" : "Calon Suami");
    const cleanNickname = typeof nickname === "string" && nickname.trim() ? nickname.trim() : cleanName.split(" ")[0];

    let userRecord: any = null;
    let weddingRecord: any = null;
    let parsedPlanData: any = null;

    if (sql) {
      // 1. Upsert user in database
      const existingUserRows = await sql`
        SELECT * FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1
      `;

      if (existingUserRows && existingUserRows.length > 0) {
        const u = existingUserRows[0];
        const updatedUser = await sql`
          UPDATE users SET
            name = COALESCE(${name ? cleanName : null}, name),
            nickname = COALESCE(${nickname ? cleanNickname : null}, nickname),
            role = COALESCE(${role ? cleanRole : null}, role),
            avatar_card_id = COALESCE(${avatarCardId ? cleanAvatar : null}, avatar_card_id),
            phone = COALESCE(${phone ? String(phone).trim() : null}, phone),
            bio = COALESCE(${bio ? String(bio).trim() : null}, bio),
            updated_at = NOW()
          WHERE id = ${u.id}::uuid
          RETURNING *
        `;
        userRecord = updatedUser && updatedUser.length > 0 ? updatedUser[0] : u;
      } else {
        const newUserRows = await sql`
          INSERT INTO users (name, nickname, email, role, avatar_card_id, phone, bio, updated_at)
          VALUES (
            ${cleanName},
            ${cleanNickname},
            ${cleanEmail},
            ${cleanRole},
            ${cleanAvatar},
            ${phone ? String(phone).trim() : null},
            ${bio ? String(bio).trim() : null},
            NOW()
          )
          RETURNING *
        `;
        if (newUserRows && newUserRows.length > 0) {
          userRecord = newUserRows[0];
        }
      }

      // 2. Find associated wedding
      const weddingRow = await findWeddingForEmail(cleanEmail);
      if (weddingRow) {
        weddingRecord = weddingRow;
        if (weddingRow.plan_data) {
          try {
            parsedPlanData = JSON.parse(weddingRow.plan_data);
          } catch (e) {
            console.error("Failed to parse plan_data in login:", e);
          }
        }
      }
    }

    const weddingId = weddingRecord ? weddingRecord.id : "new";
    const workspaceToken = createWorkspaceToken(cleanEmail, weddingId);

    const userProfile = {
      id: userRecord?.id || `u-${crypto.randomUUID()}`,
      name: userRecord?.name || cleanName,
      nickname: userRecord?.nickname || cleanNickname,
      email: cleanEmail,
      role: (userRecord?.role as "GROOM" | "BRIDE") || cleanRole,
      avatarCardId: userRecord?.avatar_card_id || cleanAvatar,
      phone: userRecord?.phone || (phone ? String(phone).trim() : ""),
      bio: userRecord?.bio || (bio ? String(bio).trim() : ""),
      provider: "credentials",
    };

    let formattedWedding: any = null;
    if (weddingRecord) {
      const isConnected = Boolean(weddingRecord.is_partner_connected);
      const user1Email = (weddingRecord.primary_user_email || "").toLowerCase().trim();
      const user2Email = (weddingRecord.partner_user_email || weddingRecord.partner_email || "").toLowerCase().trim();

      let user1Row: any = null;
      let user2Row: any = null;
      if (sql) {
        if (user1Email) {
          const r1 = await sql`SELECT * FROM users WHERE LOWER(email) = ${user1Email} LIMIT 1`;
          if (r1 && r1.length > 0) user1Row = r1[0];
        }
        if (user2Email) {
          const r2 = await sql`SELECT * FROM users WHERE LOWER(email) = ${user2Email} LIMIT 1`;
          if (r2 && r2.length > 0) user2Row = r2[0];
        }
      }

      const u1Role = user1Row?.role || (weddingRecord.partner_role === "GROOM" ? "BRIDE" : "GROOM");
      const u1Name = user1Row?.name || (u1Role === "GROOM" ? weddingRecord.groom_name : weddingRecord.bride_name) || (u1Role === "GROOM" ? "Calon Suami" : "Calon Istri");
      const user1Info = {
        name: u1Name,
        role: u1Role as "GROOM" | "BRIDE",
        email: user1Email,
        avatarCardId: user1Row?.avatar_card_id || (u1Role === "GROOM" ? "cat-prince" : "cat-princess"),
      };

      const u2Role = user2Row?.role || weddingRecord.partner_role || (u1Role === "GROOM" ? "BRIDE" : "GROOM");
      const u2Name = user2Row?.name || weddingRecord.partner_name || (u2Role === "GROOM" ? weddingRecord.groom_name : weddingRecord.bride_name) || (u2Role === "GROOM" ? "Calon Suami" : "Calon Istri");
      const user2Info = {
        name: u2Name,
        role: u2Role as "GROOM" | "BRIDE",
        email: user2Email,
        avatarCardId: user2Row?.avatar_card_id || (u2Role === "GROOM" ? "cat-prince" : "cat-princess"),
      };

      let partnerInfo: any = undefined;
      if (isConnected) {
        if (cleanEmail === user2Email) {
          partnerInfo = user1Info;
        } else {
          partnerInfo = user2Info;
        }
      }

      const isCorruptedSameName = Boolean(
        weddingRecord.groom_name &&
        weddingRecord.bride_name &&
        weddingRecord.groom_name.trim().toLowerCase() === weddingRecord.bride_name.trim().toLowerCase()
      );
      const groomFromUsers = user1Info.role === "GROOM" ? user1Info.name : (user2Info.role === "GROOM" ? user2Info.name : "");
      const brideFromUsers = user1Info.role === "BRIDE" ? user1Info.name : (user2Info.role === "BRIDE" ? user2Info.name : "");
      const effectiveGroom = (!isCorruptedSameName && weddingRecord.groom_name) || groomFromUsers || weddingRecord.groom_name || "";
      const effectiveBride = (!isCorruptedSameName && weddingRecord.bride_name) || brideFromUsers || weddingRecord.bride_name || "";

      formattedWedding = {
        id: weddingRecord.id,
        title: weddingRecord.title || "Pernikahan Kita",
        groomName: effectiveGroom,
        brideName: effectiveBride,
        weddingDate: weddingRecord.wedding_date || "",
        city: weddingRecord.city || "",
        targetBudget: parseFloat(weddingRecord.target_budget || "0"),
        currentSavings: parseFloat(weddingRecord.current_savings || "0"),
        inviteCode: weddingRecord.invite_code,
        slug: weddingRecord.slug || "",
        venueName: weddingRecord.venue_name || "",
        venueAddress: weddingRecord.venue_address || "",
        maharDetails: weddingRecord.mahar_details || "",
        waliNikah: weddingRecord.wali_nikah || "",
        penghulu: weddingRecord.penghulu || "",
        saksiNikah: weddingRecord.saksi_nikah || "",
        isPartnerConnected: isConnected,
        primaryUserEmail: user1Email,
        partnerUserEmail: user2Email,
        version: typeof weddingRecord.version === "number" ? weddingRecord.version : 0,
        partnerInfo,
        couple: isConnected ? { user1: user1Info, user2: user2Info } : undefined,
      };
    }

    const response = NextResponse.json({
      success: true,
      token: workspaceToken,
      user: userProfile,
      wedding: formattedWedding,
      planData: parsedPlanData,
    });

    response.cookies.set("hajat_workspace_token", workspaceToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Error in POST /api/auth/login:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan saat memproses login" }, { status: 500 });
  }
}
