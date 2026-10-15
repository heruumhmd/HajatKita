"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("HajatKita Root Global Crash:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans antialiased text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
            <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
            Pemulihan Sistem HajatKita
          </h1>

          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Terjadi masalah pada modul utama aplikasi. Jangan khawatir, data tersimpan Anda tetap aman di perangkat.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Aplikasi
            </button>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
            >
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
