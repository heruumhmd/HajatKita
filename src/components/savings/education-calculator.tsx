"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";
import { LifeSavingsCategory } from "@/types";

interface EducationCalculatorProps {
  onSetGoal: (category: LifeSavingsCategory, title: string, amount: number) => void;
}

export function EducationCalculator({ onSetGoal }: EducationCalculatorProps) {
  const [eduTargetStage, setEduTargetStage] = useState<"PERSALINAN" | "SD" | "SMP" | "SMA" | "KULIAH">("SD");
  const [eduCurrentAge, setEduCurrentAge] = useState("0");
  const [eduInflationRate, setEduInflationRate] = useState("10");
  const [eduPresentCost, setEduPresentCost] = useState("35000000");

  const eduCalculations = useMemo(() => {
    const currentAge = Math.max(0, parseInt(eduCurrentAge, 10) || 0);
    const presentCost = Math.max(0, parseFloat(eduPresentCost) || 0);
    const inflation = Math.max(0, parseFloat(eduInflationRate) || 10) / 100;

    let targetAge = 7;
    if (eduTargetStage === "PERSALINAN") targetAge = 1;
    if (eduTargetStage === "SD") targetAge = 7;
    if (eduTargetStage === "SMP") targetAge = 13;
    if (eduTargetStage === "SMA") targetAge = 16;
    if (eduTargetStage === "KULIAH") targetAge = 18;

    const yearsRemaining = Math.max(1, targetAge - currentAge);
    // Future Value: FV = PV * (1 + i)^n
    const futureCost = presentCost * Math.pow(1 + inflation, yearsRemaining);
    const monthlyNeeded = futureCost / (yearsRemaining * 12);

    return {
      yearsRemaining,
      futureCost,
      monthlyNeeded,
    };
  }, [eduCurrentAge, eduTargetStage, eduPresentCost, eduInflationRate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Jenjang Pendidikan yang Dituju
          </label>
          <select
            value={eduTargetStage}
            onChange={(e) => setEduTargetStage(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-pastel-500 outline-none bg-white"
          >
            <option value="PERSALINAN">Persalinan &amp; Aqiqah (Tahun 1)</option>
            <option value="SD">Uang Pangkal SD (Usia 7 Tahun)</option>
            <option value="SMP">Uang Pangkal SMP (Usia 13 Tahun)</option>
            <option value="SMA">Uang Pangkal SMA (Usia 16 Tahun)</option>
            <option value="KULIAH">Kuliah S1 (Usia 18 Tahun)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Usia Anak Saat Ini (Tahun)
            </label>
            <input
              type="number"
              value={eduCurrentAge}
              onChange={(e) => setEduCurrentAge(e.target.value)}
              placeholder="0 jika belum lahir"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Asumsi Inflasi Biaya (%/thn)
            </label>
            <input
              type="number"
              value={eduInflationRate}
              onChange={(e) => setEduInflationRate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Estimasi Biaya Jenjang Tersebut Saat Ini (Rp)
          </label>
          <input
            type="number"
            value={eduPresentCost}
            onChange={(e) => setEduPresentCost(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
          />
          <span className="text-[11px] text-slate-500 font-medium">
            = {formatRupiah(parseFloat(eduPresentCost) || 0)}
          </span>
        </div>
      </div>

      {/* Output Education */}
      <div className="lg:col-span-6 bg-gradient-to-br from-rose-50/70 via-white to-slate-50 p-6 rounded-3xl border border-rose-200/80 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
          Estimasi Biaya Masa Depan (FV)
        </span>

        <div className="space-y-3 text-xs divide-y divide-slate-100">
          <div className="flex justify-between py-1.5">
            <span className="text-slate-600">Sisa Waktu Menabung:</span>
            <span className="font-bold text-slate-900">{eduCalculations.yearsRemaining} Tahun</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-600">Biaya Standar Hari Ini:</span>
            <span className="font-bold font-mono text-slate-900">
              {formatRupiah(parseFloat(eduPresentCost) || 0)}
            </span>
          </div>
          <div className="flex justify-between py-1.5 bg-rose-50/80 p-2.5 rounded-xl">
            <span className="font-bold text-rose-900">
              Total Biaya Masa Depan (Terkena Inflasi {eduInflationRate}%):
            </span>
            <span className="font-black font-mono text-rose-800 text-sm">
              {formatRupiah(eduCalculations.futureCost)}
            </span>
          </div>
          <div className="flex justify-between py-1.5 bg-slate-100/70 p-2.5 rounded-xl">
            <span className="font-bold text-slate-800">Rekomendasi Nabung Bulanan:</span>
            <span className="font-black font-mono text-pastel-700 text-sm">
              {formatRupiah(eduCalculations.monthlyNeeded)} / bulan
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onSetGoal(
              "PENDIDIKAN_ANAK",
              `Dana Pendidikan (${eduTargetStage})`,
              Math.round(eduCalculations.futureCost)
            )
          }
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Jadikan Target Tabungan ({formatShortRupiah(eduCalculations.futureCost)})</span>
        </button>
      </div>
    </div>
  );
}
