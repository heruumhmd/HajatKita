"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";
import { LifeSavingsCategory } from "@/types";

interface HajjCalculatorProps {
  onSetGoal: (category: LifeSavingsCategory, title: string, amount: number) => void;
}

export function HajjCalculator({ onSetGoal }: HajjCalculatorProps) {
  const [hajjType, setHajjType] = useState<"HAJI_REGULER" | "HAJI_PLUS" | "UMROH_DUO">("HAJI_REGULER");
  const [hajjPersons, setHajjPersons] = useState("2");

  const hajjCalculations = useMemo(() => {
    const persons = Math.max(1, parseInt(hajjPersons, 10) || 2);
    let porsiPerPerson = 25000000;
    let totalEstPelunasanPerPerson = 55000000;

    if (hajjType === "HAJI_PLUS") {
      porsiPerPerson = 65000000;
      totalEstPelunasanPerPerson = 180000000;
    } else if (hajjType === "UMROH_DUO") {
      porsiPerPerson = 35000000;
      totalEstPelunasanPerPerson = 35000000;
    }

    const totalSetoranAwal = porsiPerPerson * persons;
    const totalEstBiaya = totalEstPelunasanPerPerson * persons;

    return {
      totalSetoranAwal,
      totalEstBiaya,
      porsiPerPerson,
      persons,
    };
  }, [hajjType, hajjPersons]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Jenis Ibadah ke Tanah Suci
          </label>
          <select
            value={hajjType}
            onChange={(e) => setHajjType(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-pastel-500 outline-none bg-white"
          >
            <option value="HAJI_REGULER">Haji Reguler Kemenag (Setoran Awal Rp 25 Jt)</option>
            <option value="HAJI_PLUS">Haji Khusus / Plus / Furoda</option>
            <option value="UMROH_DUO">Paket Umroh Honeymoon Berdua</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Jumlah Jamaah (Orang)
          </label>
          <input
            type="number"
            value={hajjPersons}
            onChange={(e) => setHajjPersons(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
          />
        </div>
      </div>

      {/* Hajj Output */}
      <div className="lg:col-span-6 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 p-6 rounded-3xl border border-teal-200/80 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
          Target Tabungan Porsi Haji / Umroh
        </span>

        <div className="space-y-3 text-xs divide-y divide-slate-100">
          <div className="flex justify-between py-1.5 bg-teal-50/80 p-2.5 rounded-xl">
            <span className="font-extrabold text-teal-900">
              Target Setoran Awal BPIH (Dapat Nomor Porsi):
            </span>
            <span className="font-black font-mono text-teal-800 text-sm">
              {formatRupiah(hajjCalculations.totalSetoranAwal)}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-600">Estimasi Pelunasan H-Keberangkatan:</span>
            <span className="font-bold font-mono text-slate-900">
              {formatRupiah(hajjCalculations.totalEstBiaya)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onSetGoal(
              "HAJI_UMROH",
              `Setoran Awal Porsi ${hajjType === "UMROH_DUO" ? "Umroh" : "Haji"} (${hajjCalculations.persons} Orang)`,
              Math.round(hajjCalculations.totalSetoranAwal)
            )
          }
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Jadikan Target Setoran Awal ({formatShortRupiah(hajjCalculations.totalSetoranAwal)})</span>
        </button>
      </div>
    </div>
  );
}
