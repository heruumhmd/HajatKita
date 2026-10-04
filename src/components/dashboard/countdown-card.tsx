"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Sparkles, Heart } from "lucide-react";
import { useWedding } from "@/context/wedding-context";

export function CountdownCard() {
  const { wedding } = useWedding();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!wedding.weddingDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const target = new Date(wedding.weddingDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [wedding.weddingDate]);

  const formattedDate = wedding.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Tanggal Belum Ditentukan";

  return (
    <div className="bg-gradient-to-br from-amber-50/50 via-white to-pastel-50/60 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-subtle-sm relative overflow-hidden">
      {/* Decorative Warm Halo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Couple Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200/80 text-amber-800 text-[11px] font-bold shadow-xs">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Hitung Mundur Hari Bahagia</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-serif tracking-tight">
            {wedding.groomName || "Calon Pengantin Pria"}{" "}
            <span className="font-serif italic font-normal text-amber-600">&amp;</span>{" "}
            {wedding.brideName || "Calon Pengantin Wanita"}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pastel-600" />
              {wedding.weddingDate ? formattedDate : "Tanggal Belum Diatur (Pilih di Akun)"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-pastel-600" />
              {wedding.city || "Lokasi Acara"}
            </span>
          </div>
        </div>

        {/* Right Countdown Digital Boxes */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full sm:w-auto">
          {[
            { label: "Hari", value: timeLeft.days },
            { label: "Jam", value: timeLeft.hours },
            { label: "Menit", value: timeLeft.minutes },
            { label: "Detik", value: timeLeft.seconds },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center min-w-0 sm:min-w-[72px] py-2.5 sm:py-3 px-1.5 sm:px-2 bg-white rounded-2xl border border-slate-200 shadow-xs"
            >
              <span className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
