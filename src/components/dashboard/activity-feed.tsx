"use client";

import React from "react";
import { Activity, Clock, Heart, CheckCircle2, Wallet, Gift, Home } from "lucide-react";
import { mockActivityLogs } from "@/lib/mock-data";

export function ActivityFeed() {
  const getActionIcon = (actionText: string) => {
    if (actionText.includes("tabungan") || actionText.includes("menyetor")) {
      return <Wallet className="w-3.5 h-3.5 text-sky-500" />;
    }
    if (actionText.includes("Seserahan")) {
      return <Gift className="w-3.5 h-3.5 text-rose-500" />;
    }
    if (actionText.includes("mencentang") || actionText.includes("selesai")) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
    return <Home className="w-3.5 h-3.5 text-indigo-500" />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-sky-100/90 shadow-pastel-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pastel-100 flex items-center justify-center text-pastel-600">
            <Activity className="w-4 h-4 text-pastel-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Aktivitas Pasangan</h3>
            <p className="text-[11px] text-slate-500">Transparansi persiapan bersama calon pengantin</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-full border border-sky-100">
          Live Feed
        </span>
      </div>

      <div className="space-y-3">
        {mockActivityLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-pastel-50/40 transition-colors border border-slate-100"
          >
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
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
        ))}
      </div>
    </div>
  );
}
