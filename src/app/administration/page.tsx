"use client";

import React, { useState } from "react";
import { FileCheck2, CheckCircle2, Circle, AlertCircle, Info, ExternalLink, Download } from "lucide-react";

interface AdminStep {
  id: string;
  stepNumber: number;
  stageName: string;
  agency: string;
  estimatedDays: string;
  cost: string;
  requirements: { id: string; title: string; isDone: boolean; note?: string }[];
}

const initialSteps: AdminStep[] = [
  {
    id: "step-1",
    stepNumber: 1,
    stageName: "Pengurusan di RT, RW & Kelurahan / Desa",
    agency: "Kelurahan Domisili Catin",
    estimatedDays: "1 - 3 Hari Kerja",
    cost: "Gratis (Biaya Admin Desa)",
    requirements: [
      { id: "r1", title: "Surat Pengantar RT & RW setempat", isDone: true },
      { id: "r2", title: "Formulir N1 (Surat Pengantar Nikah dari Kelurahan)", isDone: true },
      { id: "r3", title: "Formulir N2 (Permohonan Kehendak Nikah)", isDone: true },
      { id: "r4", title: "Formulir N4 (Surat Persetujuan Calon Mempelai)", isDone: true },
      { id: "r5", title: "Fotokopi KTP, Kartu Keluarga (KK), dan Akta Kelahiran", isDone: true },
    ],
  },
  {
    id: "step-2",
    stepNumber: 2,
    stageName: "Pemeriksaan Kesehatan Catin Puskesmas & Elsimil BKKBN",
    agency: "Puskesmas Kecamatan & Aplikasi Elsimil",
    estimatedDays: "1 Hari",
    cost: "Gratis / Rp 20.000 (Lab Puskesmas)",
    requirements: [
      { id: "r6", title: "Pemeriksaan Fisik & Skrining Anemia (Kadar Hemoglobin)", isDone: true },
      { id: "r7", title: "Imunisasi Tetanus Toxoid (TT) bagi Calon Istri", isDone: true },
      { id: "r8", title: "Input data ke Aplikasi Elsimil BKKBN di smartphone", isDone: true },
      { id: "r9", title: "Download & Cetak Sertifikat Elsimil (Syarat Wajib KUA)", isDone: true },
    ],
  },
  {
    id: "step-3",
    stepNumber: 3,
    stageName: "Pendaftaran KUA & SIMKAH Kemenag",
    agency: "Kantor Urusan Agama (KUA)",
    estimatedDays: "Maksimal H-10 Hari Kerja Sebelum Akad",
    cost: "Rp 0 (di KUA jam kerja) / Rp 600.000 (di Luar KUA via Bank)",
    requirements: [
      { id: "r10", title: "Daftar Online di situs simkah4.kemenag.go.id", isDone: true },
      { id: "r11", title: "Pas foto latar belakang biru (2x3 = 4 lembar, 4x6 = 2 lembar)", isDone: false, note: "Pria berjas, wanita berkerudung/busana sopan" },
      { id: "r12", title: "Surat Rekomendasi Nikah (Jika Numpang Nikah beda kecamatan)", isDone: false },
      { id: "r13", title: "Bayar Kode Billing PNBP Rp 600.000 di Bank (Jika nikah di luar KUA)", isDone: false },
    ],
  },
  {
    id: "step-4",
    stepNumber: 4,
    stageName: "Bimbingan Perkawinan (Bimwin) & Finalisasi Wali",
    agency: "KUA & Penghulu",
    estimatedDays: "2 Hari Kursus",
    cost: "Gratis",
    requirements: [
      { id: "r14", title: "Mengikuti Bimbingan Perkawinan (Bimwin) Tatap Muka", isDone: false },
      { id: "r15", title: "Konfirmasi Kehadiran Wali Nikah Sah (Ayah Kandung / Wali Hakim)", isDone: false },
      { id: "r16", title: "Penetapan 2 Orang Saksi Akad Nikah (Pria & Wanita)", isDone: false },
    ],
  },
];

export default function AdministrationPage() {
  const [steps, setSteps] = useState<AdminStep[]>(initialSteps);

  const toggleReq = (stepId: string, reqId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              requirements: step.requirements.map((r) =>
                r.id === reqId ? { ...r, isDone: !r.isDone } : r
              ),
            }
          : step
      )
    );
  };

  const totalReqs = steps.flatMap((s) => s.requirements);
  const doneReqs = totalReqs.filter((r) => r.isDone).length;
  const percentDone = Math.round((doneReqs / totalReqs.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <FileCheck2 className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Persiapan Administrasi KUA & Sipil Indonesia
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Panduan birokrasi step-by-step: Surat N1-N4, Catin Puskesmas, Elsimil BKKBN, dan SIMKAH Kemenag
            </p>
          </div>
        </div>

        <div className="bg-white px-4 py-3 rounded-2xl border border-sky-100 shadow-xs min-w-[180px]">
          <span className="text-xs text-slate-500 font-bold block mb-1">Kemajuan Dokumen:</span>
          <div className="flex items-center justify-between text-xs font-black mb-1">
            <span className="text-pastel-600">{doneReqs} dari {totalReqs.length} Syarat</span>
            <span className="text-slate-800">{percentDone}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentDone}%` }}
            />
          </div>
        </div>
      </div>

      {/* Official Alert Box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Peraturan Kementerian Agama RI:</strong> Pendaftaran kehendak nikah di KUA wajib diselesaikan paling lambat <strong>10 hari kerja</strong> sebelum tanggal akad. Jika kurang dari jangka waktu tersebut, catin wajib menyertakan surat dispensasi dari Kantor Kecamatan.
        </div>
      </div>

      {/* Steps Accordion Cards */}
      <div className="space-y-4">
        {steps.map((step) => {
          const stepDone = step.requirements.every((r) => r.isDone);

          return (
            <div
              key={step.id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-pastel-sm ${
                stepDone ? "border-emerald-200" : "border-sky-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-pastel-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {step.stepNumber}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{step.stageName}</h3>
                    <p className="text-xs text-slate-500">
                      Instansi: <strong>{step.agency}</strong> • Estimasi: {step.estimatedDays}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-pastel-700 bg-pastel-50 px-3 py-1 rounded-xl border border-sky-100 self-start sm:self-center">
                  Biaya: {step.cost}
                </span>
              </div>

              {/* Requirement Checkboxes */}
              <div className="space-y-2.5">
                {step.requirements.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => toggleReq(step.id, req.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                      req.isDone
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-slate-50/70 hover:bg-pastel-50/50 border-slate-100"
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                        req.isDone
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 hover:border-pastel-400 bg-white"
                      }`}
                      aria-label={req.title}
                    >
                      {req.isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold ${
                          req.isDone ? "line-through text-slate-400" : "text-slate-800"
                        }`}
                      >
                        {req.title}
                      </p>
                      {req.note && <p className="text-[11px] text-amber-700 mt-0.5">{req.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
