import test from "node:test";
import assert from "node:assert/strict";
import { hashPayload, canonicalizePlanPayload } from "../../src/context/wedding-context.tsx";

test("Sync Hash Suite: Deterministic Payload Hashing", async (t) => {
  await t.test("hashPayload produces identical hash regardless of key order or missing optional empty collections", () => {
    const payloadA = {
      wedding: { title: "Hajat Kami", version: 1, id: "w-123" },
      guests: [{ id: "g1", name: "Andi" }],
      checklist: [],
      savingContributions: [],
      seserahan: [],
      postWedding: [],
      rundown: [],
      budgetCategories: [],
      vendors: [],
      alignmentTopics: [],
      activityLogs: [],
      lifeGoals: [],
      deletedItemIds: [],
    };

    // Payload B is constructed from a partial server response missing deletedItemIds and lifeGoals, with wedding id/version different
    const payloadB = {
      guests: [{ id: "g1", name: "Andi" }],
      wedding: { title: "Hajat Kami", version: 99, id: "w-456" },
      checklist: [],
      savingContributions: [],
      seserahan: [],
      postWedding: [],
      rundown: [],
      budgetCategories: [],
      vendors: [],
      alignmentTopics: [],
      activityLogs: [],
    };

    const hashA = hashPayload(payloadA);
    const hashB = hashPayload(payloadB);

    assert.equal(hashA, hashB, "Hash of payload with identical domain data must match even if version/id differ or empty fields are omitted");
  });

  await t.test("hashPayload detects real data mutations", () => {
    const base = {
      wedding: { title: "Hajat Kami" },
      guests: [{ id: "g1", name: "Andi" }],
    };

    const mutated = {
      wedding: { title: "Hajat Kami" },
      guests: [{ id: "g1", name: "Budi" }],
    };

    assert.notEqual(hashPayload(base), hashPayload(mutated), "Mutating a guest name must yield a different hash");
  });

  await t.test("canonicalizePlanPayload ensures all 15 expected keys exist", () => {
    const canonical = canonicalizePlanPayload({});
    const keys = Object.keys(canonical);
    assert.ok(keys.includes("wedding"));
    assert.ok(keys.includes("savingContributions"));
    assert.ok(keys.includes("checklist"));
    assert.ok(keys.includes("seserahan"));
    assert.ok(keys.includes("postWedding"));
    assert.ok(keys.includes("guests"));
    assert.ok(keys.includes("familyQuota"));
    assert.ok(keys.includes("rundown"));
    assert.ok(keys.includes("budgetCategories"));
    assert.ok(keys.includes("vendors"));
    assert.ok(keys.includes("alignmentTopics"));
    assert.ok(keys.includes("adminSteps"));
    assert.ok(keys.includes("activityLogs"));
    assert.ok(keys.includes("lifeGoals"));
    assert.ok(keys.includes("deletedItemIds"));
  });

  await t.test("hashPayload detects lifeGoals addition and deposit changes", () => {
    const withoutGoals = {
      wedding: { title: "Hajat Kami" },
      lifeGoals: [],
    };

    const withGoal = {
      wedding: { title: "Hajat Kami" },
      lifeGoals: [
        {
          id: "lg-1",
          title: "DP Rumah",
          targetAmount: 50000000,
          currentAmount: 0,
          deposits: [],
        },
      ],
    };

    const withDeposit = {
      wedding: { title: "Hajat Kami" },
      lifeGoals: [
        {
          id: "lg-1",
          title: "DP Rumah",
          targetAmount: 50000000,
          currentAmount: 5000000,
          deposits: [{ id: "dep-1", amount: 5000000, date: "2026-10-23" }],
        },
      ],
    };

    assert.notEqual(hashPayload(withoutGoals), hashPayload(withGoal), "Adding a life goal must change payload hash");
    assert.notEqual(hashPayload(withGoal), hashPayload(withDeposit), "Adding a deposit (boost) to a goal must change payload hash");
  });

  await t.test("hashPayload is strictly invariant to nested property order across all entities", () => {
    const payload1 = {
      wedding: {
        groomName: "Budi",
        brideName: "Ani",
        targetBudget: 50000000,
        city: "Bandung",
      },
      lifeGoals: [
        {
          targetAmount: 100000000,
          currentAmount: 20000000,
          title: "Beli Rumah",
          id: "lg-1",
          deposits: [
            { amount: 20000000, date: "2026-10-23", id: "d-1", contributor: "GROOM" }
          ]
        }
      ],
      savingContributions: [
        { label: "Gaji", amount: 5000000, id: "sc-1" }
      ]
    };

    const payload2 = {
      savingContributions: [
        { id: "sc-1", amount: 5000000, label: "Gaji" }
      ],
      lifeGoals: [
        {
          id: "lg-1",
          title: "Beli Rumah",
          deposits: [
            { contributor: "GROOM", id: "d-1", date: "2026-10-23", amount: 20000000 }
          ],
          currentAmount: 20000000,
          targetAmount: 100000000,
        }
      ],
      wedding: {
        city: "Bandung",
        targetBudget: 50000000,
        brideName: "Ani",
        groomName: "Budi",
      },
    };

    assert.equal(
      hashPayload(payload1),
      hashPayload(payload2),
      "hashPayload must be identical even when keys inside nested objects and array items have completely different order"
    );
  });

  await t.test("hashPayload strips volatile couple and partnerInfo metadata", () => {
    const payloadWithoutCouple = {
      wedding: { title: "Hajat Kami", city: "Jakarta" },
    };
    const payloadWithCouple = {
      wedding: {
        title: "Hajat Kami",
        city: "Jakarta",
        partnerInfo: { name: "Ani", role: "BRIDE", email: "ani@test.com" },
        couple: {
          user1: { name: "Budi", role: "GROOM", email: "budi@test.com" },
          user2: { name: "Ani", role: "BRIDE", email: "ani@test.com" },
        },
      },
    };

    assert.equal(
      hashPayload(payloadWithoutCouple),
      hashPayload(payloadWithCouple),
      "Volatile couple/partnerInfo metadata must not trigger false dirty hash mismatch"
    );
  });
});
