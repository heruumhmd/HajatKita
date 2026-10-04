"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Calendar,
  Wallet,
  ShieldCheck,
  Gift,
  Home,
  Users,
  CheckSquare,
  HelpCircle,
  Eye,
  BookOpen,
  Heart,
  ScrollText,
  HeartHandshake,
  User,
  Clock,
  FileText,
  ShieldAlert,
  Printer,
  Utensils,
  Share2,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { showToastSuccess } from "@/lib/swal";

interface TourStep {
  target: string;
  title: string;
  subtitle: string;
  description: string;
  previewTitle: string;
  previewContent: React.ReactNode;
}

// 1. Dashboard Steps
const dashboardTourSteps: TourStep[] = [
  {
    target: "#tour-countdown",
    title: "Hitung Mundur Hari Bahagia",
    subtitle: "Countdown Real-Time & Detail Mempelai",
    description:
      "Kartu ini akan otomatis menghitung mundur sisa hari, jam, menit, dan detik hingga akad nikah Anda. Begitu Anda mengatur nama dan tanggal pernikahan di menu Akun, kartu ini akan langsung hidup!",
    previewTitle: "Pratinjau Saat Terisi:",
    previewContent: (
      <div className="p-3 bg-gradient-to-r from-amber-50 to-pastel-50 rounded-2xl border border-amber-200/80 text-xs space-y-2">
        <div className="flex items-center justify-between font-serif font-black text-slate-800 text-sm">
          <span>Mempelai &amp; Pasangan</span>
          <span className="text-[10px] font-sans font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
            H-75 Hari
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-center font-mono font-bold text-slate-900">
          <div className="bg-white p-1 rounded-lg border border-slate-200">
            75<span className="text-[9px] block font-sans text-slate-400">Hari</span>
          </div>
          <div className="bg-white p-1 rounded-lg border border-slate-200">
            14<span className="text-[9px] block font-sans text-slate-400">Jam</span>
          </div>
          <div className="bg-white p-1 rounded-lg border border-slate-200">
            32<span className="text-[9px] block font-sans text-slate-400">Mnt</span>
          </div>
          <div className="bg-white p-1 rounded-lg border border-slate-200 text-pastel-700">
            45<span className="text-[9px] block font-sans text-slate-400">Dtk</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    target: "#tour-duo",
    title: "Duo Workspace & Sinkron Pasangan",
    subtitle: "Rencanakan Berdua Secara Real-Time",
    description:
      "Pernikahan adalah hajat berdua. Bagikan Kode Undangan unik Anda ke calon suami/istri lewat WhatsApp agar pasangan Anda dapat membuka dan mengelola rencana yang sama.",
    previewTitle: "Kemampuan Fitur:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Status: Terhubung &amp; Terenkripsi</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Setiap perubahan anggaran, centang checklist KUA, atau penambahan kado langsung muncul di layar pasangan secara instan.
        </p>
      </div>
    ),
  },
  {
    target: "#tour-guard",
    title: "Life-After-Wedding Guard (Rasio 70/30)",
    subtitle: "Formula Keuangan Anti-Boncos Pasca-Nikah",
    description:
      "Kesalahan umum pengantin di Indonesia adalah menghabiskan 100% uangnya untuk pesta 1 hari. Hajat Kita membatasi anggaran resepsi maksimal 70% dan mengamankan minimal 30% untuk kontrakan/rumah dan dana darurat.",
    previewTitle: "Visualisasi Proteksi Rasio 70/30:",
    previewContent: (
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
        <div className="flex items-center justify-between font-bold">
          <span className="text-slate-700">Maks. 70% Pesta Resepsi</span>
          <span className="text-emerald-700 font-bold">Min. 30% Tabungan Rumah</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
          <div className="bg-pastel-600 w-[70%]" title="Pesta 70%" />
          <div className="bg-emerald-500 w-[30%]" title="Masa Depan 30%" />
        </div>
        <p className="text-[10px] text-slate-500 italic">
          Otomatis menghitung berapa nominal aman yang boleh Anda belanjakan untuk vendor.
        </p>
      </div>
    ),
  },
  {
    target: "#tour-savings",
    title: "Diagram Donut Tabungan Bersama",
    subtitle: "Transparansi Porsi Suami & Istri",
    description:
      "Catat setiap setoran tabungan bersama calon suami, calon istri, atau hibah keluarga. Diagram lingkaran akan otomatis menghitung persentase kontribusi dan sisa yang perlu ditabung menuju target.",
    previewTitle: "Pratinjau Saat Terisi:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1.5">
        <div className="flex justify-between font-bold text-slate-800">
          <span>Terkumpul: 68.7%</span>
          <span className="font-mono text-pastel-700">Rp 82.500.000 / Rp 120.000.000</span>
        </div>
        <div className="text-[11px] space-y-1 pt-1">
          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pastel-600" /> Tabungan Suami
            </span>
            <span className="font-mono font-bold">Rp 46.000.000</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pastel-400" /> Tabungan Istri
            </span>
            <span className="font-mono font-bold">Rp 28.500.000</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    target: "#tour-quickstats",
    title: "Katalog Seserahan, Wishlist & Tamu",
    subtitle: "3 Modul Esensial untuk Hari Bahagia",
    description:
      "Tiga kartu ringkasan cepat untuk mengelola: (1) Seserahan per Kotak Hantaran dengan link toko online, (2) Wishlist kado rumah pasca-nikah yang bisa diklaim sahabat, dan (3) Manajemen tamu & buku utang kondangan.",
    previewTitle: "Kemampuan Fitur:",
    previewContent: (
      <ul className="text-xs space-y-1.5 text-slate-600">
        <li className="flex items-center gap-2">
          <Gift className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span><strong>Seserahan:</strong> Catat barang per kotak 1-8 dengan status terbeli.</span>
        </li>
        <li className="flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-pastel-600 shrink-0" />
          <span><strong>Wishlist:</strong> Bagikan link <code>/registry/wishlist-kami</code> ke rekan kantor.</span>
        </li>
        <li className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span><strong>Undangan WA:</strong> Kirim undangan WA yang otomatis punya link RSVP.</span>
        </li>
      </ul>
    ),
  },
  {
    target: "#tour-checklist",
    title: "Checklist Prioritas & Legalitas KUA",
    subtitle: "Panduan Langkah Demi Langkah",
    description:
      "Mulai dari pengurusan N1-N4 di kelurahan, imunisasi TT dan tes lab Puskesmas, sertifikat Elsimil BKKBN, hingga pendaftaran online SIMKAH Kemenag. Centang saat selesai untuk memantau progres kesiapan.",
    previewTitle: "Kemampuan Fitur:",
    previewContent: (
      <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-1">
        <span className="font-bold text-amber-900 block">Checklist Resmi Indonesia:</span>
        <p className="text-[11px] text-amber-800">
          Dilengkapi instruksi berkas apa saja yang wajib dibawa ke kantor KUA dan puskesmas agar tidak bolak-balik.
        </p>
      </div>
    ),
  },
];

