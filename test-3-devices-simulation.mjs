import { neon } from '@neondatabase/serverless';
import { mergePlanData, mergeEntityList, mergeActivityLogs, mergeAlignmentTopics } from './src/lib/merge-plan-data.ts';

const sql = neon(process.env.DATABASE_URL);

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runSimulation() {
  console.log("==================================================================");
  console.log("🚀 SIMULASI MULTI-PERANGKAT: 2 HP & 1 TAB (NURUL & HERU)");
  console.log("==================================================================\n");

  // 1. Fetch live database state for Nurul & Heru
  console.log("📦 [FASE 1] Verifikasi Data Awal di Database Neon");
  const weddings = await sql`
    SELECT id, primary_user_email, partner_user_email, groom_name, bride_name, plan_data, version
    FROM weddings
    WHERE primary_user_email ILIKE '%nurulfathonahh@gmail.com%' OR partner_user_email ILIKE '%nurulfathonahh@gmail.com%'
    LIMIT 1
  `;
  assert(weddings.length > 0, "Data pernikahan Nurul & Heru ditemukan di Neon");
  const liveWedding = weddings[0];
  const livePlan = JSON.parse(liveWedding.plan_data || "{}");
  const originalSeserahanCount = livePlan.seserahan?.length || 0;
  console.log(`   Wedding ID: ${liveWedding.id}`);
  console.log(`   Initial Seserahan Count in DB: ${originalSeserahanCount}`);
  assert(originalSeserahanCount >= 27, `Database memiliki ${originalSeserahanCount} item seserahan lengkap`);

  // 2. Simulate Device 1: TAB NURUL
  console.log("\n📱 [FASE 2] Simulasi Perangkat 1: TAB NURUL (Akun: nurulfathonahh@gmail.com)");
  const tabNurulState = {
    user: { email: "nurulfathonahh@gmail.com", name: "Nurul Fathonah", role: "BRIDE" },
    plan: JSON.parse(JSON.stringify(livePlan)),
    deletedItemIds: [],
  };
  assert(tabNurulState.plan.seserahan.length === originalSeserahanCount, `Tab Nurul memuat ${originalSeserahanCount} item seserahan dari database`);
  assert(tabNurulState.plan.seserahan.some(s => s.name.includes("piyama couple")), "Tab Nurul memiliki item 'piyama couple'");
  assert(tabNurulState.plan.seserahan.some(s => s.name.includes("handuk couple")), "Tab Nurul memiliki item 'handuk couple'");

  // 3. Simulate Device 2: HP NURUL (Akun: nurulfathonahh@gmail.com - Fresh mobile device)
  console.log("\n📱 [FASE 3] Simulasi Perangkat 2: HP NURUL (Akun: nurulfathonahh@gmail.com, Fresh Device)");
  // Fresh mobile device starts with empty local state
  const hpNurulLocalState = {
    user: { email: "nurulfathonahh@gmail.com", name: "Nurul Fathonah", role: "BRIDE" },
    plan: { seserahan: [], postWedding: [], checklist: [], activityLogs: [] },
    deletedItemIds: [],
  };
  // HP Nurul syncs with DB (smart merge empty local + full DB)
  const hpNurulMerged = mergePlanData(hpNurulLocalState.plan, livePlan);
  assert(hpNurulMerged.seserahan.length === originalSeserahanCount, `HP Nurul berhasil mengambil data FULL (${hpNurulMerged.seserahan.length} item) dari Tab/DB`);
  assert(hpNurulMerged.postWedding.length === (livePlan.postWedding?.length || 0), `HP Nurul memuat wishlist rumah (${hpNurulMerged.postWedding.length} item)`);
  assert(hpNurulMerged.activityLogs.length === (livePlan.activityLogs?.length || 0), `HP Nurul memuat riwayat aktivitas (${hpNurulMerged.activityLogs.length} logs)`);

  // 4. Simulate Device 3: HP HERU (Akun: herum556@gmail.com - Calon Suami)
  console.log("\n📱 [FASE 4] Simulasi Perangkat 3: HP HERU (Akun: herum556@gmail.com, Calon Suami)");
  const hpHeroLocalState = {
    user: { email: "herum556@gmail.com", name: "Muhammad Heru", role: "GROOM" },
    plan: { seserahan: [], postWedding: [], checklist: [], activityLogs: [] },
    deletedItemIds: [],
  };
  // Heru resolves to same wedding and merges
  const hpHeruMerged = mergePlanData(hpHeroLocalState.plan, livePlan);
  assert(hpHeruMerged.seserahan.length === originalSeserahanCount, `HP Heru juga berhasil menyedot seluruh ${hpHeruMerged.seserahan.length} item seserahan dari DB`);
  assert(liveWedding.groom_name === "Muhammad Heru" && liveWedding.bride_name === "Nurul Fathonah", "Kedua pasangan terhubung sebagai Muhammad Heru & Nurul Fathonah");

  // 5. Simultaneous additions from Tab Nurul & HP Heru (Cross-Partner Merge)
  console.log("\n🔄 [FASE 5] Simulasi Penambahan Data Bersamaan di Masing-masing Pasangan");
  console.log("   - Tab Nurul menambahkan: 'Piyama Sutra Premium' (Busana)");
  console.log("   - HP Heru menambahkan: 'Jas Formal Groom' (Busana)");
  
  const newItemFromTab = {
    id: `ses-test-tab-${Date.now()}`,
    name: "Piyama Sutra Premium",
    category: "Busana",
    estimatedPrice: 250000,
    isPurchased: false,
    boxNumber: 1,
    boxName: "Kotak Pakaian Tidur",
  };
  
  const newItemFromHeru = {
    id: `ses-test-heru-${Date.now()}`,
    name: "Jas Formal Groom",
    category: "Busana",
    estimatedPrice: 1500000,
    isPurchased: false,
    boxNumber: 2,
    boxName: "Kotak Jas Pria",
  };

  // Tab Nurul saves its new item to DB
  const planWithTabItem = mergePlanData(livePlan, {
    seserahan: [newItemFromTab],
  });
  assert(planWithTabItem.seserahan.length === originalSeserahanCount + 1, `Setelah Tab Nurul simpan, total item di server menjadi ${originalSeserahanCount + 1}`);

  // Now HP Heru saves his new item to DB (which already has Tab's item)
  const planWithBothItems = mergePlanData(planWithTabItem, {
    seserahan: [newItemFromHeru],
  });
  assert(planWithBothItems.seserahan.length === originalSeserahanCount + 2, `Setelah HP Heru simpan, total item menjadi ${originalSeserahanCount + 2} (TIDAK ADA YANG HILANG)`);

  // Verify Tab Nurul pulls updates: gets Heru's item too!
  const tabNurulUpdated = mergePlanData({ seserahan: [newItemFromTab] }, planWithBothItems);
  assert(tabNurulUpdated.seserahan.some(s => s.name === "Jas Formal Groom"), "Tab Nurul otomatis mendapatkan 'Jas Formal Groom' yang ditambah oleh Heru");
  assert(tabNurulUpdated.seserahan.some(s => s.name === "Piyama Sutra Premium"), "Tab Nurul tetap memiliki 'Piyama Sutra Premium'");

  // Verify HP Nurul pulls updates: gets BOTH items!
  const hpNurulUpdated = mergePlanData(hpNurulMerged, planWithBothItems);
  assert(hpNurulUpdated.seserahan.some(s => s.name === "Jas Formal Groom"), "HP Nurul otomatis mendapatkan 'Jas Formal Groom' dari Heru");
  assert(hpNurulUpdated.seserahan.some(s => s.name === "Piyama Sutra Premium"), "HP Nurul otomatis mendapatkan 'Piyama Sutra Premium' dari Tab");
  assert(hpNurulUpdated.seserahan.length === originalSeserahanCount + 2, `HP Nurul kini memiliki total ${hpNurulUpdated.seserahan.length} item lengkap`);

  // 6. Independent field modifications (e.g. Check off purchased & Add notes)
  console.log("\n✏️ [FASE 6] Modifikasi Properti Tanpa Saling Timpa (Non-Destructive Merge)");
  console.log("   - HP Heru menandai 'Jas Formal Groom' sudah dibeli seharga Rp 1.450.000");
  console.log("   - Tab Nurul menambahkan catatan pada 'Piyama Sutra Premium': 'Warna emerald green'");

  const heruModification = {
    seserahan: [
      {
        id: newItemFromHeru.id,
        name: "Jas Formal Groom",
        isPurchased: true,
        actualPrice: 1450000,
      }
    ]
  };

  const tabModification = {
    seserahan: [
      {
        id: newItemFromTab.id,
        name: "Piyama Sutra Premium",
        notes: "Warna emerald green",
      }
    ]
  };

  const serverAfterHeru = mergePlanData(planWithBothItems, heruModification);
  const serverAfterBoth = mergePlanData(serverAfterHeru, tabModification);

  const checkHeruItem = serverAfterBoth.seserahan.find(s => s.id === newItemFromHeru.id);
  const checkTabItem = serverAfterBoth.seserahan.find(s => s.id === newItemFromTab.id);

  assert(checkHeruItem.isPurchased === true, "Status pembelian Heru (isPurchased = true) tersimpan");
  assert(checkHeruItem.actualPrice === 1450000, "Harga realisasi Heru (1.450.000) tersimpan");
  assert(checkTabItem.notes === "Warna emerald green", "Catatan dari Nurul ('Warna emerald green') tersimpan rapi");

  // 7. Tombstone Deletion Simulation
  console.log("\n🗑️ [FASE 7] Simulasi Penghapusan Barang dengan Tombstone ID (Tidak Hidup Lagi)");
  console.log("   - Tab Nurul menghapus item percobaan");
  const planAfterDeletion = mergePlanData(serverAfterBoth, {
    deletedItemIds: [newItemFromTab.id, newItemFromHeru.id],
    seserahan: [],
  });
  assert(!planAfterDeletion.seserahan.some(s => s.id === newItemFromTab.id), "Item dari Tab berhasil dihapus");
  assert(!planAfterDeletion.seserahan.some(s => s.id === newItemFromHeru.id), "Item dari Heru berhasil dihapus");
  assert(planAfterDeletion.seserahan.length === originalSeserahanCount, `Jumlah item kembali ke data asli (${originalSeserahanCount} item)`);

  // Even if another device still had the deleted item in its local state, tombstone prevents resurrection
  const staleDeviceState = { seserahan: [newItemFromTab] };
  const mergedWithStale = mergePlanData(staleDeviceState, planAfterDeletion);
  assert(!mergedWithStale.seserahan.some(s => s.id === newItemFromTab.id), "Perangkat lama TIDAK membangkitkan kembali item yang sudah dihapus");

  // 8. Final Report
  console.log("\n==================================================================");
  console.log(`🏁 HASIL AKHIR: ${testsPassed} Berhasil, ${testsFailed} Gagal`);
  console.log("==================================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSimulation().catch((err) => {
  console.error("Simulation error:", err);
  process.exit(1);
});
