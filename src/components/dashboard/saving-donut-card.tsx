"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Wallet, Plus, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";
import { mockSavingContributions, mockWedding } from "@/lib/mock-data";
import confetti from "canvas-confetti";

export function SavingDonutCard() {
  const [contributions, setContributions] = useState(mockSavingContributions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [contributor, setContributor] = useState("Calon Suami (Dwiki)");
  const [notes, setNotes] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const totalCollected = contributions.reduce((acc, curr) => acc + curr.amount, 0);
  const target = mockWedding.targetBudget;
  const remaining = Math.max(0, target - totalCollected);
  const percentage = ((totalCollected / target) * 100).toFixed(1);

  // Data for Donut Chart
  const chartData = [
    ...contributions.map((c) => ({
      name: c.label,
      value: c.amount,
      color: c.color,
    })),
    {
      name: "Kekurangan Menuju Target",
      value: remaining,
      color: "#E2E8F0", // Slate 200 for remaining
    },
  ];

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (!amountNum || amountNum <= 0) return;

    // Update contributions
    const updated = contributions.map((c) => {
      if (
        (contributor.includes("Suami") && c.label.includes("Dwiki")) ||
        (contributor.includes("Istri") && c.label.includes("Sarah"))
      ) {
        return { ...c, amount: c.amount + amountNum };
      }
      return c;
    });

    setContributions(updated);
    setIsModalOpen(false);
    setDepositAmount("");
    setNotes("");

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#38BDF8", "#7DD3FC", "#BAE6FD", "#0284C7"],
      });
    } catch {
      // safe fallback
    }

    setSuccessToast(`Berhasil menambah setoran ${formatRupiah(amountNum)}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-sky-100/90 shadow-pastel-sm relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pastel-100 flex items-center justify-center text-pastel-600 shadow-xs">
            <Wallet className="w-5 h-5 text-pastel-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Target Tabungan Nikah</h2>
            <p className="text-xs text-slate-500">Visualisasi progres tabungan bersama & porsi pasangan</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-pastel-500 hover:bg-pastel-600 text-white font-semibold text-xs transition-all shadow-pastel-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Setor Tabungan
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Chart & Stats Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut Chart with Center Label */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[240px]">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatRupiah(Number(value) || 0), "Nominal"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "12px",
                  border: "1px solid #BAE6FD",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Percentage Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">{percentage}%</span>
            <span className="text-[11px] font-semibold text-pastel-600 uppercase tracking-wider">
              Tercapai
            </span>
          </div>
        </div>

        {/* Breakdown Legend & Numbers */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="p-3.5 bg-pastel-50/70 rounded-2xl border border-sky-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">Terkumpul Saat Ini</span>
              <span className="font-extrabold text-slate-800">{formatRupiah(totalCollected)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Target Total Anggaran</span>
              <span className="font-bold text-slate-600">{formatRupiah(target)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kontribusi Masing-Masing:
            </p>
            {contributions.map((c, i) => {
              const share = ((c.amount / totalCollected) * 100).toFixed(1);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-pastel-50/50 transition-colors border border-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-xs font-semibold text-slate-700 truncate">{c.label}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800">{formatShortRupiah(c.amount)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-medium">({share}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-pastel-700 bg-sky-50 px-3 py-2 rounded-xl border border-sky-100">
            <TrendingUp className="w-3.5 h-3.5 shrink-0 text-pastel-500" />
            <span>Kekurangan: <strong>{formatRupiah(remaining)}</strong> menuju hari bahagia.</span>
          </div>
        </div>
      </div>

      {/* Modal Dialog for Depositing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-pastel-600">
                <Sparkles className="w-5 h-5 text-pastel-500" />
                <h3 className="font-bold text-slate-800 text-base">Tambah Setoran Tabungan Bersama</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sumber Setoran (Siapa yang Menyetor?)
                </label>
                <select
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                >
                  <option value="Calon Suami (Dwiki)">Calon Suami (Dwiki)</option>
                  <option value="Calon Istri (Sarah)">Calon Istri (Sarah)</option>
                  <option value="Bantuan Hibah Keluarga">Bantuan Hibah Keluarga</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nominal Setoran (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 5000000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan / Sumber Gaji (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tabungan Gaji Oktober 2026"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-pastel-500 hover:bg-pastel-600 text-white text-xs font-bold shadow-pastel-sm"
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
