"use client";

import React from "react";
import { CheckSquare, Check, ArrowRight, User, Plus } from "lucide-react";
import Link from "next/link";
import { useWedding } from "@/context/wedding-context";
import { showToastSuccess, showToastInfo } from "@/lib/swal";

export function QuickChecklist() {
  const { checklist, toggleChecklist, requireAuth } = useWedding();
  const displayItems = checklist.slice(0, 5);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700">
            <CheckSquare className="w-4 h-4 text-pastel-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
              Checklist Tugas Prioritas
            </h3>
            <p className="text-[11px] text-slate-500">
              Tugas yang harus diselesaikan bersama pasangan
            </p>
          </div>
        </div>

        <Link
          href="/timeline"
          className="text-xs font-bold text-pastel-600 hover:text-pastel-700 flex items-center gap-1"
        >
          <span>Lihat Semua ({checklist.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {displayItems.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Belum ada checklist tugas aktif saat ini.
            </p>
            <Link
              href="/timeline"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buka Peta Persiapan &amp; Tambah Tugas</span>
            </Link>
          </div>
        ) : (
          displayItems.map((item) => {
            const isDone = item.status === "COMPLETED";

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!requireAuth()) return;
                  toggleChecklist(item.id);
                  if (!isDone) {
                    showToastSuccess(`Tugas selesai: "${item.title}"! 🎉`);
                  } else {
                    showToastInfo(`Status tugas dikembalikan: "${item.title}"`);
                  }
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isDone
                    ? "bg-slate-50/70 border-slate-200/80 opacity-60"
                    : "bg-white hover:bg-slate-50 border-slate-200 shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                    isDone
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-pastel-400 bg-white"
                  }`}
                  aria-label={`Tandai selesai: ${item.title}`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {item.isOfficialKUA && (
                      <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">
                        KUA / Sipil
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {item.timelineTag}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 ml-auto">
                      <User className="w-3 h-3 text-slate-400" />
                      {item.assignedTo}
                    </span>
                  </div>

                  <p
                    className={`text-xs font-bold leading-snug ${
                      isDone ? "line-through text-slate-400" : "text-slate-800"
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