// 2. Budget Steps
const budgetTourSteps: TourStep[] = [
  {
    target: "#tour-budget-summary",
    title: "Diagram Target Tabungan Bersama",
    subtitle: "Monitoring Realisasi Dana Terkumpul",
    description:
      "Lihat perbandingan total uang tabungan yang sudah berhasil disisihkan oleh calon suami dan calon istri dibandingkan dengan total target biaya hajat Anda.",
    previewTitle: "Kalkulasi Otomatis:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1">
        <span className="font-bold text-slate-800 block">Status Tabungan Real-Time:</span>
        <p className="text-[11px] text-slate-500">
          Otomatis menampilkan persentase kecukupan dana dan sisa kekurangan yang harus ditabung tiap bulan.
        </p>
      </div>
    ),
  },
  {
    target: "#tour-budget-add",
    title: "Tambah Pos Anggaran Baru",
    subtitle: "Alokasi Rinci per Kategori Kebutuhan",
    description:
      "Tambahkan pos pengeluaran baru seperti Gedung/Venue, Katering Prasmanan, Rias & Kebaya Pengantin, Fotografi & Video, atau Mahar & Cincin Kawin.",
    previewTitle: "Kemampuan Pengaturan:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs space-y-1 text-pastel-900">
        <p className="text-[11px]">
          Tentukan batas pagu (alokasi maksimal) dan catat realisasi pengeluaran sebenarnya untuk mencegah pembengkakan dana.
        </p>
      </div>
    ),
  },
  {
    target: "#tour-budget-categories",
    title: "Tabel Rincian Anggaran & Realisasi",
    subtitle: "Kontrol DP, Termin & Pelunasan Vendor",
    description:
      "Tabel rincian ini membantu Anda memantau status DP yang sudah dibayar, termin berjalan, dan sisa kewajiban pelunasan sebelum hari H tiba.",
    previewTitle: "Manfaat Tabel:",
    previewContent: (
      <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-1 text-emerald-900">
        <span className="font-bold block">Status Realisasi Akurat:</span>
        <p className="text-[11px]">
          Warna indikator otomatis berubah menjadi peringatan jika realisasi belanja Anda melebihi rencana anggaran awal.
        </p>
      </div>
    ),
  },
];

