"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  ShieldAlert,
  Trash2,
  DollarSign,
  Building,
  Edit2,
  TrendingUp,
} from "lucide-react";
import { SavingDonutCard } from "@/components/dashboard/saving-donut-card";
import { FinancialGuardBanner } from "@/components/dashboard/financial-guard-banner";
import { formatRupiah } from "@/lib/utils";
import { useWedding } from "@/context/wedding-context";
import { BudgetCategory } from "@/types";
import { showToastSuccess, showConfirmDialog } from "@/lib/swal";

export default function BudgetPage() {
  const {
    budgetCategories,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    wedding,
    requireAuth,
  } = useWedding();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetCategory | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [allocated, setAllocated] = useState("");
  const [spent, setSpent] = useState("");
  const [status, setStatus] = useState<"LUNAS" | "DP_TERBAYAR" | "BELUM_BAYAR">("BELUM_BAYAR");

  const totalAllocated = budgetCategories.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = budgetCategories.reduce((acc, curr) => acc + curr.spent, 0);
  const remainingBudget = totalAllocated - totalSpent;

  const handleOpenAdd = () => {
    if (!requireAuth()) return;
    setEditingItem(null);
    setName("");
    setVendor("");
    setAllocated("");
    setSpent("");
    setStatus("BELUM_BAYAR");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: BudgetCategory) => {
    if (!requireAuth()) return;
    setEditingItem(cat);
    setName(cat.name);
    setVendor(cat.vendor || "");
    setAllocated(String(cat.allocated));
    setSpent(String(cat.spent));
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const allocatedNum = Math.max(0, parseFloat(allocated) || 0);
    const spentNum = Math.max(0, parseFloat(spent) || 0);

    // Respect user's selected status; auto-suggest only if left as BELUM_BAYAR with spent > 0
    let finalStatus = status;
    if (status === "BELUM_BAYAR" && spentNum > 0) {
      if (allocatedNum > 0 && spentNum >= allocatedNum) {
        finalStatus = "LUNAS";
      } else {
        finalStatus = "DP_TERBAYAR";
      }
    }

    if (editingItem) {
      updateBudgetCategory({
        ...editingItem,
        name: name.trim(),
        vendor: vendor.trim() || undefined,
        allocated: allocatedNum,
        spent: spentNum,
        status: finalStatus,
      });
      showToastSuccess(`Pos anggaran "${name}" berhasil diperbarui! 💳`);
    } else {
      addBudgetCategory({
        name: name.trim(),
        vendor: vendor.trim() || undefined,
        allocated: allocatedNum,
        spent: spentNum,
        status: finalStatus,
      });
      showToastSuccess(`Pos anggaran "${name}" berhasil ditambahkan! 📊`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteCategory = async (cat: BudgetCategory) => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Pos Anggaran?",
      text: `Apakah Anda yakin ingin menghapus pos anggaran "${cat.name}"? Data pengeluaran pos ini akan dihapus.`,
      confirmButtonText: "Ya, Hapus",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    deleteBudgetCategory(cat.id);
    showToastSuccess(`Pos anggaran "${cat.name}" berhasil dihapus`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Wallet className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Manajemen Budget &amp; Tabungan Bersama
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Rencana alokasi anggaran, status pembayaran vendor, dan proteksi boncos pasca-nikah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
          <Link
            href="/savings"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-colors flex-1 sm:flex-initial"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Tabungan Masa Depan →</span>
          </Link>
          <button
            id="tour-budget-add"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-all flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pos Anggaran</span>
          </button>
        </div>
      </div>

      {/* Saving Donut Chart Component */}
      <div id="tour-budget-summary">
        <SavingDonutCard />
      </div>

      {/* Financial Health Guard Banner */}
      <FinancialGuardBanner />

      {/* Life Goals Teaser Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-pastel-50 p-4 sm:p-5 rounded-3xl border border-emerald-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block font-serif text-sm">
              Tabungan Masa Depan: DP KPR, Kendaraan, Anak, &amp; Haji
            </span>
            <span className="text-slate-600 text-[11px] leading-relaxed">
              Kawal rencana finansial jangka panjang keluarga berdua dengan kalkulator simulasi KPR, inflasi sekolah anak, dan porsi haji.
            </span>
          </div>
        </div>
        <Link
          href="/savings"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <span>Buka Life Goals</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category Expenses Breakdown Table */}
      <div id="tour-budget-categories" className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Rincian Pos Anggaran &amp; Realisasi Pembayaran
            </h2>
            <p className="text-xs text-slate-500">
              Pantau status DP dan sisa pelunasan vendor agar tidak ada tagihan terlewat
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Realisasi Pengeluaran: </span>
            <span className="text-xs font-black font-mono text-pastel-700">
              {formatRupiah(totalSpent)} / {formatRupiah(totalAllocated)}
            </span>
          </div>
        </div>

        {budgetCategories.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <Wallet className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">Belum Ada Pos Anggaran</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mulai rencanakan anggaran untuk gedung, katering, busana, foto, dll dengan mengklik tombol di bawah.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pos Pertama</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View: Tabular Table (lg:+) */}
            <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Pos Kebutuhan</th>
                    <th className="pb-3 px-3">Vendor Rekanan</th>
                    <th className="pb-3 px-3">Alokasi Anggaran</th>
                    <th className="pb-3 px-3">Telah Dibayar</th>
                    <th className="pb-3 px-3">Sisa Tagihan</th>
                    <th className="pb-3 px-3 text-center">Status</th>
                    <th className="pb-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {budgetCategories.map((cat) => {
                    const sisa = Math.max(0, cat.allocated - cat.spent);
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900">{cat.name}</td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {cat.vendor || "Dana Cadangan Mandiri"}
                        </td>
                        <td className="py-3.5 px-3 font-bold font-mono text-slate-800">
                          {formatRupiah(cat.allocated)}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-emerald-700 font-bold">
                          {formatRupiah(cat.spent)}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-amber-800 font-bold">
                          {formatRupiah(sisa)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              cat.status === "LUNAS"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : cat.status === "DP_TERBAYAR"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {cat.status === "LUNAS"
                              ? "LUNAS"
                              : cat.status === "DP_TERBAYAR"
                              ? "DP TERBAYAR"
                              : "BELUM BAYAR"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 text-slate-400 hover:text-pastel-600 rounded-lg transition-colors"
                              title="Edit Pos Anggaran"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                              title="Hapus Pos Anggaran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 font-extrabold text-slate-800 bg-slate-50/50">
                    <td className="py-3 px-3">Total Anggaran</td>
                    <td className="py-3 px-3 text-slate-500 font-normal">{budgetCategories.length} Pos</td>
                    <td className="py-3 px-3 font-mono text-slate-900">{formatRupiah(totalAllocated)}</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">{formatRupiah(totalSpent)}</td>
                    <td className="py-3 px-3 font-mono text-amber-800">{formatRupiah(remainingBudget)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile & Tablet Portrait View: Stacked Financial Cards (< lg) */}
            <div className="lg:hidden space-y-3">
              {budgetCategories.map((cat) => {
                const sisa = Math.max(0, cat.allocated - cat.spent);
                const percentSpent = cat.allocated > 0 ? Math.min(100, Math.round((cat.spent / cat.allocated) * 100)) : 0;
                return (
                  <div
                    key={cat.id}
                    className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {cat.vendor || "Dana Cadangan Mandiri"}
                        </p>
                      </div>

                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          cat.status === "LUNAS"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : cat.status === "DP_TERBAYAR"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {cat.status === "LUNAS"
                          ? "LUNAS"
                          : cat.status === "DP_TERBAYAR"
                          ? "DP TERBAYAR"
                          : "BELUM BAYAR"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cat.status === "LUNAS" ? "bg-emerald-500" : "bg-pastel-600"
                          }`}
                          style={{ width: `${percentSpent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Realisasi: {percentSpent}%</span>
                        <span className="font-mono">Sisa: {formatRupiah(sisa)}</span>
                      </div>
                    </div>

                    {/* Financial Figures Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block">Alokasi Anggaran</span>
                        <span className="font-bold font-mono text-slate-800">{formatRupiah(cat.allocated)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-medium block">Telah Dibayar</span>
                        <span className="font-bold font-mono text-emerald-700">{formatRupiah(cat.spent)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-pastel-700 font-semibold text-xs shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 font-semibold text-xs shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Mobile Total Summary Card */}
              <div className="p-4 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Total Anggaran ({budgetCategories.length} Pos):</span>
                  <span className="font-mono">{formatRupiah(totalAllocated)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Total Telah Dibayar:</span>
                  <span className="font-mono">{formatRupiah(totalSpent)}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-bold border-t border-slate-200 pt-1.5">
                  <span>Total Sisa Kewajiban:</span>
                  <span className="font-mono">{formatRupiah(remainingBudget)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {editingItem ? "Edit Pos Anggaran" : "Tambah Pos Anggaran Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pos Kebutuhan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Venue Ballroom, Katering Utama, Rias Pengantin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vendor Rekanan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Grand Ballroom Bandung"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alokasi Anggaran (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 25000000"
                    value={allocated}
                    onChange={(e) => setAllocated(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telah Dibayar (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 5000000"
                    value={spent}
                    onChange={(e) => setSpent(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                >
                  <option value="BELUM_BAYAR">Belum Bayar</option>
                  <option value="DP_TERBAYAR">DP Terbayar Sebagian</option>
                  <option value="LUNAS">Lunas 100%</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                >
                  {editingItem ? "Simpan Perubahan" : "Tambah Pos"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
