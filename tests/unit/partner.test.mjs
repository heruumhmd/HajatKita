import test from "node:test";
import assert from "node:assert/strict";
import { getEffectivePartner, getCoupleDisplayName } from "../../src/lib/partner-helper.ts";

test("Unit Suite: Partner Helper & Reciprocal Identity Resolution", async (t) => {
  await t.test("Returns null when wedding is not partner-connected", () => {
    const wedding = {
      id: "w-1",
      title: "Pernikahan Kita",
      isPartnerConnected: false,
      inviteCode: "HAJAT-1234",
    };
    const user = {
      id: "u-1",
      email: "budi@example.test",
      name: "Budi",
      role: "GROOM",
    };

    const partner = getEffectivePartner(wedding, user);
    assert.equal(partner, null);
  });

  await t.test("Reciprocal couple resolution: Owner (User 1) sees Partner (User 2)", () => {
    const wedding = {
      id: "w-1",
      title: "Pernikahan Kita",
      isPartnerConnected: true,
      primaryUserEmail: "budi@example.test",
      partnerUserEmail: "siti@example.test",
      groomName: "Budi Santoso",
      brideName: "Siti Rahma",
      couple: {
        user1: {
          name: "Budi Santoso",
          role: "GROOM",
          email: "budi@example.test",
          avatarCardId: "cat-prince",
        },
        user2: {
          name: "Siti Rahma",
          role: "BRIDE",
          email: "siti@example.test",
          avatarCardId: "cat-princess",
        },
      },
    };

    const budiUser = {
      id: "u-1",
      email: "budi@example.test",
      name: "Budi Santoso",
      role: "GROOM",
    };

    const partner = getEffectivePartner(wedding, budiUser);
    assert.notEqual(partner, null);
    assert.equal(partner.name, "Siti Rahma");
    assert.equal(partner.role, "BRIDE");
    assert.equal(partner.email, "siti@example.test");
    assert.equal(partner.avatarCardId, "cat-princess");
  });

  await t.test("Reciprocal couple resolution: Partner (User 2) sees Owner (User 1)", () => {
    const wedding = {
      id: "w-1",
      title: "Pernikahan Kita",
      isPartnerConnected: true,
      primaryUserEmail: "budi@example.test",
      partnerUserEmail: "siti@example.test",
      groomName: "Budi Santoso",
      brideName: "Siti Rahma",
      couple: {
        user1: {
          name: "Budi Santoso",
          role: "GROOM",
          email: "budi@example.test",
          avatarCardId: "cat-prince",
        },
        user2: {
          name: "Siti Rahma",
          role: "BRIDE",
          email: "siti@example.test",
          avatarCardId: "cat-princess",
        },
      },
    };

    const sitiUser = {
      id: "u-2",
      email: "siti@example.test",
      name: "Siti Rahma",
      role: "BRIDE",
    };

    const partner = getEffectivePartner(wedding, sitiUser);
    assert.notEqual(partner, null);
    assert.equal(partner.name, "Budi Santoso");
    assert.equal(partner.role, "GROOM");
    assert.equal(partner.email, "budi@example.test");
    assert.equal(partner.avatarCardId, "cat-prince");
  });

  await t.test("Partners with default 'GROOM' role do NOT falsely trigger isSelf", () => {
    // Both users had default role GROOM when registering
    const wedding = {
      id: "w-1",
      title: "Pernikahan Kita",
      isPartnerConnected: true,
      primaryUserEmail: "owner@example.test",
      partnerUserEmail: "partner@example.test",
      groomName: "Owner Name",
      brideName: "Partner Name",
      partnerInfo: {
        name: "Partner Name",
        role: "GROOM", // default role from database
        email: "partner@example.test",
        avatarCardId: "cat-prince",
      },
    };

    const ownerUser = {
      id: "u-owner",
      email: "owner@example.test",
      name: "Owner Name",
      role: "GROOM",
    };

    const partner = getEffectivePartner(wedding, ownerUser);
    assert.notEqual(partner, null);
    // Should NOT be treated as self, email must be partner's email
    assert.equal(partner.email, "partner@example.test");
    assert.equal(partner.name, "Partner Name");
  });

  await t.test("Self-pairing fallback never assigns user's own email to partner", () => {
    // Malformed state where partner email equals owner email
    const wedding = {
      id: "w-1",
      title: "Pernikahan Kita",
      isPartnerConnected: true,
      primaryUserEmail: "user@example.test",
      partnerUserEmail: "partner@example.test",
      groomName: "Ahmad",
      brideName: "Fatimah",
      partnerInfo: {
        name: "Ahmad",
        role: "GROOM",
        email: "user@example.test", // mistakenly set to self
      },
    };

    const user = {
      id: "u-1",
      email: "user@example.test",
      name: "Ahmad",
      role: "GROOM",
    };

    const partner = getEffectivePartner(wedding, user);
    assert.notEqual(partner, null);
    // Partner email must resolve to partnerUserEmail, NOT the user's own email!
    assert.equal(partner.email, "partner@example.test");
    assert.equal(partner.role, "BRIDE");
    assert.equal(partner.name, "Fatimah");
  });

  await t.test("getCoupleDisplayName produces clean titles without hardcoded developer slop", () => {
    const wedding = {
      id: "w-1",
      title: "Pernikahan Kita",
      groomName: "Farhan Akbar",
      brideName: "Aisyah Putri",
      isPartnerConnected: true,
    };
    const user = {
      id: "u-1",
      email: "farhan@example.test",
      name: "Farhan Akbar",
      role: "GROOM",
    };

    const display = getCoupleDisplayName(wedding, user);
    assert.equal(display.groomShort, "Farhan");
    assert.equal(display.brideShort, "Aisyah");
    assert.equal(display.coupleTitle, "Farhan & Aisyah");

    // Single name set
    const singleWedding = {
      ...wedding,
      brideName: "",
    };
    const singleDisplay = getCoupleDisplayName(singleWedding, user);
    assert.equal(singleDisplay.groomShort, "Farhan");
    assert.equal(singleDisplay.coupleTitle, "Hajat Farhan");
  });

  await t.test("Complementary role assignment: Owner as GROOM gives partner BRIDE role with duck-bride avatar fallback", () => {
    const wedding = {
      id: "w-10",
      title: "Pernikahan Kita",
      isPartnerConnected: true,
      primaryUserEmail: "groom-owner@example.test",
      partnerUserEmail: "bride-partner@example.test",
      groomName: "Ali",
      brideName: "Fatimah",
      partnerInfo: null, // missing partnerInfo triggers fallback
    };
    const groomUser = {
      id: "u-groom",
      email: "groom-owner@example.test",
      name: "Ali",
      role: "GROOM",
    };

    const partner = getEffectivePartner(wedding, groomUser);
    assert.notEqual(partner, null);
    assert.equal(partner.role, "BRIDE");
    assert.equal(partner.name, "Fatimah");
    assert.equal(partner.email, "bride-partner@example.test");
    assert.equal(partner.avatarCardId, "duck-bride");
  });

  await t.test("Complementary role assignment: Owner as BRIDE gives partner GROOM role with penguin-groom avatar fallback", () => {
    const wedding = {
      id: "w-11",
      title: "Pernikahan Kita",
      isPartnerConnected: true,
      primaryUserEmail: "bride-owner@example.test",
      partnerUserEmail: "groom-partner@example.test",
      groomName: "Zaid",
      brideName: "Maryam",
      partnerInfo: null,
    };
    const brideUser = {
      id: "u-bride",
      email: "bride-owner@example.test",
      name: "Maryam",
      role: "BRIDE",
    };

    const partner = getEffectivePartner(wedding, brideUser);
    assert.notEqual(partner, null);
    assert.equal(partner.role, "GROOM");
    assert.equal(partner.name, "Zaid");
    assert.equal(partner.email, "groom-partner@example.test");
    assert.equal(partner.avatarCardId, "penguin-groom");
  });

  await t.test("getCoupleDisplayName handles blank names and generic placeholders gracefully", () => {
    const blankWedding = {
      id: "w-empty",
      title: "Hajat Bahagia",
      groomName: "",
      brideName: "",
      isPartnerConnected: false,
    };
    const anonUser = {
      id: "u-anon",
      email: "guest@example.test",
      name: "Saya",
      role: "GROOM",
    };

    const result = getCoupleDisplayName(blankWedding, anonUser);
    assert.equal(result.groomShort, "");
    assert.equal(result.brideShort, "");
    assert.equal(result.coupleTitle, "Hajat Bahagia");
  });
});