// 3. Timeline Steps
const timelineTourSteps: TourStep[] = [
  {
    target: "#tour-timeline-progress",
    title: "Indikator Kesiapan Persiapan",
    subtitle: "Roadmap Terukur Menuju Hari H",
    description:
      "Indikator ini menghitung persentase tugas persiapan yang sudah rampung, memandu langkah Anda mulai dari H-12 bulan hingga minggu pelaksanaan.",
    previewTitle: "Target Persiapan:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Membantu Anda dan pasangan tetap santai dan tenang karena seluruh tahapan pernikahan terpantau jelas.
      </div>
    ),
  },
  {
    target: "#tour-timeline-add",
    title: "Tambah Tugas & Delegasi PIC",
    subtitle: "Bagi Tugas Bersama Pasangan",
    description:
      "Buat tugas baru dan delegasikan penanggung jawabnya ke Calon Suami, Calon Istri, atau Bersama untuk setiap detail persiapan.",
    previewTitle: "Delegasi Adil:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-900">
        Masing-masing mempelai tahu persis apa tugas yang menjadi tanggung jawab pribadinya minggu ini.
      </div>
    ),
  },
  {
    target: "#tour-timeline-list",
    title: "Daftar Tugas Berdasarkan Periode Waktu",
    subtitle: "Filter H-12, H-6, H-3, H-1 Bulan, hingga Minggu H",
    description:
      "Gunakan tombol filter waktu untuk melihat tugas apa yang harus segera dikerjakan pada bulan ini tanpa pusing melihat daftar panjang sekaligus.",
    previewTitle: "Pengelompokan Waktu:",
    previewContent: (
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
        Tugas-tugas legal KUA, fitting baju, cetak souvenir, dan technical meeting vendor sudah dipetakan pada waktu yang tepat.
      </div>
    ),
  },
];

// 4. Rundown Steps
const rundownTourSteps: TourStep[] = [
  {
    target: "#tour-rundown-filter",
    title: "Filter Sesi Hari-H",
    subtitle: "Kategori Acara Terstruktur",
    description:
      "Pilah jadwal berdasarkan sesi: Akad Nikah, Adat & Sungkeman, Resepsi Siang, atau Resepsi Malam agar koordinasi lapangan lebih rapi.",
    previewTitle: "Pembagian Sesi Acara:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Memudahkan pembawa acara (MC) dan keluarga besar fokus pada satu babak acara tanpa kebingungan.
      </div>
    ),
  },
  {
    target: "#tour-rundown-add",
    title: "Tambah Agenda Jam per Jam",
    subtitle: "Detail Waktu, Lokasi & Nomor PIC",
    description:
      "Atur jam mulai, jam selesai, nama agenda, lokasi spesifik di venue, nama penanggung jawab (PIC), dan nomor telepon darurat.",
    previewTitle: "Ketepatan Jadwal:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-900">
        Setiap panitia keluarga dan Wedding Organizer (WO) memegang nomor kontak darurat pihak yang bertanggung jawab.
      </div>
    ),
  },
  {
    target: "#tour-rundown-items",
    title: "Jadwal Lengkap & Cetak PDF / Print",
    subtitle: "Format Siap Cetak untuk WO & Panitia",
    description:
      "Gunakan tombol 'Cetak Rundown / PDF' untuk mencetak lembar rundown siap pakai yang rapi dan bebas iklan untuk dibagikan kepada keluarga dan vendor.",
    previewTitle: "Output Siap Pakai:",
    previewContent: (
      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
        Tampilan cetak otomatis mengoptimalkan tata letak kertas agar muat dalam lembaran yang mudah dibawa panitia.
      </div>
    ),
  },
];

