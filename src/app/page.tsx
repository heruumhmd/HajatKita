import React from "react";
import { CountdownCard } from "@/components/dashboard/countdown-card";
import { PartnerBanner } from "@/components/dashboard/partner-banner";
import { SavingDonutCard } from "@/components/dashboard/saving-donut-card";
import { FinancialGuardBanner } from "@/components/dashboard/financial-guard-banner";
import { QuickChecklist } from "@/components/dashboard/quick-checklist";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Gift, Home, Users, FileCheck2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { mockSeserahanItems, mockPostWeddingItems, mockGuests } from "@/lib/mock-data";

export default function DashboardPage() {
  const purchasedSeserahan = mockSeserahanItems.filter((i) => i.isPurchased).length;
  const acquiredPostWedding = mockPostWeddingItems.filter((i) => i.isAcquired).length;
  const confirmedGuests = mockGuests.filter((g) => g.rsvpStatus === "CONFIRMED_ATTENDING").length;

  return (
    <div className="space-y-6">
      {/* 1. Countdown Hero Card */}
      <CountdownCard />

      {/* 2. Partner Synchronization Banner */}
      <PartnerBanner />

      {/* 3. Life-After-Wedding Guard (Rasio 70/30) */}
      <FinancialGuardBanner />

      {/* 4. Saving Target Donut Chart */}
      <SavingDonutCard />

      {/* 5. 3-Card Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Seserahan Card */}
        <Link
          href="/seserahan"
          className="bg-white rounded-3xl p-5 border border-sky-100 hover:border-pastel-300 shadow-pastel-sm transition-all pastel-glow-hover flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {purchasedSeserahan}/{mockSeserahanItems.length} Terbeli
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Seserahan & Hantaran</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Merk, estimasi harga, & link toko</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-pastel-600">
            <span>Buka Katalog Box</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Barang Pasca-Nikah Card */}
        <Link
          href="/post-wedding"
          className="bg-white rounded-3xl p-5 border border-sky-100 hover:border-pastel-300 shadow-pastel-sm transition-all pastel-glow-hover flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
              {acquiredPostWedding}/{mockPostWeddingItems.length} Terpenuhi
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Barang Pasca-Nikah</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Perabotan & registry kado sahabat</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-pastel-600">
            <span>Lihat Wishlist Rumah</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Tamu & RSVP Card */}
        <Link
          href="/guests"
          className="bg-white rounded-3xl p-5 border border-sky-100 hover:border-pastel-300 shadow-pastel-sm transition-all pastel-glow-hover flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {confirmedGuests}/{mockGuests.length} Terkonfirmasi
            </span>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Tamu & Amplop Ledger</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Kuota 4 pilar & buku utang kondangan</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-pastel-600">
            <span>Kelola Daftar Tamu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* 6. Two-Column Layout: Quick Checklist & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <QuickChecklist />
        </div>
        <div className="lg:col-span-5">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
