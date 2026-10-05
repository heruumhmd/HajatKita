"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Sparkles,
  Send,
  CheckCircle2,
  Gift,
  Share2,
  ChevronDown,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import confetti from "canvas-confetti";
import { showSuccessAlert } from "@/lib/swal";

export default function DynamicInvitationPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "kami-berdua";
  const { wedding, addGuest, guests } = useWedding();

  const [weddingData, setWeddingData] = useState(wedding);

  useEffect(() => {
    async function loadWeddingBySlug() {
      try {
        const res = await fetch(`/api/wedding/sync?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success && data.wedding) {
          setWeddingData(data.wedding);
        }
      } catch (e) {
        console.error("Failed to load invitation from DB", e);
      }
    }
    if (slug) {
      loadWeddingBySlug();
    }
  }, [slug]);

  const activeWedding = (weddingData && (weddingData.groomName || weddingData.brideName)) ? weddingData : wedding;

  // Guest RSVP Form State
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestSide, setGuestSide] = useState<"GROOM" | "BRIDE" | "BOTH">("BOTH");
  const [rsvpStatus, setRsvpStatus] = useState<"CONFIRMED_ATTENDING" | "DECLINED">("CONFIRMED_ATTENDING");
  const [pax, setPax] = useState(2);
  const [wishes, setWishes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const groomShort = activeWedding.groomName ? activeWedding.groomName.split(" ")[0] : "Pria";
  const brideShort = activeWedding.brideName ? activeWedding.brideName.split(" ")[0] : "Wanita";

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!activeWedding.weddingDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const targetDate = new Date(activeWedding.weddingDate).getTime();
    if (isNaN(targetDate)) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeWedding.weddingDate]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    // 1. Direct persistent save to Neon Database
    try {
      await fetch("/api/wedding/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RSVP",
          slug,
          weddingId: activeWedding.id,
          guest: {
            name: guestName,
            side: guestSide,
            category: "Undangan Digital",
            pax: rsvpStatus === "CONFIRMED_ATTENDING" ? pax : 0,
            phone: guestPhone || "-",
            rsvpStatus,
            notes: wishes,
          },
        }),
      });
    } catch (err) {
      console.warn("Direct RSVP to DB error", err);
    }

    // 2. Also update local context state
    addGuest({
      name: guestName,
      side: guestSide,
      category: "Undangan Digital",
      pax: rsvpStatus === "CONFIRMED_ATTENDING" ? pax : 0,
      phone: guestPhone || "-",
      rsvpStatus,
      notes: wishes,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }

    setSubmitted(true);
    showSuccessAlert(
      "Konfirmasi Kehadiran Terkirim!",
      `Terima kasih ${guestName}, konfirmasi dan doa restu Anda telah berhasil tersimpan ke database.`
    );
  };

  // Format date readable
  const formattedDate = activeWedding.weddingDate
    ? new Date(activeWedding.weddingDate).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Menunggu Penentuan Tanggal";

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10">
      {/* Decorative Border Container */}
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden relative">
        {/* Top Header Floral / Gold Motif Accent */}
        <div className="h-3 bg-gradient-to-r from-amber-200 via-rose-300 to-pastel-400" />

        {/* Hero Invitation Section */}
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Walimatul &apos;Ursy • Undangan Pernikahan</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
              Dengan penuh rasa syukur mengundang Anda ke pernikahan:
            </p>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight">
              {activeWedding.groomName || "Calon Suami"}
            </h1>
            <span className="font-serif italic text-2xl sm:text-3xl text-amber-600 font-normal">&amp;</span>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight">
              {activeWedding.brideName || "Calon Istri"}
            </h1>
          </div>

          {/* Date & Location Pill */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pastel-50 border border-sky-100 text-pastel-800">
              <Calendar className="w-4 h-4 text-pastel-600" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pastel-50 border border-sky-100 text-pastel-800">
              <MapPin className="w-4 h-4 text-pastel-600" />
              {activeWedding.city || "Indonesia"}
            </span>
          </div>

          {/* Digital Countdown Box */}
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Menuju Hari Bahagia
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {[
                { label: "Hari", val: timeLeft.days },
                { label: "Jam", val: timeLeft.hours },
                { label: "Menit", val: timeLeft.minutes },
                { label: "Detik", val: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="w-16 sm:w-20 py-3 bg-[#FAF7F2] rounded-2xl border border-amber-100/80 shadow-xs flex flex-col items-center"
                >
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-800">
                    {String(item.val).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule & Venue Card */}
        <div className="px-8 sm:px-12 py-6 bg-slate-50/70 border-y border-slate-100 space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-bold font-serif text-slate-800">Rangkaian Acara</h2>
            <p className="text-xs text-slate-500">Mohon doa restu untuk kelancaran akad dan resepsi</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-pastel-700">
                <span>Akad Nikah</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-base font-extrabold text-slate-800">08:00 - 10:00 WIB</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeWedding.venueName || "Gedung / Kediaman Mempelai"}
                <br />
                {activeWedding.venueAddress || activeWedding.city}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Resepsi Pernikahan</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-base font-extrabold text-slate-800">11:00 - 14:00 WIB</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeWedding.venueName || "Grand Ballroom"}
                <br />
                {activeWedding.venueAddress || activeWedding.city}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive RSVP Form */}
        <div className="p-8 sm:p-12 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold font-serif text-slate-800">Konfirmasi Kehadiran (RSVP)</h2>
            <p className="text-xs text-slate-500">
              Bantu kami menyiapkan jamuan dengan mengonfirmasi kehadiran Anda
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">Terima Kasih, {guestName}!</h3>
              <p className="text-xs text-slate-600">
                Konfirmasi dan doa restu Anda telah tercatat langsung di sistem rencana pernikahan {activeWedding.groomName} &amp; {activeWedding.brideName}.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-emerald-700 underline pt-2"
              >
                Kirim tanggapan lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Tamu *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Bambang & Keluarga"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relasi / Pihak Mempelai</label>
                  <select
                    value={guestSide}
                    onChange={(e) => setGuestSide(e.target.value as any)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="BOTH">Rekan / Teman Bersama</option>
                    <option value="GROOM">Pihak Calon Pria ({groomShort})</option>
                    <option value="BRIDE">Pihak Calon Wanita ({brideShort})</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Kehadiran *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      rsvpStatus === "CONFIRMED_ATTENDING"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rsvpStatus"
                      value="CONFIRMED_ATTENDING"
                      checked={rsvpStatus === "CONFIRMED_ATTENDING"}
                      onChange={() => setRsvpStatus("CONFIRMED_ATTENDING")}
                      className="hidden"
                    />
                    <span>Hadir</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      rsvpStatus === "DECLINED"
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rsvpStatus"
                      value="DECLINED"
                      checked={rsvpStatus === "DECLINED"}
                      onChange={() => setRsvpStatus("DECLINED")}
                      className="hidden"
                    />
                    <span>Berhalangan Hadir</span>
                  </label>
                </div>
              </div>

              {rsvpStatus === "CONFIRMED_ATTENDING" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Orang yang Hadir (Pax): {pax} Orang
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={pax}
                    onChange={(e) => setPax(parseInt(e.target.value, 10))}
                    className="w-full accent-pastel-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                    <span>1 (Sendiri)</span>
                    <span>2 (+Pasangan)</span>
                    <span>3-4 (+Keluarga)</span>
                    <span>5-6 Orang</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ucapan &amp; Doa Restu</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan ucapan selamat dan doa restu untuk kedua mempelai..."
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pastel-300 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Konfirmasi Kehadiran</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-slate-50 text-center border-t border-slate-100 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-600">Hajat Kita • Digital Wedding Planner</p>
          <p>Tautan undangan digital dinamis: hajatkita.id/invitation/{slug}</p>
        </div>
      </div>
    </div>
  );
}
