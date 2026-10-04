"use client";

import React, { useState } from "react";
import { Gem, Utensils, Users, AlertTriangle, ShieldCheck, Heart, Sparkles } from "lucide-react";

export default function CeremonyPage() {
  const [invitationsCount, setInvitationsCount] = useState(300);
  const [familyRatio, setFamilyRatio] = useState(40); // 40% keluarga
  const [friendsRatio, setFriendsRatio] = useState(40); // 40% rekan/sahabat
  const [outOfTownRatio, setOutOfTownRatio] = useState(20); // 20% luar kota

  // Calculation formula
  // Tamu keluarga bawa pasangan + anak = 1.8x
  // Teman kantor = 1.3x
  // Luar kota = 0.65x
  const headsFromFamily = Math.round((invitationsCount * (familyRatio / 100)) * 1.8);
  const headsFromFriends = Math.round((invitationsCount * (friendsRatio / 100)) * 1.3);
  const headsFromOutOfTown = Math.round((invitationsCount * (outOfTownRatio / 100)) * 0.65);
  const totalEstimatedHeads = headsFromFamily + headsFromFriends + headsFromOutOfTown;

  // Indonesian Golden Ratios
  const recommendedBuffetPax = totalEstimatedHeads;
  const recommendedStallPax = totalEstimatedHeads * 4; // 1 orang = 4 porsi gubukan

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Gem className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Akad, Resepsi & Kalkulator Porsi Katering
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Detail sakral ijab qabul dan formula katering anti-ludes jam 12 siang
            </p>
          </div>
        </div>
      </div>

      {/* 1. Detail Sakral Akad Nikah Card */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-pastel-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-pastel-700">
          <Heart className="w-5 h-5 fill-pastel-500 text-pastel-500" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
            Detail Sakral Akad Nikah
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-pastel-50/70 border border-sky-100">
            <span className="text-xs text-slate-500 font-medium block mb-1">Mahar / Mas Kawin</span>
            <p className="text-sm font-extrabold text-slate-800">Logam Mulia Antam 10 Gram</p>
            <span className="text-[11px] text-pastel-600 font-semibold">+ Uang Tunai Rp 1.912.026</span>
          </div>

          <div className="p-4 rounded-2xl bg-pastel-50/70 border border-sky-100">
            <span className="text-xs text-slate-500 font-medium block mb-1">Wali Nikah Sah</span>
            <p className="text-sm font-extrabold text-slate-800">Bpk. H. Rahmat Sudrajat</p>
            <span className="text-[11px] text-slate-500">(Ayah Kandung Pengantin Wanita)</span>
          </div>

          <div className="p-4 rounded-2xl bg-pastel-50/70 border border-sky-100">
            <span className="text-xs text-slate-500 font-medium block mb-1">Penghulu / Petugas KUA</span>
            <p className="text-sm font-extrabold text-slate-800">Drs. H. Ahmad Fauzi, M.Ag</p>
            <span className="text-[11px] text-slate-500">KUA Kecamatan Coblong</span>
          </div>
        </div>
      </div>

      {/* 2. Indonesian Catering Buffer Algorithm (Killer Feature) */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-pastel-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-pastel-100 flex items-center justify-center text-pastel-600">
            <Utensils className="w-5 h-5 text-pastel-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
              Kalkulator Katering Safety-Buffer (Anti Katering Habis)
            </h2>
            <p className="text-xs text-slate-500">
              Formula khusus Indonesia yang memperhitungkan tamu bawa pasangan (+1), anak, dan supir
            </p>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-3xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Jumlah Undangan yang Disebar:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={invitationsCount}
                onChange={(e) => setInvitationsCount(parseInt(e.target.value, 10) || 0)}
                className="w-32 text-sm font-black bg-white border border-slate-300 rounded-xl px-3 py-2 text-pastel-700 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
              <span className="text-xs text-slate-500">Undangan Fisik / Digital</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              1 undangan keluarga di Indonesia rata-rata dihadiri 1.8 orang.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Estimasi Komposisi Tamu:
            </span>
            <div className="text-xs text-slate-600 space-y-1">
              <p>• Tamu Keluarga ({familyRatio}%): Multiplier 1.8x bawa rombongan</p>
              <p>• Teman Kantor / Sahabat ({friendsRatio}%): Multiplier 1.3x</p>
              <p>• Tamu Luar Kota ({outOfTownRatio}%): Potensi hadir 65%</p>
            </div>
          </div>
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
            <span className="text-xs text-sky-700 font-bold block mb-1">
              Perkiraan Kepala Tamu Riil
            </span>
            <p className="text-2xl font-black text-sky-900">{totalEstimatedHeads} Orang</p>
            <span className="text-[11px] text-sky-600">Total mulut yang harus dijamu</span>
          </div>

          <div className="p-4 rounded-2xl bg-pastel-100 border border-pastel-300">
            <span className="text-xs text-pastel-800 font-bold block mb-1">
              Rekomendasi Porsi Buffet
            </span>
            <p className="text-2xl font-black text-pastel-900">{recommendedBuffetPax} Porsi</p>
            <span className="text-[11px] text-pastel-700">Rasio 100% dari perkiraan kepala</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-800 font-bold block mb-1">
              Rekomendasi Porsi Gubukan (Stall)
            </span>
            <p className="text-2xl font-black text-emerald-900">{recommendedStallPax.toLocaleString("id-ID")} Porsi</p>
            <span className="text-[11px] text-emerald-700">Rasio emas 1 : 4 (aman s/d selesai)</span>
          </div>
        </div>

        {/* Safety Warning */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <strong>Indikator Katering Aman:</strong> Dengan alokasi <strong>{recommendedBuffetPax} porsi buffet</strong> dan <strong>{recommendedStallPax.toLocaleString("id-ID")} porsi gubukan</strong>, risiko makanan habis sebelum jam 12:30 siang berada pada batas aman <strong>98%</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
