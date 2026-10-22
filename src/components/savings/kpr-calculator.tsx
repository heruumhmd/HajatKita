"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";
import { LifeSavingsCategory } from "@/types";

interface KprCalculatorProps {
  onSetGoal: (category: LifeSavingsCategory, title: string, amount: number) => void;
}

export function KprCalculator({ onSetGoal }: KprCalculatorProps) {
  const [kprHomePrice, setKprHomePrice] = useState("650000000");
  const [kprDpPercent, setKprDpPercent] = useState("15");
  const [kprTenor, setKprTenor] = useState("15");
  const [kprInterestRate, setKprInterestRate] = useState("7.25");
  const [kprJointIncome, setKprJointIncome] = useState("18000000");

  const kprCalculations = useMemo(() => {
    const price = Math.max(0, parseFloat(kprHomePrice) || 0);
    const dpPercent = Math.max(0, Math.min(100, parseFloat(kprDpPercent) || 0));
    const tenor = Math.max(1, parseInt(kprTenor, 10) || 15);
    const rate = Math.max(0, parseFloat(kprInterestRate) || 7.25);
    const income = Math.max(0, parseFloat(kprJointIncome) || 0);

    const dpNominal = (price * dpPercent) / 100;
    const loanPrincipal = Math.max(0, price - dpNominal);
    const estimatedExtraFees = loanPrincipal * 0.055;
    const totalCashNeededForDP = dpNominal + estimatedExtraFees;

    const monthlyRate = rate / 100 / 12;
    const totalMonths = tenor * 12;
    let monthlyInstallment = 0;
    if (loanPrincipal > 0 && monthlyRate > 0) {
      monthlyInstallment =
        (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else if (loanPrincipal > 0) {
      monthlyInstallment = loanPrincipal / totalMonths;
    }

    const dsr = income > 0 ? ((monthlyInstallment / income) * 100).toFixed(1) : "0";
    const dsrNum = parseFloat(dsr);
    let dsrStatus: "SEHAT" | "WASPADA" | "BERBAHAYA" = "SEHAT";
    if (dsrNum > 40) {
      dsrStatus = "BERBAHAYA";
    } else if (dsrNum > 30) {
      dsrStatus = "WASPADA";
    }

    return {
      price,
      dpNominal,
      estimatedExtraFees,
      totalCashNeededForDP,
      loanPrincipal,
      monthlyInstallment,
      dsr,
      dsrStatus,
    };
  }, [kprHomePrice, kprDpPercent, kprTenor, kprInterestRate, kprJointIncome]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Estimasi Harga Properti Rumah (Rp)
          </label>
          <input
            type="number"
            value={kprHomePrice}
            onChange={(e) => setKprHomePrice(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
          />
          <span className="text-[11px] text-slate-500 font-medium">
            = {formatRupiah(parseFloat(kprHomePrice) || 0)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Uang Muka (DP %)
            </label>
            <input
              type="number"
              value={kprDpPercent}
              onChange={(e) => setKprDpPercent(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tenor Pinjaman (Tahun)
            </label>
            <select
              value={kprTenor}
              onChange={(e) => setKprTenor(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-pastel-500 outline-none bg-white"
            >
              <option value="5">5 Tahun (60 Bln)</option>
              <option value="10">10 Tahun (120 Bln)</option>
              <option value="15">15 Tahun (180 Bln)</option>
              <option value="20">20 Tahun (240 Bln)</option>
              <option value="25">25 Tahun (300 Bln)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Suku Bunga / Margin (%/tahun)
            </label>
            <input
              type="number"
              step="0.05"
              value={kprInterestRate}
              onChange={(e) => setKprInterestRate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Total Gaji Berdua (Joint Income)
            </label>
            <input
              type="number"
              value={kprJointIncome}
              onChange={(e) => setKprJointIncome(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPR Output Card */}
      <div className="lg:col-span-6 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-6 rounded-3xl border border-emerald-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Hasil Simulasi KPR
          </span>
          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              kprCalculations.dsrStatus === "SEHAT"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : kprCalculations.dsrStatus === "WASPADA"
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-rose-100 text-rose-800 border-rose-300"
            }`}
          >
            DSR {kprCalculations.dsr}% ({kprCalculations.dsrStatus})
          </span>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 text-xs">
          <div className="flex justify-between py-1.5">
            <span className="text-slate-600">Nominal Uang Muka (DP Murni):</span>
            <span className="font-bold font-mono text-slate-900">
              {formatRupiah(kprCalculations.dpNominal)}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-600">Est. BPHTB, AJB, Notaris &amp; Provisi (5.5%):</span>
            <span className="font-bold font-mono text-slate-900">
              {formatRupiah(kprCalculations.estimatedExtraFees)}
            </span>
          </div>
          <div className="flex justify-between py-1.5 bg-emerald-50/80 p-2 rounded-xl">
            <span className="font-extrabold text-emerald-900">
              Total Cash Wajib Ditabung (DP + Biaya):
            </span>
            <span className="font-black font-mono text-emerald-800 text-sm">
              {formatRupiah(kprCalculations.totalCashNeededForDP)}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-600">Plafon Pinjaman Bank:</span>
            <span className="font-bold font-mono text-slate-900">
              {formatRupiah(kprCalculations.loanPrincipal)}
            </span>
          </div>
          <div className="flex justify-between py-1.5 bg-slate-100/70 p-2 rounded-xl">
            <span className="font-bold text-slate-800">Estimasi Cicilan per Bulan:</span>
            <span className="font-black font-mono text-pastel-700 text-sm">
              {formatRupiah(kprCalculations.monthlyInstallment)} / bulan
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() =>
              onSetGoal(
                "RUMAH_KPR",
                `DP Rumah Pertama & Biaya KPR (${kprTenor} Thn)`,
                Math.round(kprCalculations.totalCashNeededForDP)
              )
            }
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Jadikan Target Tabungan ({formatShortRupiah(kprCalculations.totalCashNeededForDP)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
