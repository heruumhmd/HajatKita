"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { mockWedding } from "@/lib/mock-data";

export function CountdownCard() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(mockWedding.weddingDate).getTime();

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
  }, []);

  return (
    <div className="bg-gradient-to-br from-pastel-100/90 via-pastel-50 to-white rounded-3xl p-6 border border-sky-200/70 shadow-pastel-sm relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-pastel-200/30 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Couple Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-sky-200/60 text-pastel-700 text-[11px] font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-pastel-500" />
            <span>Hitung Mundur Hari Bahagia</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            {mockWedding.groomName.split(" ")[0]} & {mockWedding.brideName.split(" ")[0]}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-pastel-500" />
              Sabtu, 19 Desember 2026
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-pastel-500" />
              {mockWedding.city}
            </span>
          </div>
        </div>

        {/* Right Countdown Digital Boxes in Pastel Blue */}
        <div className="flex items-center gap-2 sm:gap-3">
          {[
            { label: "Hari", value: timeLeft.days },
            { label: "Jam", value: timeLeft.hours },
            { label: "Menit", value: timeLeft.minutes },
            { label: "Detik", value: timeLeft.seconds },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center min-w-[62px] sm:min-w-[72px] py-2.5 px-2 bg-white rounded-2xl border border-sky-100 shadow-pastel-sm"
            >
              <span className="text-xl sm:text-2xl font-black text-pastel-600 font-mono tracking-tight">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
