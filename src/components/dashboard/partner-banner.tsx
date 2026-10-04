"use client";

import React, { useState } from "react";
import { Copy, Check, Share2, Heart, UserX, Link2 } from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { CuteAvatarBadge } from "@/components/profile/cute-card-badge";
import { getCuteCard } from "@/lib/cute-cards";
import { showToastSuccess, showToastInfo, showConfirmDialog, showSuccessAlert, showErrorAlert } from "@/lib/swal";

export function PartnerBanner() {
  const { wedding, currentUser, unpairPartner, requireAuth, syncNow } = useWedding();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUnpairing, setIsUnpairing] = useState(false);

  const inviteCode = wedding.inviteCode || "HAJAT-89X2";

  const getOrigin = () => {
    return typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  };

  const getJoinUrl = () => {
    return `${getOrigin()}/account?join=${inviteCode}`;
  };

  const copyCodeToClipboard = () => {
    syncNow();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      showToastSuccess("Kode pasangan disalin ke clipboard! 📋");
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const copyLinkToClipboard = () => {
    syncNow();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(getJoinUrl());
      setCopiedLink(true);
      showToastSuccess("Tautan gabung disalin ke clipboard! 🔗");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    syncNow();
    showToastInfo("Membuka WhatsApp untuk berbagi tautan... 💬");
    const groomNick = wedding.groomName ? wedding.groomName.split(" ")[0] : "Saya";
    const brideNick = wedding.brideName ? wedding.brideName.split(" ")[0] : "Pasangan";
    const message = encodeURIComponent(
      `Halo sayang! Yuk gabung ke Wedding Workspace "Hajat Kita" untuk merencanakan pernikahan kita bersama.\n\nKlik tautan undangan ini untuk langsung terhubung:\n${getJoinUrl()}\n\natau masukkan Kode Pasangan: *${inviteCode}* di menu Akun & Pasangan.\n\nBiar nikah kita makin terarah dan bahagia!`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleUnpair = async () => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Batalkan Hubungan Pasangan?",
      text: "Seluruh data bersama Anda TIDAK AKAN HILANG dan tetap tersimpan aman di database Neon. Data akan dipulihkan otomatis jika Anda terhubung kembali dengan orang yang sama.",
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Kembali",
      isDestructive: true,
      icon: "warning",
    });
    if (!isConfirmed) return;

    setIsUnpairing(true);
    const result = await unpairPartner();
    setIsUnpairing(false);

    if (result.success) {
      showSuccessAlert("Berhasil Membatalkan", result.message);
    } else {
      showErrorAlert("Gagal", result.message);
    }
  };

  const effectivePartner = React.useMemo(() => {
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
  }, [wedding.isPartnerConnected, wedding.partnerInfo, wedding.groomName, wedding.brideName, wedding.primaryUserEmail, wedding.partnerUserEmail, currentUser]);

  const userCard = getCuteCard(currentUser?.avatarCardId);
  const partnerCard = getCuteCard(effectivePartner?.avatarCardId || (currentUser?.role === "GROOM" ? "cat-princess" : "cat-prince"));

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-subtle-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Connection Status with Cute Card Badges */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="relative shrink-0 flex items-center -space-x-2">
            <CuteAvatarBadge cardId={currentUser?.avatarCardId || "cat-prince"} size="sm" />
            <div className="w-5 h-5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center z-10 shadow-2xs">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            </div>
            <CuteAvatarBadge
              cardId={effectivePartner?.avatarCardId || (currentUser?.role === "GROOM" ? "cat-princess" : "cat-prince")}
              size="sm"
            />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base font-serif truncate">
                Ruang Kolaborasi Pasangan
              </h3>
              {wedding.isPartnerConnected ? (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  Saling Terhubung
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                  Menunggu Pasangan
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 truncate flex items-center gap-1.5">
              {wedding.isPartnerConnected && effectivePartner ? (
                <>
                  <span className="font-semibold text-slate-700">{currentUser?.name || "Anda"}</span>
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                  <strong className="text-slate-900 font-bold">{effectivePartner.name}</strong>
                  <span className="text-emerald-700 font-medium text-[11px]">(Saling Terhubung)</span>
                </>
              ) : wedding.groomName && wedding.brideName ? (
                <span>
                  Calon Mempelai: <strong className="text-slate-800">{wedding.groomName}</strong> &amp; <strong className="text-slate-800">{wedding.brideName}</strong>
                </span>
              ) : (
                <span className="italic text-slate-400">Bagikan kode atau link untuk menghubungkan pasangan</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Unique Invite Code & Share Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {/* Unique Code Badge */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">Kode:</span>
            <span className="text-xs font-mono font-black text-pastel-700">{inviteCode}</span>
            <button
              type="button"
              onClick={copyCodeToClipboard}
              className="p-1 text-slate-400 hover:text-pastel-600 rounded-md transition-colors"
              title="Salin Kode Undangan"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={copyLinkToClipboard}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors shadow-2xs shrink-0"
            title="Salin Tautan Gabung Pasangan"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? "Link Tersalin!" : "Salin Link"}</span>
          </button>

          {/* Share WhatsApp Button */}
          <button
            type="button"
            onClick={shareWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Kirim via WA</span>
          </button>

          {/* Unpair Button if connected */}
          {wedding.isPartnerConnected && (
            <button
              type="button"
              onClick={handleUnpair}
              disabled={isUnpairing}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors shadow-2xs shrink-0"
              title="Batalkan hubungan pasangan (data tetap aman tersimpan di database)"
            >
              <UserX className="w-3.5 h-3.5 text-rose-500" />
              <span>{isUnpairing ? "Memproses..." : "Batalkan Hubungan"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