// 5. Guests Steps
const guestsTourSteps: TourStep[] = [
  {
    target: "#tour-guests-quota",
    title: "Simulasi Kuota 4 Pilar",
    subtitle: "Pembagian Kuota Undangan yang Adil",
    description:
      "Hindari perdebatan jatah undangan dengan membagi kuota secara proporsional antara Calon Suami, Calon Istri, Keluarga Pria, dan Keluarga Wanita.",
    previewTitle: "Proporsi 4 Pilar:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Kapasitas gedung otomatis dipantau agar total perkiraan tamu (Pax) tidak membludak melebihi kapasitas tempat.
      </div>
    ),
  },
  {
    target: "#tour-guests-ledger",
    title: "Buku Amplop & Titipan Hadiah",
    subtitle: "Pencatatan Transparan Pasca-Acara",
    description:
      "Catat setiap nominal amplop tunai, transfer QRIS, atau kado fisik yang diberikan oleh para tamu undangan untuk dokumentasi dan membalas silaturahmi.",
    previewTitle: "Dokumentasi Lengkap:",
    previewContent: (
      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
        Memudahkan pelacakan saat keluarga atau kerabat mengadakan hajatan di masa mendatang.
      </div>
    ),
  },
  {
    target: "#tour-guests-add",
    title: "Tambah Tamu & Generator WhatsApp",
    subtitle: "Kirim Undangan Digital Personal Sekali Klik",
    description:
      "Input nama tamu, kategori (Keluarga, Sahabat, VIP, Kantor), dan klik tombol WhatsApp untuk langsung mengirim pesan undangan personal ber-RSVP.",
    previewTitle: "Format Teks Personal:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-900">
        Teks pesan WhatsApp otomatis memuat nama tamu yang bersangkutan dan tautan ke undangan digital personal Anda.
      </div>
    ),
  },
];

// 6. Ceremony Steps
const ceremonyTourSteps: TourStep[] = [
  {
    target: "#tour-ceremony-form",
    title: "Detail Sakral Akad Nikah",
    subtitle: "Data Hukum & Rukun Pernikahan Sah",
    description:
      "Catat rincian mahar/mas kawin, nama wali nikah sah, nama penghulu KUA yang bertugas, dan para saksi dari kedua belah pihak.",
    previewTitle: "Data Sakral Pernikahan:",
    previewContent: (
      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
        Data ini menjadi acuan juru bicara saat prosesi ijab kabul berlangsung di hadapan penghulu KUA.
      </div>
    ),
  },
  {
    target: "#tour-ceremony-catering",
    title: "Kalkulator Katering Safety-Buffer",
    subtitle: "Formula Anti-Katering Habis Khusus Indonesia",
    description:
      "Formula pintar yang memperhitungkan tamu membawa pasangan (+1), anak, keluarga, dan supir dengan rasio 60% prasmanan (buffet) dan 40% gubukan (stall).",
    previewTitle: "Perhitungan Akurat:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Mencegah situasi memalukan kekurangan makanan saat jam makan siang resepsi berlangsung.
      </div>
    ),
  },
];

// 7. Seserahan Steps
const seserahanTourSteps: TourStep[] = [
  {
    target: "#tour-seserahan-summary",
    title: "Ringkasan Belanja Seserahan",
    subtitle: "Progres Pembelian & Total Anggaran",
    description:
      "Pantau berapa barang hantaran yang sudah terbeli dan berapa realisasi anggaran yang telah dikeluarkan untuk seluruh kotak seserahan.",
    previewTitle: "Kontrol Biaya Hantaran:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Membantu calon pengantin pria dan wanita menyepakati barang hantaran yang benar-benar bermanfaat.
      </div>
    ),
  },
  {
    target: "#tour-seserahan-boxes",
    title: "Navigasi Box 1 sampai Box 8",
    subtitle: "Kategori Barang Tertata Rapi",
    description:
      "Pilah barang per kotak: Perlengkapan Ibadah, Pakaian Kerja/Pesta, Kosmetik/Skincare, Tas & Sepatu, Perhiasan, hingga Kue Tradisional.",
    previewTitle: "Kerapian Kotak:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-900">
        Memudahkan pihak vendor hias seserahan menata kotak mika atau akrilik sesuai tema warna acara.
      </div>
    ),
  },
  {
    target: "#tour-seserahan-add",
    title: "Tambah Barang Hantaran",
    subtitle: "Simpan Link Toko & Catatan Spesifikasi",
    description:
      "Cantumkan nama barang, brand pilihan calon istri, estimasi harga, dan tautan belanja Shopee/Tokopedia agar pasangan tidak salah beli.",
    previewTitle: "Tautan Toko Online:",
    previewContent: (
      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
        Tautan produk bisa dibuka langsung untuk mengecek harga promo dan ketersediaan stok.
      </div>
    ),
  },
];

