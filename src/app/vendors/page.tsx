"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, Clock, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface VendorMilestone {
  id: string;
  vendorName: string;
  serviceType: string;
  totalContract: number;
  stages: {
    name: string;
    percentage: number;
    amount: number;
    isPaid: boolean;
    condition: string;
  }[];
}

const initialMilestones: VendorMilestone[] = [
  {
    id: "vm-1",
    vendorName: "Grand Ballroom Bandung",
    serviceType: "Gedung / Venue",
    totalContract: 28000000,
    stages: [
      { name: "DP Booking Tanggal", percentage: 20, amount: 5600000, isPaid: true, condition: "Menerima kwitansi & surat lock tanggal" },
      { name: "Termin 2 (Technical Meeting)", percentage: 40, amount: 11200000, isPaid: true, condition: "Layout panggung & loading dock disepakati" },
      { name: "Pelunasan H-14", percentage: 40, amount: 11200000, isPaid: true, condition: "Final briefing bersama WO" },
    ],
  },
  {
    id: "vm-2",
    vendorName: "Salero Minang & Royal Catering",
    serviceType: "Katering Utama & Gubukan",
    totalContract: 42500000,
    stages: [
      { name: "DP 20%", percentage: 20, amount: 8500000, isPaid: true, condition: "Uji rasa (food testing) disetujui" },
      { name: "Termin 2 (H-30)", percentage: 40, amount: 17000000, isPaid: false, condition: "Finalisasi jumlah porsi & menu gubukan" },
      { name: "Pelunasan H+1 Pasca Acara", percentage: 40, amount: 17000000, isPaid: false, condition: "Setelah makanan tersaji sempurna di hari H" },
    ],
  },
  {
    id: "vm-3",
    vendorName: "Lensa Kenangan Visual",
    serviceType: "Foto & Video Sinematik",
    totalContract: 8500000,
    stages: [
      { name: "DP Awal", percentage: 30, amount: 2550000, isPaid: true, condition: "Kontrak ditandatangani" },
      { name: "Hari H Pelaksanaan", percentage: 40, amount: 3400000, isPaid: false, condition: "Kru hadir di lokasi & dokumentasi berjalan" },
      { name: "Pelunasan Pasca Penyerahan Master", percentage: 30, amount: 2550000, isPaid: false, condition: "Teaser video & album fisik diserahkan" },
    ],
  },
];

export default function VendorsPage() {
  const [milestones] = useState<VendorMilestone[]>(initialMilestones);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Proteksi Vendor & Termin Aman (Anti-Scam)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Mitigasi risiko penipuan WO dengan aturan termin berbasis bukti kerja riil
            </p>
          </div>
        </div>
      </div>

      {/* Anti-Scam Golden Rules Banner */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-3xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-pastel-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-pastel-800">Prinsip Aman Pembayaran Hajat Kita:</strong> Jangan pernah melunasi 100% biaya katering atau dokumentasi jauh sebelum hari H. Selalu sisakan minimal <strong>20% - 30%</strong> yang baru dilunasi pada H+1 setelah pekerjaan selesai secara memuaskan.
        </div>
      </div>

      {/* Vendor List Cards */}
      <div className="space-y-4">
        {milestones.map((vm) => (
          <div key={vm.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-pastel-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {vm.serviceType}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mt-1">{vm.vendorName}</h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Nilai Kontrak:</span>
                <p className="text-sm font-black text-slate-800">{formatRupiah(vm.totalContract)}</p>
              </div>
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {vm.stages.map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    stage.isPaid
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{stage.name}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        stage.isPaid ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {stage.isPaid ? "Terbayar" : "Tertahan"}
                    </span>
                  </div>

                  <p className="text-sm font-black text-slate-900 mt-1">{formatRupiah(stage.amount)}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    Syarat: <em>{stage.condition}</em>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
