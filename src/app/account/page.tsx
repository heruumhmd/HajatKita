"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Heart,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  MapPin,
  Database,
  Trash2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  UserX,
  Link2,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { CuteAvatarBadge } from "@/components/profile/cute-card-badge";
import { formatRupiah } from "@/lib/utils";

function AccountPageContent() {
  const searchParams = useSearchParams();
  const joinParam = searchParams.get("join")?.trim().toUpperCase();

  const {
    wedding,
    updateWedding,
    clearAllData,
    currentUser,
    pairWithPartner,
    unpairPartner,
    generateNewInviteCode,
    requireAuth,
  } = useWedding();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState(joinParam || "");
  const [pairingLoading, setPairingLoading] = useState(false);
  const [unpairingLoading, setUnpairingLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states initialized with wedding context
  const [groomName, setGroomName] = useState(wedding.groomName || "");
  const [brideName, setBrideName] = useState(wedding.brideName || "");
  const [weddingDate, setWeddingDate] = useState(
    wedding.weddingDate ? wedding.weddingDate.slice(0, 10) : ""
  );
  const [city, setCity] = useState(wedding.city || "");
  const [venueName, setVenueName] = useState(wedding.venueName || "");
  const [venueAddress, setVenueAddress] = useState(wedding.venueAddress || "");
  const [targetBudget, setTargetBudget] = useState(
    wedding.targetBudget ? String(wedding.targetBudget) : ""
  );
  const [slug, setSlug] = useState(wedding.slug || "");

  useEffect(() => {
    if (joinParam) {
      setPartnerCodeInput(joinParam);
    }
  }, [joinParam]);

  useEffect(() => {
    setGroomName(wedding.groomName || "");
    setBrideName(wedding.brideName || "");
    setWeddingDate(wedding.weddingDate ? wedding.weddingDate.slice(0, 10) : "");
    setCity(wedding.city || "");
    setVenueName(wedding.venueName || "");
    setVenueAddress(wedding.venueAddress || "");
    setTargetBudget(wedding.targetBudget ? String(wedding.targetBudget) : "");
    setSlug(wedding.slug || "");
  }, [wedding]);

  const getOrigin = () => {
    return typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  };

  const getJoinUrl = () => {
    return `${getOrigin()}/account?join=${wedding.inviteCode}`;
  };

  const copyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(wedding.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(getJoinUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(
      `Halo sayang! Yuk gabung ke Wedding Workspace "Hajat Kita" untuk merencanakan pernikahan kita bersama.\n\nKlik tautan ini untuk langsung terhubung:\n${getJoinUrl()}\n\natau gunakan Kode Pasangan: *${wedding.inviteCode}* di menu Akun & Pasangan.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handlePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!partnerCodeInput.trim()) return;

    setPairingLoading(true);
    setFeedbackMessage(null);

    const res = await pairWithPartner(partnerCodeInput.trim());
    setPairingLoading(false);

    if (res.success) {
      setFeedbackMessage({ text: res.message, type: "success" });
      setPartnerCodeInput("");
    } else {
      setFeedbackMessage({ text: res.message, type: "error" });
    }
  };

  const handleUnpair = async () => {
    if (!requireAuth()) return;
    const confirmed = confirm(
      "Apakah Anda yakin ingin membatalkan hubungan dengan pasangan di workspace ini?\n\nPERINGATAN DATA AMAN: Seluruh data rencana bersama Anda TIDAK HILANG dan tetap tersimpan di database. Jika Anda menghubungkan kembali dengan orang yang sama, data akan kembali utuh. Namun jika Anda menghubungkan dengan orang lain yang berbeda, data lama tidak akan dipindahkan."
    );
    if (!confirmed) return;

    setUnpairingLoading(true);
    setFeedbackMessage(null);
    const res = await unpairPartner();
    setUnpairingLoading(false);

    if (res.success) {
      setFeedbackMessage({ text: res.message, type: "success" });
    } else {
      setFeedbackMessage({ text: res.message, type: "error" });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    updateWedding({
      groomName,
      brideName,
      weddingDate: weddingDate ? new Date(weddingDate).toISOString() : "",
      city,
      venueName,
      venueAddress,
      targetBudget: parseFloat(targetBudget) || 0,
      slug: slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") : "",
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearAll = () => {
    if (!requireAuth()) return;
    if (confirm("Apakah Anda yakin ingin mengosongkan semua data? Seluruh data tamu, budget, checklist, dan seserahan akan dihapus bersih.")) {
      clearAllData();
      setGroomName("");
      setBrideName("");
      setWeddingDate("");
      setCity("");
      setVenueName("");
      setVenueAddress("");
      setTargetBudget("");
      setSlug("");
      alert("Semua data berhasil dikosongkan. Anda dapat mulai mengisi dari awal!");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Profil Pernikahan &amp; Sinkronisasi Pasangan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Sinkronisasi real-time antar perangkat, database cloud permanen, dan kolaborasi duo
            </p>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profil pernikahan berhasil diperbarui dan tersimpan permanen di database!</span>
        </div>
      )}

      {/* Feedback Alert for Pairing */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <UserX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* 1. Duo Workspace & Partner Synchronization Card */}
      <div id="tour-account-pair" className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-subtle-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold font-serif">
              Kolaborasi Pasangan (Duo Workspace)
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-center">
            Database Terpusat (Local &amp; Deploy Terhubung)
          </span>
        </div>

        {/* Current Couple Connection State */}
        {wedding.isPartnerConnected && wedding.partnerInfo ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <CuteAvatarBadge cardId={wedding.partnerInfo.avatarCardId || "cat-princess"} size="lg" />
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  Pasangan Terhubung
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 font-serif mt-1 truncate">
                  {wedding.partnerInfo.name}
                </h4>
                <p className="text-xs text-slate-600 truncate">
                  {wedding.partnerInfo.email || "Email tersinkron"} • {wedding.partnerInfo.role === "GROOM" ? "Calon Suami" : "Calon Istri"}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                  ✨ Ruang kerja tersinkronisasi. Semua checklist &amp; tabungan diupdate bersama.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUnpair}
              disabled={unpairingLoading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 shadow-2xs transition-colors self-start sm:self-center shrink-0 w-full sm:w-auto"
            >
              <UserX className="w-4 h-4 text-rose-600" />
              <span>{unpairingLoading ? "Memproses..." : "Batalkan Hubungan"}</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Status Kolaborasi:</strong> Anda belum terhubung dengan pasangan. Bagikan kode atau link undangan di bawah kepada pasangan Anda. Begitu pasangan memasukkan kode ini atau mengklik link dari WhatsApp, rencana Anda berdua akan langsung menyatu!
          </div>
        )}

        {/* Unique Invite Code Showcase Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-pastel-50/70 border border-pastel-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Kode Pasangan Unik Anda:</span>
            <div className="flex items-center gap-2">
              <p className="text-xl sm:text-2xl font-mono font-black text-pastel-800 tracking-wider">
                {wedding.inviteCode}
              </p>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed max-w-md">
              Kirimkan kode unik ini atau langsung bagikan tautan via WhatsApp agar pasangan dapat bergabung tanpa ribet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs transition-colors shrink-0"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? "Tersalin!" : "Salin Kode"}</span>
            </button>

            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs transition-colors shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-pastel-600" />}
              <span>{copiedLink ? "Link Tersalin!" : "Salin Link Gabung"}</span>
            </button>

            <button
              type="button"
              onClick={shareWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim via WA</span>
            </button>
          </div>
        </div>

        {/* Input Pair with another code */}
        <form onSubmit={handlePairing} className="pt-2 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Punya Kode Undangan dari Pasangan?
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Contoh: HAJAT-89X2KP"
              value={partnerCodeInput}
              onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())}
              className="flex-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300 uppercase"
            />
            <button
              type="submit"
              disabled={pairingLoading}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 text-center"
            >
              {pairingLoading ? "Menghubungkan..." : "Sinkronkan Sekarang"}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            💡 <strong>Prinsip Aman Hajat Kita:</strong> Jika Anda pernah terhubung dengan orang yang sama sebelumnya, menghubungkan kembali akan memulihkan data lama tanpa hilang. Namun jika menghubungkan dengan pasangan berbeda, data lama tidak akan dibawa.
          </p>
        </form>
      </div>

      {/* 2. Form Edit Profil Pernikahan */}
      <div id="tour-account-profile" className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-subtle-sm space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-pastel-700">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
            Identitas Calon Mempelai &amp; Acara
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Calon Suami *
              </label>
              <input
                type="text"
                required
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="Contoh: Muhammad Heru"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Calon Istri *
              </label>
              <input
                type="text"
                required
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Contoh: Nurul Fathonah"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Akad / Resepsi *
              </label>
              <input
                type="date"
                required
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kota / Lokasi Acara *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Bandung, Jawa Barat"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Anggaran Total (Rp) *
              </label>
              <input
                type="number"
                required
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="Contoh: 120000000"
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Gedung / Tempat Acara
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Contoh: Grand Ballroom Bandung"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Slug Tautan Dinamis Publik *
              </label>
              <div className="flex flex-col sm:flex-row items-stretch">
                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 border sm:border-r-0 border-slate-200 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl font-mono shrink-0">
                  /invitation/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="heru-nurul"
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-b-xl sm:rounded-b-none sm:rounded-r-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300 min-w-0"
                />
              </div>
            </div>
          </div>

          {/* Links Preview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Pratinjau Tautan Dinamis Anda:
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 truncate max-w-full">
                Undangan Digital: <strong className="font-mono text-pastel-700">/invitation/{slug || "heru-nurul"}</strong>
              </span>
              <a
                href={`/invitation/${slug || "heru-nurul"}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-pastel-700 font-bold hover:underline shrink-0"
              >
                <span>Buka Undangan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 truncate max-w-full">
                Registry Wishlist Kado: <strong className="font-mono text-amber-700">/registry/{slug || "heru-nurul"}</strong>
              </span>
              <a
                href={`/registry/${slug || "heru-nurul"}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-amber-700 font-bold hover:underline shrink-0"
              >
                <span>Buka Registry</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors text-center"
            >
              Simpan Profil Pernikahan
            </button>
          </div>
        </form>
      </div>

      {/* 3. Manajemen Data & Template */}
      <div id="tour-account-data" className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-subtle-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
          <Database className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold font-serif">
            Sinkronisasi Database &amp; Manajemen Data
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Semua data rencana pernikahan Anda tersimpan otomatis di Neon PostgreSQL cloud. Anda dapat mengakses data yang sama dari perangkat mana pun, baik saat testing di <strong>localhost</strong> maupun saat <strong>deploy online</strong>.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition-colors shadow-xs w-full sm:w-auto text-center"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Kosongkan Semua Data Rencana</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-slate-500">Memuat data akun...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}
