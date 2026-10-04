"use client";

import React, { useState } from "react";
import { GitFork, Clock, User, Phone, MapPin, Printer, Plus, Trash2, Edit2 } from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { RundownItem } from "@/types";

export default function RundownPage() {
  const { rundown, addRundown, editRundown, deleteRundown, wedding, requireAuth } = useWedding();

  const [filterPhase, setFilterPhase] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RundownItem | null>(null);

  // Form State - Default empty for clean user input
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activity, setActivity] = useState("");
  const [picName, setPicName] = useState("");
  const [picPhone, setPicPhone] = useState("");
  const [location, setLocation] = useState("");
  const [phase, setPhase] = useState<RundownItem["phase"]>("Akad Nikah");

  const filteredItems = rundown.filter(
    (i) => filterPhase === "ALL" || i.phase === filterPhase
  );

  const handleOpenAdd = () => {
    if (!requireAuth()) return;
    setEditingItem(null);
    setStartTime("");
    setEndTime("");
    setActivity("");
    setPicName("");
    setPicPhone("");
    setLocation("");
    setPhase("Akad Nikah");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RundownItem) => {
    if (!requireAuth()) return;
    setEditingItem(item);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setActivity(item.activity);
    setPicName(item.picName);
    setPicPhone(item.picPhone);
    setLocation(item.location);
    setPhase(item.phase);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    if (editingItem) {
      editRundown({
        ...editingItem,
        startTime,
        endTime,
        activity,
        picName: picName || "Panitia Acara",
        picPhone: picPhone || "-",
        location: location || "Venue Utama",
        phase,
      });
    } else {
      addRundown({
        startTime,
        endTime,
        activity,
        picName: picName || "Panitia Acara",
        picPhone: picPhone || "-",
        location: location || "Venue Utama",
        phase,
      });
    }

    setIsModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <GitFork className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Alur Acara &amp; Rundown Hari H
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Jadwal pelaksanaan jam per jam, PIC keluarga, dan kontak darurat untuk WO
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs transition-colors w-full sm:w-auto"
          >
            <Printer className="w-4 h-4 text-pastel-600" />
            <span>Cetak Rundown / PDF</span>
          </button>

          <button
            id="tour-rundown-add"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* Phase Filter Bar */}
      <div id="tour-rundown-filter" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {["ALL", "Akad Nikah", "Adat & Sungkeman", "Resepsi Siang", "Resepsi Malam"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setFilterPhase(p)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterPhase === p
                ? "bg-pastel-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {p === "ALL" ? "Semua Sesi Acara" : p}
          </button>
        ))}
      </div>

      {/* Timeline Rundown Cards */}
      <div id="tour-rundown-items">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-subtle-sm space-y-3">
            <GitFork className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Belum Ada Agenda Rundown</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mulai susun jadwal prosesi akad nikah, make up, sungkeman adat, dan resepsi hari H.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Agenda Pertama</span>
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="relative bg-white rounded-3xl p-5 border border-slate-200/90 shadow-subtle-sm hover:border-pastel-300 transition-all space-y-3"
            >
              {/* Dot on timeline */}
              <span className="absolute -left-[27px] sm:-left-[35px] top-6 w-3.5 h-3.5 rounded-full bg-pastel-600 ring-4 ring-white shadow-xs" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-pastel-800 bg-pastel-50 px-2.5 py-1 rounded-lg border border-pastel-200">
                    <Clock className="w-3.5 h-3.5" />
                    {item.startTime} - {item.endTime} WIB
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.phase}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-pastel-600" />
                    {item.location}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-slate-400 hover:text-pastel-600 rounded-lg transition-colors"
                    title="Edit Agenda"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!requireAuth()) return;
                      deleteRundown(item.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {item.activity}
              </h3>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <User className="w-4 h-4 text-pastel-600" />
                  PIC: <strong>{item.picName}</strong>
                </span>

                {item.picPhone && item.picPhone !== "-" && (
                  <a
                    href={`https://wa.me/${item.picPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{item.picPhone}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Add / Edit Agenda Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {editingItem ? "Edit Agenda Hari H" : "Tambah Agenda Hari H"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Mulai (WIB) *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Selesai (WIB) *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kegiatan / Prosesi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ijab Qabul, Sungkeman, Ramah Tamah"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sesi / Fase Acara
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as any)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="Akad Nikah">Akad Nikah</option>
                    <option value="Adat & Sungkeman">Adat &amp; Sungkeman</option>
                    <option value="Resepsi Siang">Resepsi Siang</option>
                    <option value="Resepsi Malam">Resepsi Malam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lokasi / Ruangan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Meja Akad, Pelaminan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Penanggung Jawab (PIC)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mas Arya (WO) / Om Bambang"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Kontak / WA PIC
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={picPhone}
                    onChange={(e) => setPicPhone(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
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
                  {editingItem ? "Simpan Perubahan" : "Tambah Agenda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
