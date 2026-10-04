"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
import { showToastSuccess, showToastInfo, showConfirmDialog, showSuccessAlert, showErrorAlert } from "@/lib/swal";

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
    syncNow,
    refreshWorkspace,
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

  // Reciprocal partner resolution:
  const effectivePartner = useMemo(() => {
    if (!wedding.isPartnerConnected) return null;
    const raw = wedding.partnerInfo;
    const myEmail = (currentUser?.email || "").toLowerCase().trim();
    const myName = (currentUser?.name || "").toLowerCase().trim();
    const rawEmail = (raw?.email || "").toLowerCase().trim();
    const rawName = (raw?.name || "").toLowerCase().trim();

    const isSelf =
      (rawEmail && myEmail && rawEmail === myEmail) ||
      (rawName && myName && rawName === myName) ||
      (currentUser?.role && raw?.role && currentUser.role === raw.role);

    if (!raw || isSelf) {
      if (currentUser?.role === "GROOM") {
        return {
          name: wedding.brideName || "Calon Istri",
          role: "BRIDE" as const,
          email: wedding.primaryUserEmail || "",
          avatarCardId: "duck-bride",
        };
      } else {
        return {
          name: wedding.groomName || "Calon Suami",
          role: "GROOM" as const,
          email: wedding.partnerUserEmail || "",
          avatarCardId: "penguin-groom",
        };
      }
    }

    return raw;
  }, [
    wedding.isPartnerConnected,
    wedding.partnerInfo,
    wedding.groomName,
    wedding.brideName,
    wedding.primaryUserEmail,
    wedding.partnerUserEmail,
    currentUser,
  ]);

  // Pull latest DB records upon visiting the account page
  useEffect(() => {
    refreshWorkspace();
  }, [refreshWorkspace]);

  useEffect(() => {
    if (joinParam) {
      setPartnerCodeInput(joinParam);
    }
  }, [joinParam]);

  useEffect(() => {
    let effectiveGroom = wedding.groomName || "";
    let effectiveBride = wedding.brideName || "";

    // If groom name is not yet set, adapt from currentUser (if GROOM) or partner (if GROOM)
    if (!effectiveGroom) {
      if (currentUser?.role === "GROOM" && currentUser?.name) {
        effectiveGroom = currentUser.name;
      } else if (effectivePartner?.role === "GROOM" && effectivePartner?.name) {
        effectiveGroom = effectivePartner.name;
      }
    }

    // If bride name is not yet set, adapt from currentUser (if BRIDE) or partner (if BRIDE)
    if (!effectiveBride) {
      if (currentUser?.role === "BRIDE" && currentUser?.name) {
        effectiveBride = currentUser.name;
      } else if (effectivePartner?.role === "BRIDE" && effectivePartner?.name) {
        effectiveBride = effectivePartner.name;
      }
    }

    setGroomName(effectiveGroom);
    setBrideName(effectiveBride);
    setWeddingDate(wedding.weddingDate ? wedding.weddingDate.slice(0, 10) : "");
    setCity(wedding.city || "");
    setVenueName(wedding.venueName || "");
    setVenueAddress(wedding.venueAddress || "");
    setTargetBudget(wedding.targetBudget ? String(wedding.targetBudget) : "");
    setSlug(wedding.slug || "");
  }, [wedding, currentUser, effectivePartner]);

  const getOrigin = () => {
    return typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  };

  const getJoinUrl = () => {
    return `${getOrigin()}/account?join=${wedding.inviteCode}`;
  };

  const copyCode = () => {
    syncNow();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(wedding.inviteCode);
      setCopiedCode(true);
      showToastSuccess("Kode pasangan berhasil disalin! 📋");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyLink = () => {
    syncNow();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(getJoinUrl());
      setCopiedLink(true);
      showToastSuccess("Tautan bergabung berhasil disalin! 🔗");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    syncNow();
    showToastInfo("Membuka WhatsApp untuk berbagi tautan... 💬");
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
      showSuccessAlert("Berhasil Terhubung!", res.message);
    } else {
      setFeedbackMessage({ text: res.message, type: "error" });
      showErrorAlert("Gagal Menghubungkan", res.message);
    }
  };

  const handleUnpair = async () => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Batalkan Hubungan Pasangan?",
      text: "Seluruh data rencana bersama Anda TIDAK HILANG dan tetap tersimpan aman di database Neon. Data akan dipulihkan otomatis jika Anda terhubung kembali dengan orang yang sama.",
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Kembali",
      isDestructive: true,
      icon: "warning",
    });
    if (!isConfirmed) return;

    setUnpairingLoading(true);
    setFeedbackMessage(null);
    const res = await unpairPartner();
    setUnpairingLoading(false);

    if (res.success) {
      setFeedbackMessage({ text: res.message, type: "success" });
      showSuccessAlert("Berhasil Membatalkan", res.message);
    } else {
      setFeedbackMessage({ text: res.message, type: "error" });
      showErrorAlert("Gagal", res.message);
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
    showToastSuccess("Profil pernikahan berhasil disimpan & disinkronkan! 💍");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearAll = async () => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Kosongkan Semua Data?",
      text: "Apakah Anda yakin ingin mengosongkan semua data? Seluruh data tamu, budget, checklist, rundown, dan seserahan akan dihapus bersih.",
      confirmButtonText: "Ya, Kosongkan",
      isDestructive: true,
      icon: "warning",
    });
    if (!isConfirmed) return;

    clearAllData();
    setGroomName("");
    setBrideName("");
    setWeddingDate("");
    setCity("");
    setVenueName("");
    setVenueAddress("");
    setTargetBudget("");
    setSlug("");
    showSuccessAlert("Data Dikosongkan", "Semua data rencana berhasil dikosongkan. Anda dapat mulai mengisi dari awal!");
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

        {/* Linked Couple Header Chip */}
        {wedding.isPartnerConnected && effectivePartner && (
          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-2xs self-start sm:self-center shrink-0">
            <div className="flex -space-x-2 shrink-0">
              <CuteAvatarBadge cardId={currentUser?.avatarCardId || "cat-prince"} size="xs" />
              <CuteAvatarBadge cardId={effectivePartner.avatarCardId || "cat-princess"} size="xs" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 font-serif">
                  {currentUser?.name || "Saya"} &amp; {effectivePartner.name}
                </span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 block">
                Saling Terhubung
              </span>
            </div>
          </div>
        )}
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

      {/* Join Invite Notification if accessed via link */}
      {joinParam && !wedding.isPartnerConnected && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-pastel-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-serif">
                Undangan Bergabung ke Duo Workspace Pasangan
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Kode Undangan: <strong className="font-mono font-black text-pastel-700">{joinParam}</strong> sudah terpasang. Klik tombol untuk langsung terhubung!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePairing}
            disabled={pairingLoading}
            className="px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            {pairingLoading ? "Menghubungkan..." : "Hubungkan Sekarang"}
          </button>
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
        {wedding.isPartnerConnected && effectivePartner ? (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-pastel-50/50 border border-emerald-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 font-serif">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                <span>Akun Saling Terhubung (Duo Workspace Aktif)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-white/90 border border-emerald-200 px-2.5 py-1 rounded-full shadow-2xs self-start sm:self-center">
                Tersinkron Database
              </span>
            </div>

            {/* Couple Visual Cards Bridge */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
              {/* Card 1: User Account */}
              <div className="md:col-span-3 p-3.5 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                <CuteAvatarBadge cardId={currentUser?.avatarCardId || "cat-prince"} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {currentUser?.role === "GROOM" ? "Calon Suami" : "Calon Istri"}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      (Anda)
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-serif truncate mt-0.5">
                    {currentUser?.name || "Saya"}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              {/* Center Connection Icon */}
              <div className="md:col-span-1 flex flex-col items-center justify-center gap-1 py-1">
                <div className="w-9 h-9 rounded-2xl bg-white border border-rose-200 shadow-2xs flex items-center justify-center text-rose-500">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                </div>
                <span className="text-[9px] font-bold text-rose-600">
                  Terhubung
                </span>
              </div>

              {/* Card 2: Partner Account */}
              <div className="md:col-span-3 p-3.5 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                <CuteAvatarBadge cardId={effectivePartner.avatarCardId || "cat-princess"} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      {effectivePartner.role === "GROOM" ? "Calon Suami" : "Calon Istri"}
                    </span>
                    <span className="text-[9px] text-rose-600 font-medium flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" /> Pasangan
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-serif truncate mt-0.5">
                    {effectivePartner.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {effectivePartner.email || "Email tersinkron"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside connected box */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="text-[11px] text-emerald-800 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                <span>Ruang kerja Anda dan pasangan telah menyatu. Semua tabungan, checklist, dan susunan acara saling tersinkron otomatis.</span>
              </p>

              <button
                type="button"
                onClick={handleUnpair}
                disabled={unpairingLoading}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 shadow-2xs transition-colors shrink-0"
              >
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span>{unpairingLoading ? "Memproses..." : "Batalkan Hubungan"}</span>
              </button>
            </div>
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
              <button
                type="button"
                onClick={copyCode}
                className="p-1.5 text-slate-500 hover:text-pastel-700 bg-white/80 hover:bg-white rounded-lg border border-slate-200/80 transition-colors shadow-2xs"
                title="Salin Kode Saja"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed max-w-md">
              Kirimkan tautan via WhatsApp atau salin tautan agar pasangan dapat bergabung tanpa ribet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
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
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-pastel-700">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Identitas Calon Mempelai &amp; Acara
            </h2>
          </div>
          {wedding.isPartnerConnected && (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
              <span>Tersinkron Pasangan</span>
            </span>
          )}
        </div>

        {/* Synced with Partner Banner */}
        {wedding.isPartnerConnected && effectivePartner ? (
          <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-pastel-50/70 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-rose-500 shrink-0 shadow-2xs">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 font-serif">
                    Biodata Terhubung Otomatis dengan {effectivePartner.name}
                  </h4>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white tracking-wide shrink-0">
                    Database Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Data mempelai pria, mempelai wanita, tanggal, anggaran, dan lokasi acara langsung diselaraskan bersama pasangan dari database Neon. Anda tidak perlu mengetik ulang secara manual.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await refreshWorkspace();
                showToastSuccess("Data berhasil disinkronkan dari database! 🔄");
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs shrink-0 self-start sm:self-center"
              title="Perbarui biodata dari database"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sinkronkan Ulang</span>
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Nama Lengkap Calon Suami *
                </label>
                {currentUser?.role === "GROOM" && (
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    (Anda)
                  </span>
                )}
                {wedding.isPartnerConnected && effectivePartner?.role === "GROOM" && (
                  <span className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500 shrink-0" />
                    <span>Pasangan: {effectivePartner.name}</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="Masukkan nama lengkap calon suami"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Nama Lengkap Calon Istri *
                </label>
                {currentUser?.role === "BRIDE" && (
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    (Anda)
                  </span>
                )}
                {wedding.isPartnerConnected && effectivePartner?.role === "BRIDE" && (
                  <span className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500 shrink-0" />
                    <span>Pasangan: {effectivePartner.name}</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Masukkan nama lengkap calon istri"
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
                  placeholder="nama-kamu-dan-pasangan"
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
                Undangan Digital: <strong className="font-mono text-pastel-700">/invitation/{slug || "undangan-kami"}</strong>
              </span>
              <a
                href={`/invitation/${slug || "undangan-kami"}`}
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
                Registry Wishlist Kado: <strong className="font-mono text-amber-700">/registry/{slug || "registry-kami"}</strong>
              </span>
              <a
                href={`/registry/${slug || "registry-kami"}`}
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
