"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  Gift,
  Users,
  Calendar,
  Lock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { CuteAvatarBadge } from "@/components/profile/cute-card-badge";

export function ThreeDScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(10);
  const [rotateY, setRotateY] = useState<number>(-6);
  const [scale, setScale] = useState<number>(0.96);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate visibility progress: 0 when entering from bottom, 0.5 in middle, 1.0 when exiting top
      const progress = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height))
      );

      setScrollProgress(progress);

      // Interpolate 3D tilt dynamically along scroll
      // As user scrolls, the card transitions from tilted backward (3D entrance) to straight, then forward
      const targetRotateX = (0.5 - progress) * 22; // from ~+11deg to -11deg
      const targetRotateY = (progress - 0.5) * -12;
      const targetScale = 0.94 + Math.sin(progress * Math.PI) * 0.06;

      if (!isHovered) {
        setRotateX(targetRotateX);
        setRotateY(targetRotateY);
        setScale(targetScale);
      }
    };

    const onScrollThrottled = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScrollThrottled, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScrollThrottled);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered]);

  // Interactive mouse tilt on desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsHovered(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mouseXRatio = (x - centerX) / centerX;
    const mouseYRatio = (y - centerY) / centerY;

    // Subtle responsive tilt
    setRotateX(-mouseYRatio * 14);
    setRotateY(mouseXRatio * 16);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-5xl mx-auto py-8 sm:py-12 px-2 sm:px-4 select-none"
      style={{ perspective: "1200px" }}
    >
      {/* Background Spatial Glow Orbs */}
      <div
        className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-pastel-400/20 blur-3xl pointer-events-none transition-transform duration-700"
        style={{
          transform: `translate(${scrollProgress * 40}px, ${scrollProgress * 20}px)`,
        }}
      />
      <div
        className="absolute -bottom-16 -right-12 w-80 h-80 rounded-full bg-gold-400/20 blur-3xl pointer-events-none transition-transform duration-700"
        style={{
          transform: `translate(${-scrollProgress * 40}px, ${-scrollProgress * 20}px)`,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-400/10 blur-3xl pointer-events-none"
      />

      {/* Main 3D Stage Container */}
      <div
        className="relative rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-b from-white/95 via-white/90 to-slate-50/95 border border-white/80 shadow-2xl backdrop-blur-xl p-4 sm:p-7 md:p-9 transition-transform duration-300 ease-out will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          boxShadow: `
            0 25px 60px -15px rgba(29, 80, 162, 0.18),
            0 12px 28px -8px rgba(15, 23, 42, 0.10),
            0 0 0 1px rgba(255, 255, 255, 0.9) inset
          `,
        }}
      >
        {/* Top Header of Simulated Workspace */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-100"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pastel-600 to-pastel-400 flex items-center justify-center text-white shadow-md shadow-pastel-500/25">
              <Heart className="w-6 h-6 fill-white stroke-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-full border border-pastel-200">
                  Live Workspace
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Cloud Terhubung
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-slate-900 font-serif tracking-tight mt-0.5">
                Rencana Bahagia: Rian &amp; Nadia
              </h3>
            </div>
          </div>

          {/* Couple Reciprocal Status */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="flex -space-x-2">
              <CuteAvatarBadge cardId="cat-prince" size="xs" />
              <CuteAvatarBadge cardId="cat-princess" size="xs" />
            </div>
            <div className="text-left text-[11px]">
              <span className="font-bold text-slate-800 block">Duo Terhubung</span>
              <span className="text-slate-500 text-[10px]">Sesi Aktif Bersama</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Simulation */}
        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 mt-5 sm:mt-6"
          style={{ transform: "translateZ(20px)" }}
        >
          {/* Left Column: Countdown & Financial Guard */}
          <div className="md:col-span-7 space-y-4">
            {/* Countdown Banner */}
            <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-pastel-50 via-white to-amber-50/50 border border-pastel-200/70 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-700">
                  Countdown Hari-H
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                  124 Hari <span className="text-xs font-normal text-slate-500">lagi</span>
                </div>
                <p className="text-[11px] text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-pastel-600" />
                  Sabtu, 20 Juni 2026 • Grand Ballroom Al-Jabbar
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-pastel-200 shadow-xs flex flex-col items-center justify-center text-pastel-700">
                <span className="text-[10px] font-bold text-slate-400">FASE</span>
                <span className="text-sm font-black text-pastel-700 font-mono">H-4</span>
              </div>
            </div>

            {/* Financial Guard 70/30 Card */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-serif">
                      Financial Guard 70/30 Terproteksi
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">
                      30% dana darurat aman untuk modal sewa rumah pasca-nikah
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Aman Seimbang
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">Plafon Resepsi (Maks. 70%)</span>
                  <span className="text-emerald-700 font-mono">Rp 59.500.000 / Rp 85.000.000</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-pastel-500 to-pastel-600 rounded-l-full"
                    style={{ width: "70%" }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-r-full"
                    style={{ width: "30%" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>70% Resepsi Pesta</span>
                  <span className="text-emerald-700 font-semibold">30% Tabungan Pasca-Nikah (Terkunci)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mini Checklist & Live Audit Preview */}
          <div className="md:col-span-5 space-y-4">
            {/* Checklist Preview */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-serif">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pastel-600" />
                  Ceklis KUA &amp; Persiapan
                </span>
                <span className="text-[10px] font-bold text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-full">
                  5/7 Siap
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50/80">
                  <span className="text-emerald-500 text-sm">✓</span>
                  <span className="line-through text-slate-400 text-[11px]">
                    Surat Pengantar RT/RW &amp; N1 Kelurahan
                  </span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50/80">
                  <span className="text-emerald-500 text-sm">✓</span>
                  <span className="line-through text-slate-400 text-[11px]">
                    Sertifikat Imunisasi TT Puskesmas
                  </span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50/80 border border-amber-200/60">
                  <span className="text-amber-500 text-sm font-bold">●</span>
                  <span className="font-semibold text-amber-950 text-[11px]">
                    Finalisasi Fitting Busana &amp; MUA
                  </span>
                </div>
              </div>
            </div>

            {/* Live Audit Log Preview */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-700/80 pb-1.5">
                <span className="font-bold uppercase tracking-wider text-pastel-300">
                  Live Audit Trail
                </span>
                <span>Baru Saja</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-300 truncate">
                    <strong className="text-white">Nadia (Istri)</strong> membayar DP Catering termin 1
                  </span>
                  <span className="text-emerald-400 font-mono shrink-0 font-bold">
                    +Rp 15.000.000
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2 text-slate-400 text-[10px]">
                  <span>
                    <strong className="text-slate-300">Rian (Suami)</strong> menyepakati topik pranikah
                  </span>
                  <span className="text-pastel-300 font-medium">✓ Sepakat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating 3D Depth Badges (Z-Space popped out) */}
        {/* Floating Badge 1: Savings */}
        <div
          className="hidden sm:flex absolute -top-5 -left-4 sm:-left-6 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md text-slate-900"
          style={{
            transform: "translateZ(65px)",
            boxShadow: "0 18px 35px -5px rgba(29, 80, 162, 0.20)",
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
            <Wallet className="w-4 h-4 text-gold-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Tabungan Terkumpul
            </div>
            <div className="text-xs font-black text-slate-900 font-mono">
              Rp 68.500.000 <span className="text-emerald-600 text-[10px] font-bold">(80.5%)</span>
            </div>
          </div>
        </div>

        {/* Floating Badge 2: Quota 4 Pihak */}
        <div
          className="hidden sm:flex absolute -bottom-5 -right-3 sm:-right-5 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md text-slate-900"
          style={{
            transform: "translateZ(75px)",
            boxShadow: "0 20px 40px -8px rgba(15, 23, 42, 0.22)",
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700">
            <Users className="w-4 h-4 text-pastel-700" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Kuota Tamu 4 Pihak
            </div>
            <div className="text-xs font-black text-slate-900 font-serif">
              500 Pax Adil &amp; Transparan
            </div>
          </div>
        </div>

        {/* Floating Badge 3: 100% Bebas AI Slop & Spesifik Budaya Indonesia */}
        <div
          className="hidden md:flex absolute top-1/2 -right-8 -translate-y-1/2 items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg text-[11px] font-bold"
          style={{
            transform: "translateZ(85px) rotate(3deg)",
            boxShadow: "0 12px 24px -4px rgba(217, 119, 6, 0.35)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Khas Tradisi &amp; KUA Indonesia</span>
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <div className="mt-4 text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-white/80 px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-pastel-500 animate-pulse" />
          Gerakkan kursor atau gulir halaman untuk melihat efek spatial 3D
        </span>
      </div>
    </div>
  );
}
