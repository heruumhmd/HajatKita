// IMPORTANT DEPLOYMENT PREREQUISITE:
// Ensure Neon database migration has been run before deploying:
// ALTER TABLE weddings ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;
// Otherwise, queries selecting or updating `version` will fail with 500 error.

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db";
import { auth } from "@/auth";
import { findWeddingForEmail } from "@/db/find-wedding";
import { mergePlanData } from "@/lib/merge-plan-data";
import { z } from "zod";

// In-memory rate limiting per IP (10 requests per minute)
// NOTE: For multi-instance / serverless deployment (e.g. Vercel),
// an external store like Upstash Redis is recommended for distributed rate limiting.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit = 10, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
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

const rsvpSchema = z.object({
  action: z.literal("RSVP"),
  weddingId: z.string().optional(),
  slug: z.string().optional(),
  guest: z.object({
    name: z.string().trim().min(1, "Nama tamu wajib diisi").max(100, "Nama maksimal 100 karakter"),
    phone: z.string().max(30, "Nomor telepon maksimal 30 karakter").optional().default("-"),
    notes: z.string().max(500, "Catatan maksimal 500 karakter").optional().default(""),
    pax: z.number().int().min(0).max(20).optional().default(2),
    side: z.enum(["GROOM", "BRIDE", "BOTH"]).optional().default("BOTH"),
    rsvpStatus: z.enum(["CONFIRMED_ATTENDING", "DECLINED"]).optional().default("CONFIRMED_ATTENDING"),
  }),
});

const claimGiftSchema = z.object({
  action: z.literal("CLAIM_GIFT"),
  weddingId: z.string().optional(),
  slug: z.string().optional(),
  itemId: z.string().min(1, "ID kado wajib diisi"),
  friendName: z.string().trim().min(1, "Nama pemberi kado wajib diisi").max(100, "Nama maksimal 100 karakter"),
});

