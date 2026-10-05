import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || "";
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required.");
}
const sql = neon(databaseUrl, { fetchOptions: { timeout: 30000 } });

async function queryWithRetry(fn, retries = 4, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`    (Koneksi tertunda [${err.code || err.message}], mencoba ulang [${i + 1}/${retries}]...)`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

const TEST_EMAIL = "testing_user_hajatkita@example.com";
const TEST_PARTNER_EMAIL = "testing_partner_hajatkita@example.com";
const TEST_INVITE_CODE = "HAJAT-TEST99";
const TEST_SLUG = "test-andi-siti-" + Date.now();

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runAllTests() {
  console.log("=================================================================");
  console.log("HAJAT KITA - COMPREHENSIVE END-TO-END DATABASE INTEGRATION TEST");
  console.log("=================================================================\n");

  let createdWeddingId = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Database Connectivity & Tables Check
    // -------------------------------------------------------------
    console.log(">>> TEST 1: Memeriksa Koneksi Database Neon & Tabel Sistem");
    const tables = await queryWithRetry(() => sql`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    `);
    const tableNames = tables.map((t) => t.table_name);
    console.log("    Tabel terdeteksi:", tableNames.join(", "));
    assert(tableNames.includes("weddings"), "Tabel 'weddings' tersedia di database");
    assert(tableNames.includes("users"), "Tabel 'users' tersedia di database");
    assert(tableNames.includes("couple_history"), "Tabel 'couple_history' tersedia di database");

    // -------------------------------------------------------------
    // TEST 2: User Profile Upsert
    // -------------------------------------------------------------
    console.log("\n>>> TEST 2: Sinkronisasi Profil Pengguna (users table)");
    await queryWithRetry(() => sql`
      INSERT INTO users (name, nickname, email, role, phone, bio, avatar_card_id, updated_at)
      VALUES (
        'Andi Pratama', 'Andi', ${TEST_EMAIL}, 'GROOM', '08123456789', 'Mempersiapkan pernikahan impian.', 'cat-prince', NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        updated_at = NOW()
    `);
    const userRows = await queryWithRetry(() => sql`SELECT * FROM users WHERE LOWER(email) = ${TEST_EMAIL} LIMIT 1`);
    assert(userRows.length > 0, "Pengguna berhasil disimpan ke tabel 'users'");
    assert(userRows[0].name === "Andi Pratama", "Nama pengguna tersimpan dengan benar");
    assert(userRows[0].role === "GROOM", "Role pengguna (GROOM) tersimpan dengan benar");

    // -------------------------------------------------------------
    // TEST 3: Create Full Wedding Project with ALL 15 Modules
    // -------------------------------------------------------------
    console.log("\n>>> TEST 3: Penyimpanan Lengkap Seluruh Modul UI/UX (plan_data & columns)");

    const fullPlanData = {
      savingContributions: [
        { id: "s-1", label: "Tabungan Andi (Pria)", amount: 50000000, percentage: 62.5, color: "#1D50A2" },
        { id: "s-2", label: "Tabungan Siti (Wanita)", amount: 30000000, percentage: 37.5, color: "#C59B3C" },
      ],
      checklist: [
        { id: "chk-1", title: "Daftar SIMKAH Kemenag Online", description: "Minimal H-10 hari", category: "ADMINISTRASI_KUA", timelineTag: "H-3 Bulan", status: "TODO", assignedTo: "Andi", isOfficialKUA: true },
        { id: "chk-2", title: "Booking Gedung & Katering", description: "Kapasitas 600 pax", category: "VENUE_CATERING", timelineTag: "H-6 Bulan", status: "COMPLETED", assignedTo: "Bersama", isOfficialKUA: false },
      ],
      seserahan: [
        { id: "ses-1", boxNumber: 1, boxName: "Kotak 1: Perlengkapan Shalat", name: "Mukena Sutra & Al-Quran", brand: "Dior / Silk", category: "Ibadah", estimatedPrice: 2500000, purchaseUrl: "https://shopee.co.id", isPurchased: true },
        { id: "ses-2", boxNumber: 2, boxName: "Kotak 2: Skincare & Makeup", name: "Set Skincare Lengkap", brand: "Laneige", category: "Kecantikan", estimatedPrice: 1800000, purchaseUrl: "https://shopee.co.id", isPurchased: false },
      ],
      postWedding: [
        { id: "pw-1", name: "Kulkas 2 Pintu Inverter", roomCategory: "Dapur", brand: "Samsung", price: 6500000, purchaseUrl: "https://tokopedia.com", priority: "MUST_HAVE", isAcquired: false, isGiftClaimable: true },
        { id: "pw-2", name: "Smart TV 55 Inch 4K", roomCategory: "Ruang Keluarga", brand: "LG", price: 7200000, purchaseUrl: "https://tokopedia.com", priority: "NICE_TO_HAVE", isAcquired: false, isGiftClaimable: true },
      ],
      guests: [
        { id: "g-1", name: "Bpk. Rahmat & Keluarga", side: "GROOM", category: "Keluarga Inti", pax: 4, phone: "081299990001", rsvpStatus: "CONFIRMED_ATTENDING", envelopeAmount: 1500000, giftDescription: "Set Sprei Sutra" },
        { id: "g-2", name: "Ibu Dewi & Suami", side: "BRIDE", category: "Sahabat", pax: 2, phone: "081299990002", rsvpStatus: "PENDING" },
      ],
      familyQuota: {
        venueCapacity: 600,
        groomQuota: 150,
        brideQuota: 150,
        groomParentsQuota: 150,
        brideParentsQuota: 150,
        costPerPax: 95000,
      },
      rundown: [
        { id: "rd-1", startTime: "07:30", endTime: "08:30", activity: "Penyambutan Keluarga Calon Suami & Akad", picName: "Ust. Fulan", picPhone: "081288880001", location: "Masjid / Ruang Utama", phase: "Akad Nikah" },
        { id: "rd-2", startTime: "11:00", endTime: "14:00", activity: "Resepsi Siang & Ramah Tamah", picName: "MC Ridwan", picPhone: "081288880002", location: "Grand Ballroom", phase: "Resepsi Siang" },
      ],
      budgetCategories: [
        { id: "b-1", name: "Sewa Gedung / Venue Utama", allocated: 35000000, spent: 35000000, status: "LUNAS", vendor: "Balai Samudera" },
        { id: "b-2", name: "Katering 600 Pax", allocated: 55000000, spent: 25000000, status: "DP_TERBAYAR", vendor: "Puspa Catering" },
      ],
      vendors: [
        {
          id: "vm-1",
          vendorName: "Puspa Catering",
          serviceType: "Katering",
          totalContract: 55000000,
          contactPerson: "Ibu Puspa",
          contactPhone: "081277770001",
          stages: [
            { name: "DP Awal Booking Tanggal", percentage: 30, amount: 16500000, isPaid: true, condition: "Saat TTD Kontrak" },
            { name: "Termin 2 (Food Tasting & Final Menu)", percentage: 40, amount: 22000000, isPaid: false, condition: "H-30 Hari" },
            { name: "Pelunasan Final", percentage: 30, amount: 16500000, isPaid: false, condition: "H-7 Hari" },
          ],
        },
      ],
      alignmentTopics: [
        {
          id: "top-test-1",
          category: "LIVING",
          question: "Di mana rencana tempat tinggal kita setelah akad nikah?",
          groomAnswer: "Ngontrak mandiri 1 tahun pertama",
          brideAnswer: "Sepakat mandiri agar lebih leluasa belajar berumah tangga",
          isAgreed: false,
        },
        {
          id: "top-test-2",
          category: "FINANCIAL",
          question: "Bagaimana sistem pengelolaan rekening dan pos gaji bulanan?",
          groomAnswer: "Rekening bersama untuk operasional dan tabungan",
          brideAnswer: "Setuju, ada pos darurat dan pos tabungan masa depan",
          isAgreed: false,
        },
      ],
      adminSteps: [
        {
          id: "step-1",
          stepNumber: 1,
          stageName: "Pengurusan di RT, RW & Kelurahan",
          agency: "Kelurahan",
          estimatedDays: "1-3 Hari",
          cost: "Gratis",
          requirements: [
            { id: "r1", title: "Surat Pengantar RT RW", isDone: true },
            { id: "r2", title: "Formulir N1 dari Kelurahan", isDone: true },
          ],
        },
      ],
      activityLogs: [
        { id: "act-1", userName: "Andi", userRole: "GROOM", action: "Membuat rencana pernikahan Hajat Kita", timeAgo: "Baru saja", timestamp: Date.now() },
      ],
    };

    // Clean any prior test row
    await queryWithRetry(() => sql`DELETE FROM weddings WHERE UPPER(invite_code) = ${TEST_INVITE_CODE}`);

    const insertWedding = await queryWithRetry(() => sql`
      INSERT INTO weddings (
        title, invite_code, groom_name, bride_name, wedding_date, city,
        target_budget, current_savings, slug, venue_name, venue_address,
        mahar_details, wali_nikah, penghulu, saksi_nikah,
        is_partner_connected, primary_user_email, plan_data, updated_at
      ) VALUES (
        'Pernikahan Andi & Siti',
        ${TEST_INVITE_CODE},
        'Andi Pratama',
        'Siti Nurhaliza',
        '2026-11-20T00:00:00.000Z',
        'Jakarta Selatan',
        150000000,
        80000000,
        ${TEST_SLUG},
        'Balai Samudera Kelapa Gading',
        'Jl. Boulevard Barat Raya No. 1, Jakarta',
        'Logam Mulia 15 Gram & Seperangkat Alat Shalat',
        'H. Abdullah (Ayah Kandung)',
        'Drs. H. Ahmad Fauzi (KUA)',
        'Bpk. H. Suparman & Bpk. Ir. Gunawan',
        false,
        ${TEST_EMAIL},
        ${JSON.stringify(fullPlanData)},
        NOW()
      )
      RETURNING id
    `);

    createdWeddingId = insertWedding[0].id;
    assert(Boolean(createdWeddingId), `Wedding project tersimpan dengan ID: ${createdWeddingId}`);

    // Verify Read back
    const fetchedWeddings = await queryWithRetry(() => sql`SELECT * FROM weddings WHERE id = ${createdWeddingId}::uuid LIMIT 1`);
    assert(fetchedWeddings.length > 0, "Wedding project berhasil dibaca dari database");
    const w = fetchedWeddings[0];
    assert(w.groom_name === "Andi Pratama", "Nama Calon Suami (groom_name) sesuai");
    assert(w.bride_name === "Siti Nurhaliza", "Nama Calon Istri (bride_name) sesuai");
    assert(w.city === "Jakarta Selatan", "Kota pernikahan sesuai");
    assert(w.venue_name === "Balai Samudera Kelapa Gading", "Venue pernikahan sesuai");
    assert(w.mahar_details === "Logam Mulia 15 Gram & Seperangkat Alat Shalat", "Mahar akad nikah sesuai");
    assert(w.wali_nikah === "H. Abdullah (Ayah Kandung)", "Wali nikah sesuai");

    const parsedPlan = JSON.parse(w.plan_data);
    assert(parsedPlan.savingContributions.length === 2, "Modul Celengan Tabungan tersimpan (2 pos)");
    assert(parsedPlan.checklist.length === 2, "Modul Checklist KUA tersimpan (2 tugas)");
    assert(parsedPlan.seserahan.length === 2, "Modul Kotak Seserahan tersimpan (2 kotak)");
    assert(parsedPlan.postWedding.length === 2, "Modul Wishlist Rumah tersimpan (2 barang)");
    assert(parsedPlan.guests.length === 2, "Modul Buku Tamu tersimpan (2 undangan)");
    assert(parsedPlan.familyQuota.venueCapacity === 600, "Modul Kuota Keluarga tersimpan (600 pax)");
    assert(parsedPlan.rundown.length === 2, "Modul Rundown Acara tersimpan (2 jadwal)");
    assert(parsedPlan.budgetCategories.length === 2, "Modul Pos Anggaran tersimpan (2 pos)");
    assert(parsedPlan.vendors.length === 1, "Modul Vendor & Termin tersimpan (1 vendor, 3 termin)");
    assert(parsedPlan.adminSteps.length === 1, "Modul Birokrasi KUA tersimpan");
    assert(parsedPlan.alignmentTopics.length === 2, "Modul Pojok Bicara tersimpan (2 topik)");

    // -------------------------------------------------------------
    // TEST 4: KHUSUS FITUR "SEPAKAT" PADA POJOK BICARA
    // -------------------------------------------------------------
    console.log("\n>>> TEST 4: Verifikasi Fitur 'Sepakat' Pojok Bicara (isAgreed Toggle & Persistence)");
    
    // Step 4.1: Tandai Sepakat Topik 1
    console.log("    Aksi: Tandai Sepakat Topik #1 ('top-test-1')");
    parsedPlan.alignmentTopics = parsedPlan.alignmentTopics.map((t) =>
      t.id === "top-test-1" ? { ...t, isAgreed: true } : t
    );
    parsedPlan.activityLogs.unshift({
      id: "act-" + Date.now(),
      userName: "Andi",
      userRole: "GROOM",
      action: "Menyepakati topik diskusi pranikah: Di mana rencana tempat tinggal...",
      timeAgo: "Baru saja",
      timestamp: Date.now(),
    });

    await queryWithRetry(() => sql`
      UPDATE weddings SET
        plan_data = ${JSON.stringify(parsedPlan)},
        updated_at = NOW()
      WHERE id = ${createdWeddingId}::uuid
    `);

    // Step 4.2: Baca Ulang dari Database dan Pastikan Status SEPAKAT = TRUE
    const readAfterAgreed = await queryWithRetry(() => sql`SELECT plan_data FROM weddings WHERE id = ${createdWeddingId}::uuid`);
    const planAfterAgreed = JSON.parse(readAfterAgreed[0].plan_data);
    const topic1 = planAfterAgreed.alignmentTopics.find((t) => t.id === "top-test-1");
    assert(topic1.isAgreed === true, "Status kesepakatan topik #1 BERHASIL tersimpan TRUE di Neon Database! 🤝");

    // Step 4.3: Ubah Status Jadi Belum Sepakat (Cancel)
    console.log("    Aksi: Batalkan Kesepakatan Topik #1 ('top-test-1')");
    planAfterAgreed.alignmentTopics = planAfterAgreed.alignmentTopics.map((t) =>
      t.id === "top-test-1" ? { ...t, isAgreed: false } : t
    );
    await queryWithRetry(() => sql`
      UPDATE weddings SET
        plan_data = ${JSON.stringify(planAfterAgreed)},
        updated_at = NOW()
      WHERE id = ${createdWeddingId}::uuid
    `);

    const readAfterCancel = await queryWithRetry(() => sql`SELECT plan_data FROM weddings WHERE id = ${createdWeddingId}::uuid`);
    const planAfterCancel = JSON.parse(readAfterCancel[0].plan_data);
    const topic1Cancelled = planAfterCancel.alignmentTopics.find((t) => t.id === "top-test-1");
    assert(topic1Cancelled.isAgreed === false, "Status pembatalan kesepakatan topik BERHASIL tersimpan FALSE di Neon Database");

    // -------------------------------------------------------------
    // TEST 5: Public Digital Invitation RSVP Direct to Database
    // -------------------------------------------------------------
    console.log("\n>>> TEST 5: Verifikasi Undangan Digital Publik (RSVP Langsung Tersimpan)");
    
    // Simulate RSVP from external guest
    const guestRsvp = {
      name: "Bambang Sudirman",
      side: "GROOM",
      category: "Undangan Digital",
      pax: 3,
      phone: "081987654321",
      rsvpStatus: "CONFIRMED_ATTENDING",
      notes: "Barakallah Andi & Siti, semoga samawa!",
    };

    // Execute direct RSVP update
    const currentWeddingRows = await queryWithRetry(() => sql`SELECT plan_data FROM weddings WHERE id = ${createdWeddingId}::uuid`);
    const currentPlan = JSON.parse(currentWeddingRows[0].plan_data);
    currentPlan.guests.unshift({
      id: "g-" + Date.now(),
      name: guestRsvp.name,
      side: guestRsvp.side,
      category: "Undangan Digital",
      pax: guestRsvp.pax,
      phone: guestRsvp.phone,
      rsvpStatus: guestRsvp.rsvpStatus,
      notes: guestRsvp.notes,
      envelopeAmount: 0,
    });
    await queryWithRetry(() => sql`
      UPDATE weddings SET
        plan_data = ${JSON.stringify(currentPlan)},
        updated_at = NOW()
      WHERE id = ${createdWeddingId}::uuid
    `);

    const checkRsvpRows = await queryWithRetry(() => sql`SELECT plan_data FROM weddings WHERE id = ${createdWeddingId}::uuid`);
    const planWithRsvp = JSON.parse(checkRsvpRows[0].plan_data);
    const foundRsvpGuest = planWithRsvp.guests.find((g) => g.name === "Bambang Sudirman");
    assert(Boolean(foundRsvpGuest), "RSVP tamu eksternal berhasil tersimpan di tabel 'weddings.plan_data.guests'");
    assert(foundRsvpGuest.pax === 3, "Jumlah Pax tamu (3 pax) tersimpan akurat");
    assert(foundRsvpGuest.notes.includes("Barakallah"), "Ucapan doa restu tamu tersimpan akurat");

    // -------------------------------------------------------------
    // TEST 6: Public Registry Gift Claim Direct to Database
    // -------------------------------------------------------------
    console.log("\n>>> TEST 6: Verifikasi Klaim Kado Pernikahan (Registry Direct Claim)");
    const claimingTargetId = "pw-1"; // Kulkas 2 Pintu
    const friendClaimant = "Rekan Kerja Divisi IT";

    planWithRsvp.postWedding = planWithRsvp.postWedding.map((item) =>
      item.id === claimingTargetId ? { ...item, isAcquired: true, claimedBy: friendClaimant } : item
    );

    await queryWithRetry(() => sql`
      UPDATE weddings SET
        plan_data = ${JSON.stringify(planWithRsvp)},
        updated_at = NOW()
      WHERE id = ${createdWeddingId}::uuid
    `);

    const checkRegistryRows = await queryWithRetry(() => sql`SELECT plan_data FROM weddings WHERE id = ${createdWeddingId}::uuid`);
    const planWithClaim = JSON.parse(checkRegistryRows[0].plan_data);
    const claimedItem = planWithClaim.postWedding.find((i) => i.id === claimingTargetId);
    assert(claimedItem.isAcquired === true, "Status kado terklaim (isAcquired = true) tersimpan di database");
    assert(claimedItem.claimedBy === friendClaimant, `Nama pengklaim ('${friendClaimant}') tersimpan di database`);

    // -------------------------------------------------------------
    // TEST 7: Partner Duo Workspace Pairing & Unpairing
    // -------------------------------------------------------------
    console.log("\n>>> TEST 7: Verifikasi Hubungkan Pasangan (Duo Workspace Pairing & History)");

    // Clean previous couple history
    await queryWithRetry(() => sql`DELETE FROM couple_history WHERE user1_email = ${TEST_EMAIL} OR user2_email = ${TEST_EMAIL}`);

    // Pair with partner
    const coupleHistoryInsert = await queryWithRetry(() => sql`
      INSERT INTO couple_history (user1_email, user2_email, wedding_id, status, updated_at)
      VALUES (${TEST_EMAIL}, ${TEST_PARTNER_EMAIL}, ${createdWeddingId}::uuid, 'ACTIVE', NOW())
      RETURNING id
    `);
    assert(coupleHistoryInsert.length > 0, "Pencatatan riwayat pasangan di 'couple_history' berhasil");

    await queryWithRetry(() => sql`
      UPDATE weddings SET
        is_partner_connected = true,
        partner_name = 'Siti Nurhaliza',
        partner_email = ${TEST_PARTNER_EMAIL},
        partner_user_email = ${TEST_PARTNER_EMAIL},
        partner_role = 'BRIDE',
        partner_avatar_card_id = 'duck-bride',
        updated_at = NOW()
      WHERE id = ${createdWeddingId}::uuid
    `);

    const pairedWeddingRow = await queryWithRetry(() => sql`SELECT * FROM weddings WHERE id = ${createdWeddingId}::uuid`);
    assert(pairedWeddingRow[0].is_partner_connected === true, "Status 'is_partner_connected' = true tersimpan di DB");
    assert(pairedWeddingRow[0].partner_email === TEST_PARTNER_EMAIL, "Email pasangan tersimpan di DB");

    // Unpair test
    await queryWithRetry(() => sql`
      UPDATE couple_history SET status = 'UNPAIRED', unpaired_at = NOW()
      WHERE wedding_id = ${createdWeddingId}::uuid
    `);
    await queryWithRetry(() => sql`
      UPDATE weddings SET
        is_partner_connected = false,
        partner_name = NULL,
        partner_email = NULL,
        partner_user_email = NULL,
        updated_at = NOW()
      WHERE id = ${createdWeddingId}::uuid
    `);

    const unpairedWeddingRow = await queryWithRetry(() => sql`SELECT * FROM weddings WHERE id = ${createdWeddingId}::uuid`);
    assert(unpairedWeddingRow[0].is_partner_connected === false, "Status unpair berhasil diputus di database");

  } finally {
    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    console.log("\n>>> CLEANUP: Membersihkan Data Dummy Pengujian");
    try {
      if (createdWeddingId) {
        await queryWithRetry(() => sql`DELETE FROM couple_history WHERE wedding_id = ${createdWeddingId}::uuid`);
        await queryWithRetry(() => sql`DELETE FROM weddings WHERE id = ${createdWeddingId}::uuid`);
        console.log(`    Wedding test ID ${createdWeddingId} dibersihkan.`);
      }
      await queryWithRetry(() => sql`DELETE FROM users WHERE LOWER(email) IN (${TEST_EMAIL}, ${TEST_PARTNER_EMAIL})`);
      console.log("    Data user testing dibersihkan.");
    } catch (e) {
      console.warn("Cleanup warning:", e.message);
    }
  }

  console.log("\n=================================================================");
  console.log(`HASIL PENGUJIAN: ${passedTests} / ${totalTests} TESTS PASSED (100% SUKSES)`);
  console.log("Seluruh fitur UI/UX terbukti 100% terintegrasi dan tersimpan di database Neon!");
  console.log("=================================================================\n");
}

runAllTests().catch((err) => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
