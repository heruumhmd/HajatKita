"use client";

import React, { useState } from "react";
import {
  MapPin,
  Check,
  Plus,
  Calendar,
  User,
  FileCheck2,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { ChecklistItem, TaskCategory } from "@/types";

export default function TimelinePage() {
  const { checklist, addChecklist, toggleChecklist, deleteChecklist, wedding, requireAuth } = useWedding();

  const [selectedTimeline, setSelectedTimeline] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("ADMINISTRASI_KUA");
  const [timelineTag, setTimelineTag] = useState("H-3 Bulan");
  const [assignedTo, setAssignedTo] = useState("Bersama");
  const [isOfficialKUA, setIsOfficialKUA] = useState(false);

  const completedCount = checklist.filter((i) => i.status === "COMPLETED").length;
  const progressPercent =
    checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const filteredItems = checklist.filter((item) => {
    const matchTimeline = selectedTimeline === "ALL" || item.timelineTag === selectedTimeline;
    const matchCat = filterCategory === "ALL" || item.category === filterCategory;
    return matchTimeline && matchCat;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addChecklist({
      title,
      description,
      category,
      timelineTag,
      status: "TODO",
      assignedTo,
      isOfficialKUA,
    });

    setIsModalOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <MapPin className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Peta Persiapan &amp; Roadmap Timeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Checklist terarah dari H-12 bulan, berkas legal KUA, hingga hari bahagia
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Progress Box */}
          <div id="tour-timeline-progress" className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs min-w-0 sm:min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-600">Kesiapan Checklist:</span>
              <span className="text-pastel-700 font-black font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-pastel-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {completedCount} dari {checklist.length} tugas selesai
            </span>
          </div>

          <button
            id="tour-timeline-add"
            type="button"
            onClick={() => {
              if (!requireAuth()) return;
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Filters Timeline Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["ALL", "H-12 Bulan", "H-6 Bulan", "H-3 Bulan", "H-2 Bulan", "H-1 Bulan", "Minggu H"].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTimeline(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedTimeline === tag
                    ? "bg-pastel-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tag === "ALL" ? "Semua Waktu" : tag}
              </button>
            )
          )}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="ADMINISTRASI_KUA">Birokrasi &amp; KUA</option>
          <option value="VENUE_CATERING">Venue &amp; Katering</option>
          <option value="BUSANA_MUA">Busana &amp; Rias Pengantin</option>
          <option value="UNDANGAN_SOUVENIR">Undangan &amp; Souvenir</option>
          <option value="DEKORASI">Dekorasi &amp; Panggung</option>
          <option value="DOKUMENTASI">Foto &amp; Video</option>
        </select>
      </div>

      {/* Checklist Task Items */}
      <div id="tour-timeline-list">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-subtle-sm space-y-3">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Belum Ada Tugas dalam Kategori Ini</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Buat tugas baru untuk persiapan H-12 hingga hari H.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!requireAuth()) return;
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tugas Pertama</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
          {filteredItems.map((item) => {
            const isDone = item.status === "COMPLETED";

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border transition-all shadow-subtle-sm flex items-start gap-4 ${
                  isDone
                    ? "border-emerald-200 bg-emerald-50/10 opacity-70"
                    : "border-slate-200/90 hover:border-pastel-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth()) return;
                    toggleChecklist(item.id);
                  }}
                  className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all shrink-0 mt-0.5 shadow-2xs ${
                    isDone
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-slate-300 hover:border-pastel-400 bg-white"
                  }`}
                  aria-label={`Tandai selesai: ${item.title}`}
                >
                  {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {item.isOfficialKUA && (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                        Legal KUA
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-pastel-800 bg-pastel-50 px-2 py-0.5 rounded-md border border-pastel-200">
                      {item.timelineTag}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 sm:ml-auto">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Penanggung Jawab: <strong className="text-slate-700">{item.assignedTo}</strong>
                    </span>
                  </div>

                  <h3
                    className={`font-bold text-sm sm:text-base leading-snug ${
                      isDone ? "line-through text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth()) return;
                    deleteChecklist(item.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                  title="Hapus Tugas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                Tambah Tugas Checklist Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tes Kesehatan Elsimil, Fitting Baju Akad"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rincian Instruksi / Catatan
                </label>
                <textarea
                  rows={2}
                  placeholder="Bawa fotokopi KTP, KK, dan pas foto 2x3 latar biru..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pastel-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Timeline Target
                  </label>
                  <select
                    value={timelineTag}
                    onChange={(e) => setTimelineTag(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="H-12 Bulan">H-12 Bulan</option>
                    <option value="H-6 Bulan">H-6 Bulan</option>
                    <option value="H-3 Bulan">H-3 Bulan</option>
                    <option value="H-2 Bulan">H-2 Bulan</option>
                    <option value="H-1 Bulan">H-1 Bulan</option>
                    <option value="Minggu H">Minggu Hari H</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Tugas
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="ADMINISTRASI_KUA">Administrasi KUA</option>
                    <option value="VENUE_CATERING">Venue &amp; Katering</option>
                    <option value="BUSANA_MUA">Busana &amp; Rias</option>
                    <option value="UNDANGAN_SOUVENIR">Undangan &amp; Souvenir</option>
                    <option value="DEKORASI">Dekorasi</option>
                    <option value="DOKUMENTASI">Foto &amp; Video</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIC / Yang Bertanggung Jawab
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="Bersama">Bersama</option>
                    <option value={`Suami (${wedding.groomName ? wedding.groomName.split(" ")[0] : "Heru"})`}>
                      Calon Suami ({wedding.groomName ? wedding.groomName.split(" ")[0] : "Heru"})
                    </option>
                    <option value={`Istri (${wedding.brideName ? wedding.brideName.split(" ")[0] : "Nurul"})`}>
                      Calon Istri ({wedding.brideName ? wedding.brideName.split(" ")[0] : "Nurul"})
                    </option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isKua"
                    checked={isOfficialKUA}
                    onChange={(e) => setIsOfficialKUA(e.target.checked)}
                    className="rounded text-pastel-600 focus:ring-pastel-300 cursor-pointer"
                  />
                  <label htmlFor="isKua" className="text-xs text-slate-700 font-bold cursor-pointer">
                    Syarat Resmi KUA / Sipil
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
