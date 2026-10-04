"use client";

import React, { useState } from "react";
import { Copy, Check, Share2, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { mockWedding } from "@/lib/mock-data";

export function PartnerBanner() {
  const [copied, setCopied] = useState(false);
  const inviteCode = mockWedding.inviteCode;

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(
      `Halo sayang! Yuk gabung ke Wedding Workspace "Hajat Kita" untuk rencana pernikahan kita. Masukkan kode undangan ini: *${inviteCode}* atau buka: https://hajatkita.vercel.app/invite/${inviteCode}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-pastel-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Connection Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pastel-200 to-sky-300 flex items-center justify-center text-pastel-700 shadow-pastel-sm ring-2 ring-white">
              <Heart className="w-6 h-6 fill-pastel-500 text-pastel-500" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                Status Duo: Pasangan Terhubung
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                Sinkron Real-time
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Calon Istri: <strong className="text-slate-700">{mockWedding.brideName}</strong> ({mockWedding.partnerInfo?.email})
            </p>
          </div>
        </div>

        {/* Right Side: Invite Code & Share Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="flex items-center gap-2 bg-pastel-50 border border-sky-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-medium text-slate-500">Kode Pasangan:</span>
            <span className="text-xs font-mono font-bold text-pastel-700">{inviteCode}</span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-1 text-slate-400 hover:text-pastel-600 rounded-md transition-colors"
              title="Salin Kode Undangan"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors shadow-xs active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Kirim via WA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
