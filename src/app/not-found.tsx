import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, HeartHandshake } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 mx-auto">
          <HeartHandshake className="w-8 h-8 text-pastel-600" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Halaman Tidak Ditemukan
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-3 font-serif">
            404 • Tautan Belum Terdaftar
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Halaman rencana pernikahan yang Anda tuju tidak ditemukan atau alamat tautan telah diubah.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda Rencana</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
