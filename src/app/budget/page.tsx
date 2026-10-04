"use client";

import React, { useState } from "react";
import { Wallet, PieChart as ChartIcon, Plus, ArrowUpRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { SavingDonutCard } from "@/components/dashboard/saving-donut-card";
import { FinancialGuardBanner } from "@/components/dashboard/financial-guard-banner";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  status: "LUNAS" | "DP_TERBAYAR" | "BELUM_BAYAR";
  vendor?: string;
}

const initialCategories: BudgetCategory[] = [
  { id: "b-1", name: "Venue & Gedung Ballroom", allocated: 28000000, spent: 28000000, status: "LUNAS", vendor: "Grand Ballroom Bandung" },
  { id: "b-2", name: "Katering Utama & Gubukan (500 Pax)", allocated: 42500000, spent: 20000000, status: "DP_TERBAYAR", vendor: "Salero Minang & Royal Catering" },
  { id: "b-3", name: "Rias Pengantin (MUA) & Busana Adat", allocated: 15000000, spent: 7500000, status: "DP_TERBAYAR", vendor: "Wardah Wedding Gallery" },
  { id: "b-4", name: "Dekorasi Pelaminan & Panggung Musik", allocated: 14000000, spent: 5000000, status: "DP_TERBAYAR", vendor: "Rustic Bloom Decoration" },
  { id: "b-5", name: "Foto & Video Dokumentasi (Cinematic)", allocated: 8500000, spent: 4000000, status: "DP_TERBAYAR", vendor: "Lensa Kenangan Visual" },
  { id: "b-6", name: "Souvenir & Undangan Cetak VIP", allocated: 4500000, spent: 2000000, status: "DP_TERBAYAR", vendor: "Creative Souvenir Jakarta" },
  { id: "b-7", name: "Biaya Administrasi KUA & PNBP", allocated: 600000, spent: 600000, status: "LUNAS", vendor: "KUA Coblong Kemenag" },
  { id: "b-8", name: "Dana Darurat / Buffer Cadangan (10%)", allocated: 6900000, spent: 0, status: "BELUM_BAYAR" },
];

export default function BudgetPage() {
  const [categories] = useState<BudgetCategory[]>(initialCategories);

  const totalAllocated = categories.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = categories.reduce((acc, curr) => acc + curr.spent, 0);
  const remainingBudget = totalAllocated - totalSpent;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Wallet className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Manajemen Budget & Tabungan Bersama
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Rencana alokasi keuangan nikah terarah, diagram lingkaran, dan proteksi boncos pasca-nikah
            </p>
          </div>
        </div>
      </div>

      {/* Saving Donut Chart Component */}
      <SavingDonutCard />

      {/* Financial Health Guard Banner */}
      <FinancialGuardBanner />

      {/* Category Expenses Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-pastel-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Rincian Pos Anggaran & Realisasi Pembayaran
            </h2>
            <p className="text-xs text-slate-500">
              Pantau status DP dan pelunasan setiap vendor agar tidak ada tagihan terlewat
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Realisasi Pengeluaran: </span>
            <span className="text-xs font-black text-pastel-600">
              {formatRupiah(totalSpent)} / {formatRupiah(totalAllocated)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Pos Kebutuhan</th>
                <th className="pb-3 px-3">Vendor Rekanan</th>
                <th className="pb-3 px-3">Alokasi Anggaran</th>
                <th className="pb-3 px-3">Telah Dibayar</th>
                <th className="pb-3 px-3">Sisa Tagihan</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {categories.map((cat) => {
                const sisa = cat.allocated - cat.spent;
                return (
                  <tr key={cat.id} className="hover:bg-pastel-50/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800">{cat.name}</td>
                    <td className="py-3 px-3 text-slate-600">{cat.vendor || "Dana Cadangan Mandiri"}</td>
                    <td className="py-3 px-3 font-bold text-slate-700">{formatRupiah(cat.allocated)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{formatRupiah(cat.spent)}</td>
                    <td className="py-3 px-3 font-bold text-slate-500">{formatRupiah(sisa)}</td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          cat.status === "LUNAS"
                            ? "bg-emerald-100 text-emerald-800"
                            : cat.status === "DP_TERBAYAR"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {cat.status === "LUNAS" ? "Lunas" : cat.status === "DP_TERBAYAR" ? "DP 50%" : "Belum Bayar"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
