"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log client error to console
    console.error("HajatKita Caught Client Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xl shadow-rose-500/5 text-center">
        {/* Cute & reassuring icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-rose-100 to-amber-100 flex items-center justify-center text-rose-500 shadow-inner">
          <AlertCircle className="w-8 h-8 text-rose-500 stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Data Perencanaan Anda Aman
        </span>

        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
          Ups, Terjadi Sedikit Kendala
        </h2>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Tampilan mengalami gangguan sesaat. Seluruh data acara Anda tetap tersimpan dengan aman di perangkat. Silakan coba muat ulang komponen.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pastel-600 to-pastel-700 text-white font-bold text-sm shadow-md shadow-pastel-500/20 hover:brightness-105 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </button>
        </div>

        {/* Technical details toggle */}
        <div className="pt-4 border-t border-slate-100 text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-800 py-1 transition-colors"
          >
            <span>Informasi Diagnostik</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-[11px] text-slate-600 break-words max-h-36 overflow-y-auto">
              <p className="font-semibold text-rose-600 mb-1">{error.name}: {error.message}</p>
              {error.digest && <p className="text-slate-500 text-[10px]">Digest: {error.digest}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
