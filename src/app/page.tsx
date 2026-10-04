"use client";

import React from "react";
import { CountdownCard } from "@/components/dashboard/countdown-card";
import { PartnerBanner } from "@/components/dashboard/partner-banner";
import { SavingDonutCard } from "@/components/dashboard/saving-donut-card";
import { FinancialGuardBanner } from "@/components/dashboard/financial-guard-banner";
import { QuickChecklist } from "@/components/dashboard/quick-checklist";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Gift, Home, Users, ArrowRight, Sparkles, Heart, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useWedding } from "@/context/wedding-context";

export default function DashboardPage() {
  const { seserahan, postWedding, guests, wedding } = useWedding();

  const purchasedSeserahan = seserahan.filter((i) => i.isPurchased).length;
  const acquiredPostWedding = postWedding.filter((i) => i.isAcquired).length;
  const confirmedGuests = guests.filter((g) => g.rsvpStatus === "CONFIRMED_ATTENDING").length;

  const isProfileEmpty = !wedding.groomName || !wedding.brideName;

  return (
    <div className="space-y-6">
      {/* Welcome Callout if profile is not yet set */}
      {isProfileEmpty && (
        <div className="p-5 bg-gradient-to-r from-amber-50 via-white to-pastel-50 rounded-3xl border border-amber-200/90 shadow-subtle-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-serif">
                Selamat Datang di Hajat Kita!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rencana pernikahan Anda masih bersih. Lengkapi nama kedua calon mempelai dan tentukan tanggal hari bahagia untuk mengaktifkan seluruh fitur.
              </p>
            </div>
          </div>

          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 self-start sm:self-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Atur Nama &amp; Tanggal Acara</span>
          </Link>
        </div>
      )}

      {/* 1. Countdown Hero Card */}
      <div id="tour-countdown">
        <CountdownCard />
      </div>

      {/* 2. Partner Synchronization Banner */}
      <div id="tour-duo">
        <PartnerBanner />
      </div>

      {/* 3. Life-After-Wedding Guard (Rasio 70/30) */}
      <div id="tour-guard">
        <FinancialGuardBanner />
      </div>

      {/* 4. Saving Target Donut Chart */}
      <div id="tour-savings">
        <SavingDonutCard />
      </div>

      {/* 5. 3-Card Quick Stats Overview */}
      <div id="tour-quickstats" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Seserahan Card */}
        <Link
          href="/seserahan"
          className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-amber-300 shadow-subtle-sm transition-all subtle-hover flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              {purchasedSeserahan}/{seserahan.length} Terbeli
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm font-serif">Seserahan &amp; Hantaran</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Merk, estimasi harga, &amp; katalog per box</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-pastel-700">
            <span>Buka Katalog Box</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Barang Pasca-Nikah Card */}
        <Link
          href="/post-wedding"
          className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-amber-300 shadow-subtle-sm transition-all subtle-hover flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-pastel-800 bg-pastel-50 px-2.5 py-0.5 rounded-full border border-pastel-200">
              {acquiredPostWedding}/{postWedding.length} Terpenuhi
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm font-serif">Barang Pasca-Nikah</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Perabotan &amp; registry kado sahabat</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-pastel-700">
            <span>Lihat Wishlist Rumah</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Tamu & RSVP Card */}
        <Link
          href="/guests"
          className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-amber-300 shadow-subtle-sm transition-all subtle-hover flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {confirmedGuests}/{guests.length} Konfirmasi
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm font-serif">Tamu &amp; Amplop Ledger</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Kuota 4 pilar &amp; link undangan WhatsApp</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-pastel-700">
            <span>Kelola Tamu Undangan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* 6. Two-Column Layout: Quick Checklist & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div id="tour-checklist" className="lg:col-span-7">
          <QuickChecklist />
        </div>
        <div className="lg:col-span-5">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
