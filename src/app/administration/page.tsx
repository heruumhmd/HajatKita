"use client";

import React from "react";
import { FileCheck2, CheckCircle2, Circle, AlertCircle, Info, ExternalLink, Download } from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { showToastSuccess, showToastInfo } from "@/lib/swal";

export default function AdministrationPage() {
  const { adminSteps, toggleAdminRequirement, requireAuth } = useWedding();

  const totalReqs = adminSteps.flatMap((s) => s.requirements);
  const doneReqs = totalReqs.filter((r) => r.isDone).length;
  const percentDone = totalReqs.length > 0 ? Math.round((doneReqs / totalReqs.length) * 100) : 0;

  const handleToggleReq = (stepId: string, req: { id: string; title: string; isDone: boolean }) => {
    if (!requireAuth()) return;
    toggleAdminRequirement(stepId, req.id);
    const willBeDone = !req.isDone;
    if (willBeDone) {
      showToastSuccess(`Syarat KUA terpenuhi: "${req.title}"! ✅`);
    } else {
      showToastInfo(`Status berkas: "${req.title}" dikembalikan`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <FileCheck2 className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Birokrasi &amp; Administrasi Resmi KUA
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Panduan legalitas pernikahan dari tingkat RT/RW, Puskesmas/Elsimil, hingga pendaftaran Kemenag
            </p>
          </div>
        </div>

        {/* Overall Progress Badge */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs min-w-0 sm:min-w-[200px] w-full sm:w-auto self-stretch sm:self-auto">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-600">Kelengkapan Berkas:</span>
            <span className="text-pastel-700 font-black font-mono">{percentDone}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-pastel-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentDone}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {doneReqs} dari {totalReqs.length} persyaratan sah
          </span>
        </div>
      </div>

      {/* Official Government Portals Quick Links */}
      <div id="tour-admin-portals" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://simkah4.kemenag.go.id"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-pastel-400 transition-all shadow-subtle-sm flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Kementerian Agama RI
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-pastel-700 transition-colors">
              Portal SIMKAH 4.0 (Daftar Nikah Online)
            </h4>
            <p className="text-[11px] text-slate-500">simkah4.kemenag.go.id</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pastel-600 transition-colors shrink-0" />
        </a>

        <a
          href="https://elsimil.bkkbn.go.id"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-pastel-400 transition-all shadow-subtle-sm flex items-center justify-between group"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              BKKBN Official
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-pastel-700 transition-colors">
              Aplikasi Elsimil (Elektronik Siap Nikah)
            </h4>
            <p className="text-[11px] text-slate-500">elsimil.bkkbn.go.id</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pastel-600 transition-colors shrink-0" />
        </a>
      </div>

      {/* 4 Government Administrative Steps */}
      <div id="tour-admin-steps" className="space-y-4">
        {adminSteps.map((step) => {
          const stepDone = step.requirements.every((r) => r.isDone);

          return (
            <div
              key={step.id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-subtle-sm space-y-4 ${
                stepDone ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200/90"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-pastel-50 border border-pastel-200 font-bold font-mono text-pastel-700 flex items-center justify-center text-sm shadow-xs">
                    {step.stepNumber}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-serif">
                      {step.stageName}
                    </h3>
                    <p className="text-xs text-slate-500">Instansi: {step.agency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                    Estimasi: {step.estimatedDays}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-pastel-50 text-pastel-800 font-bold border border-pastel-200">
                    Biaya: {step.cost}
                  </span>
                </div>
              </div>

              {/* Requirement Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {step.requirements.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => handleToggleReq(step.id, req)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      req.isDone
                        ? "bg-emerald-50/40 border-emerald-200 text-slate-800"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 mt-0.5 ${
                        req.isDone
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-label={req.title}
                    >
                      {req.isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-semibold block ${req.isDone ? "line-through text-slate-400" : ""}`}>
                        {req.title}
                      </span>
                      {req.note && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{req.note}</span>
                      )}
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
