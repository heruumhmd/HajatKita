"use client";

import React, { useState } from "react";
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

    const allocatedNum = parseFloat(allocated) || 0;
    const spentNum = parseFloat(spent) || 0;

    let computedStatus = status;
    if (spentNum >= allocatedNum && allocatedNum > 0) {
      computedStatus = "LUNAS";
    } else if (spentNum > 0) {
      computedStatus = "DP_TERBAYAR";
    }

    if (editingItem) {
      updateBudgetCategory({
        ...editingItem,
        name,
        vendor: vendor || undefined,
        allocated: allocatedNum,
        spent: spentNum,
        status: computedStatus,
      });
      showToastSuccess(`Pos anggaran "${name}" berhasil diperbarui! 💳`);
    } else {
      addBudgetCategory({
        name,
        vendor: vendor || undefined,
        allocated: allocatedNum,
        spent: spentNum,
        status: computedStatus,
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

        <button
          id="tour-budget-add"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-all w-full sm:w-auto self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pos Anggaran</span>
        </button>
      </div>

      {/* Saving Donut Chart Component */}
      <div id="tour-budget-summary">
        <SavingDonutCard />
      </div>

      {/* Financial Health Guard Banner */}
      <FinancialGuardBanner />

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
          <div className="overflow-x-auto -mx-6 px-6">
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
