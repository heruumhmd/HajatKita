"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Trash2,
  Edit2,
  Gift,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { GuestItem, GuestSide, RSVPStatus } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { showToastSuccess, showToastInfo, showConfirmDialog } from "@/lib/swal";

function GuestsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as "GUESTS" | "QUOTA" | "AMPLOP_LEDGER" | null;

  const {
    guests,
    addGuest,
    editGuest,
    deleteGuest,
    recordEnvelope,
    updateGuestRSVP,
    familyQuota,
    updateFamilyQuota,
    wedding,
    requireAuth,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<"GUESTS" | "QUOTA" | "AMPLOP_LEDGER">(
    tabParam || "GUESTS"
  );
  const [search, setSearch] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [recordingEnvelopeId, setRecordingEnvelopeId] = useState<string | null>(null);
  const [envelopeInput, setEnvelopeInput] = useState("");
  const [giftInput, setGiftInput] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [side, setSide] = useState<GuestSide>("BOTH");
  const [category, setCategory] = useState("Sahabat");
  const [pax, setPax] = useState(2);
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>("PENDING");

  // Sync tab with URL
  const switchTab = (tab: "GUESTS" | "QUOTA" | "AMPLOP_LEDGER") => {
    setActiveTab(tab);
    router.replace(`/guests?tab=${tab}`);
  };

  useEffect(() => {
    if (tabParam && (tabParam === "GUESTS" || tabParam === "QUOTA" || tabParam === "AMPLOP_LEDGER")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Quota simulation state
  const costPerPax = familyQuota.costPerPax || 85000;
  const totalAllocatedQuota =
    familyQuota.groomQuota +
    familyQuota.brideQuota +
    familyQuota.groomParentsQuota +
    familyQuota.brideParentsQuota;
  const quotaDifference = totalAllocatedQuota - familyQuota.venueCapacity;

  const filteredGuests = guests.filter(
    (g) =>
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

  const handleOpenAdd = () => {
    if (!requireAuth()) return;
    setEditingGuest(null);
    setName("");
    setPhone("");
    setSide("BOTH");
    setCategory("Sahabat");
    setPax(2);
    setRsvpStatus("PENDING");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (g: GuestItem) => {
    if (!requireAuth()) return;
    setEditingGuest(g);
    setName(g.name);
    setPhone(g.phone);
    setSide(g.side);
    setCategory(g.category);
    setPax(g.pax);
    setRsvpStatus(g.rsvpStatus);
    setIsAddModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingGuest) {
      editGuest({
        ...editingGuest,
        name,
        phone,
        side,
        category,
        pax,
        rsvpStatus,
      });
      showToastSuccess(`Data tamu "${name}" berhasil diperbarui! ✨`);
    } else {
      addGuest({
        name,
        phone: phone || "-",
        side,
        category,
        pax,
        rsvpStatus,
      });
      showToastSuccess(`Tamu "${name}" berhasil ditambahkan! 👥`);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteGuest = async (guest: GuestItem) => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Tamu Undangan?",
      text: `Apakah Anda yakin ingin menghapus data undangan "${guest.name}"?`,
      confirmButtonText: "Ya, Hapus",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    deleteGuest(guest.id);
    showToastSuccess(`Tamu "${guest.name}" berhasil dihapus`);
  };

  const handleSaveEnvelope = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingEnvelopeId) return;
    const amount = parseFloat(envelopeInput) || 0;
    recordEnvelope(recordingEnvelopeId, amount, giftInput);
    showToastSuccess("Catatan amplop & kado berhasil disimpan! 💌");
    setRecordingEnvelopeId(null);
    setEnvelopeInput("");
    setGiftInput("");
  };

  const generateWhatsAppMessage = (guest: GuestItem) => {
    showToastInfo(`Membuka WhatsApp untuk mengirim undangan ke ${guest.name}... 💬`);
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const inviteUrl = `${origin}/invitation/${wedding.slug || "undangan-kami"}`;

    const formattedDate = wedding.weddingDate
      ? new Date(wedding.weddingDate).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Segera Diumumkan";

    const groomFullName = wedding.groomName || "Mempelai Pria";
    const brideFullName = wedding.brideName || "Mempelai Wanita";
    const closingSignature = wedding.groomName && wedding.brideName
      ? `${wedding.groomName.split(" ")[0]} & ${wedding.brideName.split(" ")[0]}`
      : "Kedua Mempelai";

    const text = `Assalamu'alaikum Wr. Wb. / Salam Sejahtera\n\nKepada Yth. *${guest.name}*,\n\nDengan penuh rasa syukur, kami mengundang Bapak/Ibu/Sahabat untuk hadir dan memberikan doa restu pada pernikahan kami:\n\n*${groomFullName} & ${brideFullName}*\n${formattedDate}\n${wedding.venueName || "Lokasi Akad/Resepsi"}\n\nDetail undangan digital & konfirmasi kehadiran (RSVP):\n${inviteUrl}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila berkenan hadir.\n\nTerima kasih,\n${closingSignature}`;

    const cleanPhone = guest.phone.replace(/[^0-9]/g, "");
    const waUrl = cleanPhone.startsWith("0")
      ? `https://wa.me/62${cleanPhone.slice(1)}?text=${encodeURIComponent(text)}`
      : `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

    window.open(waUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Users className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Tamu, Kuota 4 Pilar &amp; Buku Amplop
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Kelola undangan digital, simulasi kuota keluarga, dan pencatatan amplop kondangan
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-stretch sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => switchTab("GUESTS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "GUESTS"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Daftar Tamu &amp; WA ({guests.length})
          </button>
          <button
            id="tour-guests-quota"
            type="button"
            onClick={() => switchTab("QUOTA")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "QUOTA"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Kuota 4 Pilar
          </button>
          <button
            id="tour-guests-ledger"
            type="button"
            onClick={() => switchTab("AMPLOP_LEDGER")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "AMPLOP_LEDGER"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Buku Amplop
          </button>
        </div>
      </div>

      {/* VIEW 1: DAFTAR TAMU & GENERATOR WA */}
      {activeTab === "GUESTS" && (
        <div className="space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
              <span className="text-xs text-slate-500 font-semibold block">Total Tamu Diundang</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
                {guests.length} Undangan
              </span>
              <span className="text-[11px] text-slate-400">Estimasi total: {totalInvitedPax} Pax</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
              <span className="text-xs text-slate-500 font-semibold block">Konfirmasi Hadir (RSVP)</span>
              <span className="text-2xl font-black font-mono text-emerald-700 mt-1 block">
                {confirmedPax} Pax
              </span>
              <span className="text-[11px] text-emerald-700">
                {guests.filter((g) => g.rsvpStatus === "CONFIRMED_ATTENDING").length} undangan pasti hadir
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
              <span className="text-xs text-slate-500 font-semibold block">Tautan Undangan Digital</span>
              <a
                href={`/invitation/${wedding.slug || "undangan-kami"}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-pastel-700 hover:underline flex items-center gap-1 mt-2"
              >
                <span>Buka /invitation/{wedding.slug || "undangan-kami"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[10px] text-slate-400 block mt-1">Dapat diakses langsung oleh tamu</span>
            </div>
          </div>

          {/* Action & Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-subtle-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama tamu atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-300"
              />
            </div>

            <button
              id="tour-guests-add"
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tamu</span>
            </button>
          </div>

          {/* Guest Cards / Table */}
          {filteredGuests.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-subtle-sm space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Belum Ada Daftar Tamu</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tambahkan kerabat, sahabat, atau kolega kerja Anda untuk mengelola jumlah porsi dan kirim undangan WhatsApp.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tamu Pertama</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle-sm hover:border-pastel-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {guest.category}
                      </span>
                      <span className="text-[10px] font-semibold text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-md border border-pastel-200">
                        {guest.side === "GROOM"
                          ? `Pria ${wedding.groomName ? `(${wedding.groomName.split(" ")[0]})` : ""}`
                          : guest.side === "BRIDE"
                          ? `Wanita ${wedding.brideName ? `(${wedding.brideName.split(" ")[0]})` : ""}`
                          : "Bersama"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {guest.pax} Pax
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{guest.name}</h4>
                    <p className="text-xs text-slate-500">No. WA: {guest.phone || "-"}</p>
                    {guest.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded-lg mt-1">
                        &quot;{guest.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        guest.rsvpStatus === "CONFIRMED_ATTENDING"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : guest.rsvpStatus === "DECLINED"
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {guest.rsvpStatus === "CONFIRMED_ATTENDING"
                        ? "Hadir"
                        : guest.rsvpStatus === "DECLINED"
                        ? "Tidak Hadir"
                        : "Menunggu Konfirmasi"}
                    </span>

                    <button
                      type="button"
                      onClick={() => generateWhatsAppMessage(guest)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kirim Undangan WA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(guest)}
                      className="p-1.5 text-slate-400 hover:text-pastel-600 rounded-lg transition-colors"
                      title="Edit Tamu"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteGuest(guest)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Hapus Tamu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KUOTA 4 PILAR */}
      {activeTab === "QUOTA" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm space-y-6">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Simulasi Kuota 4 Pilar Keluarga
            </h2>
            <p className="text-xs text-slate-500">
              Prinsip Keadilan: Membagi porsi tamu antara Calon Pria, Calon Wanita, Orang Tua Pria, dan Orang Tua Wanita
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Keluarga / Teman Calon Suami
              </label>
              <input
                type="number"
                value={familyQuota.groomQuota}
                onChange={(e) =>
                  updateFamilyQuota({ groomQuota: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full text-base font-black font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
              <span className="text-[11px] text-slate-400">Porsi Calon Pria</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Keluarga / Teman Calon Istri
              </label>
              <input
                type="number"
                value={familyQuota.brideQuota}
                onChange={(e) =>
                  updateFamilyQuota({ brideQuota: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full text-base font-black font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
              <span className="text-[11px] text-slate-400">Porsi Calon Wanita</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Undangan Orang Tua Pria
              </label>
              <input
                type="number"
                value={familyQuota.groomParentsQuota}
                onChange={(e) =>
                  updateFamilyQuota({ groomParentsQuota: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full text-base font-black font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
              <span className="text-[11px] text-slate-400">Relasi Ortu Suami</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Undangan Orang Tua Wanita
              </label>
              <input
                type="number"
                value={familyQuota.brideParentsQuota}
                onChange={(e) =>
                  updateFamilyQuota({ brideParentsQuota: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full text-base font-black font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
              <span className="text-[11px] text-slate-400">Relasi Ortu Istri</span>
            </div>
          </div>

          <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-amber-900">Total Alokasi Tamu:</span>
                <p className="text-xl font-black font-mono text-slate-900">
                  {totalAllocatedQuota} Undangan / Kapasitas Venue: {familyQuota.venueCapacity} Pax
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 font-semibold block">Estimasi Biaya per Pax:</span>
                <input
                  type="number"
                  value={costPerPax}
                  onChange={(e) => updateFamilyQuota({ costPerPax: parseInt(e.target.value, 10) || 0 })}
                  className="text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 mt-1"
                />
              </div>
            </div>

            {quotaDifference > 0 && (
              <p className="text-xs text-amber-900 leading-relaxed">
                Kelebihan kuota tamu sebanyak <strong>{quotaDifference} undangan</strong>. Diperkirakan
                membutuhkan tambahan katering sebesar{" "}
                <strong className="font-mono text-rose-700 font-bold">
                  {formatRupiah(quotaDifference * costPerPax)}
                </strong>
                . Pihak keluarga yang meminta tambahan kuota dianjurkan memberikan subsidi katering ekstra ini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: BUKU AMPLOP & KADO */}
      {activeTab === "AMPLOP_LEDGER" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                Buku Catatan Amplop &amp; Kado Masuk
              </h2>
              <p className="text-xs text-slate-500">
                Dokumentasi tanda kasih tamu untuk menjaga silaturahmi dan utang sosial kondangan kelak
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Total Amplop Terdata: </span>
              <span className="text-sm font-black font-mono text-emerald-700">
                {formatRupiah(totalEnvelopes)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Nama Tamu</th>
                  <th className="pb-3 px-3">Kategori</th>
                  <th className="pb-3 px-3">Pihak</th>
                  <th className="pb-3 px-3">Nominal Amplop</th>
                  <th className="pb-3 px-3">Deskripsi Kado</th>
                  <th className="pb-3 px-3 text-right">Catat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{g.name}</td>
                    <td className="py-3 px-3 text-slate-600">{g.category}</td>
                    <td className="py-3 px-3 text-slate-500">{g.side}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {g.envelopeAmount ? formatRupiah(g.envelopeAmount) : "-"}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{g.giftDescription || "-"}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (!requireAuth()) return;
                          setRecordingEnvelopeId(g.id);
                          setEnvelopeInput(g.envelopeAmount ? String(g.envelopeAmount) : "");
                          setGiftInput(g.giftDescription || "");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-pastel-50 hover:bg-pastel-100 text-pastel-700 font-bold text-[11px] border border-pastel-200"
                      >
                        {g.envelopeAmount ? "Edit" : "+ Catat"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Envelope Modal */}
      {recordingEnvelopeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base font-serif">Catat Amplop / Kado</h3>
            <form onSubmit={handleSaveEnvelope} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Amplop (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 500000"
                  value={envelopeInput}
                  onChange={(e) => setEnvelopeInput(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Kado (Jika Berupa Barang)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Set Sprei King Koil / Microwave"
                  value={giftInput}
                  onChange={(e) => setGiftInput(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordingEnvelopeId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                >
                  Simpan Amplop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {editingGuest ? "Edit Tamu Undangan" : "Tambah Tamu Undangan Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap / Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. H. Hendra Wijaya & Keluarga"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Pax *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pax}
                    onChange={(e) => setPax(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pihak Mempelai
                  </label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as any)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="BOTH">Rekan Bersama</option>
                    <option value="GROOM">Pihak Pria {wedding.groomName ? `(${wedding.groomName.split(" ")[0]})` : ""}</option>
                    <option value="BRIDE">Pihak Wanita {wedding.brideName ? `(${wedding.brideName.split(" ")[0]})` : ""}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Tamu
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="Keluarga Inti">Keluarga Inti</option>
                    <option value="Keluarga Besar">Keluarga Besar</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="Rekan Kantor">Rekan Kantor</option>
                    <option value="Tetangga">Tetangga</option>
                    <option value="VIP">Tamu VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Kehadiran
                </label>
                <select
                  value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                >
                  <option value="PENDING">Menunggu Konfirmasi</option>
                  <option value="CONFIRMED_ATTENDING">Pasti Hadir</option>
                  <option value="DECLINED">Berhalangan Hadir</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                >
                  {editingGuest ? "Simpan Perubahan" : "Tambah Tamu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat data tamu...</div>}>
      <GuestsContent />
    </Suspense>
  );
}
