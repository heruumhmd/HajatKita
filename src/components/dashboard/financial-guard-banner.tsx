"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, ArrowRight, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useWedding } from "@/context/wedding-context";
import { formatRupiah } from "@/lib/utils";

export function FinancialGuardBanner() {
  const { wedding } = useWedding();

  const targetBudget = wedding.targetBudget || 0;
  const currentSavings = wedding.currentSavings || 0;

  // 70% wedding max, 30% post-wedding life safety
  const recommendedPostWeddingFund = Math.round(targetBudget * 0.3);
  const weddingPortionRatio = targetBudget > 0 ? Math.min(100, Math.round((currentSavings / targetBudget) * 100)) : 0;
  const isHealthy = targetBudget === 0 ? true : weddingPortionRatio <= 75;

  return (
    <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-5 border border-slate-200/90 shadow-subtle-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
            {isHealthy ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <ShieldAlert className="w-5 h-5 text-amber-600" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 font-serif">
                Life-After-Wedding Guard (Rasio 70/30)
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isHealthy
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {targetBudget === 0 ? "Panduan Finansial" : isHealthy ? "Proteksi Sehat" : "Perlu Penyesuaian"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {targetBudget > 0 ? (
                <>
                  Prinsip Hajat Kita: Alokasi resepsi dibatasi maksimal 70% agar Anda memiliki cadangan minimal{" "}
                  <strong className="text-slate-800 font-bold font-mono">
                    {formatRupiah(recommendedPostWeddingFund)} (30%)
                  </strong>{" "}
                  untuk menyewa tempat tinggal, membeli perabot primer, dan dana darurat berdua setelah akad usai.
                </>
              ) : (
                <>
                  Prinsip Hajat Kita: Alokasi resepsi dibatasi maksimal 70% modal agar Anda memiliki cadangan minimal 30% untuk menyewa tempat tinggal, membeli perabot primer, dan dana darurat setelah akad usai. Tentukan target anggaran di Akun &amp; Profil.
                </>
              )}
            </p>

            {/* Dynamic Dual-Arc SVG Gauge */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-100/90 mt-2">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Outer Track (70% Resepsi) */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#1D50A2"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - 0.70)}
                    strokeLinecap="round"
                  />
                  {/* Inner Track (30% Pasca-Nikah) */}
                  <circle cx="50" cy="50" r="26" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="26"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 * (1 - 0.30)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-800 font-mono">70/30</span>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-pastel-600 shrink-0" />
                    Plafon Pesta Resepsi (Maks. 70%)
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {targetBudget > 0 ? formatRupiah(Math.round(targetBudget * 0.7)) : "70% Target"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-semibold truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    Dana Terkunci Pasca-Nikah (Min. 30%)
                  </span>
                  <span className="font-mono font-bold text-emerald-700 shrink-0">
                    {targetBudget > 0 ? formatRupiah(recommendedPostWeddingFund) : "30% Target"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/post-wedding"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs shrink-0 self-stretch sm:self-auto w-full sm:w-auto transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-pastel-600" />
          <span>Wishlist Kebutuhan Rumah</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
