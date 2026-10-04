"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Share2,
  DollarSign,
  MessageSquare,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { mockGuests, mockFamilyQuota } from "@/lib/mock-data";
import { GuestItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestItem[]>(mockGuests);
  const [activeTab, setActiveTab] = useState<"GUESTS" | "QUOTA" | "AMPLOP_LEDGER">("GUESTS");
  const [search, setSearch] = useState("");

  // Quota simulation state
  const [extraGuests, setExtraGuests] = useState(150);
  const costPerPax = mockFamilyQuota.costPerPax;
  const extraCost = extraGuests * costPerPax;

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalInvitedPax = guests.reduce((acc, curr) => acc + curr.pax, 0);
  const confirmedPax = guests
    .filter((g) => g.rsvpStatus === "CONFIRMED_ATTENDING")
    .reduce((acc, curr) => acc + curr.pax, 0);

  const totalEnvelopes = guests
    .filter((g) => g.envelopeAmount)
    .reduce((acc, curr) => acc + (curr.envelopeAmount || 0), 0);

  const generateWhatsAppMessage = (guest: GuestItem) => {
    const text = `Assalamu'alaikum Wr. Wb. / Salam Sejahtera\n\nKepada Yth. *${guest.name}*,\n\nDengan rasa syukur dan penuh kebahagiaan, kami bermaksud mengundang Bapak/Ibu/Sahabat untuk hadir dan memberikan doa restu pada pernikahan kami:\n\n*Dwiki Ramadhan & Sarah Amalia*\nSabtu, 19 Desember 2026\nGrand Ballroom Bandung\n\nDetail undangan digital & konfirmasi kehadiran (RSVP):\nhttps://hajatkita.vercel.app/invitation/dwiki-sarah\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila berkenan hadir.\n\nTerima kasih,\nDwiki & Sarah`;
    window.open(`https://wa.me/${guest.phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Users className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Tamu, Kuota 4 Pilar & Buku Amplop
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Kelola undangan, simulasi subsidi kuota orang tua, dan buku rekam utang sosial kondangan
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-sky-100 shadow-xs self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("GUESTS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "GUESTS" ? "bg-pastel-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Daftar Tamu & WA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("QUOTA")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "QUOTA" ? "bg-pastel-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Kuota 4 Pilar Ortu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AMPLOP_LEDGER")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "AMPLOP_LEDGER" ? "bg-pastel-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Buku Amplop
          </button>
        </div>
      </div>

      {/* View 1: DAFTAR TAMU & GENERATOR WA */}
      {activeTab === "GUESTS" && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Undangan Terdaftar</span>
              <p className="text-lg font-extrabold text-slate-800 mt-0.5">{guests.length} Undangan</p>
              <span className="text-[11px] text-pastel-600 font-semibold">{totalInvitedPax} Total Estimasi Pax</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Konfirmasi Hadir (RSVP)</span>
              <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{confirmedPax} Pax</p>
              <span className="text-[11px] text-emerald-700 font-semibold">Telah Terkonfirmasi</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Amplop & Tanda Kasih Masuk</span>
              <p className="text-lg font-extrabold text-slate-800 mt-0.5">{formatRupiah(totalEnvelopes)}</p>
              <span className="text-[11px] text-slate-500 font-semibold">Tercatat di Buku Kas</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama tamu undangan, instansi, atau relasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>
          </div>

          {/* Guest Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuests.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-3xl p-5 border border-sky-100 hover:border-pastel-300 shadow-pastel-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-pastel-100 text-pastel-700 px-2 py-0.5 rounded-lg border border-sky-200">
                      {g.category}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        g.rsvpStatus === "CONFIRMED_ATTENDING"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {g.rsvpStatus === "CONFIRMED_ATTENDING" ? "Hadir (RSVP)" : "Menunggu Konfirmasi"}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">{g.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pihak: <strong>{g.side === "GROOM" ? "Calon Suami" : g.side === "BRIDE" ? "Calon Istri" : "Kedua Mempelai"}</strong> • Jatah {g.pax} Pax
                  </p>

                  {g.envelopeAmount && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-medium">Amplop Diberikan:</span>
                      <strong className="text-emerald-900 font-black">{formatRupiah(g.envelopeAmount)}</strong>
                    </div>
                  )}

                  {g.giftDescription && (
                    <div className="mt-2 p-2 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800">
                      Kado Fisik: <strong>{g.giftDescription}</strong>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">{g.phone}</span>
                  <button
                    type="button"
                    onClick={() => generateWhatsAppMessage(g)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Kirim WA Personal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: KUOTA 4 PILAR ORTU (SOLUSI DRAMA TAMU) */}
      {activeTab === "QUOTA" && (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-pastel-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-lg font-extrabold text-slate-800">
              Family Quota & Parent Subsidy Simulator
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fitur inovatif untuk memecahkan perdebatan jumlah tamu antara pengantin dan orang tua. Kuota gedung dibagi adil ke dalam 4 pilar. Jika orang tua ingin menambah kuota di luar batas, sistem menghitung perkiraan tambahan biaya katering secara objektif.
            </p>
          </div>

          {/* 4-Pillar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <span className="text-xs text-sky-700 font-bold block mb-1">Jatah Calon Suami</span>
              <p className="text-2xl font-black text-sky-900">{mockFamilyQuota.groomQuota} Pax</p>
              <span className="text-[11px] text-sky-600">Teman kantor & sahabat</span>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <span className="text-xs text-sky-700 font-bold block mb-1">Jatah Calon Istri</span>
              <p className="text-2xl font-black text-sky-900">{mockFamilyQuota.brideQuota} Pax</p>
              <span className="text-[11px] text-sky-600">Teman kuliah & sahabat</span>
            </div>
            <div className="p-4 rounded-2xl bg-pastel-100 border border-pastel-300">
              <span className="text-xs text-pastel-800 font-bold block mb-1">Jatah Orang Tua Pria</span>
              <p className="text-2xl font-black text-pastel-900">{mockFamilyQuota.groomParentsQuota} Pax</p>
              <span className="text-[11px] text-pastel-700">Keluarga besar & relasi kerja</span>
            </div>
            <div className="p-4 rounded-2xl bg-pastel-100 border border-pastel-300">
              <span className="text-xs text-pastel-800 font-bold block mb-1">Jatah Orang Tua Wanita</span>
              <p className="text-2xl font-black text-pastel-900">{mockFamilyQuota.brideParentsQuota} Pax</p>
              <span className="text-[11px] text-pastel-700">Keluarga besar & rekan arisan</span>
            </div>
          </div>

          {/* Interactive Extra Guest Slider */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Simulasi Tambahan Tamu dari Orang Tua / Mertua
                </h4>
                <p className="text-xs text-slate-500">
                  Geser untuk melihat dampak biaya katering jika kuota ditambah
                </p>
              </div>
              <span className="text-sm font-black text-pastel-600 bg-white px-3 py-1 rounded-xl border border-sky-100">
                +{extraGuests} Tamu Ekstra
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={extraGuests}
              onChange={(e) => setExtraGuests(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 cursor-pointer"
            />

            <div className="p-4 bg-white rounded-2xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">
                  Kebutuhan Tambahan Biaya Katering & Souvenir:
                </span>
                <p className="text-xl font-black text-slate-800">{formatRupiah(extraCost)}</p>
                <span className="text-[11px] text-slate-400">
                  (Berdasarkan estimasi Rp {costPerPax.toLocaleString("id-ID")} per pax katering + souvenir)
                </span>
              </div>

              <div className="p-3 bg-pastel-50 rounded-xl border border-sky-100 text-xs text-pastel-800 max-w-sm">
                <strong>Saran Solutif:</strong> Biaya ekstra {formatRupiah(extraCost)} dapat disepakati untuk disubsidi mandiri oleh pihak orang tua yang menambah kuota.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: SOCIAL DEBT LEDGER (BUKU UTANG KONDANGAN) */}
      {activeTab === "AMPLOP_LEDGER" && (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-pastel-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
              Social Debt Ledger (Buku Balas Kondangan)
            </h2>
            <p className="text-xs text-slate-500">
              Di Indonesia, amplop kondangan hakikatnya adalah utang sosial. Catat di sini agar 3–10 tahun mendatang Anda tahu persis berapa yang harus dibalas saat mereka mengadakan hajatan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Nama Pemberi</th>
                  <th className="pb-3 px-3">Relasi / Pihak</th>
                  <th className="pb-3 px-3">Nominal / Kado</th>
                  <th className="pb-3 px-3">Tanggal Diterima</th>
                  <th className="pb-3 px-3 text-right">Status Balasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {guests
                  .filter((g) => g.envelopeAmount || g.giftDescription)
                  .map((g) => (
                    <tr key={g.id} className="hover:bg-pastel-50/50">
                      <td className="py-3 px-3 font-bold text-slate-800">{g.name}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {g.category} ({g.side === "GROOM" ? "Pihak Pria" : "Pihak Wanita"})
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        {g.envelopeAmount ? formatRupiah(g.envelopeAmount) : g.giftDescription}
                      </td>
                      <td className="py-3 px-3 text-slate-500">19 Des 2026</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          Belum Dibalas (Tersimpan)
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
