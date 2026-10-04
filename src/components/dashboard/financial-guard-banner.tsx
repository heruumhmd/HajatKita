"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, ArrowRight, Home, Sparkles } from "lucide-react";
import Link from "next/link";

export function FinancialGuardBanner() {
  return (
    <div className="bg-gradient-to-r from-sky-50 via-pastel-50 to-white rounded-3xl p-5 border border-sky-200/90 shadow-pastel-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-pastel-700" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">
                Life-After-Wedding Guard (Rasio Sehat 70/30)
              </h4>
              <span className="text-[10px] bg-sky-200 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                Kondisi Aman (68.5%)
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Alokasi pesta pernikahan Anda saat ini terkontrol di bawah batas 70%. Anda telah menyisihkan{" "}
              <strong className="text-pastel-700 font-bold">Rp 37.500.000</strong> khusus untuk kebutuhan awal rumah tangga pasca-nikah (sewa rumah, kasur, alat masak, & dana darurat).
            </p>
          </div>
        </div>

        <Link
          href="/post-wedding"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-pastel-50 text-pastel-700 font-bold text-xs border border-sky-200 transition-colors shadow-xs shrink-0 self-start sm:self-center"
        >
          <Home className="w-3.5 h-3.5 text-pastel-500" />
          <span>Kelola Wishlist Rumah</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
