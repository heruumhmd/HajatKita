"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";
import { LifeSavingsCategory } from "@/types";

interface EmergencyFundCalculatorProps {
  onSetGoal: (category: LifeSavingsCategory, title: string, amount: number) => void;
}

export function EmergencyFundCalculator({ onSetGoal }: EmergencyFundCalculatorProps) {
  const [emgMonthlyExpense, setEmgMonthlyExpense] = useState("8500000");
  const [emgMultiplier, setEmgMultiplier] = useState("6");

  const emgCalculations = useMemo(() => {
    const monthly = Math.max(0, parseFloat(emgMonthlyExpense) || 0);
    const multiplier = Math.max(1, parseInt(emgMultiplier, 10) || 6);
    const totalTargetEmergency = monthly * multiplier;
    return {
      totalTargetEmergency,
      monthly,
      multiplier,
    };
  }, [emgMonthlyExpense, emgMultiplier]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Pengeluaran Rutin Bulanan Keluarga (Rp)
          </label>
          <input
            type="number"
            value={emgMonthlyExpense}
            onChange={(e) => setEmgMonthlyExpense(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
          />
          <span className="text-[11px] text-slate-500 font-medium">
            = {formatRupiah(parseFloat(emgMonthlyExpense) || 0)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Faktor Pengali Dana Darurat
          </label>
          <select
            value={emgMultiplier}
            onChange={(e) => setEmgMultiplier(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-pastel-500 outline-none bg-white"
          >
            <option value="3">3 Bulan (Pasangan baru, belum punya anak, 2 income)</option>
            <option value="6">6 Bulan (Standar ideal pasangan berkeluarga)</option>
            <option value="9">9 Bulan (1 anak, income tunggal)</option>
            <option value="12">12 Bulan (Pekerja lepas / freelancer / wirausaha)</option>
          </select>
        </div>
      </div>

      {/* Output Emergency */}
      <div className="lg:col-span-6 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-6 rounded-3xl border border-indigo-200/80 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
          Target Dana Darurat Ideal
        </span>

        <div className="space-y-3 text-xs divide-y divide-slate-100">
          <div className="flex justify-between py-1.5 bg-indigo-50/80 p-2.5 rounded-xl">
            <span className="font-extrabold text-indigo-900">
              Total Dana Darurat ({emgCalculations.multiplier}x Pengeluaran):
            </span>
            <span className="font-black font-mono text-indigo-800 text-base">
              {formatRupiah(emgCalculations.totalTargetEmergency)}
            </span>
          </div>
          <div className="text-[11px] text-slate-600 leading-relaxed pt-1">
            💡 Disarankan untuk menyimpan 20% di tabungan rekening operasional dan 80% di Reksadana Pasar Uang (RDPU) yang likuid tanpa biaya penarikan.
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onSetGoal(
              "DANA_DARURAT",
              `Dana Darurat Keluarga (${emgCalculations.multiplier} Bulan)`,
              Math.round(emgCalculations.totalTargetEmergency)
            )
          }
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Jadikan Target Dana Darurat ({formatShortRupiah(emgCalculations.totalTargetEmergency)})</span>
        </button>
      </div>
    </div>
  );
}
