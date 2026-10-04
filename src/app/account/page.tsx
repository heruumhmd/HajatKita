"use client";

import React, { useState } from "react";
import { User, Heart, Share2, Copy, Check, ShieldCheck, Calendar, MapPin, Database } from "lucide-react";
import { mockWedding } from "@/lib/mock-data";

export default function AccountPage() {
  const [copied, setCopied] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState("");
  const [weddingDate, setWeddingDate] = useState("2026-12-19");
  const [city, setCity] = useState(mockWedding.city);

  const copyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(mockWedding.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePairing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCodeInput.trim()) return;
    alert(`Kode pasangan ${partnerCodeInput} berhasil divalidasi! Akun Anda kini tersinkron.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <User className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Akun & Duo Workspace Pasangan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Kelola kolaborasi bersama pasangan dan data pernikahan Anda
            </p>
          </div>
        </div>
      </div>

      {/* Partner Connection Card */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-pastel-sm space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-pastel-700">
          <Heart className="w-5 h-5 fill-pastel-500 text-pastel-500" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
            Status Kemitraan Pasangan (Duo Workspace)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 block">
              Calon Suami (Akun Aktif)
            </span>
            <p className="text-sm font-black text-slate-900">{mockWedding.groomName}</p>
            <p className="text-xs text-slate-500">dwiki.ramadhan@gmail.com (Google OAuth)</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
              Calon Istri (Terhubung)
            </span>
            <p className="text-sm font-black text-slate-900">{mockWedding.brideName}</p>
            <p className="text-xs text-slate-500">{mockWedding.partnerInfo?.email}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-pastel-50/70 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-500 font-medium">Kode Undangan Pasangan Anda:</span>
            <p className="text-lg font-mono font-black text-pastel-700">{mockWedding.inviteCode}</p>
          </div>

          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-pastel-100 text-pastel-700 font-bold text-xs border border-sky-200 shadow-xs transition-colors self-start sm:self-center"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Kode Tersalin!" : "Salin Kode"}</span>
          </button>
        </div>

        {/* Input Pair with another code */}
        <form onSubmit={handlePairing} className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Punya Kode Undangan dari Pasangan Lain?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: HAJAT-89X2"
              value={partnerCodeInput}
              onChange={(e) => setPartnerCodeInput(e.target.value)}
              className="flex-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300 uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-pastel-500 hover:bg-pastel-600 text-white text-xs font-bold shadow-pastel-sm"
            >
              Hubungkan
            </button>
          </div>
        </form>
      </div>

      {/* Wedding Project Settings */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-pastel-sm space-y-4">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-800 pb-2 border-b border-slate-100">
          Pengaturan Tanggal & Lokasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-pastel-500" />
              <span>Tanggal Hari H Akad Nikah</span>
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-pastel-500" />
              <span>Kota / Lokasi Acara</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
