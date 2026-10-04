"use client";

import React, { useState } from "react";
import { Gem, Utensils, Users, AlertTriangle, ShieldCheck, Heart, Sparkles, Edit2, Check } from "lucide-react";
import { useWedding } from "@/context/wedding-context";

export default function CeremonyPage() {
  const { wedding, updateWedding, requireAuth } = useWedding();

  // Ceremony Details edit mode
  const [isEditingCeremony, setIsEditingCeremony] = useState(false);
  const [mahar, setMahar] = useState(wedding.maharDetails || "");
  const [wali, setWali] = useState(wedding.waliNikah || "");
  const [penghulu, setPenghulu] = useState(wedding.penghulu || "");
  const [saksi, setSaksi] = useState(wedding.saksiNikah || "");

  // Catering buffer algorithm state
  const [invitationsCount, setInvitationsCount] = useState(300);
  const [familyRatio, setFamilyRatio] = useState(40);
  const [friendsRatio, setFriendsRatio] = useState(40);
  const [outOfTownRatio, setOutOfTownRatio] = useState(20);

  const headsFromFamily = Math.round((invitationsCount * (familyRatio / 100)) * 1.8);
  const headsFromFriends = Math.round((invitationsCount * (friendsRatio / 100)) * 1.3);
  const headsFromOutOfTown = Math.round((invitationsCount * (outOfTownRatio / 100)) * 0.65);
  const totalEstimatedHeads = headsFromFamily + headsFromFriends + headsFromOutOfTown;

  const recommendedBuffetPax = totalEstimatedHeads;
  const recommendedStallPax = totalEstimatedHeads * 4;

  const handleSaveCeremony = () => {
    if (!requireAuth()) return;
    updateWedding({
      maharDetails: mahar,
      waliNikah: wali,
      penghulu,
      saksiNikah: saksi,
    });
    setIsEditingCeremony(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
            <Gem className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Akad, Resepsi &amp; Kalkulator Porsi Katering
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Detail sakral ijab qabul dan formula katering anti-ludes jam 12 siang
            </p>
          </div>
        </div>
      </div>

      {/* 1. Detail Sakral Akad Nikah Card */}
      <div id="tour-ceremony-form" className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-pastel-700">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Detail Sakral Akad Nikah
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!requireAuth()) return;
              if (isEditingCeremony) {
                handleSaveCeremony();
              } else {
                setIsEditingCeremony(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            {isEditingCeremony ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5 text-slate-600" />}
            <span>{isEditingCeremony ? "Simpan Detail" : "Ubah Rincian"}</span>
          </button>
        </div>

        {isEditingCeremony ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mahar / Mas Kawin</label>
              <input
                type="text"
                value={mahar}
                onChange={(e) => setMahar(e.target.value)}
                placeholder="Contoh: Logam Mulia Antam 10 Gram & Seperangkat Alat Sholat"
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Wali Nikah Sah</label>
              <input
                type="text"
                value={wali}
                onChange={(e) => setWali(e.target.value)}
                placeholder="Contoh: Bpk. H. Rahmat Sudrajat (Ayah Kandung)"
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Penghulu / Petugas KUA</label>
              <input
                type="text"
                value={penghulu}
                onChange={(e) => setPenghulu(e.target.value)}
                placeholder="Contoh: Drs. H. Ahmad Fauzi (KUA Setempat)"
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Saksi Akad Nikah</label>
              <input
                type="text"
                value={saksi}
                onChange={(e) => setSaksi(e.target.value)}
                placeholder="Contoh: Bpk. Ir. Joko & Bpk. Hendra"
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Mahar / Mas Kawin</span>
              <p className="text-sm font-extrabold text-slate-900">
                {wedding.maharDetails || mahar || <span className="text-slate-400 font-normal italic">Belum diisi</span>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Wali Nikah Sah</span>
              <p className="text-sm font-extrabold text-slate-900">
                {wedding.waliNikah || wali || <span className="text-slate-400 font-normal italic">Belum diisi</span>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Penghulu / Petugas KUA</span>
              <p className="text-sm font-extrabold text-slate-900">
                {wedding.penghulu || penghulu || <span className="text-slate-400 font-normal italic">Belum diisi</span>}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">Saksi Akad Nikah</span>
              <p className="text-sm font-extrabold text-slate-900">
                {wedding.saksiNikah || saksi || <span className="text-slate-400 font-normal italic">Belum diisi</span>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Catering Buffer Calculator */}
      <div id="tour-ceremony-catering" className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700">
            <Utensils className="w-5 h-5 text-pastel-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Kalkulator Katering Safety-Buffer (Formula Anti Katering Habis)
            </h2>
            <p className="text-xs text-slate-500">
              Formula khusus Indonesia yang memperhitungkan tamu membawa pasangan (+1), anak, dan supir
            </p>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Jumlah Undangan yang Disebar:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={invitationsCount}
                onChange={(e) => setInvitationsCount(parseInt(e.target.value, 10) || 0)}
                className="w-32 text-lg font-black font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
              <span className="text-xs text-slate-500">Undangan (Fisik / Digital)</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-700">Proporsi Kategori Tamu:</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">Tamu Keluarga (Faktor 1.8x):</span>
                <span className="font-mono text-slate-900">{familyRatio}% ({headsFromFamily} Orang)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={familyRatio}
                onChange={(e) => setFamilyRatio(parseInt(e.target.value, 10))}
                className="w-full accent-pastel-600"
              />

              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">Teman / Rekan Kerja (Faktor 1.3x):</span>
                <span className="font-mono text-slate-900">{friendsRatio}% ({headsFromFriends} Orang)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={friendsRatio}
                onChange={(e) => setFriendsRatio(parseInt(e.target.value, 10))}
                className="w-full accent-pastel-600"
              />

              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">Tamu Luar Kota (Faktor 0.65x):</span>
                <span className="font-mono text-slate-900">{outOfTownRatio}% ({headsFromOutOfTown} Orang)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={outOfTownRatio}
                onChange={(e) => setOutOfTownRatio(parseInt(e.target.value, 10))}
                className="w-full accent-pastel-600"
              />
            </div>
          </div>
        </div>

        {/* Calculation Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-pastel-50 border border-pastel-200">
            <span className="text-xs font-bold text-pastel-900 block mb-1">Total Estimasi Kepala (Heads)</span>
            <span className="text-3xl font-black font-mono text-pastel-800">
              {totalEstimatedHeads} Orang
            </span>
            <p className="text-[11px] text-pastel-700 mt-1">
              Dari {invitationsCount} undangan yang disebar
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-bold text-amber-900 block mb-1">Rekomendasi Menu Prasmanan (Buffet)</span>
            <span className="text-3xl font-black font-mono text-amber-900">
              {recommendedBuffetPax} Porsi
            </span>
            <p className="text-[11px] text-amber-800 mt-1">
              Rasio 100% dari total estimasi kepala
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-900 block mb-1">Rekomendasi Menu Gubukan (Stall)</span>
            <span className="text-3xl font-black font-mono text-emerald-900">
              {recommendedStallPax} Porsi
            </span>
            <p className="text-[11px] text-emerald-800 mt-1">
              Rasio 1 orang = 4 porsi aneka gubukan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
