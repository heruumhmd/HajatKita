"use client";

import React from "react";
import { Activity, Clock, Heart, CheckCircle2, Wallet, Gift, Home, Sparkles } from "lucide-react";
import { useWedding } from "@/context/wedding-context";

export function ActivityFeed() {
  const { activityLogs } = useWedding();

  const getActionIcon = (actionText: string) => {
    if (actionText.includes("tabungan") || actionText.includes("menyetor") || actionText.includes("setoran")) {
      return <Wallet className="w-3.5 h-3.5 text-pastel-600" />;
    }
    if (actionText.includes("seserahan") || actionText.includes("Seserahan")) {
      return <Gift className="w-3.5 h-3.5 text-rose-500" />;
    }
    if (actionText.includes("selesai") || actionText.includes("tugas") || actionText.includes("tamu")) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (actionText.includes("kado") || actionText.includes("wishlist")) {
      return <Home className="w-3.5 h-3.5 text-amber-600" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-pastel-500" />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700">
            <Activity className="w-4 h-4 text-pastel-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
              Aktivitas Pasangan
            </h3>
            <p className="text-[11px] text-slate-500">
              Transparansi persiapan bersama calon pengantin
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Live Feed
        </span>
      </div>

      <div className="space-y-3">
        {activityLogs.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Belum Ada Riwayat Aktivitas</p>
            <p className="text-[11px]">
              Setiap kali Anda atau pasangan memperbarui tabungan, checklist, atau kado, riwayat perubahan akan otomatis tercatat di sini.
            </p>
          </div>
        ) : (
          activityLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/60 transition-colors border border-slate-100"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                {getActionIcon(log.action)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-800 leading-snug">
                  <strong className="font-bold text-slate-900">{log.userName}</strong>{" "}
                  <span className="text-slate-600">{log.action}</span>
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  {log.timeAgo}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
