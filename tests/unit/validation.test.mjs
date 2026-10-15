import test from "node:test";
import assert from "node:assert/strict";
import { rsvpSchema, claimGiftSchema } from "../../src/lib/validation.ts";

test("Validation Suite: Unit Tests (RSVP & Claim Gift)", async (t) => {
  await t.test("Valid RSVP payload succeeds with default values applied", () => {
    const valid = {
      action: "RSVP",
      slug: "andi-siti",
      guest: {
        name: "Budi Santoso",
      },
    };

    const parsed = rsvpSchema.safeParse(valid);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.guest.name, "Budi Santoso");
      assert.equal(parsed.data.guest.pax, 2);
      assert.equal(parsed.data.guest.side, "BOTH");
      assert.equal(parsed.data.guest.rsvpStatus, "CONFIRMED_ATTENDING");
      assert.equal(parsed.data.guest.phone, "-");
      assert.equal(parsed.data.guest.notes, "");
    }
  });

  await t.test("RSVP rejects empty or whitespace-only guest name", () => {
    const emptyName = { action: "RSVP", guest: { name: "" } };
    assert.equal(rsvpSchema.safeParse(emptyName).success, false);

    const whitespaceName = { action: "RSVP", guest: { name: "   " } };
    assert.equal(rsvpSchema.safeParse(whitespaceName).success, false);
  });

  await t.test("RSVP rejects name exceeding 100 characters", () => {
    const longName = { action: "RSVP", guest: { name: "A".repeat(101) } };
    const res = rsvpSchema.safeParse(longName);
    assert.equal(res.success, false);
  });

  await t.test("RSVP rejects phone exceeding 30 characters", () => {
    const longPhone = { action: "RSVP", guest: { name: "Budi", phone: "0812".repeat(10) } };
    assert.equal(rsvpSchema.safeParse(longPhone).success, false);
  });

  await t.test("RSVP rejects notes exceeding 500 characters", () => {
    const longNotes = { action: "RSVP", guest: { name: "Budi", notes: "X".repeat(501) } };
    assert.equal(rsvpSchema.safeParse(longNotes).success, false);
  });

  await t.test("RSVP rejects negative, decimal, or excessive pax", () => {
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", pax: -1 } }).success, false);
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", pax: 2.5 } }).success, false);
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", pax: 21 } }).success, false);

    // Boundary cases that should pass
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", pax: 0 } }).success, true);
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", pax: 20 } }).success, true);
  });

  await t.test("RSVP rejects invalid side or rsvpStatus enums", () => {
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", side: "NEIGHBOR" } }).success, false);
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", rsvpStatus: "TENTATIVE" } }).success, false);

    // Valid values
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", side: "GROOM" } }).success, true);
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", side: "BRIDE" } }).success, true);
    assert.equal(rsvpSchema.safeParse({ action: "RSVP", guest: { name: "Budi", rsvpStatus: "DECLINED" } }).success, true);
  });

  await t.test("Valid CLAIM_GIFT payload succeeds", () => {
    const valid = {
      action: "CLAIM_GIFT",
      slug: "andi-siti",
      itemId: "post-1234",
      friendName: "Rina Wijaya",
    };
    const parsed = claimGiftSchema.safeParse(valid);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.friendName, "Rina Wijaya");
      assert.equal(parsed.data.itemId, "post-1234");
    }
  });

  await t.test("CLAIM_GIFT rejects missing itemId or invalid friendName", () => {
    assert.equal(claimGiftSchema.safeParse({ action: "CLAIM_GIFT", friendName: "Rina" }).success, false);
    assert.equal(claimGiftSchema.safeParse({ action: "CLAIM_GIFT", itemId: "i-1", friendName: "" }).success, false);
    assert.equal(claimGiftSchema.safeParse({ action: "CLAIM_GIFT", itemId: "i-1", friendName: "   " }).success, false);
    assert.equal(claimGiftSchema.safeParse({ action: "CLAIM_GIFT", itemId: "i-1", friendName: "A".repeat(101) }).success, false);
  });
});
