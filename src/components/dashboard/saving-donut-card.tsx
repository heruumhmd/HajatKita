"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Wallet, Plus, TrendingUp, Sparkles, CheckCircle2, Trash2 } from "lucide-react";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";
import { useWedding } from "@/context/wedding-context";
import confetti from "canvas-confetti";

export function SavingDonutCard() {
  const { wedding, savingContributions, addSavingContribution, deleteSavingContribution, requireAuth } = useWedding();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [contributor, setContributor] = useState("Calon Suami");
  const [customLabel, setCustomLabel] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const target = wedding.targetBudget || 100000000;
  const totalCollected = savingContributions.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = Math.max(0, target - totalCollected);
  const percentage = target > 0 ? ((totalCollected / target) * 100).toFixed(1) : "0";

  // Palette colors for contributors
  const palette = ["#1D50A2", "#5D92DC", "#C59B3C", "#E11D48", "#10B981"];

  // Data for Donut Chart
  const chartData = [
    ...savingContributions.map((c, idx) => ({
      name: c.label,
      value: c.amount,
      color: c.color || palette[idx % palette.length],
    })),
    {
      name: "Kekurangan Menuju Target",
      value: remaining,
      color: "#E2E8F0",
    },
  ];

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (!amountNum || amountNum <= 0) return;

    const label = customLabel.trim() || `Tabungan ${contributor}`;
    const color = palette[savingContributions.length % palette.length];

    addSavingContribution({
      label,
      amount: amountNum,
      percentage: 0,
      color,
    });

    setIsModalOpen(false);
    setDepositAmount("");
    setCustomLabel("");

    // Confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#1D50A2", "#C59B3C", "#5D92DC", "#F43F5E"],
      });
    } catch {
      // safe
    }

    setSuccessToast(`Berhasil menambah setoran ${formatRupiah(amountNum)}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Wallet className="w-5 h-5 text-pastel-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Target Tabungan Nikah Bersama
            </h2>
            <p className="text-xs text-slate-500">
              Visualisasi progres tabungan bersama &amp; porsi calon suami/istri
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!requireAuth()) return;
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs transition-all shadow-xs w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Setor Tabungan
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Donut Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={savingContributions.length > 0 ? 3 : 0}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value) || 0), "Jumlah"]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Terkumpul
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {percentage}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {formatShortRupiah(totalCollected)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Legend & Statistics */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Target Anggaran</span>
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                {formatRupiah(target)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Sisa Perlu Ditabung</span>
              <span className="text-base sm:text-lg font-black text-amber-700 font-mono">
                {formatRupiah(remaining)}
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Rincian Kontribusi:</span>

            {savingContributions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Belum ada data setoran tabungan. Klik tombol <strong>&quot;Setor Tabungan&quot;</strong> di atas untuk mencatat tabungan pertama Anda.
              </div>
            ) : (
              savingContributions.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: c.color || palette[idx % palette.length] }}
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 truncate block">{c.label}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {c.percentage}% dari total tabungan
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold font-mono text-slate-800 text-xs sm:text-sm">
                      {formatRupiah(c.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!requireAuth()) return;
                        deleteSavingContribution(idx);
                      }}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      title="Hapus setoran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Setor Tabungan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                Catat Setoran Tabungan Bersama
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pihak Penyetor
                </label>
                <select
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                >
                  <option value="Calon Suami">Calon Suami {wedding.groomName ? `(${wedding.groomName.split(" ")[0]})` : ""}</option>
                  <option value="Calon Istri">Calon Istri {wedding.brideName ? `(${wedding.brideName.split(" ")[0]})` : ""}</option>
                  <option value="Bantuan Keluarga">Bantuan / Hibah Keluarga</option>
                  <option value="Tabungan Bersama">Rekening Bersama</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Label (Opsional)
                </label>
                <input
                  type="text"
                  placeholder={`Contoh: Tabungan ${contributor}`}
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Setoran (Rp) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 5000000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
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
                  Simpan Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
