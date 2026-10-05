"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User as UserIcon,
  LogOut,
  Check,
  Sparkles,
  ArrowRight,
  Smile,
  FileText,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { CuteCardGallery } from "@/components/profile/cute-card-gallery";
import { getCuteCard, getDefaultCuteCardForRole } from "@/lib/cute-cards";
import { showToastSuccess, showConfirmDialog } from "@/lib/swal";

export function ProfileModal() {
  const {
    currentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateUserProfile,
    logout,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<"BIODATA" | "AVATAR">("BIODATA");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<"GROOM" | "BRIDE">("GROOM");
  const [avatarCardId, setAvatarCardId] = useState<string>("cat-prince");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setNickname(currentUser.nickname || "");
      setPhone(currentUser.phone || "");
      setBio(currentUser.bio || "");
      setRole(currentUser.role === "BRIDE" ? "BRIDE" : "GROOM");
      setAvatarCardId(currentUser.avatarCardId || getDefaultCuteCardForRole(currentUser.role).id);
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const currentCard = getCuteCard(avatarCardId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      nickname,
      phone,
      bio,
      role,
      avatarCardId,
    });
    setSavedSuccess(true);
    showToastSuccess("Profil & karakter avatar berhasil disimpan! ✨");
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 1200);
  };

  const handleLogout = async () => {
    const isConfirmed = await showConfirmDialog({
      title: "Keluar dari Akun?",
      text: "Apakah Anda yakin ingin keluar? Seluruh rencana Anda tetap tersimpan aman di database.",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      isDestructive: false,
      icon: "question",
    });
    if (!isConfirmed) return;
    logout();
    showToastSuccess("Berhasil keluar dari akun");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs shrink-0">
              <UserIcon className="w-5 h-5 text-pastel-700" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-serif leading-tight truncate">
                Profil &amp; Kartu Avatar
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                Kelola identitas mempelai dan pilih karakter maskot lucu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle Bar */}
        <div className="flex items-center px-4 pt-3 pb-2 border-b border-slate-100 bg-slate-50/60 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("BIODATA")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "BIODATA"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Biodata Diri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("AVATAR")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "AVATAR"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Pilih Karakter ({currentCard.emoji})</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profil &amp; kartu avatar berhasil diperbarui!</span>
            </div>
          )}

          {/* TAB 1: BIODATA FORM */}
          {activeTab === "BIODATA" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Active Cute Card Showcase Banner */}
              <div
                onClick={() => setActiveTab("AVATAR")}
                className={`p-3.5 rounded-2xl border-2 ${currentCard.theme.border} ${currentCard.theme.bgGradient} bg-gradient-to-br flex items-center justify-between gap-3 shadow-xs cursor-pointer hover:opacity-95 transition-all`}
                title="Klik untuk memilih karakter avatar lainnya"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl filter drop-shadow-xs shrink-0">{currentCard.emoji}</span>
                  <div className="min-w-0">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${currentCard.theme.badgeBg} ${currentCard.theme.badgeText}`}
                    >
                      {currentCard.roleLabel}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm font-serif mt-0.5 truncate">
                      {currentCard.name}
                    </h4>
                    <p className="text-[10px] text-slate-600 italic leading-snug line-clamp-1">
                      &quot;{currentCard.quote}&quot;
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-pastel-700 bg-white/90 px-2.5 py-1 rounded-xl shadow-2xs shrink-0">
                  <span>Ganti</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Name & Nickname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={role === "GROOM" ? "Nama Lengkap Calon Suami" : "Nama Lengkap Calon Istri"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Panggilan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Panggilan"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran Mempelai</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value as "GROOM" | "BRIDE";
                      setRole(newRole);
                      setAvatarCardId(getDefaultCuteCardForRole(newRole).id);
                    }}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="GROOM">Calon Suami</option>
                    <option value="BRIDE">Calon Istri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biodata / Catatan Singkat</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan impian atau visi pernikahan Anda bersama pasangan..."
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pastel-300 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: AVATAR CARD GALLERY */}
          {activeTab === "AVATAR" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-pastel-50/70 rounded-2xl border border-pastel-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentCard.emoji}</span>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{currentCard.name}</span>
                    <span className="text-[10px] text-slate-500">{currentCard.roleLabel}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateUserProfile({ avatarCardId: avatarCardId });
                    setActiveTab("BIODATA");
                    showToastSuccess(`Karakter ${currentCard.name} dipilih! ${currentCard.emoji}`);
                  }}
                  className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  Gunakan Karakter Ini
                </button>
              </div>

              <CuteCardGallery
                selectedCardId={avatarCardId}
                onSelectCard={(id) => {
                  setAvatarCardId(id);
                  // Immediately commit to context so header updates
                  updateUserProfile({ avatarCardId: id });
                  const c = getCuteCard(id);
                  showToastSuccess(`Karakter ${c.name} dipilih! ${c.emoji}`);
                }}
                userRole={role}
              />
            </div>
          )}

          {/* Responsive Action Buttons Footer */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors order-2 sm:order-1"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Keluar Akun</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors order-1 sm:order-2 w-full sm:w-auto text-center"
            >
              Simpan Profil &amp; Kartu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
