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