// 8. Post-Wedding Steps
const postWeddingTourSteps: TourStep[] = [
  {
    target: "#tour-postwedding-guard",
    title: "Kebutuhan Primer Rumah Tangga Baru",
    subtitle: "Fokus Hidup Setelah Pesta 1 Hari Usai",
    description:
      "Daftar perabotan esensial mulai dari kasur tidur, lemari, kulkas, mesin cuci, hingga perlengkapan masak rumah baru.",
    previewTitle: "Proteksi Pasca-Nikah:",
    previewContent: (
      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
        Memastikan kedua mempelai memiliki tempat tinggal yang layak dan nyaman setelah pesta selesai.
      </div>
    ),
  },
  {
    target: "#tour-postwedding-registry",
    title: "Tautan Registry Publik Teman & Kerabat",
    subtitle: "Cegah Kado Dobel dari Sahabat & Rekan Kantor",
    description:
      "Bagikan tautan publik wishlist kado Anda ke grup kantor dan sahabat. Mereka dapat memilih dan mengklaim kado mana yang ingin dihadiahkan.",
    previewTitle: "Sistem Klaim Kado Mandiri:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Kado yang sudah diklaim oleh satu orang otomatis terkunci sehingga Anda tidak akan menerima 3 set blender atau teko yang sama.
      </div>
    ),
  },
  {
    target: "#tour-postwedding-add",
    title: "Tambah Kebutuhan & Prioritas",
    subtitle: "Kategorikan Must Have, Nice to Have, atau Dream Item",
    description:
      "Atur skala prioritas perabot rumah baru agar dana tabungan dialokasikan pertama kali untuk barang-barang yang wajib ada.",
    previewTitle: "Tingkat Urgensi:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-900">
        Membedakan kebutuhan primer (Wajib Ada) dengan kebutuhan sekunder atau pelengkap.
      </div>
    ),
  },
];

// 9. Vendors Steps
const vendorsTourSteps: TourStep[] = [
  {
    target: "#tour-vendors-golden",
    title: "Prinsip Emas Anti-Scam Vendor",
    subtitle: "Aturan Aman Pembayaran Hajat Kita",
    description:
      "Jangan pernah melunasi 100% biaya vendor jauh sebelum hari H. Tahan minimal 20% - 30% yang baru dilunasi pada H+1 setelah pekerjaan terbukti tuntas di lapangan.",
    previewTitle: "Proteksi Konsumen Pernikahan:",
    previewContent: (
      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
        Menghindarkan Anda dari risiko vendor katering tidak datang atau dekorasi belum selesai saat acara dimulai.
      </div>
    ),
  },
  {
    target: "#tour-vendors-add",
    title: "Tambah Kontrak Rekanan Vendor",
    subtitle: "Catat Gedung, Katering, WO, Dekorasi, & Foto",
    description:
      "Input nilai kontrak total dan nomor kontak penanggung jawab vendor untuk memudahkan follow-up berkala.",
    previewTitle: "Dokumentasi Kontrak:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Otomatis memecah pembayaran menjadi 3 termin standar yang aman (DP 20%, Termin 40%, Pelunasan H+1 40%).
      </div>
    ),
  },
  {
    target: "#tour-vendors-list",
    title: "Kelola Tahapan Termin Pembayaran",
    subtitle: "Milestone: DP Booking, Technical Meeting & Pelunasan",
    description:
      "Pantau status tiap termin pembayaran: tandai lunas hanya saat syarat progress terpenuhi (misal food testing disetujui atau busana selesai pas).",
    previewTitle: "Verifikasi Milestone:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-900">
        Setiap termin memiliki syarat checklist kondisi yang harus diverifikasi sebelum uang ditransfer.
      </div>
    ),
  },
];

