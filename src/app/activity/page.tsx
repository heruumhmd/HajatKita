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
  PlusCircle,
  Edit3,
  Trash2,
  LogIn,
  LogOut,
  CreditCard,
  Download,
  Copy,
  Check,
  MapPin,
  FileCheck2,
} from "lucide-react";
import { useWedding, autoDetectTypeAndModule } from "@/context/wedding-context";
import { formatExactDateTime, formatRelativeTime, parseActivityDate } from "@/lib/utils";
import { ActivityLog, ActivityActionType, ActivityModule } from "@/types";
import { showToastSuccess, showToastInfo } from "@/lib/swal";

type ActionFilter = "ALL" | "CREATE" | "UPDATE" | "DELETE" | "AUTH" | "STATUS" | "PAYMENT" | "CLAIM";

export default function ActivityHistoryPage() {
  const { activityLogs, wedding } = useWedding();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActionType, setSelectedActionType] = useState<ActionFilter>("ALL");
  const [selectedActor, setSelectedActor] = useState<"ALL" | "GROOM" | "BRIDE" | "COLLABORATOR">("ALL");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [copiedAudit, setCopiedAudit] = useState(false);

  // Normalize log item with actionType and module if missing
  const normalizedLogs = useMemo(() => {
    const raw = Array.isArray(activityLogs) ? activityLogs : [];
    return raw.map((log) => {
      const detected = autoDetectTypeAndModule(log.action);
      return {
        ...log,
        actionType: log.actionType || detected.actionType,
        module: log.module || detected.module,
      };
    });
  }, [activityLogs]);

  // Real-time statistics counters
  const stats = useMemo(() => {
    let creates = 0;
    let updates = 0;
    let deletes = 0;
    let auths = 0;
    let statuses = 0;

    for (const log of normalizedLogs) {
      const type = log.actionType;
      if (type === "CREATE") creates++;
      else if (type === "UPDATE") updates++;
      else if (type === "DELETE") deletes++;
      else if (type === "LOGIN" || type === "LOGOUT") auths++;
      else if (type === "STATUS" || type === "PAYMENT" || type === "CLAIM") statuses++;
    }

    return {
      total: normalizedLogs.length,
      creates,
      updates,
      deletes,
      auths,
      statuses,
    };
  }, [normalizedLogs]);

  const getActionBadge = (actionType?: ActivityActionType) => {
    switch (actionType) {
      case "CREATE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <PlusCircle className="w-3 h-3 text-emerald-600" />
            Tambah
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Edit3 className="w-3 h-3 text-amber-600" />
            Ubah
          </span>
        );
      case "DELETE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <Trash2 className="w-3 h-3 text-rose-600" />
            Hapus
          </span>
        );
      case "LOGIN":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            <LogIn className="w-3 h-3 text-indigo-600" />
            Login
          </span>
        );
      case "LOGOUT":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
            <LogOut className="w-3 h-3 text-slate-600" />
            Logout
          </span>
        );
      case "STATUS":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            Status
          </span>
        );
      case "PAYMENT":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            <CreditCard className="w-3 h-3 text-teal-600" />
            Transaksi
          </span>
        );
      case "CLAIM":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            <Gift className="w-3 h-3 text-purple-600" />
            Klaim
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            <Sparkles className="w-3 h-3 text-slate-500" />
            Aktivitas
          </span>
        );
    }
  };

  const getModuleIcon = (module?: ActivityModule, actionText?: string) => {
    if (module === "SAVINGS" || module === "BUDGET") {
      return <Wallet className="w-4 h-4 text-emerald-600" />;
    }
    if (module === "SESERAHAN") {
      return <Gift className="w-4 h-4 text-rose-500" />;
    }
    if (module === "CHECKLIST" || module === "RUNDOWN") {
      return <CheckCircle2 className="w-4 h-4 text-sky-600" />;
    }
    if (module === "GUESTS") {
      return <Users className="w-4 h-4 text-indigo-600" />;
    }
    if (module === "POST_WEDDING") {
      return <Home className="w-4 h-4 text-amber-600" />;
    }
    if (module === "VENDORS") {
      return <ShieldCheck className="w-4 h-4 text-teal-600" />;
    }
    if (module === "ADMINISTRATION") {
      return <FileCheck2 className="w-4 h-4 text-blue-600" />;
    }
    if (module === "ALIGNMENT") {
      return <HeartHandshake className="w-4 h-4 text-pink-600" />;
    }
    if (module === "AUTH" || module === "PROFILE" || module === "WORKSPACE") {
      return <User className="w-4 h-4 text-purple-600" />;
    }

    const text = (actionText || "").toLowerCase();
    if (text.includes("tabungan") || text.includes("budget") || text.includes("anggaran")) {
      return <Wallet className="w-4 h-4 text-emerald-600" />;
    }
    if (text.includes("seserahan")) {
      return <Gift className="w-4 h-4 text-rose-500" />;
    }
    if (text.includes("tugas") || text.includes("checklist") || text.includes("rundown")) {
      return <CheckCircle2 className="w-4 h-4 text-sky-600" />;
    }
    if (text.includes("tamu") || text.includes("rsvp") || text.includes("amplop")) {
      return <Users className="w-4 h-4 text-indigo-600" />;
    }
    if (text.includes("kado") || text.includes("wishlist")) {
      return <Home className="w-4 h-4 text-amber-600" />;
    }
    if (text.includes("vendor")) {
      return <ShieldCheck className="w-4 h-4 text-teal-600" />;
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
    return normalizedLogs.filter((log) => {
      if (!log) return false;

      // 1. Action Type filter
      if (selectedActionType !== "ALL") {
        if (selectedActionType === "AUTH") {
          if (log.actionType !== "LOGIN" && log.actionType !== "LOGOUT") return false;
        } else if (log.actionType !== selectedActionType) {
          return false;
        }
      }

      // 2. Actor filter
      if (selectedActor !== "ALL" && log.userRole !== selectedActor) {
        return false;
      }

      // 3. Module filter
      if (selectedModule !== "ALL") {
        if (log.module !== selectedModule) {
          const text = (log.action || "").toLowerCase();
          if (selectedModule === "SESERAHAN" && !text.includes("seserahan")) return false;
          if (selectedModule === "SAVINGS" && !text.includes("tabungan") && !text.includes("setoran")) return false;
          if (selectedModule === "BUDGET" && !text.includes("anggaran") && !text.includes("budget")) return false;
          if (selectedModule === "CHECKLIST" && !text.includes("tugas") && !text.includes("checklist")) return false;
          if (selectedModule === "RUNDOWN" && !text.includes("rundown") && !text.includes("agenda")) return false;
          if (selectedModule === "GUESTS" && !text.includes("tamu") && !text.includes("rsvp") && !text.includes("amplop")) return false;
          if (selectedModule === "POST_WEDDING" && !text.includes("wishlist") && !text.includes("kado")) return false;
          if (selectedModule === "VENDORS" && !text.includes("vendor") && !text.includes("kontrak")) return false;
          if (selectedModule === "ADMINISTRATION" && !text.includes("kua") && !text.includes("berkas")) return false;
          if (selectedModule === "ALIGNMENT" && !text.includes("pranikah") && !text.includes("topik")) return false;
          if (selectedModule === "AUTH" && !text.includes("login") && !text.includes("logout") && !text.includes("masuk") && !text.includes("keluar")) return false;
        }
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = (log.userName || "").toLowerCase().includes(query);
        const matchAction = (log.action || "").toLowerCase().includes(query);
        const matchDetails = (log.details || "").toLowerCase().includes(query);
        const matchModule = (log.module || "").toLowerCase().includes(query);
        return matchName || matchAction || matchDetails || matchModule;
      }

      return true;
    });
  }, [normalizedLogs, selectedActionType, selectedActor, selectedModule, searchQuery]);

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

  // Export or copy audit log summary
  const handleCopyAuditSummary = () => {
    if (filteredLogs.length === 0) {
      showToastInfo("Tidak ada riwayat aktivitas untuk disalin.");
      return;
    }

    const lines = filteredLogs.map((log, idx) => {
      const time = formatExactDateTime(log.timestamp || log.createdAt) || log.timeAgo || "-";
      const type = log.actionType || "AKTIVITAS";
      const role = log.userRole === "GROOM" ? "Suami" : log.userRole === "BRIDE" ? "Istri" : "Tamu";
      return `${idx + 1}. [${time}] [${type}] ${log.userName} (${role}): ${log.action}${log.details ? ` - Detail: ${log.details}` : ""}`;
    });

    const header = `AUDIT TRAIL PERSIAPAN PERNIKAHAN: ${wedding.groomName || "Suami"} & ${wedding.brideName || "Istri"}\nTotal Aktivitas: ${filteredLogs.length}\nDicetak pada: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB\n----------------------------------------\n\n`;
    const fullText = header + lines.join("\n");

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedAudit(true);
      showToastSuccess("Ringkasan jejak audit berhasil disalin ke papan klip! 📋");
      setTimeout(() => setCopiedAudit(false), 2000);
    }
  };

  const handleDownloadCsv = () => {
    if (filteredLogs.length === 0) {
      showToastInfo("Tidak ada riwayat aktivitas untuk diunduh.");
      return;
    }

    const csvRows = [
      ["No", "Waktu (WIB)", "Tipe Aksi", "Modul", "Pelaku", "Peran", "Aktivitas", "Rincian"],
      ...filteredLogs.map((log, i) => [
        String(i + 1),
        `"${formatExactDateTime(log.timestamp || log.createdAt) || log.timeAgo || ""}"`,
        `"${log.actionType || "UPDATE"}"`,
        `"${log.module || "WEDDING"}"`,
        `"${log.userName || ""}"`,
        `"${log.userRole || ""}"`,
        `"${(log.action || "").replace(/"/g, '""')}"`,
        `"${(log.details || "").replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Live_Audit_HajatKita_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastSuccess("Berkas audit CSV berhasil diunduh! 📥");
  };

  const groomName = wedding.groomName || "Suami";
  const brideName = wedding.brideName || "Istri";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-50/90 via-white to-slate-100/80 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Activity className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                Linimasa &amp; Riwayat Aktivitas
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Audit
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Transparansi lengkap jejak persiapan pernikahan bersama pasangan sejak awal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          <Link
            href="/timeline"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-pastel-600" />
            <span>Peta Persiapan (Roadmap)</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-pastel-600" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Live Audit Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => setSelectedActionType("ALL")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedActionType === "ALL"
              ? "bg-pastel-600 text-white border-pastel-700 shadow-sm"
              : "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            Total Jejak
          </span>
          <span className="text-xl font-black font-mono block mt-1">
            {stats.total}
          </span>
          <span className="text-[10px] opacity-75 mt-0.5 block">Semua aktivitas</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedActionType("CREATE")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedActionType === "CREATE"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
              : "bg-white hover:bg-emerald-50/50 border-slate-200/90 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-700">
              Tambah (Create)
            </span>
            <PlusCircle className={`w-3.5 h-3.5 ${selectedActionType === "CREATE" ? "text-white" : "text-emerald-500"}`} />
          </div>
          <span className="text-xl font-black font-mono block mt-1">
            {stats.creates}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Item baru ditambahkan</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedActionType("UPDATE")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedActionType === "UPDATE"
              ? "bg-amber-600 text-white border-amber-700 shadow-sm"
              : "bg-white hover:bg-amber-50/50 border-slate-200/90 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-700">
              Ubah (Update)
            </span>
            <Edit3 className={`w-3.5 h-3.5 ${selectedActionType === "UPDATE" ? "text-white" : "text-amber-500"}`} />
          </div>
          <span className="text-xl font-black font-mono block mt-1">
            {stats.updates}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Perubahan rincian</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedActionType("DELETE")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedActionType === "DELETE"
              ? "bg-rose-600 text-white border-rose-700 shadow-sm"
              : "bg-white hover:bg-rose-50/50 border-slate-200/90 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-700">
              Hapus (Delete)
            </span>
            <Trash2 className={`w-3.5 h-3.5 ${selectedActionType === "DELETE" ? "text-white" : "text-rose-500"}`} />
          </div>
          <span className="text-xl font-black font-mono block mt-1">
            {stats.deletes}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Penghapusan item</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedActionType("AUTH")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedActionType === "AUTH"
              ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
              : "bg-white hover:bg-indigo-50/50 border-slate-200/90 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-indigo-700">
              Sesi Akun
            </span>
            <LogIn className={`w-3.5 h-3.5 ${selectedActionType === "AUTH" ? "text-white" : "text-indigo-500"}`} />
          </div>
          <span className="text-xl font-black font-mono block mt-1">
            {stats.auths}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Login &amp; Logout</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedActionType("STATUS")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedActionType === "STATUS"
              ? "bg-sky-600 text-white border-sky-700 shadow-sm"
              : "bg-white hover:bg-sky-50/50 border-slate-200/90 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-sky-700">
              Status &amp; Transaksi
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${selectedActionType === "STATUS" ? "text-white" : "text-sky-500"}`} />
          </div>
          <span className="text-xl font-black font-mono block mt-1">
            {stats.statuses}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Selesai &amp; bayar</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-subtle-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari jejak audit (contoh: login, hapus, seserahan, setoran, vendor, checklist)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300 font-medium"
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

          <div className="flex items-center gap-2">
            {/* Export & Copy buttons */}
            <button
              type="button"
              onClick={handleCopyAuditSummary}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Salin ringkasan teks audit"
            >
              {copiedAudit ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copiedAudit ? "Disalin!" : "Salin Teks"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-pastel-700 bg-pastel-50 hover:bg-pastel-100 rounded-xl border border-pastel-200 transition-colors"
              title="Unduh berkas CSV"
            >
              <Download className="w-3.5 h-3.5 text-pastel-600" />
              <span>Ekspor CSV</span>
            </button>

            {/* Reset button */}
            {(selectedActionType !== "ALL" || selectedActor !== "ALL" || selectedModule !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedActionType("ALL");
                  setSelectedActor("ALL");
                  setSelectedModule("ALL");
                  setSearchQuery("");
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Action Type Pills */}
          <span className="text-slate-500 font-bold text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-pastel-600" /> Aksi:
          </span>

          <button
            type="button"
            onClick={() => setSelectedActionType("ALL")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActionType === "ALL"
                ? "bg-slate-800 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Semua Aksi
          </button>
          <button
            type="button"
            onClick={() => setSelectedActionType("CREATE")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActionType === "CREATE"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 border border-emerald-200"
            }`}
          >
            + Tambah
          </button>
          <button
            type="button"
            onClick={() => setSelectedActionType("UPDATE")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActionType === "UPDATE"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 border border-amber-200"
            }`}
          >
            ✏️ Ubah
          </button>
          <button
            type="button"
            onClick={() => setSelectedActionType("DELETE")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActionType === "DELETE"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-50/70 hover:bg-rose-100/70 text-rose-800 border border-rose-200"
            }`}
          >
            🗑️ Hapus
          </button>
          <button
            type="button"
            onClick={() => setSelectedActionType("AUTH")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActionType === "AUTH"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-800 border border-indigo-200"
            }`}
          >
            🔑 Login/Logout
          </button>
          <button
            type="button"
            onClick={() => setSelectedActionType("STATUS")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActionType === "STATUS"
                ? "bg-sky-600 text-white shadow-2xs"
                : "bg-sky-50/70 hover:bg-sky-100/70 text-sky-800 border border-sky-200"
            }`}
          >
            ✓ Status
          </button>

          <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

          {/* Actor Selector */}
          <span className="text-slate-500 font-bold text-[11px] mr-1">Pelaku:</span>
          <button
            type="button"
            onClick={() => setSelectedActor("ALL")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActor === "ALL"
                ? "bg-pastel-600 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setSelectedActor("GROOM")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActor === "GROOM"
                ? "bg-sky-600 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {groomName.split(" ")[0]} (Suami)
          </button>
          <button
            type="button"
            onClick={() => setSelectedActor("BRIDE")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActor === "BRIDE"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {brideName.split(" ")[0]} (Istri)
          </button>
          <button
            type="button"
            onClick={() => setSelectedActor("COLLABORATOR")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
              selectedActor === "COLLABORATOR"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Tamu
          </button>

          <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

          {/* Module Selector */}
          <span className="text-slate-500 font-bold text-[11px] mr-1">Modul:</span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pastel-300"
          >
            <option value="ALL">Semua Modul</option>
            <option value="SAVINGS">Tabungan Bersama</option>
            <option value="BUDGET">Pos Anggaran</option>
            <option value="CHECKLIST">Peta Persiapan (Checklist)</option>
            <option value="RUNDOWN">Rundown Acara</option>
            <option value="SESERAHAN">Barang Seserahan</option>
            <option value="GUESTS">Tamu &amp; Amplop</option>
            <option value="POST_WEDDING">Wishlist Pasca-Nikah</option>
            <option value="VENDORS">Proteksi Vendor</option>
            <option value="ADMINISTRATION">Administrasi KUA</option>
            <option value="ALIGNMENT">Pojok Bicara Pranikah</option>
            <option value="AUTH">Sesi Login / Logout</option>
            <option value="PROFILE">Profil Mempelai</option>
            <option value="WORKSPACE">Duo Workspace</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-6">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center space-y-3 shadow-subtle-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 font-serif">Tidak Ada Riwayat Aktivitas yang Cocok</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedActionType !== "ALL" || selectedActor !== "ALL" || selectedModule !== "ALL"
                ? "Tidak ada jejak audit yang sesuai dengan filter atau kata kunci pencarian Anda."
                : "Belum ada riwayat aktivitas yang tercatat. Setiap tindakan Create, Update, Delete, Login, dan Logout akan otomatis terekam secara live di sini."}
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
                      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle-sm hover:border-pastel-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          {getModuleIcon(log.module, log.action)}
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {log.userName}
                            </span>
                            {getRoleBadge(log.userRole)}
                            {getActionBadge(log.actionType)}
                            {log.module && (
                              <span className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 uppercase">
                                {log.module}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-[13px] font-medium text-slate-800 leading-snug">
                            {log.action}
                          </p>

                          {log.details && (
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed font-sans">
                              {log.details}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp Badges */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0 gap-1 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-semibold text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-lg border border-pastel-200">
                          <Clock className="w-3 h-3 text-pastel-600" />
                          {relative}
                        </span>

                        {exact && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {exact}
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
