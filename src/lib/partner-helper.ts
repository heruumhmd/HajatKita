import { WeddingProject, User, RoleType } from "@/types";

export interface EffectivePartnerInfo {
  name: string;
  role: RoleType;
  email: string;
  avatarCardId?: string;
  image?: string;
}

/**
 * Deterministically resolves the reciprocal partner profile for the currently viewing user.
 * 
 * Rules:
 * 1. If the workspace is not partner-connected, return null.
 * 2. If wedding.couple is available and the viewing user has an email:
 *    - If currentUser matches couple.user1, partner is couple.user2.
 *    - If currentUser matches couple.user2, partner is couple.user1.
 * 3. Infallible anti-self guard:
 *    - A user is ONLY self if their email strictly matches the partner's email.
 *    - Same role does NOT mean self (partners might have default roles before pairing).
 * 4. Fallback resolution:
 *    - If partnerInfo is missing or resolved to self, compute from wedding names and roles.
 *    - Partner email MUST be reciprocal:
 *      * If currentUser is the workspace owner (primaryUserEmail), partner's email is partnerUserEmail.
 *      * If currentUser is the partner (partnerUserEmail), partner's email is primaryUserEmail.
 *      * NEVER assign currentUser's own email to the partner!
 */
export function getEffectivePartner(
  wedding: WeddingProject | null | undefined,
  currentUser: User | null | undefined
): EffectivePartnerInfo | null {
  if (!wedding || !wedding.isPartnerConnected) {
    return null;
  }

  const myEmail = (currentUser?.email || "").toLowerCase().trim();
  const myName = (currentUser?.name || "").toLowerCase().trim();

  let resolved: EffectivePartnerInfo | null = null;

  // 1. Reciprocal resolution via wedding.couple
  if (wedding.couple && myEmail) {
    const u1 = wedding.couple.user1;
    const u2 = wedding.couple.user2;
    const u1Email = (u1?.email || "").toLowerCase().trim();
    const u2Email = (u2?.email || "").toLowerCase().trim();

    if (u1Email && u1Email === myEmail && u2) {
      resolved = {
        name: u2.name || (u2.role === "GROOM" ? (wedding.groomName || "Calon Suami") : (wedding.brideName || "Calon Istri")),
        role: u2.role,
        email: u2.email || wedding.partnerUserEmail || "",
        avatarCardId: u2.avatarCardId || (u2.role === "GROOM" ? "cat-prince" : "cat-princess"),
      };
    } else if (u2Email && u2Email === myEmail && u1) {
      resolved = {
        name: u1.name || (u1.role === "GROOM" ? (wedding.groomName || "Calon Suami") : (wedding.brideName || "Calon Istri")),
        role: u1.role,
        email: u1.email || wedding.primaryUserEmail || "",
        avatarCardId: u1.avatarCardId || (u1.role === "GROOM" ? "cat-prince" : "cat-princess"),
      };
    }
  }

  // 2. Direct wedding.partnerInfo fallback
  if (!resolved && wedding.partnerInfo) {
    resolved = {
      name: wedding.partnerInfo.name,
      role: wedding.partnerInfo.role,
      email: wedding.partnerInfo.email,
      avatarCardId: wedding.partnerInfo.avatarCardId,
      image: wedding.partnerInfo.image,
    };
  }

  // 3. Infallible anti-self guard:
  // Check if resolved partner is actually the current user themselves
  const pEmail = (resolved?.email || "").toLowerCase().trim();
  const pName = (resolved?.name || "").toLowerCase().trim();

  const isSelf = Boolean(
    (myEmail && pEmail && myEmail === pEmail) ||
    (myName && pName && myName === pName && myName !== "saya" && myName !== "calon pengantin")
  );

  if (!resolved || isSelf) {
    const isOwner = Boolean(
      myEmail &&
      wedding.primaryUserEmail &&
      myEmail === wedding.primaryUserEmail.toLowerCase().trim()
    );

    const partnerEmail = isOwner
      ? (wedding.partnerUserEmail || "")
      : (wedding.primaryUserEmail || "");

    if (currentUser?.role === "GROOM") {
      return {
        name: wedding.brideName || "Calon Istri",
        role: "BRIDE",
        email: partnerEmail,
        avatarCardId: resolved?.avatarCardId || "duck-bride",
      };
    } else {
      return {
        name: wedding.groomName || "Calon Suami",
        role: "GROOM",
        email: partnerEmail,
        avatarCardId: resolved?.avatarCardId || "penguin-groom",
      };
    }
  }

  return resolved;
}

/**
 * Returns couple names for headers and navigation without hardcoded developer nicknames.
 */
export function getCoupleDisplayName(
  wedding: WeddingProject | null | undefined,
  currentUser: User | null | undefined
): { groomShort: string; brideShort: string; coupleTitle: string } {
  if (!wedding) {
    return { groomShort: "", brideShort: "", coupleTitle: "Rencana Pernikahan Kita" };
  }

  const partner = getEffectivePartner(wedding, currentUser);

  const weddingGroom = (wedding.groomName || "").trim().split(" ")[0];
  const weddingBride = (wedding.brideName || "").trim().split(" ")[0];

  let groomShort = weddingGroom;
  let brideShort = weddingBride;

  const myNick = currentUser?.nickname || currentUser?.name?.trim().split(" ")[0] || "";
  const partnerNick = partner?.name?.trim().split(" ")[0] || "";

  if (!groomShort) {
    if (currentUser?.role === "GROOM" && myNick) {
      groomShort = myNick;
    } else if (partner?.role === "GROOM" && partnerNick) {
      groomShort = partnerNick;
    }
  }

  if (!brideShort) {
    if (currentUser?.role === "BRIDE" && myNick) {
      brideShort = myNick;
    } else if (partner?.role === "BRIDE" && partnerNick) {
      brideShort = partnerNick;
    }
  }

  const isGenericPlaceholder = (s: string) => {
    if (!s) return true;
    const lower = s.toLowerCase();
    return lower === "calon" || lower === "saya" || lower === "pasangan" || lower === "pria" || lower === "wanita" || lower === "anda";
  };

  const validGroom = isGenericPlaceholder(groomShort) ? "" : groomShort;
  const validBride = isGenericPlaceholder(brideShort) ? "" : brideShort;

  // Prevent duplicate names (e.g. if both somehow got the same string)
  if (validGroom && validBride && validGroom.toLowerCase() === validBride.toLowerCase()) {
    if (currentUser?.role === "BRIDE") {
      groomShort = partnerNick && !isGenericPlaceholder(partnerNick) ? partnerNick : "";
      brideShort = myNick;
    } else {
      groomShort = myNick;
      brideShort = partnerNick && !isGenericPlaceholder(partnerNick) ? partnerNick : "";
    }
  } else {
    groomShort = validGroom;
    brideShort = validBride;
  }

  const coupleTitle =
    groomShort && brideShort
      ? `${groomShort} & ${brideShort}`
      : groomShort
      ? `Hajat ${groomShort}`
      : brideShort
      ? `Hajat ${brideShort}`
      : wedding.title || "Rencana Pernikahan Kita";

  return { groomShort, brideShort, coupleTitle };
}
