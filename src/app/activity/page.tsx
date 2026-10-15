"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Search,
  Filter,
  Clock,
  Calendar,
  Wallet,
  Gift,
  CheckCircle2,
  Home,
  Sparkles,
  Users,
  ArrowLeft,
  ShieldCheck,
  User,
  HeartHandshake,
  RotateCcw,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { formatExactDateTime, formatRelativeTime, parseActivityDate } from "@/lib/utils";
import { ActivityLog } from "@/types";

export default function ActivityHistoryPage() {
  const { activityLogs, wedding, currentUser } = useWedding();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActor, setSelectedActor] = useState<"ALL" | "GROOM" | "BRIDE" | "COLLABORATOR">("ALL");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");

  const getActionIcon = (actionText: string) => {
    const text = actionText.toLowerCase();
    if (text.includes("tabungan") || text.includes("menyetor") || text.includes("setoran") || text.includes("pos anggaran") || text.includes("budget")) {
      return <Wallet className="w-4 h-4 text-pastel-600" />;
    }
    if (text.includes("seserahan")) {
      return <Gift className="w-4 h-4 text-rose-500" />;
    }
    if (text.includes("selesai") || text.includes("tugas") || text.includes("checklist")) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (text.includes("tamu") || text.includes("rsvp") || text.includes("kehadiran") || text.includes("undangan")) {
      return <Users className="w-4 h-4 text-indigo-600" />;
    }
    if (text.includes("kado") || text.includes("wishlist") || text.includes("rumah")) {
      return <Home className="w-4 h-4 text-amber-600" />;
    }
    if (text.includes("vendor") || text.includes("kontrak")) {
      return <ShieldCheck className="w-4 h-4 text-teal-600" />;
    }
    if (text.includes("profil") || text.includes("pasangan") || text.includes("biodata")) {
      return <User className="w-4 h-4 text-purple-600" />;
    }
    if (text.includes("topik") || text.includes("pranikah") || text.includes("bicara")) {
      return <HeartHandshake className="w-4 h-4 text-pink-600" />;
    }
    return <Sparkles className="w-4 h-4 text-pastel-500" />;
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "GROOM":
        return (
          <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            Calon Suami
          </span>
        );
      case "BRIDE":
        return (
          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Calon Istri
          </span>
        );
      case "COLLABORATOR":
        return (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Tamu / Rekan
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Pengguna
          </span>
        );
    }
  };

  // Filter and search activities
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      // 1. Actor filter
      if (selectedActor !== "ALL" && log.userRole !== selectedActor) {
        return false;
      }

      // 2. Module filter
      if (selectedModule !== "ALL") {
        const text = log.action.toLowerCase();
        if (selectedModule === "SESERAHAN" && !text.includes("seserahan")) return false;
        if (selectedModule === "TABUNGAN" && !text.includes("tabungan") && !text.includes("setoran") && !text.includes("anggaran") && !text.includes("budget")) return false;
        if (selectedModule === "CHECKLIST" && !text.includes("tugas") && !text.includes("checklist") && !text.includes("rundown") && !text.includes("agenda")) return false;
        if (selectedModule === "TAMU" && !text.includes("tamu") && !text.includes("rsvp") && !text.includes("kehadiran") && !text.includes("undangan")) return false;
        if (selectedModule === "KADO" && !text.includes("kado") && !text.includes("wishlist") && !text.includes("rumah")) return false;
        if (selectedModule === "VENDOR" && !text.includes("vendor") && !text.includes("kontrak")) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = (log.userName || "").toLowerCase().includes(query);
        const matchAction = (log.action || "").toLowerCase().includes(query);
        return matchName || matchAction;
      }

      return true;
    });
  }, [activityLogs, selectedActor, selectedModule, searchQuery]);

  // Group filtered logs by date bucket
  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: ActivityLog[] } = {};

    for (const log of filteredLogs) {
      const d = parseActivityDate(log.timestamp || log.createdAt);
      let groupKey = "Riwayat Lainnya";

      if (d) {
        const now = new Date();
        const isToday =
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
          d.getDate() === yesterday.getDate() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getFullYear() === yesterday.getFullYear();

        if (isToday) {
          groupKey = "Hari Ini";
        } else if (isYesterday) {
          groupKey = "Kemarin";
        } else {
          groupKey = new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          }).format(d);
        }
      } else {
        groupKey = "Riwayat Awal";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(log);
    }

    return groups;
  }, [filteredLogs]);

  const groomName = wedding.groomName || "Suami";
  const brideName = wedding.brideName || "Istri";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Activity className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                Linimasa &amp; Riwayat Aktivitas
              </h1>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Live Audit
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Transparansi lengkap jejak persiapan pernikahan bersama pasangan sejak awal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 text-pastel-600" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-subtle-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aktivitas (contoh: piyama, gedung, setoran, konfirmasi tamu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Reset button */}
          {(selectedActor !== "ALL" || selectedModule !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedActor("ALL");
                setSelectedModule("ALL");
                setSearchQuery("");
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-bold text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-pastel-600" /> Pelaku:
          </span>

          <button
            type="button"
            onClick={() => setSelectedActor("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              selectedActor === "ALL"
                ? "bg-pastel-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Semua
          </button>

          <button
            type="button"
            onClick={() => setSelectedActor("GROOM")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              selectedActor === "GROOM"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {groomName.split(" ")[0]} (Suami)
          </button>

          <button
            type="button"
            onClick={() => setSelectedActor("BRIDE")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              selectedActor === "BRIDE"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {brideName.split(" ")[0]} (Istri)
          </button>

          <button
            type="button"
            onClick={() => setSelectedActor("COLLABORATOR")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              selectedActor === "COLLABORATOR"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Tamu Undangan
          </button>

          <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

          <span className="text-slate-500 font-bold text-[11px] mr-1">Modul:</span>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pastel-300"
          >
            <option value="ALL">Semua Modul</option>
            <option value="SESERAHAN">Barang Seserahan</option>
            <option value="TABUNGAN">Tabungan &amp; Pos Anggaran</option>
            <option value="CHECKLIST">Tugas &amp; Rundown</option>
            <option value="TAMU">Tamu Undangan &amp; RSVP</option>
            <option value="KADO">Wishlist Kado Pasca-Nikah</option>
            <option value="VENDOR">Kontrak Vendor</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-6">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 font-serif">Tidak Ada Aktivitas Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedActor !== "ALL" || selectedModule !== "ALL"
                ? "Tidak ada riwayat aktivitas yang cocok dengan filter atau kata kunci pencarian Anda."
                : "Belum ada riwayat aktivitas yang tercatat di akun ini."}
            </p>
          </div>
        ) : (
          Object.entries(groupedLogs).map(([groupTitle, logs]) => (
            <div key={groupTitle} className="space-y-3">
              {/* Group Date Header */}
              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-4 h-4 text-pastel-600" />
                <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider font-serif">
                  {groupTitle}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {logs.length}
                </span>
                <div className="flex-1 h-px bg-slate-200 ml-2" />
              </div>

              {/* Items in this date bucket */}
              <div className="space-y-2.5">
                {logs.map((log) => {
                  const relative = formatRelativeTime(log.timestamp || log.createdAt, log.timeAgo || "Baru saja");
                  const exact = formatExactDateTime(log.timestamp || log.createdAt);

                  return (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle-sm hover:border-pastel-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          {getActionIcon(log.action)}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {log.userName}
                            </span>
                            {getRoleBadge(log.userRole)}
                          </div>

                          <p className="text-xs text-slate-700 leading-snug">
                            {log.action}
                          </p>
                        </div>
                      </div>

                      {/* Timestamp Badges */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0 gap-1 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-semibold text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-lg border border-pastel-200">
                          <Clock className="w-3 h-3 text-pastel-600" />
                          {relative}
                        </span>

                        {exact ? (
                          <span className="font-mono text-[10px] text-slate-400">
                            {exact}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {log.timeAgo}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