// 10. Administration Steps
const administrationTourSteps: TourStep[] = [
  {
    target: "#tour-admin-portals",
    title: "Portal Resmi Kementerian Agama & BKKBN",
    subtitle: "Akses SIMKAH 4.0 & Aplikasi Elsimil",
    description:
      "Tautan langsung ke sistem pendaftaran nikah resmi SIMKAH Kemenag RI dan aplikasi Elsimil BKKBN untuk sertifikat layak nikah.",
    previewTitle: "Layanan Pemerintah:",
    previewContent: (
      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
        Daftar nikah online dan bayar PNBP resmi tanpa calo atau perantara liar.
      </div>
    ),
  },
  {
    target: "#tour-admin-steps",
    title: "4 Tahap Birokrasi Resmi KUA",
    subtitle: "Panduan Dokumen Bebas Bolak-Balik",
    description:
      "Mulai dari berkas N1-N4 di tingkat RT/Kelurahan, imunisasi TT puskesmas, pendaftaran nikah KUA, hingga pemeriksaan berkas akhir.",
    previewTitle: "Panduan Berkas Lengkap:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Daftar syarat apa saja yang harus dibawa dan difotokopi agar Anda tidak bolak-balik kantor dinas.
      </div>
    ),
  },
];

// 11. Alignment Steps
const alignmentTourSteps: TourStep[] = [
  {
    target: "#tour-alignment-summary",
    title: "Pojok Bicara: Keselarasan Pranikah",
    subtitle: "Indikator Kesepakatan Bersama",
    description:
      "Memantau berapa topik esensial yang sudah disepakati antara calon suami dan calon istri sebelum mengarungi kehidupan rumah tangga.",
    previewTitle: "Tingkat Keselarasan Visi:",
    previewContent: (
      <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900">
        Membuka ruang diskusi yang sehat untuk topik-topik sensitif yang sering diabaikan sebelum menikah.
      </div>
    ),
  },
  {
    target: "#tour-alignment-add",
    title: "Tambah Topik Diskusi Baru",
    subtitle: "Bahas Finansial, Tempat Tinggal & Hubungan Mertua",
    description:
      "Buat pertanyaan terbuka mengenai pembagian keuangan keluarga, privasi rumah tangga, rencana momongan, atau karier berdua.",
    previewTitle: "Topik Terarah:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Membantu calon pengantin mengenal ekspektasi pasangan secara jujur dan mendalam.
      </div>
    ),
  },
  {
    target: "#tour-alignment-cards",
    title: "Kartu Jawaban Berpasangan",
    subtitle: "Tulis Pandangan Mandiri Lalu Samakan Persepsi",
    description:
      "Calon suami dan calon istri dapat menulis jawabannya masing-masing, kemudian berdiskusi hingga menekan tombol 'Tandai Sepakat'.",
    previewTitle: "Transparansi Persepsi:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-900">
        Menghilangkan asumsi sepihak sehingga pernikahan dimulai dengan visi dan komitmen yang sejalan.
      </div>
    ),
  },
];

// 12. Account Steps
const accountTourSteps: TourStep[] = [
  {
    target: "#tour-account-profile",
    title: "Identitas Mempelai & Acara",
    subtitle: "Lengkapi Nama, Tanggal & Slug Tautan",
    description:
      "Atur nama lengkap kedua mempelai, tanggal sakral pernikahan, venue acara, dan slug URL publik untuk undangan digital Anda.",
    previewTitle: "Pusat Data Pernikahan:",
    previewContent: (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
        Perubahan data di halaman ini otomatis memperbarui seluruh halaman hitung mundur, undangan, dan katalog.
      </div>
    ),
  },
  {
    target: "#tour-account-pair",
    title: "Kolaborasi Pasangan (Duo Workspace)",
    subtitle: "Sinkronisasi Real-Time dengan Calon Pasangan",
    description:
      "Salin kode undangan unik Anda dan kirimkan ke pasangan agar dapat mengakses dan mengedit seluruh rencana pernikahan dari HP atau laptop pasangan.",
    previewTitle: "Kode Sinkronisasi:",
    previewContent: (
      <div className="p-3 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-900">
        Tidak perlu login berulang atau bertukar password akun.
      </div>
    ),
  },
  {
    target: "#tour-account-data",
    title: "Manajemen Data & Cadangan",
    subtitle: "Ekspor & Cadangkan Data Anda",
    description:
      "Unduh file cadangan JSON rencana pernikahan Anda sewaktu-waktu atau reset jika ingin memulai dari lembar bersih.",
    previewTitle: "Keamanan Data:",
    previewContent: (
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
        Data disimpan aman di peramban dan dapat dipulihkan kapan pun melalui impor JSON.
      </div>
    ),
  },
];

