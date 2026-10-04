"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  Wallet,
  FileCheck2,
  Users,
  Gift,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Compass,
} from "lucide-react";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleFinish = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem("HAJAT_TUTORIAL_SEEN_V2", "true");
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  const steps = [
    {
      title: "Selamat Datang di Hajat Kita",
      subtitle: "Biar Nikah Lebih Terarah, Tenang, dan Bebas Boncos",
      icon: Heart,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Menyiapkan pernikahan di Indonesia sering kali menguras energi, emosi, dan finansial
            karena banyaknya pihak yang terlibat dan kompleksitas tradisi.
          </p>
          <div className="p-3.5 bg-pastel-50 rounded-2xl border border-sky-100 text-slate-700">
            <strong className="text-pastel-800 block mb-1">Misi Hajat Kita:</strong>
            Membantu calon pengantin mengendalikan anggaran, membagi kuota tamu secara adil, memastikan
            legalitas negara beres tepat waktu, dan menjamin Anda masih punya tabungan yang cukup untuk
            memulai hidup setelah pesta usai.
          </div>
        </div>
      ),
    },
    {
      title: "1. Profil Pernikahan & URL Dinamis",
      subtitle: "Atur identitas acara dan dapatkan link unik untuk tamu",
      icon: Calendar,
      iconColor: "text-pastel-600",
      iconBg: "bg-pastel-50",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Buka menu <strong>Akun & Pasangan</strong> untuk mengatur nama mempelai, tanggal akad,
            lokasi kota/gedung, serta <em>slug tautan unik</em> (contoh: <code>/invitation/kami-berdua</code>).
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>URL Dinamis:</strong> Setiap undangan digital dan wishlist kado otomatis menyesuaikan nama Anda dan pasangan.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Countdown Real-time:</strong> Hitung mundur hari H di dashboard langsung terhubung dengan tanggal yang Anda tetapkan.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "2. Proteksi Finansial 70/30 & Tabungan",
      subtitle: "Pesta nikah selesai 1 hari, kehidupan pernikahan seumur hidup",
      icon: Wallet,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Fitur <strong>Life-After-Wedding Guard</strong> otomatis memantau rasio kesehatan keuangan Anda:
          </p>
          <div className="grid grid-cols-2 gap-2.5 my-2">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Maksimal 70%</span>
              <p className="text-xs text-amber-900 mt-0.5">Alokasi seluruh pesta, katering, gedung, dan busana.</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Minimal 30%</span>
              <p className="text-xs text-emerald-900 mt-0.5">Disimpan utuh untuk kontrakan/rumah, perabotan, dan dana darurat.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Catat setoran tabungan bersama calon suami dan istri untuk melihat diagram kontribusi yang adil dan transparan.
          </p>
        </div>
      ),
    },
    {
      title: "3. Legalitas KUA & Roadmap Timeline",
      subtitle: "Tahapan berkas resmi negara anti-ditolak di hari H",
      icon: FileCheck2,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Menu <strong>Administrasi KUA</strong> dan <strong>Peta Persiapan</strong> memandu Anda melewati 4 etape resmi:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 font-medium text-slate-700">
            <li>Surat pengantar RT/RW dan formulir N1, N2, N4 dari Kelurahan.</li>
            <li>Cek kesehatan laboratorium di Puskesmas & sertifikat Elsimil BKKBN.</li>
            <li>Pendaftaran online SIMKAH Kemenag maksimal H-10 hari kerja.</li>
            <li>Bimbingan Perkawinan (Bimwin) mandiri atau KUA setempat.</li>
          </ol>
        </div>
      ),
    },
    {
      title: "4. Kuota 4 Pilar Tamu & WhatsApp RSVP",
      subtitle: "Formula katering anti-ludes dan undangan digital yang bekerja",
      icon: Users,
      iconColor: "text-pastel-600",
      iconBg: "bg-pastel-50",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Gunakan <strong>Simulasi Kuota 4 Pilar</strong> untuk membagi porsi undangan secara transparan antara Anda, pasangan, orang tua pria, dan orang tua wanita.
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 block mb-0.5">Integrasi WhatsApp & RSVP:</span>
            Klik tombol &quot;Kirim Undangan WhatsApp&quot; untuk langsung membuat pesan undangan sopan dengan tautan konfirmasi kehadiran digital yang terisi otomatis.
          </div>
        </div>
      ),
    },
    {
      title: "5. Seserahan, Registry Kado & Vendor Aman",
      subtitle: "Kelola perlengkapan akad dan hindari penipuan vendor",
      icon: ShieldCheck,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Gift className="w-4 h-4 text-pastel-600 shrink-0 mt-0.5" />
              <span><strong>Katalog Seserahan:</strong> Catat barang per kotak (box ibadah, kosmetik, busana) dan status pembeliannya.</span>
            </li>
            <li className="flex items-start gap-2">
              <Compass className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Wishlist Kado Pasca-Nikah:</strong> Bagikan link <code>/registry/[slug]</code> ke teman kantor agar mereka bisa patungan kado yang benar-benar Anda butuhkan.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span><strong>Proteksi Termin Vendor:</strong> Terapkan sistem pembayaran bertahap (DP, Termin 2, Pelunasan H+1 setelah kerjaan tuntas) untuk memitigasi risiko WO kabur.</span>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];
  const StepIcon = current.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with decorative badge */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pastel-50 via-white to-amber-50/30">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${current.iconBg} flex items-center justify-center ${current.iconColor} shadow-xs`}>
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-700 bg-white px-2 py-0.5 rounded-full border border-sky-100">
                Langkah {currentStep + 1} dari {steps.length}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800 font-serif leading-tight mt-1">
                {current.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <p className="text-xs font-semibold text-pastel-700 uppercase tracking-wide">
            {current.subtitle}
          </p>
          {current.content}
        </div>

        {/* Footer with Step Dots & Navigation */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-6 bg-pastel-600"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Ke langkah ${idx + 1}`}
                />
              ))}
            </div>

            {/* Nav Buttons */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-pastel-sm transition-all"
                >
                  <span>Mulai Sekarang</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-pastel-sm transition-all"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Don't show again toggle */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded text-pastel-600 focus:ring-pastel-300 cursor-pointer"
            />
            <label htmlFor="dontShowAgain" className="text-[11px] text-slate-500 cursor-pointer select-none">
              Jangan buka otomatis panduan ini lagi saat memulai aplikasi
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
