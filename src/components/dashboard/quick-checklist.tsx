"use client";

import React, { useState } from "react";
import { CheckSquare, Check, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { mockChecklist } from "@/lib/mock-data";
import { ChecklistItem } from "@/types";

export function QuickChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(mockChecklist.slice(0, 4));

  const toggleTask = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "COMPLETED" ? "TODO" : "COMPLETED" }
          : item
      )
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-sky-100/90 shadow-pastel-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pastel-100 flex items-center justify-center text-pastel-600">
            <CheckSquare className="w-4 h-4 text-pastel-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Checklist Prioritas Pekan Ini</h3>
            <p className="text-[11px] text-slate-500">Tugas yang harus diselesaikan bersama pasangan</p>
          </div>
        </div>

        <Link
          href="/timeline"
          className="text-xs font-bold text-pastel-600 hover:text-pastel-700 flex items-center gap-1"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const isDone = item.status === "COMPLETED";

          return (
            <div
              key={item.id}
              onClick={() => toggleTask(item.id)}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isDone
                  ? "bg-slate-50/70 border-slate-200/80 opacity-70"
                  : "bg-white hover:bg-pastel-50/50 border-sky-100 shadow-xs"
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
                    <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                      KUA / Sipil
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-md border border-sky-100">
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
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
