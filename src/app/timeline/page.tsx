"use client";

import React, { useState } from "react";
import { MapPin, Check, Plus, Calendar, User, FileCheck2, Filter } from "lucide-react";
import { mockChecklist } from "@/lib/mock-data";
import { ChecklistItem } from "@/types";

export default function TimelinePage() {
  const [items, setItems] = useState<ChecklistItem[]>(mockChecklist);
  const [selectedTimeline, setSelectedTimeline] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const toggleTask = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "COMPLETED" ? "TODO" : "COMPLETED" }
          : item
      )
    );
  };

  const completedCount = items.filter((i) => i.status === "COMPLETED").length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const filteredItems = items.filter((item) => {
    const matchTimeline = selectedTimeline === "ALL" || item.timelineTag === selectedTimeline;
    const matchCat = filterCategory === "ALL" || item.category === filterCategory;
    return matchTimeline && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <MapPin className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Peta Persiapan & Roadmap Timeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Checklist terarah dari H-12 bulan, berkas KUA, hingga hari bahagia
            </p>
          </div>
        </div>

        {/* Overall Progress Ring/Bar */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-sky-100 shadow-xs min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-600">Kesiapan Checklist:</span>
            <span className="text-pastel-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-pastel-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {completedCount} dari {items.length} tugas selesai
          </span>
        </div>
      </div>

      {/* Filters Timeline Bar */}
      <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["ALL", "H-6 Bulan", "H-3 Bulan", "H-2 Bulan", "H-1 Bulan"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTimeline(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTimeline === tag
                  ? "bg-pastel-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-pastel-50 hover:text-pastel-700"
              }`}
            >
              {tag === "ALL" ? "Semua Waktu" : tag}
            </button>
          ))}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pastel-300"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="ADMINISTRASI_KUA">Birokrasi & KUA</option>
          <option value="VENUE_CATERING">Venue & Katering</option>
          <option value="BUSANA_MUA">Busana & Rias Pengantin</option>
          <option value="UNDANGAN_SOUVENIR">Undangan & Souvenir</option>
        </select>
      </div>

      {/* Checklist Task Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isDone = item.status === "COMPLETED";

          return (
            <div
              key={item.id}
              onClick={() => toggleTask(item.id)}
              className={`flex items-start gap-4 p-4 rounded-3xl border transition-all cursor-pointer ${
                isDone
                  ? "bg-slate-50/70 border-slate-200/80 opacity-75"
                  : "bg-white hover:bg-pastel-50/40 border-sky-100 shadow-pastel-sm pastel-glow-hover"
              }`}
            >
              <button
                type="button"
                className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                    : "border-slate-300 hover:border-pastel-400 bg-white"
                }`}
                aria-label={`Toggle: ${item.title}`}
              >
                {isDone && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {item.isOfficialKUA && (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3" />
                      Wajib KUA / Sipil
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-pastel-700 bg-pastel-100 px-2.5 py-0.5 rounded-lg border border-sky-200/70">
                    {item.timelineTag}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 ml-auto">
                    <User className="w-3.5 h-3.5 text-pastel-500" />
                    PIC: {item.assignedTo}
                  </span>
                </div>

                <h3
                  className={`text-sm sm:text-base font-extrabold leading-snug ${
                    isDone ? "line-through text-slate-400" : "text-slate-800"
                  }`}
                >
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
