"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Sparkles,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { CuteCardGallery } from "@/components/profile/cute-card-gallery";
import { CuteCardItem } from "@/components/profile/cute-card-badge";
import { getCuteCard, getDefaultCuteCardForRole } from "@/lib/cute-cards";
import { showToastSuccess, showToastInfo } from "@/lib/swal";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, loginWithGoogle } = useWedding();

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"GROOM" | "BRIDE">("GROOM");
  const [bio, setBio] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string>("cat-prince");

  if (!isAuthModalOpen) return null;

  const handleRoleChange = (newRole: "GROOM" | "BRIDE") => {
    setRole(newRole);
    setSelectedCardId(getDefaultCuteCardForRole(newRole).id);
  };

  const handleGoogleLogin = () => {
    showToastInfo("Mengarahkan ke Google Sign-In...");
    loginWithGoogle();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    login({
      name: fullName,
      nickname: nickname || fullName.split(" ")[0],
      email,
      phone,
      role,
      bio,
      avatarCardId: selectedCardId,
      provider: "credentials",
    });
    showToastSuccess("Berhasil masuk! Selamat datang di Hajat Kita 🎉");
  };

  const currentCard = getCuteCard(selectedCardId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/60 via-white to-pastel-50/60">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs shrink-0">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-pastel-700" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-pastel-700 bg-white px-2 py-0.5 rounded-full border border-sky-100">
                Akses Terproteksi
              </span>
              <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 font-serif leading-tight mt-0.5 truncate">
                Masuk ke Hajat Kita
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Masuk dengan akun Google agar rencana anggaran, checklist KUA, seserahan, dan link kolaborasi pasangan tersimpan aman di database serta tersinkron antara local dan deploy.
          </p>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-subtle-sm transition-all flex items-center justify-center gap-2.5 active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="truncate">Masuk Cepat dengan Google</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <span className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Atau Masuk Mandiri
            </span>
            <span className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Manual Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Anda *
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Panggilan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama panggilan"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peran Mempelai *
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as "GROOM" | "BRIDE")}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                >
                  <option value="GROOM">Calon Pengantin Pria</option>
                  <option value="BRIDE">Calon Pengantin Wanita</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                placeholder="nama@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp (Opsional)
              </label>
              <input
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            {/* Cute Card Avatar Selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Kartu Avatar Lucu Anda:
              </label>

              {/* Selected Card Highlight */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-3xl">{currentCard.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-extrabold text-xs text-slate-900 truncate">
                        {currentCard.name}
                      </h5>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${currentCard.theme.badgeBg} ${currentCard.theme.badgeText}`}>
                        {currentCard.roleLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {currentCard.personality}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cute Gallery */}
              <CuteCardGallery
                selectedCardId={selectedCardId}
                onSelectCard={(id) => setSelectedCardId(id)}
                userRole={role}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors mt-2"
            >
              Simpan Profil &amp; Buka Rencana
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
