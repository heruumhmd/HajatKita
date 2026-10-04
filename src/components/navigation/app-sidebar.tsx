"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  GitFork,
  Wallet,
  Users,
  Gem,
  Gift,
  User,
  Menu,
  X,
  FileCheck2,
  HeartHandshake,
  ShieldCheck,
  Home,
  Heart,
  Sparkles,
} from "lucide-react";
import { mockWedding } from "@/lib/mock-data";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Peta Persiapan", href: "/timeline", icon: MapPin },
  { label: "Alur Pernikahan", href: "/rundown", icon: GitFork },
  { label: "Budget & Tabungan", href: "/budget", icon: Wallet },
  { label: "Tamu & Hadiah", href: "/guests", icon: Users },
  { label: "Akad & Resepsi", href: "/ceremony", icon: Gem },
  { label: "Seserahan", href: "/seserahan", icon: Gift },
  { label: "Barang Pasca-Nikah", href: "/post-wedding", icon: Home },
  { label: "Administrasi KUA", href: "/administration", icon: FileCheck2 },
  { label: "Pojok Bicara", href: "/alignment", icon: HeartHandshake, badge: "Penting" },
  { label: "Proteksi Vendor", href: "/vendors", icon: ShieldCheck },
  { label: "Akun & Pasangan", href: "/account", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pastel-100 flex items-center justify-center text-pastel-600 shadow-pastel-sm">
            <Heart className="w-4 h-4 fill-pastel-500 text-pastel-500" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-base leading-none">Hajat Kita</span>
            <p className="text-[10px] text-pastel-600 font-medium">Biar Nikah Lebih Terarah</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl text-slate-600 hover:text-pastel-600 hover:bg-pastel-50 focus:outline-none focus:ring-2 focus:ring-pastel-300"
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-sky-100/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header (Matches user mockup with Heart logo) */}
        <div className="p-6 border-b border-sky-50 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pastel-100 to-pastel-200 flex items-center justify-center text-pastel-600 shadow-pastel-sm ring-1 ring-pastel-300/60">
              <Heart className="w-6 h-6 fill-pastel-500 text-pastel-500 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">Hajat Kita</h1>
              <p className="text-xs font-semibold text-pastel-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pastel-400" />
                Biar Nikah Lebih Terarah
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-pastel-500 text-white shadow-pastel-sm font-semibold"
                    : "text-slate-600 hover:bg-pastel-50 hover:text-pastel-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-pastel-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-pastel-100 text-pastel-700 ring-1 ring-pastel-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Partner Duo Status Card at Bottom of Sidebar */}
        <div className="p-4 border-t border-sky-100 bg-pastel-50/60 m-3 rounded-2xl ring-1 ring-pastel-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pastel-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Pasangan Terhubung
            </span>
            <span className="text-[10px] bg-pastel-200 text-pastel-800 px-1.5 py-0.5 rounded-md font-mono">
              {mockWedding.inviteCode}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-pastel-200 border-2 border-white flex items-center justify-center font-bold text-xs text-pastel-700 overflow-hidden shadow-xs">
                <span>D</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-rose-200 border-2 border-white flex items-center justify-center font-bold text-xs text-rose-700 -ml-3 overflow-hidden shadow-xs">
                <span>S</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {mockWedding.groomName.split(" ")[0]} & {mockWedding.brideName.split(" ")[0]}
              </p>
              <p className="text-[11px] text-slate-500 truncate">Workspace Bersama</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Quick-Access Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-sky-100 flex items-center justify-around py-2 px-2 shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium ${
            pathname === "/" ? "text-pastel-600 font-bold" : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>
        <Link
          href="/budget"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium ${
            pathname === "/budget" ? "text-pastel-600 font-bold" : "text-slate-500"
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span>Tabungan</span>
        </Link>
        <Link
          href="/seserahan"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium ${
            pathname === "/seserahan" ? "text-pastel-600 font-bold" : "text-slate-500"
          }`}
        >
          <Gift className="w-5 h-5 mb-0.5" />
          <span>Seserahan</span>
        </Link>
        <Link
          href="/timeline"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium ${
            pathname === "/timeline" ? "text-pastel-600 font-bold" : "text-slate-500"
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span>Checklist</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium text-slate-500"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
}