export async function GET(req: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const inviteCode = searchParams.get("code")?.trim().toUpperCase();
    const slug = searchParams.get("slug")?.trim().toLowerCase();
    const reqEmail = searchParams.get("email")?.trim().toLowerCase();

    // 1. Public Access: by slug (invitation & registry pages)
    if (slug) {
      const rows = await sql`
        SELECT * FROM weddings WHERE LOWER(slug) = ${slug} LIMIT 1
      `;
      if (!rows || rows.length === 0) {
        return NextResponse.json({ success: true, exists: false, data: null });
      }
      const weddingRow = rows[0];

      let publicPostWedding: any[] = [];
      if (weddingRow.plan_data) {
        try {
          const parsed = JSON.parse(weddingRow.plan_data);
          if (Array.isArray(parsed.postWedding)) {
            publicPostWedding = parsed.postWedding
              .filter((item: any) => item.isGiftClaimable)
              .map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                estimatedCost: item.estimatedCost,
                isGiftClaimable: true,
                isAcquired: Boolean(item.isAcquired),
                claimedBy: item.claimedBy || null,
                notes: item.notes || "",
              }));
          }
        } catch (e) {
          console.error("Failed to parse plan_data for public view", e);
        }
      }

      return NextResponse.json({
        success: true,
        exists: true,
        wedding: {
          id: weddingRow.id,
          groomName: weddingRow.groom_name || "",
          brideName: weddingRow.bride_name || "",
          weddingDate: weddingRow.wedding_date || "",
          city: weddingRow.city || "",
          venueName: weddingRow.venue_name || "",
          venueAddress: weddingRow.venue_address || "",
          slug: weddingRow.slug || "",
        },
        planData: {
          postWedding: publicPostWedding,
        },
      });
    }

    // 2. Authenticated Session or Registered Email Access for Full Workspace
    const session = await auth();
    const sessionEmail = session?.user?.email?.toLowerCase().trim();
    const email = sessionEmail || reqEmail;

    if (!email) {
      // If unauthenticated and invite code is queried without user email, return only public subset
      if (inviteCode) {
        const rows = await sql`
          SELECT * FROM weddings WHERE UPPER(invite_code) = ${inviteCode} LIMIT 1
        `;
        if (!rows || rows.length === 0) {
          return NextResponse.json({ success: true, exists: false, data: null });
        }
        const weddingRow = rows[0];
        let publicPostWedding: any[] = [];
        if (weddingRow.plan_data) {
          try {
            const parsed = JSON.parse(weddingRow.plan_data);
            if (Array.isArray(parsed.postWedding)) {
              publicPostWedding = parsed.postWedding
                .filter((item: any) => item.isGiftClaimable)
                .map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  estimatedCost: item.estimatedCost,
                  isGiftClaimable: true,
                  isAcquired: Boolean(item.isAcquired),
                  claimedBy: item.claimedBy || null,
                  notes: item.notes || "",
                }));
            }
          } catch (e) {}
        }
        return NextResponse.json({
          success: true,
          exists: true,
          wedding: {
            id: weddingRow.id,
            groomName: weddingRow.groom_name || "",
            brideName: weddingRow.bride_name || "",
            weddingDate: weddingRow.wedding_date || "",
            city: weddingRow.city || "",
            venueName: weddingRow.venue_name || "",
            venueAddress: weddingRow.venue_address || "",
            slug: weddingRow.slug || "",
          },
          planData: {
            postWedding: publicPostWedding,
          },
        });
      }

      // No session, no email, and no public param -> 401 Unauthorized
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const weddingRow = await findWeddingForEmail(email);

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
      version: typeof weddingRow.version === "number" ? weddingRow.version : 0,
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

    const clientIp = getClientIp(req);

    // Reject all payloads exceeding 2MB before reading the full stream
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran permintaan melebihi batas maksimal (2MB)" },
        { status: 413 }
      );
    }

    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: "Format JSON tidak valid" }, { status: 400 });
    }

    // Enforce 10KB payload limit in bytes for public unauthenticated endpoints
    if (body?.action === "RSVP" || body?.action === "CLAIM_GIFT") {
      if (Buffer.byteLength(rawBody, "utf8") > 10 * 1024) {
        return NextResponse.json(
          { success: false, message: "Ukuran permintaan melebihi batas maksimal (10KB)" },
          { status: 413 }
        );
      }
    }

    // 1. Special Action: RSVP from Public Digital Invitation
    if (body.action === "RSVP") {
      if (!checkRateLimit(clientIp)) {
        return NextResponse.json(
          { success: false, message: "Terlalu banyak permintaan. Silakan tunggu beberapa saat." },
          { status: 429 }
        );
      }

      const parseResult = rsvpSchema.safeParse(body);
      if (!parseResult.success) {
        const errMsg = parseResult.error.errors.map((e: any) => e.message).join(", ");
        return NextResponse.json({ success: false, message: errMsg || "Data RSVP tidak valid" }, { status: 400 });
      }

      const { slug, weddingId, guest } = parseResult.data;

      const MAX_RETRIES = 3;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        let wRow = null;
        if (weddingId && weddingId !== "w-main") {
          const rows = await sql`SELECT id, plan_data, version FROM weddings WHERE id = ${weddingId}::uuid LIMIT 1`;
          if (rows && rows.length > 0) wRow = rows[0];
        }
        if (!wRow && slug) {
          const rows = await sql`SELECT id, plan_data, version FROM weddings WHERE LOWER(slug) = ${slug.toLowerCase().trim()} LIMIT 1`;
          if (rows && rows.length > 0) wRow = rows[0];
        }

        if (!wRow) {
          return NextResponse.json({ success: false, message: "Pernikahan tidak ditemukan" }, { status: 404 });
        }

        const currentVersion = typeof wRow.version === "number" ? wRow.version : 0;

        let planData: any = {};
        if (wRow.plan_data) {
          try {
            planData = JSON.parse(wRow.plan_data);
          } catch (e) {}
        }

        const guests = Array.isArray(planData.guests) ? planData.guests : [];
        const newGuest = {
          id: `g-${crypto.randomUUID()}`,
          name: guest.name.trim(),
          phone: guest.phone || "-",
          side: guest.side || "BOTH",
          category: "Undangan Digital",
          pax: guest.pax !== undefined ? guest.pax : 2,
          rsvpStatus: guest.rsvpStatus || "CONFIRMED_ATTENDING",
          notes: guest.notes || "",
          envelopeAmount: 0,
          giftDescription: "",
        };

        const existingIdx = guests.findIndex(
          (g: any) => ((g && g.name) || "").toLowerCase().trim() === guest.name.toLowerCase().trim()
        );
        if (existingIdx >= 0) {
          guests[existingIdx] = { ...guests[existingIdx], ...newGuest, id: guests[existingIdx].id };
        } else {
          guests.unshift(newGuest);
        }

        const activityLogs = Array.isArray(planData.activityLogs) ? planData.activityLogs : [];
        const now = Date.now();
        activityLogs.unshift({
          id: `act-${crypto.randomUUID()}`,
          userName: guest.name,
          userRole: "COLLABORATOR",
          action: `Mengonfirmasi kehadiran via Undangan Digital (${guest.rsvpStatus === "CONFIRMED_ATTENDING" ? `Hadir ${guest.pax || 2} Pax` : "Tidak Hadir"})`,
          timeAgo: "Baru saja",
          timestamp: now,
          createdAt: new Date(now).toISOString(),
        });

        planData.guests = guests;
        planData.activityLogs = activityLogs.slice(0, 200);

        const updateResult = await sql`
          UPDATE weddings SET
            plan_data = ${JSON.stringify(planData)},
            version = version + 1,
            updated_at = NOW()
          WHERE id = ${wRow.id}::uuid AND version = ${currentVersion}
          RETURNING id, version
        `;

        if (updateResult && updateResult.length > 0) {
          return NextResponse.json({ success: true, message: "Konfirmasi kehadiran berhasil tersimpan ke database! 💌" });
        }
      }

      return NextResponse.json(
        { success: false, conflict: true, message: "Terjadi konflik pembaruan data RSVP. Silakan coba lagi." },
        { status: 409 }
      );
    }

    // 2. Special Action: Claim Gift from Public Registry
    if (body.action === "CLAIM_GIFT") {
      if (!checkRateLimit(clientIp)) {
        return NextResponse.json(
          { success: false, message: "Terlalu banyak permintaan. Silakan tunggu beberapa saat." },
          { status: 429 }
        );
      }

      const parseResult = claimGiftSchema.safeParse(body);
      if (!parseResult.success) {
        const errMsg = parseResult.error.errors.map((e: any) => e.message).join(", ");
        return NextResponse.json({ success: false, message: errMsg || "Data klaim kado tidak valid" }, { status: 400 });
      }

      const { slug, weddingId, itemId, friendName } = parseResult.data;

      const MAX_RETRIES = 3;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        let wRow = null;
        if (weddingId && weddingId !== "w-main") {
          const rows = await sql`SELECT id, plan_data, version FROM weddings WHERE id = ${weddingId}::uuid LIMIT 1`;
          if (rows && rows.length > 0) wRow = rows[0];
        }
        if (!wRow && slug) {
          const rows = await sql`SELECT id, plan_data, version FROM weddings WHERE LOWER(slug) = ${slug.toLowerCase().trim()} LIMIT 1`;
          if (rows && rows.length > 0) wRow = rows[0];
        }

        if (!wRow) {
          return NextResponse.json({ success: false, message: "Pernikahan tidak ditemukan" }, { status: 404 });
        }

        const currentVersion = typeof wRow.version === "number" ? wRow.version : 0;

        let planData: any = {};
        if (wRow.plan_data) {
          try {
            planData = JSON.parse(wRow.plan_data);
          } catch (e) {}
        }

        const postWedding = Array.isArray(planData.postWedding) ? planData.postWedding : [];
        const targetItem = postWedding.find((item: any) => item.id === itemId);
        if (!targetItem) {
          return NextResponse.json({ success: false, message: "Kado tidak ditemukan dalam wishlist." }, { status: 404 });
        }
        if (targetItem.isAcquired || targetItem.claimedBy) {
          return NextResponse.json(
            { success: false, message: `Kado "${targetItem.name}" sudah dihadiahkan oleh rekan lain (${targetItem.claimedBy || "Sudah Dihadiahi"}).` },
            { status: 409 }
          );
        }

        const claimedItemName = targetItem.name || "Kado";
        const updatedPostWedding = postWedding.map((item: any) => {
          if (item.id === itemId) {
            return { ...item, isAcquired: true, claimedBy: friendName.trim() };
          }
          return item;
        });

        const activityLogs = Array.isArray(planData.activityLogs) ? planData.activityLogs : [];
        const now = Date.now();
        activityLogs.unshift({
          id: `act-${crypto.randomUUID()}`,
          userName: friendName.trim(),
          userRole: "COLLABORATOR",
          action: `Mengklaim kado pernikahan: "${claimedItemName}" dari wishlist`,
          timeAgo: "Baru saja",
          timestamp: now,
          createdAt: new Date(now).toISOString(),
        });

        planData.postWedding = updatedPostWedding;
        planData.activityLogs = activityLogs.slice(0, 200);

        const updateResult = await sql`
          UPDATE weddings SET
            plan_data = ${JSON.stringify(planData)},
            version = version + 1,
            updated_at = NOW()
          WHERE id = ${wRow.id}::uuid AND version = ${currentVersion}
          RETURNING id, version
        `;

        if (updateResult && updateResult.length > 0) {
          return NextResponse.json({ success: true, message: "Klaim kado berhasil disimpan ke database! 🎁" });
        }
      }

      return NextResponse.json(
        { success: false, conflict: true, message: "Terjadi konflik pembaruan klaim kado. Silakan coba lagi." },
        { status: 409 }
      );
    }

    // 3. Full Save / Auto-Save: Strictly require authenticated NextAuth session or verified user email
    const session = await auth();
    const userEmail = session?.user?.email?.toLowerCase().trim() || body?.user?.email?.toLowerCase().trim();
    if (!userEmail) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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

    // 1. Upsert User using authenticated session or verified user email
    if (userEmail) {
      const sessionUserName = session?.user?.name || null;
      const sessionUserImage = session?.user?.image || null;

      await sql`
        INSERT INTO users (name, nickname, email, image, avatar_card_id, role, phone, bio, updated_at)
        VALUES (
          ${user?.name || sessionUserName || "Calon Pengantin"},
          ${user?.nickname || user?.name?.split(" ")[0] || sessionUserName?.split(" ")[0] || "Saya"},
          ${userEmail},
          ${user?.image || sessionUserImage || null},
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

    const inviteCode = (wedding?.inviteCode || "HAJAT-" + Math.random().toString(36).substring(2, 8).toUpperCase()).toUpperCase();

    // 2. Incoming Plan Payload Construction
    const incomingPlanData = {
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
      deletedItemIds: body?.deletedItemIds || [],
    };

    // 3. Deterministic Wedding Resolution using authenticated session email
    const existingWedding = await findWeddingForEmail(userEmail);

    let savedWeddingId: string;
    let savedWeddingVersion: number = 0;
    let finalPlanData: any;

    if (existingWedding) {
      savedWeddingId = existingWedding.id;

      // Smart Reconciliation: Merge incoming changes with existing plan in DB so no missing items are lost
      let existingPlan = {};
      if (existingWedding.plan_data) {
        try {
          existingPlan = JSON.parse(existingWedding.plan_data);
        } catch (e) {
          console.error("Failed to parse existing plan_data for merge", e);
        }
      }
      finalPlanData = mergePlanData(existingPlan, incomingPlanData);
      const planDataJson = JSON.stringify(finalPlanData);

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
        resolvedPartnerName = resolvedPartnerName || (resolvedPartnerRole === "GROOM" ? (existingWedding.groom_name || "Calon Suami") : (existingWedding.bride_name || "Calon Istri"));
        resolvedPartnerAvatar = resolvedPartnerAvatar || (resolvedPartnerRole === "GROOM" ? "penguin-groom" : "duck-bride");
      }

      const primaryEmail = existingWedding.primary_user_email || historyRec?.user1_email || (userEmail && userEmail !== partnerEmail ? userEmail : null);

      let validWeddingDate: string | null = null;
      if (wedding?.weddingDate) {
        if (typeof wedding.weddingDate === "string" && wedding.weddingDate.trim() !== "") {
          validWeddingDate = wedding.weddingDate.trim().split("T")[0];
        } else if (wedding.weddingDate instanceof Date) {
          validWeddingDate = wedding.weddingDate.toISOString().split("T")[0];
        }
      }

      const clientBaseVersion = typeof body.baseVersion === "number" ? body.baseVersion : (typeof wedding?.version === "number" ? wedding.version : 0);

      const updateResult = await sql`
        UPDATE weddings SET
          title = ${wedding?.title !== undefined ? (wedding.title || "Pernikahan Kita") : (existingWedding.title || "Pernikahan Kita")},
          groom_name = COALESCE(NULLIF(${wedding?.groomName || ""}, ''), groom_name),
          bride_name = COALESCE(NULLIF(${wedding?.brideName || ""}, ''), bride_name),
          wedding_date = ${wedding?.weddingDate !== undefined ? validWeddingDate : existingWedding.wedding_date},
          city = ${wedding?.city !== undefined ? (wedding.city || null) : existingWedding.city},
          target_budget = ${wedding?.targetBudget !== undefined ? wedding.targetBudget : existingWedding.target_budget},
          current_savings = ${wedding?.currentSavings !== undefined ? wedding.currentSavings : existingWedding.current_savings},
          slug = ${wedding?.slug !== undefined ? (wedding.slug || null) : existingWedding.slug},
          venue_name = ${wedding?.venueName !== undefined ? (wedding.venueName || null) : existingWedding.venue_name},
          venue_address = ${wedding?.venueAddress !== undefined ? (wedding.venueAddress || null) : existingWedding.venue_address},
          mahar_details = ${wedding?.maharDetails !== undefined ? (wedding.maharDetails || null) : existingWedding.mahar_details},
          wali_nikah = ${wedding?.waliNikah !== undefined ? (wedding.waliNikah || null) : existingWedding.wali_nikah},
          penghulu = ${wedding?.penghulu !== undefined ? (wedding.penghulu || null) : existingWedding.penghulu},
          saksi_nikah = ${wedding?.saksiNikah !== undefined ? (wedding.saksiNikah || null) : existingWedding.saksi_nikah},
          is_partner_connected = ${Boolean(isPartnerConnected)},
          partner_name = ${resolvedPartnerName},
          partner_email = ${partnerEmail},
          partner_user_email = ${partnerUserEmail},
          partner_role = ${resolvedPartnerRole},
          partner_avatar_card_id = ${resolvedPartnerAvatar},
          primary_user_email = COALESCE(${primaryEmail}, primary_user_email),
          plan_data = ${planDataJson},
          version = version + 1,
          updated_at = NOW()
        WHERE id = ${savedWeddingId}::uuid AND version = ${clientBaseVersion}
        RETURNING id, version
      `;

      if (!updateResult || updateResult.length === 0) {
        const vRows = await sql`SELECT version FROM weddings WHERE id = ${savedWeddingId}::uuid LIMIT 1`;
        const currentVersion = vRows && vRows.length > 0 ? Number(vRows[0].version || 0) : 0;
        return NextResponse.json(
          {
            success: false,
            conflict: true,
            version: currentVersion,
            message: "Konflik versi: data telah diperbarui dari perangkat lain.",
          },
          { status: 409 }
        );
      }

      savedWeddingVersion = Number(updateResult[0].version || 0);
    } else {
      finalPlanData = incomingPlanData;
      const planDataJson = JSON.stringify(finalPlanData);

      let validWeddingDate: string | null = null;
      if (wedding?.weddingDate) {
        if (typeof wedding.weddingDate === "string" && wedding.weddingDate.trim() !== "") {
          validWeddingDate = wedding.weddingDate.trim().split("T")[0];
        } else if (wedding.weddingDate instanceof Date) {
          validWeddingDate = wedding.weddingDate.toISOString().split("T")[0];
        }
      }

      const insertRows = await sql`
        INSERT INTO weddings (
          title, invite_code, groom_name, bride_name, wedding_date, city,
          target_budget, current_savings, slug, venue_name, venue_address,
          mahar_details, wali_nikah, penghulu, saksi_nikah,
          is_partner_connected, partner_name, partner_email, partner_user_email, partner_role,
          partner_avatar_card_id, primary_user_email, plan_data, version, updated_at
        ) VALUES (
          ${wedding?.title || "Pernikahan Kita"},
          ${inviteCode},
          ${wedding?.groomName || ""},
          ${wedding?.brideName || ""},
          ${validWeddingDate},
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
          0,
          NOW()
        )
        RETURNING id, version
      `;
      savedWeddingId = insertRows[0].id;
      savedWeddingVersion = Number(insertRows[0].version || 0);
    }

    return NextResponse.json({
      success: true,
      weddingId: savedWeddingId,
      inviteCode,
      version: savedWeddingVersion,
      planData: finalPlanData,
    });
  } catch (error: any) {
    console.error("Error in POST /api/wedding/sync:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
