"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Compass,
  ChevronDown,
  HelpCircle,
  Gem,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";
import { ThreeDScrollShowcase } from "@/components/account/three-d-scroll-showcase";
import { InteractiveTestimonials } from "@/components/account/interactive-testimonials";

interface FullLandingPageProps {
  onEnterWorkspace: () => void;
  onOpenAuthModal: () => void;
  partnerCodeInput?: string;
  setPartnerCodeInput?: (code: string) => void;
  onPairWithPartner?: (e: React.FormEvent) => void;
  pairingLoading?: boolean;
}

export function FullLandingPage({
  onEnterWorkspace,
  onOpenAuthModal,
  partnerCodeInput = "",
  setPartnerCodeInput,
  onPairWithPartner,
  pairingLoading = false,
}: FullLandingPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [localCode, setLocalCode] = useState(partnerCodeInput);

  const handleCodeChange = (val: string) => {
    setLocalCode(val.toUpperCase());
    if (setPartnerCodeInput) {
      setPartnerCodeInput(val.toUpperCase());
    }
  };

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onPairWithPartner) {
      onPairWithPartner(e);
    } else {
      onOpenAuthModal();
    }
  };

  const pillars = [
    {
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      title: "Financial Guard 70/30",
      desc: "Menjaga batas tegas: maksimal 70% untuk pesta resepsi, 30% wajib dikunci untuk biaya kontrakan/rumah pertama dan dana darurat berdua.",
      href: "/budget",
      label: "Buka Budget & Guard",
    },
    {
      icon: Users,
      color: "text-pastel-700 bg-pastel-50 border-pastel-200",
      title: "Kuota Tamu 4 Pihak",
      desc: "Membagi kuota undangan secara adil dan transparan antara Pihak Pria, Pihak Wanita, Orang Tua Pria, dan Orang Tua Wanita untuk mencegah over-invite.",
      href: "/guests",
      label: "Buka Kuota & Tamu",
    },
    {
      icon: FileCheck2,
      color: "text-gold-700 bg-gold-50 border-gold-200",
      title: "Checklist KUA Lengkap",
      desc: "Panduan runut berkas nikah resmi Indonesia: surat pengantar RT/RW, N1 kelurahan, imunisasi TT puskesmas, hingga Simkah online.",
      href: "/administration",
      label: "Buka Panduan KUA",
    },
    {
      icon: Gift,
      color: "text-rose-700 bg-rose-50 border-rose-200",
      title: "Katalog Seserahan & Wishlist",
      desc: "Atur belanja per box hantaran seserahan agar tidak tercecer, serta bagikan daftar kado impian agar tamu tidak memberi barang kembar.",
      href: "/seserahan",
      label: "Buka Box Seserahan",
    },
    {
      icon: Activity,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      title: "Live Audit Trail Terbuka",
      desc: "Transparansi penuh: setiap input mutasi uang, perubahan status checklist, dan bayar termin vendor terekam otomatis beserta nama pelaku.",
      href: "/activity",
      label: "Buka Riwayat Audit",
    },
    {
      icon: Wallet,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      title: "Proteksi Termin Vendor",
      desc: "Kawal setiap kontrak vendor dari DP, termin progres, hingga pelunasan H-H agar hak dan kewajiban pengantin terjaga aman.",
      href: "/vendors",
      label: "Buka Proteksi Vendor",
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
      q: "Bisakah kami mencoba fitur aplikasi ini langsung tanpa login?",
      a: "Tentu! Anda bisa langsung klik tombol 'Lihat Fitur / Masuk Workspace' di atas untuk masuk langsung ke aplikasi dan mencoba simulasi secara lokal di peramban Anda sebelum menghubungkan akun Google.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-900 flex flex-col selection:bg-pastel-100 selection:text-pastel-900">
      {/* 1. Custom Standalone Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pastel-600 to-pastel-500 flex items-center justify-center text-white shadow-md shadow-pastel-500/25 shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white stroke-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-slate-900 text-lg sm:text-2xl tracking-tight">
                  HajatKita
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-full border border-pastel-200 hidden sm:inline-block">
                  Wedding Planner
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden xs:block">
                Biar Nikah Lebih Terarah
              </p>
            </div>
          </div>

          {/* Quick Jump Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#fitur" className="hover:text-pastel-700 transition-colors">
              Fitur Utama
            </a>
            <a href="#testimoni" className="hover:text-pastel-700 transition-colors">
              Kisah Pengantin
            </a>
            <a href="#kode-pasangan" className="hover:text-pastel-700 transition-colors">
              Kode Pasangan
            </a>
            <a href="#faq" className="hover:text-pastel-700 transition-colors">
              Tanya Jawab
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onEnterWorkspace}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-subtle-sm transition-all hover:border-pastel-400"
            >
              <LayoutDashboard className="w-4 h-4 text-pastel-600" />
              <span>Lihat Fitur &amp; Demo</span>
            </button>

            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-pastel-600 to-pastel-700 hover:from-pastel-700 hover:to-pastel-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-pastel-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Masuk Akun</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="relative pt-10 sm:pt-16 pb-6 px-4 text-center max-w-5xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 via-white to-pastel-50 border border-amber-200/90 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin-slow" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-serif">
              Platform Wedding Planner Kolaboratif No. 1 di Indonesia
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 font-serif tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Biar Hari-H Terarah, Hidup Berdua Pasca-Nikah Tetap{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pastel-600 via-pastel-500 to-amber-600">
              Tenang &amp; Berkah.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
            Bukan sekadar spreadsheet biasa. HajatKita menghubungkan dua insan, dua keluarga besar, dan
            tabungan bersama dengan proteksi finansial 70/30, ceklis KUA lengkap, dan sinkronisasi cloud
            real-time.
          </p>

          {/* Primary Action Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-pastel-600 to-pastel-700 hover:from-pastel-700 hover:to-pastel-800 text-white font-black text-sm sm:text-base shadow-lg shadow-pastel-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              <span>Mulai Rencana Berdua (Gratis)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onEnterWorkspace}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-pastel-400 text-slate-800 font-bold text-sm sm:text-base shadow-subtle-sm transition-all"
            >
              <Compass className="w-5 h-5 text-pastel-600" />
              <span>Lihat Seluruh Fitur (Buka Workspace)</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% Gratis Tanpa Langganan
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Database Cloud PostgreSQL Terenkripsi
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sesuai Budaya &amp; Administrasi KUA Indonesia
            </span>
          </div>
        </section>

        {/* 3. Interactive 3D Scroll Showcase */}
        <section className="px-3 sm:px-6">
          <ThreeDScrollShowcase />
        </section>

        {/* 4. The 6 Pillars of Indonesian Wedding Planning */}
        <section id="fitur" className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Kearifan Budaya &amp; Realitas Finansial Indonesia</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif tracking-tight">
              Dirancang Khusus Menjawab Masalah Nyata Pengantin Indonesia
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pernikahan di Indonesia bukan sekadar urusan dua orang, melainkan menyatukan dua keluarga besar, adat istiadat, dan kesiapan finansial jangka panjang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-subtle-sm hover:border-pastel-300 transition-all subtle-hover flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-2xs ${pillar.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 font-serif">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <Link
                      href={pillar.href}
                      onClick={onEnterWorkspace}
                      className="inline-flex items-center gap-1 text-xs font-bold text-pastel-700 hover:text-pastel-900 transition-colors"
                    >
                      <span>{pillar.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. 3D Testimonials from Indonesian Couples */}
        <section id="testimoni" className="max-w-6xl mx-auto px-4 sm:px-6">
          <InteractiveTestimonials />
        </section>

        {/* 6. Partner Quick Code Pairing Section */}
        <section id="kode-pasangan" className="py-10 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-pastel-50 via-white to-amber-50/60 p-7 sm:p-10 border border-pastel-200/80 shadow-subtle-md text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pastel-100 border border-pastel-300 flex items-center justify-center text-pastel-700 mx-auto shadow-2xs">
              <Link2 className="w-6 h-6 text-pastel-700" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              Sudah Diberi Kode oleh Pasangan Anda?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Masukkan kode undangan unik (misal: <code className="font-mono text-pastel-700 font-bold">HAJAT-ABC123</code>) untuk langsung masuk ke workspace pernikahan yang sama.
            </p>

            <form onSubmit={handlePairSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
              <input
                type="text"
                value={localCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Contoh: HAJAT-ABC123"
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 font-mono font-bold text-center sm:text-left text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-pastel-500 shadow-xs"
                maxLength={15}
              />
              <button
                type="submit"
                disabled={pairingLoading || !localCode.trim()}
                className="px-6 py-3 rounded-2xl bg-pastel-600 hover:bg-pastel-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0 flex items-center justify-center gap-2"
              >
                {pairingLoading ? "Menghubungkan..." : "Hubungkan Sekarang"}
              </button>
            </form>
          </div>
        </section>

        {/* 7. FAQ Section */}
        <section id="faq" className="py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pastel-700 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-pastel-600" />
              <span>Tanya Jawab Seputar HajatKita</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Pertanyaan yang Sering Diajukan
            </h3>
          </div>

          <div className="space-y-3 pt-2">
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
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-pastel-700 transition-colors"
                  >
                    <span className="font-serif">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-pastel-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. Bottom Final Callout */}
        <section className="py-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-r from-pastel-700 via-pastel-800 to-slate-900 text-white p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                Langkah Pertama Menuju Hari Bahagia
              </span>
              <h3 className="text-2xl sm:text-4xl font-black font-serif leading-tight">
                Mulai Rencanakan Hari Bahagia Bersama Pasangan Sekarang
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                Bergabunglah dengan ribuan calon pengantin di Indonesia yang merencanakan pernikahan secara
                matang, transparan, dan tenang.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-pastel-600" />
                <span>Masuk Akun Google</span>
              </button>

              <button
                type="button"
                onClick={onEnterWorkspace}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-pastel-800/80 hover:bg-pastel-800 border border-pastel-400/40 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-300" />
                <span>Buka Workspace Sekarang</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Standalone Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-serif font-bold text-slate-800 text-sm">
          <span>HajatKita</span>
          <span>•</span>
          <span className="font-sans font-normal text-slate-500 text-xs">Platform Wedding Planner Indonesia</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Dibuat dengan penuh cinta untuk calon mempelai di seluruh penjuru nusantara.
        </p>
      </footer>
    </div>
  );
}
