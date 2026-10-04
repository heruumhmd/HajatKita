"use client";

import React, { useState } from "react";
import { GitFork, Clock, User, Phone, MapPin, Printer, Plus, Share2 } from "lucide-react";
import { mockRundown } from "@/lib/mock-data";
import { RundownItem } from "@/types";

export default function RundownPage() {
  const [items] = useState<RundownItem[]>(mockRundown);
  const [filterPhase, setFilterPhase] = useState<string>("ALL");

  const filteredItems = items.filter(
    (i) => filterPhase === "ALL" || i.phase === filterPhase
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <GitFork className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Alur Pernikahan & Rundown Hari H
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Jadwal pelaksanaan jam per jam, pembagian tugas panitia keluarga, dan kontak darurat PIC
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-500 hover:bg-pastel-600 text-white font-bold text-xs shadow-pastel-sm transition-all self-start md:self-center"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / PDF untuk WO</span>
        </button>
      </div>

      {/* Phase Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {["ALL", "Akad Nikah", "Adat & Sungkeman", "Resepsi Siang"].map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => setFilterPhase(phase)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterPhase === phase
                ? "bg-pastel-500 text-white shadow-xs"
                : "bg-white text-slate-600 border border-sky-100 hover:bg-pastel-50"
            }`}
          >
            {phase === "ALL" ? "Semua Sesi Acara" : phase}
          </button>
        ))}
      </div>

      {/* Timeline Rundown Cards */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-sky-200">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="relative bg-white rounded-3xl p-5 border border-sky-100 shadow-pastel-sm hover:border-pastel-300 transition-all"
          >
            {/* Dot on timeline */}
            <span className="absolute -left-[27px] sm:-left-[35px] top-6 w-3.5 h-3.5 rounded-full bg-pastel-500 ring-4 ring-white shadow-xs" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-pastel-700 bg-pastel-100 px-2.5 py-1 rounded-lg border border-sky-200">
                  <Clock className="w-3.5 h-3.5" />
                  {item.startTime} - {item.endTime} WIB
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {item.phase}
                </span>
              </div>

              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-pastel-500" />
                {item.location}
              </span>
            </div>

            <h3 className="font-extrabold text-slate-800 text-base sm:text-lg mb-2">
              {item.activity}
            </h3>

            <div className="p-3 bg-pastel-50/60 rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <User className="w-4 h-4 text-pastel-600" />
                Penanggung Jawab (PIC): <strong>{item.picName}</strong>
              </span>

              <a
                href={`tel:${item.picPhone}`}
                className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{item.picPhone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
