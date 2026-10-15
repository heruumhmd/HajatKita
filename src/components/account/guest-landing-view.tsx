"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Users,
  CheckCircle2,
  Wallet,
  Gift,
  FileCheck2,
  Activity,
  LogIn,
  ArrowRight,
  Link2,
  Lock,
  ChevronDown,
  Layers,
  HelpCircle,
  Clock,
  Compass,
} from "lucide-react";
import { ThreeDScrollShowcase } from "./three-d-scroll-showcase";
import { InteractiveTestimonials } from "./interactive-testimonials";

interface GuestLandingViewProps {
  onOpenAuthModal: () => void;
  onSwitchToLocalMode: () => void;
  partnerCodeInput: string;
  setPartnerCodeInput: (code: string) => void;
  onPairWithPartner: (e: React.FormEvent) => void;
  pairingLoading: boolean;
  inviteCode?: string;
  isLoggedIn?: boolean;
  userName?: string;
}

export function GuestLandingView({
  onOpenAuthModal,
  onSwitchToLocalMode,
  partnerCodeInput,
  setPartnerCodeInput,
  onPairWithPartner,
  pairingLoading,
  isLoggedIn = false,
  userName,
}: GuestLandingViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const pillars = [
    {
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      title: "Financial Guard 70/30",
      desc: "Menjaga batas tegas: maksimal 70% untuk pesta resepsi, 30% wajib dikunci untuk biaya kontrakan/rumah pertama dan dana darurat berdua.",
    },
    {
      icon: Users,
      color: "text-pastel-700 bg-pastel-50 border-pastel-200",
      title: "Kuota Tamu 4 Pihak",
      desc: "Membagi kuota undangan secara adil dan transparan antara Pihak Pria, Pihak Wanita, Orang Tua Pria, dan Orang Tua Wanita untuk mencegah over-invite.",
    },
    {
      icon: FileCheck2,
      color: "text-gold-700 bg-gold-50 border-gold-200",
      title: "Checklist KUA Lengkap",
      desc: "Panduan runut berkas nikah resmi Indonesia: surat pengantar RT/RW, N1 kelurahan, imunisasi TT puskesmas, hingga Simkah online.",
    },
    {
      icon: Gift,
      color: "text-rose-700 bg-rose-50 border-rose-200",
      title: "Katalog Seserahan & Wishlist",
      desc: "Atur belanja per box hantaran seserahan agar tidak tercecer, serta bagikan daftar kado impian agar tamu tidak memberi barang kembar.",
    },
    {
      icon: Activity,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      title: "Live Audit Trail Terbuka",
      desc: "Transparansi penuh: setiap input mutasi uang, perubahan status checklist, dan bayar termin vendor terekam otomatis beserta nama pelaku.",
    },
    {
      icon: Wallet,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      title: "Proteksi Termin Vendor",
      desc: "Kawal setiap kontrak vendor dari DP, termin progres, hingga pelunasan H-H agar hak dan kewajiban pengantin terjaga aman.",
    },
  ];

  const faqs = [
    {
      q: "Apakah HajatKita benar-benar gratis digunakan?",
      a: "Ya, 100% gratis! Semua fitur mulai dari kalkulator kuota tamu, checklist KUA, pengelolaan pos anggaran, hingga sinkronisasi cloud real-time bersama pasangan dapat digunakan tanpa biaya langganan.",
    },
    {
      q: "Bagaimana cara kerja sinkronisasi bersama pasangan?",
      a: "Cukup masuk dengan akun Google masing-masing. Salah satu pihak membagikan Kode Pasangan unik (contoh: HAJAT-XXXX), lalu pasangan tinggal memasukkan kode tersebut di menu Akun & Pasangan. Seluruh data langsung tersinkronkan otomatis.",
    },
    {
      q: "Apakah data rencana pernikahan kami aman dan privat?",
      a: "Sangat aman. Data Anda disimpan di infrastruktur database PostgreSQL Neon yang terenkripsi dan terlindungi otentikasi ketat. Hanya Anda dan pasangan yang telah terhubung yang memiliki akses ke workspace pernikahan Anda.",
    },
    {
      q: "Apa bedanya HajatKita dengan spreadsheet biasa (Excel / Google Sheets)?",
      a: "Spreadsheet rawan terhapus, sulit dibuka di HP saat meeting dengan vendor, dan tidak punya aturan spesifik pernikahan Indonesia seperti Financial Guard 70/30, kalkulator kuota 4 pihak, ceklis N1-N4 KUA, katalog box seserahan, dan notifikasi audit mutual.",
    },
    {
      q: "Bisakah kami mencoba aplikasi ini dulu tanpa login?",
      a: "Tentu! Anda bisa langsung klik tombol 'Coba Mode Offline / Tamu' di bawah ini untuk melihat dan mencoba mengisi rencana secara lokal di peramban Anda sebelum memutuskan untuk menghubungkan akun Google.",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 max-w-5xl mx-auto pb-16">
      {/* Logged in notification banner */}
      {isLoggedIn && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-white to-pastel-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Halo, <strong className="text-emerald-800">{userName || "Pengguna"}</strong>! Anda sedang membuka Showcase &amp; Testimoni HajatKita.
            </span>
          </div>
          <button
            type="button"
            onClick={onSwitchToLocalMode}
            className="px-3.5 py-1.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            Ke Pengaturan Akun →
          </button>
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="text-center pt-4 sm:pt-8 space-y-5 px-3">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 via-white to-pastel-50 border border-amber-200/90 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-serif">
            Platform Wedding Planner Kolaboratif Indonesia
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-serif tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Biar Hari-H Terarah, Hidup Berdua Pasca-Nikah Tetap{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pastel-600 via-pastel-500 to-amber-600">
            Tenang &amp; Berkah.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Bukan sekadar spreadsheet biasa. HajatKita menghubungkan dua insan, dua keluarga besar, dan
          tabungan bersama dengan proteksi finansial 70/30, ceklis KUA lengkap, dan sinkronisasi cloud
          real-time.
        </p>

        {/* Main CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pastel-600 to-pastel-700 hover:from-pastel-700 hover:to-pastel-800 text-white font-black text-xs sm:text-sm shadow-md shadow-pastel-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            <span>Mulai Rencana Berdua (Gratis)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onSwitchToLocalMode}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-subtle-sm transition-all"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Coba Mode Offline / Tamu</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Gratis Selamanya
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Database Cloud Neon Terenkripsi
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Bebas Iklan Mengganggu
          </span>
        </div>
      </section>

      {/* 2. Interactive 3D Scroll Showcase */}
      <section className="relative">
        <ThreeDScrollShowcase />
      </section>

      {/* 3. Partner Pairing Card (Langsung Input Kode Undangan) */}
      <section className="rounded-3xl bg-gradient-to-br from-pastel-50/80 via-white to-amber-50/60 p-6 sm:p-8 border border-pastel-200/80 shadow-subtle-md">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-pastel-100 border border-pastel-300 flex items-center justify-center text-pastel-700 mx-auto shadow-2xs">
            <Link2 className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 font-serif">
              Sudah Diberi Kode oleh Pasangan Anda?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Masukkan kode undangan unik (misal: <code className="font-mono text-pastel-700 font-bold">HAJAT-ABC123</code>) untuk langsung masuk ke workspace pernikahan yang sama.
            </p>
          </div>

          <form onSubmit={onPairWithPartner} className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
            <input
              type="text"
              value={partnerCodeInput}
              onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())}
              placeholder="Contoh: HAJAT-ABC123"
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 font-mono font-bold text-center sm:text-left text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-pastel-500 shadow-xs"
              maxLength={15}
            />
            <button
              type="submit"
              disabled={pairingLoading || !partnerCodeInput.trim()}
              className="px-6 py-3 rounded-2xl bg-pastel-600 hover:bg-pastel-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0 flex items-center justify-center gap-2"
            >
              {pairingLoading ? "Menghubungkan..." : "Hubungkan Sekarang"}
            </button>
          </form>
        </div>
      </section>

      {/* 4. 6 Pillars: Kenapa HajatKita, Bukan AI Slop Biasa */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Kearifan Budaya &amp; Realitas Finansial Indonesia</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-serif tracking-tight">
            Dirancang Khusus Menjawab Masalah Nyata Pengantin Indonesia
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pernikahan di Indonesia bukan sekadar urusan dua orang, melainkan menyatukan dua keluarga besar, adat istiadat, dan kesiapan finansial jangka panjang.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-subtle-sm hover:border-pastel-300 transition-all subtle-hover flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-2xs ${pillar.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 font-serif">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Interactive Testimonials with 3D Tilt */}
      <InteractiveTestimonials />

      {/* 6. FAQ Section */}
      <section className="rounded-3xl bg-slate-50/80 border border-slate-200/90 p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pastel-700 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-pastel-600" />
            <span>Tanya Jawab Seputar HajatKita</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
            Pertanyaan yang Sering Diajukan
          </h3>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-pastel-700 transition-colors"
                >
                  <span className="font-serif">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-pastel-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Final Callout */}
      <section className="rounded-3xl bg-gradient-to-r from-pastel-600 via-pastel-700 to-slate-900 text-white p-7 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
            Mulai Hari Ini
          </span>
          <h3 className="text-xl sm:text-3xl font-black font-serif leading-tight">
            Wujudkan Hari Bahagia Tanpa Beban Finansial
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Bergabunglah dengan ribuan calon pengantin di Indonesia yang merencanakan pernikahan secara
            matang, transparan, dan tenang.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-pastel-600" />
            <span>Masuk dengan Google</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToLocalMode}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-pastel-800/60 hover:bg-pastel-800 border border-pastel-400/30 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Lanjut Mode Tamu</span>
          </button>
        </div>
      </section>
    </div>
  );
}