export function SpotlightTour() {
  const pathname = usePathname();
  const { isTourOpen, setIsTourOpen } = useWedding();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Determine current active steps based on route
  const getActiveSteps = (): TourStep[] => {
    const cleanPath = (pathname || "").replace(/\/$/, "") || "/";
    switch (cleanPath) {
      case "/budget":
        return budgetTourSteps;
      case "/timeline":
        return timelineTourSteps;
      case "/rundown":
        return rundownTourSteps;
      case "/guests":
        return guestsTourSteps;
      case "/ceremony":
        return ceremonyTourSteps;
      case "/seserahan":
        return seserahanTourSteps;
      case "/post-wedding":
        return postWeddingTourSteps;
      case "/vendors":
        return vendorsTourSteps;
      case "/administration":
        return administrationTourSteps;
      case "/alignment":
        return alignmentTourSteps;
      case "/account":
        return accountTourSteps;
      case "/":
      default:
        return dashboardTourSteps;
    }
  };

  const steps = getActiveSteps();
  const step = steps[currentStepIndex] || steps[0];

  // Reset index when pathname changes or tour opens
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [pathname, isTourOpen]);

  // Update spotlight bounding rect when step changes or window resizes
  useEffect(() => {
    if (!isTourOpen || !step) return;

    const updatePosition = () => {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
        }, 250);
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    const handleScrollResize = () => updatePosition();
    window.addEventListener("resize", handleScrollResize);
    window.addEventListener("scroll", handleScrollResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleScrollResize);
      window.removeEventListener("scroll", handleScrollResize);
    };
  }, [isTourOpen, currentStepIndex, step]);

  if (!isTourOpen || !step) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsTourOpen(false);
    setCurrentStepIndex(0);
    try {
      localStorage.setItem(`HAJAT_TOUR_SEEN_${pathname}`, "true");
      localStorage.setItem(`HAJAT_SPOTLIGHT_TOUR_${pathname}`, "true");
    } catch (e) {
      console.error(e);
    }
    showToastSuccess("Panduan selesai! Selamat merencanakan pernikahan impian 🎉");
  };

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  // Smart placement: if target is in bottom half of screen, popover floats at top; otherwise at bottom
  const isTargetInBottomHalf =
    targetRect && typeof window !== "undefined"
      ? targetRect.top > window.innerHeight / 2
      : false;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* 1. Transparent SVG Mask Overlay: 100% sharp inside the cutout, dimmed outside */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-50">
        <defs>
          <mask id="spotlight-tour-mask">
            {/* White area retains dark overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black area cuts out 100% transparent hole (ZERO BLUR, ZERO OVERLAY) */}
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - 8)}
                y={Math.max(0, targetRect.top - 8)}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="20"
                ry="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.72)"
          mask="url(#spotlight-tour-mask)"
        />
      </svg>

      {/* 2. Golden Ring Glow around Target Element (Zero Blur inside!) */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-3xl transition-all duration-300 ease-out z-50 ring-4 ring-amber-400 ring-offset-2 ring-offset-transparent shadow-[0_0_40px_rgba(245,158,11,0.6)] border-2 border-amber-300/80"
          style={{
            top: Math.max(0, targetRect.top - 8),
            left: Math.max(0, targetRect.left - 8),
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* 3. Floating Explanatory Popover Card (Dynamically positioned opposite target) */}
      <div
        className={`fixed z-50 max-w-lg w-[calc(100%-2rem)] sm:w-full mx-auto pointer-events-auto transition-all duration-300 ${
          isTargetInBottomHalf
            ? "top-4 sm:top-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
            : "bottom-4 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
        }`}
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 via-white to-pastel-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-black text-xs shrink-0">
                {currentStepIndex + 1}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block truncate">
                  Panduan Halaman • Langkah {currentStepIndex + 1} dari {steps.length}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-serif leading-tight truncate">
                  {step.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-2"
              title="Lewati Panduan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
            <p className="text-xs font-semibold text-pastel-700">{step.subtitle}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>

            {/* Visual Preview Box */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                {step.previewTitle}
              </span>
              {step.previewContent}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-2">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all shrink-0 ${
                    idx === currentStepIndex
                      ? "w-6 bg-amber-500"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Ke langkah ${idx + 1}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all"
                >
                  <span>Selesai</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
