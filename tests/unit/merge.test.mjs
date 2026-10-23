import test from "node:test";
import assert from "node:assert/strict";
import { mergePlanData, mergeEntityList, mergeActivityLogs, mergeAlignmentTopics } from "../../src/lib/merge-plan-data.ts";

test("Merge Suite: Unit Tests", async (t) => {
  await t.test("Union merge preserves items absent from incoming (no tombstone)", () => {
    const existing = {
      guests: [{ id: "g1", name: "Budi", notes: "vegan" }],
      checklist: [{ id: "c1", title: "Venue", completed: true }],
      postWedding: [{ id: "p1", name: "Blender", isAcquired: true }],
      seserahan: [{ id: "s1", name: "Mukena", isPurchased: true }],
      rundown: [{ id: "r1", activity: "Akad", time: "08:00" }],
      budgetCategories: [{ id: "b1", name: "Catering", allocated: 50000000 }],
      vendors: [{ id: "v1", vendorName: "Katering Lezat", category: "Catering" }],
      savingContributions: [{ id: "sc1", label: "Gaji Januari", amount: 5000000 }],
      lifeGoals: [{ id: "lg1", title: "DP Rumah", targetAmount: 100000000, currentAmount: 20000000 }],
    };

    const incoming = {
      guests: [],
      checklist: [],
      postWedding: [],
      seserahan: [],
      rundown: [],
      budgetCategories: [],
      vendors: [],
      savingContributions: [],
      lifeGoals: [],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.guests.length, 1);
    assert.equal(result.checklist.length, 1);
    assert.equal(result.postWedding.length, 1);
    assert.equal(result.seserahan.length, 1);
    assert.equal(result.rundown.length, 1);
    assert.equal(result.budgetCategories.length, 1);
    assert.equal(result.vendors.length, 1);
    assert.equal(result.savingContributions.length, 1);
    assert.equal(result.lifeGoals.length, 1);
  });

  await t.test("Tombstone (deletedItemIds) permanently removes item and prevents resurrection", () => {
    const existing = {
      guests: [{ id: "g1", name: "Budi" }],
      checklist: [{ id: "c1", title: "Venue" }],
    };

    const incoming = {
      guests: [{ id: "g1", name: "Budi" }], // Stale client attempting to re-send g1
      checklist: [],
      deletedItemIds: ["g1", "c1"],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.guests.length, 0, "Tombstone must purge g1");
    assert.equal(result.checklist.length, 0, "Tombstone must purge c1");
    assert.ok(result.deletedItemIds.includes("g1"));
    assert.ok(result.deletedItemIds.includes("c1"));
  });

  await t.test("Tombstones are capped at newest 500 IDs", () => {
    const manyIds = Array.from({ length: 600 }, (_, i) => `del-${i}`);
    const result = mergePlanData({ guests: [] }, { deletedItemIds: manyIds });
    assert.equal(result.deletedItemIds.length, 500);
    assert.equal(result.deletedItemIds[0], "del-100");
    assert.equal(result.deletedItemIds[499], "del-599");
  });

  await t.test("Un-completing checklist or un-acquiring post-wedding item is respected", () => {
    const existing = {
      checklist: [{ id: "c1", title: "Catering", completed: true }],
      postWedding: [{ id: "p1", name: "Sofa", isAcquired: true, isPurchased: true }],
      seserahan: [{ id: "s1", name: "Tas", isPurchased: true }],
    };

    const incoming = {
      checklist: [{ id: "c1", title: "Catering", completed: false }],
      postWedding: [{ id: "p1", name: "Sofa", isAcquired: false, isPurchased: false }],
      seserahan: [{ id: "s1", name: "Tas", isPurchased: false }],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.checklist[0].completed, false);
    assert.equal(result.postWedding[0].isAcquired, false);
    assert.equal(result.postWedding[0].isPurchased, false);
    assert.equal(result.seserahan[0].isPurchased, false);
  });

  await t.test("Deduplication without ID uses normalized fallback key", () => {
    const existing = [
      { name: "  Budi Santoso  ", notes: "Keluarga" },
      { name: "Siti Rahma", notes: "Teman SMA" },
    ];
    const incoming = [
      { name: "budi   santoso", notes: "Keluarga Inti" }, // Match by name
      { name: "Ahmad", notes: "Baru" },
    ];

    const result = mergeEntityList(existing, incoming, "name");
    assert.equal(result.length, 3);
    assert.equal(result[0].name.trim(), "budi   santoso");
    assert.equal(result[0].notes, "Keluarga Inti");
  });

  await t.test("Prototype pollution inputs (__proto__, constructor) are safely handled", () => {
    const existing = { guests: [{ id: "g1", name: "Test" }] };
    const maliciousIncoming = {
      guests: [
        { id: "__proto__", name: "Exploit" },
        { id: "g2", name: "Polluter", __proto__: { isAdmin: true } },
      ],
    };

    const result = mergePlanData(existing, maliciousIncoming);
    assert.equal(({}).isAdmin, undefined, "Global prototype must NOT be polluted");
    assert.ok(result);
  });

  await t.test("Family quota merges shallowly without overwriting sibling keys", () => {
    const existing = { familyQuota: { groom: 100, bride: 150, vip: 20 } };
    const incoming = { familyQuota: { groom: 120 } };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.familyQuota.groom, 120);
    assert.equal(result.familyQuota.bride, 150);
    assert.equal(result.familyQuota.vip, 20);
  });

  await t.test("Alignment topics merges both groom and bride answers independently", () => {
    const existing = {
      alignmentTopics: [
        { id: "top-1", question: "Finansial", groomAnswer: "Tabungan bersama 50:50", brideAnswer: "" },
      ],
    };
    const incoming = {
      alignmentTopics: [
        { id: "top-1", question: "Finansial", groomAnswer: "", brideAnswer: "Tabungan bersama 50:50" },
      ],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.alignmentTopics[0].groomAnswer, "Tabungan bersama 50:50");
    assert.equal(result.alignmentTopics[0].brideAnswer, "Tabungan bersama 50:50");
    assert.equal(result.alignmentTopics[0].isAgreed, true);
  });

  await t.test("Activity logs merge newest up to 500 items and deduplicate", () => {
    const exLogs = [
      { id: "log-1", action: "Tambah tamu", timestamp: 1000 },
      { id: "log-2", action: "Ubah budget", timestamp: 2000 },
    ];
    const inLogs = [
      { id: "log-2", action: "Ubah budget", timestamp: 2000 }, // Duplicate
      { id: "log-3", action: "Checklist selesai", timestamp: 3000 },
    ];

    const result = mergePlanData({ activityLogs: exLogs }, { activityLogs: inLogs });
    assert.equal(result.activityLogs.length, 3);
    assert.equal(result.activityLogs[0].id, "log-3"); // Newest first
  });

  await t.test("Large payload (1000 items) merges efficiently without stack overflow or data corruption", () => {
    const existing = {
      guests: Array.from({ length: 500 }, (_, i) => ({ id: `g-ex-${i}`, name: `Guest ${i}`, pax: 2 })),
    };
    const incoming = {
      guests: Array.from({ length: 500 }, (_, i) => ({ id: `g-in-${i}`, name: `Incoming Guest ${i}`, pax: 1 })),
    };

    const start = Date.now();
    const result = mergePlanData(existing, incoming);
    const duration = Date.now() - start;

    assert.equal(result.guests.length, 1000);
    assert.ok(duration < 1000, `Merge took ${duration}ms, expected < 1000ms`);
  });

  // =========================================================================
  // KNOWN BUG TEST 1: User can clear notes to empty string ("")
  // =========================================================================
  await t.test("BUG CHECK: User can clear an existing note to empty string", () => {
    const existing = {
      guests: [{ id: "g1", name: "Budi", notes: "Alergi kacang" }],
    };
    const incoming = {
      guests: [{ id: "g1", name: "Budi", notes: "" }],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.guests[0].notes, "", "User clearing notes must result in empty string, not preserve old notes");
  });

  // =========================================================================
  // KNOWN BUG TEST 2: Empty deposits must reset currentAmount to 0
  // =========================================================================
  await t.test("BUG CHECK: Clearing all deposits for a life goal resets currentAmount to 0", () => {
    const existing = {
      lifeGoals: [
        {
          id: "lg-1",
          title: "Beli Rumah",
          targetAmount: 500000000,
          currentAmount: 50000000,
          deposits: [{ id: "dep-1", amount: 50000000, note: "Tabungan awal" }],
        },
      ],
    };
    const incoming = {
      lifeGoals: [
        {
          id: "lg-1",
          title: "Beli Rumah",
          targetAmount: 500000000,
          deposits: [],
        },
      ],
      deletedItemIds: ["dep-1"],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.lifeGoals[0].deposits.length, 0);
    assert.equal(result.lifeGoals[0].currentAmount, 0, "currentAmount must be 0 when deposits are empty");
  });

  // =========================================================================
  // KNOWN BUG TEST 3: adminSteps partial incoming does NOT wipe existing steps
  // =========================================================================
  await t.test("BUG CHECK: adminSteps merges by ID instead of replacing entire list", () => {
    const existing = {
      adminSteps: [
        { id: "step-1", title: "Surat RT/RW", done: true },
        { id: "step-2", title: "Surat Kelurahan", done: false },
        { id: "step-3", title: "KUA", done: false },
      ],
    };
    const incoming = {
      adminSteps: [
        { id: "step-2", title: "Surat Kelurahan", done: true },
      ],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.adminSteps.length, 3, "adminSteps must retain all 3 steps, not truncate to 1");
    const step2 = result.adminSteps.find((s) => s.id === "step-2");
    assert.equal(step2.done, true);
  });

  // =========================================================================
  // KNOWN BUG TEST 4: Concurrent deposits & boost merging on same goal
  // =========================================================================
  await t.test("BUG CHECK: Two concurrent boost deposits (Groom & Bride) are both preserved and currentAmount sum is exact", () => {
    const existing = {
      lifeGoals: [
        {
          id: "f20eb503-bca8-4d2c-9daf-a8b7cdd14b1e",
          title: "DP Rumah",
          targetAmount: 100000000,
          currentAmount: 10000000,
          deposits: [
            { id: "dep-groom-1", amount: 10000000, contributor: "GROOM", date: "2026-10-23" },
          ],
        },
      ],
    };

    const incoming = {
      lifeGoals: [
        {
          id: "f20eb503-bca8-4d2c-9daf-a8b7cdd14b1e",
          title: "DP Rumah",
          targetAmount: 100000000,
          currentAmount: 5000000,
          deposits: [
            { id: "dep-bride-1", amount: 5000000, contributor: "BRIDE", date: "2026-10-23" },
          ],
        },
      ],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.lifeGoals.length, 1);
    const goal = result.lifeGoals[0];
    assert.equal(goal.deposits.length, 2, "Both deposits must be retained");
    assert.equal(goal.currentAmount, 15000000, "currentAmount must reflect exact sum of both deposits");
  });

  // =========================================================================
  // KNOWN BUG TEST 5: Incoming new goal cleans up deposits in tombstone set
  // =========================================================================
  await t.test("BUG CHECK: Newly incoming goal does not resurrect a deposit whose ID is tombstoned", () => {
    const existing = {
      lifeGoals: [],
      deletedItemIds: ["dep-stale-1"],
    };

    const incoming = {
      lifeGoals: [
        {
          id: "lg-new-1",
          title: "Dana Darurat",
          targetAmount: 50000000,
          currentAmount: 20000000,
          deposits: [
            { id: "dep-stale-1", amount: 15000000, contributor: "GROOM", date: "2026-10-20" },
            { id: "dep-active-2", amount: 5000000, contributor: "BRIDE", date: "2026-10-22" },
          ],
        },
      ],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.lifeGoals.length, 1);
    const goal = result.lifeGoals[0];
    assert.equal(goal.deposits.length, 1, "Only dep-active-2 must be kept");
    assert.equal(goal.deposits[0].id, "dep-active-2");
    assert.equal(goal.currentAmount, 5000000, "currentAmount must be recalculated from remaining active deposits");
  });

  // =========================================================================
  // NESTED MERGE TESTS: adminSteps requirements & vendor stages
  // =========================================================================
  await t.test("Nested merge for adminSteps requirements preserves completion and notes", () => {
    const existing = {
      adminSteps: [
        {
          id: "step-1",
          stepNumber: 1,
          stageName: "Surat Pengantar RT/RW",
          requirements: [
            { id: "req-1", title: "Fotokopi KTP", isDone: true, note: "Sudah difotokopi 5 lembar" },
            { id: "req-2", title: "Fotokopi KK", isDone: false },
          ],
        },
      ],
    };

    const incoming = {
      adminSteps: [
        {
          id: "step-1",
          stepNumber: 1,
          stageName: "Surat Pengantar RT/RW",
          requirements: [
            { id: "req-1", title: "Fotokopi KTP", isDone: true }, // partner syncs without note
            { id: "req-2", title: "Fotokopi KK", isDone: true, note: "Diambil dari rumah ibu" }, // partner completed it
            { id: "req-3", title: "Surat Pengantar RT", isDone: false }, // new requirement added
          ],
        },
      ],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.adminSteps.length, 1);
    const step = result.adminSteps[0];
    assert.equal(step.requirements.length, 3);
    const req1 = step.requirements.find((r) => r.id === "req-1");
    assert.equal(req1.isDone, true);
    assert.equal(req1.note, "Sudah difotokopi 5 lembar", "Existing note must be preserved if incoming note is undefined");
    const req2 = step.requirements.find((r) => r.id === "req-2");
    assert.equal(req2.isDone, true);
    assert.equal(req2.note, "Diambil dari rumah ibu");
    const req3 = step.requirements.find((r) => r.id === "req-3");
    assert.equal(req3.isDone, false);
  });

  await t.test("Nested merge for vendor stages preserves isPaid and merges by name", () => {
    const existing = {
      vendors: [
        {
          id: "v-1",
          vendorName: "Catering Berkah",
          serviceType: "Catering",
          totalContract: 50000000,
          stages: [
            { name: "DP 30%", percentage: 30, amount: 15000000, isPaid: true, condition: "Saat booking" },
            { name: "Pelunasan", percentage: 70, amount: 35000000, isPaid: false, condition: "H-7" },
          ],
        },
      ],
    };

    const incoming = {
      vendors: [
        {
          id: "v-1",
          vendorName: "Catering Berkah",
          serviceType: "Catering",
          totalContract: 50000000,
          stages: [
            { name: "DP 30%", percentage: 30, amount: 15000000, isPaid: true, condition: "Saat booking" },
            { name: "Pelunasan", percentage: 70, amount: 35000000, isPaid: true, condition: "H-7" }, // partner paid pelunasan
          ],
        },
      ],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.vendors.length, 1);
    const vendor = result.vendors[0];
    assert.equal(vendor.stages.length, 2);
    assert.equal(vendor.stages[0].isPaid, true);
    assert.equal(vendor.stages[1].isPaid, true);
  });

  await t.test("adminSteps fallback key uses stageName when id is absent", () => {
    const existing = {
      adminSteps: [
        { stageName: "KUA & Pemeriksaan Berkas", cost: "Rp 0", agency: "KUA" },
      ],
    };
    const incoming = {
      adminSteps: [
        { stageName: "kua & pemeriksaan berkas", cost: "Rp 600.000 (luar kantor)", agency: "KUA" },
      ],
    };

    const result = mergePlanData(existing, incoming);
    assert.equal(result.adminSteps.length, 1, "Must deduplicate by stageName");
    assert.equal(result.adminSteps[0].cost, "Rp 600.000 (luar kantor)");
  });
});

