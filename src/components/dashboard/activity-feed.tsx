"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Clock,
  CheckCircle2,
  Wallet,
  Gift,
  Home,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Edit3,
  Trash2,
  LogIn,
  LogOut,
  CreditCard,
  Users,
  ShieldCheck,
  User,
  HeartHandshake,
  FileCheck2,
} from "lucide-react";
import { useWedding, autoDetectTypeAndModule } from "@/context/wedding-context";
import { formatExactDateTime, formatRelativeTime } from "@/lib/utils";
import { ActivityActionType, ActivityModule } from "@/types";

export function ActivityFeed() {
  const { activityLogs } = useWedding();

  const getActionBadge = (actionType?: ActivityActionType) => {
    switch (actionType) {
      case "CREATE":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <PlusCircle className="w-2.5 h-2.5 text-emerald-600" />
            Tambah
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            <Edit3 className="w-2.5 h-2.5 text-amber-600" />
            Ubah
          </span>
        );
      case "DELETE":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
            <Trash2 className="w-2.5 h-2.5 text-rose-600" />
            Hapus
          </span>
        );
      case "LOGIN":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
            <LogIn className="w-2.5 h-2.5 text-indigo-600" />
            Login
          </span>
        );
      case "LOGOUT":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
            <LogOut className="w-2.5 h-2.5 text-slate-600" />
            Logout
          </span>
        );
      case "STATUS":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
            <CheckCircle2 className="w-2.5 h-2.5 text-sky-600" />
            Status
          </span>
        );
      case "PAYMENT":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            <CreditCard className="w-2.5 h-2.5 text-teal-600" />
            Bayar
          </span>
        );
      case "CLAIM":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
            <Gift className="w-2.5 h-2.5 text-purple-600" />
            Klaim
          </span>
        );
      default:
        return null;
    }
  };

  const getActionIcon = (module?: ActivityModule, actionText?: string) => {
    if (module === "SAVINGS" || module === "BUDGET") {
      return <Wallet className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (module === "SESERAHAN") {
      return <Gift className="w-3.5 h-3.5 text-rose-500" />;
    }
    if (module === "CHECKLIST" || module === "RUNDOWN") {
      return <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />;
    }
    if (module === "GUESTS") {
      return <Users className="w-3.5 h-3.5 text-indigo-600" />;
    }
    if (module === "POST_WEDDING") {
      return <Home className="w-3.5 h-3.5 text-amber-600" />;
    }
    if (module === "VENDORS") {
      return <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />;
    }
    if (module === "ADMINISTRATION") {
      return <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (module === "ALIGNMENT") {
      return <HeartHandshake className="w-3.5 h-3.5 text-pink-600" />;
    }
    if (module === "AUTH" || module === "PROFILE" || module === "WORKSPACE") {
      return <User className="w-3.5 h-3.5 text-purple-600" />;
    }

    const text = (actionText || "").toLowerCase();
    if (text.includes("tabungan") || text.includes("setoran") || text.includes("budget") || text.includes("anggaran")) {
      return <Wallet className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (text.includes("seserahan")) {
      return <Gift className="w-3.5 h-3.5 text-rose-500" />;
    }
    if (text.includes("selesai") || text.includes("tugas") || text.includes("tamu") || text.includes("kehadiran")) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (text.includes("kado") || text.includes("wishlist")) {
      return <Home className="w-3.5 h-3.5 text-amber-600" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-pastel-500" />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-2xs">
            <Activity className="w-4 h-4 text-pastel-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
              Aktivitas Pasangan
            </h3>
            <p className="text-[11px] text-slate-500">
              Live audit transparansi jejak persiapan pernikahan
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Audit
        </span>
      </div>

      <div className="space-y-3">
        {activityLogs.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Belum Ada Riwayat Aktivitas</p>
            <p className="text-[11px]">
              Setiap kali Anda atau pasangan membuat, mengubah, menghapus, atau masuk ke akun, jejak aktivitas akan otomatis tercatat secara live di sini.
            </p>
          </div>
        ) : (
          activityLogs.slice(0, 5).map((log) => {
            const detected = autoDetectTypeAndModule(log.action);
            const actionType = log.actionType || detected.actionType;
            const activityModule = log.module || detected.module;
            const relativeTime = formatRelativeTime(log.timestamp || log.createdAt, log.timeAgo || "Baru saja");
            const exactTime = formatExactDateTime(log.timestamp || log.createdAt);

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/60 transition-colors border border-slate-100"
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getActionIcon(activityModule, log.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <strong className="font-bold text-xs text-slate-900">{log.userName}</strong>
                    {getActionBadge(actionType)}
                  </div>

                  <p className="text-xs text-slate-700 leading-snug">
                    {log.action}
                  </p>

                  {log.details && (
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 italic">
                      {log.details}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                      <Clock className="w-3 h-3 text-pastel-600" />
                      {relativeTime}
                    </span>
                    {exactTime && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-500">{exactTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activityLogs.length > 0 && (
        <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 font-medium">
            Total {activityLogs.length} aktivitas terekam
          </span>
          <Link
            href="/activity"
            className="inline-flex items-center gap-1 text-xs font-bold text-pastel-700 hover:text-pastel-800 hover:underline transition-all"
          >
            <span>Buka Linimasa &amp; Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
