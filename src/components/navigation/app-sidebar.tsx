"use client";

import React from "react";
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
  X,
  FileCheck2,
  HeartHandshake,
  ShieldCheck,
  Home,
  Heart,
  HelpCircle,
  Menu,
} from "lucide-react";
import { CuteAvatarBadge } from "@/components/profile/cute-card-badge";
import { useWedding } from "@/context/wedding-context";

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

interface AppSidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
  onOpenTutorial?: () => void;
  onOpenMobileMenu?: () => void;
}

export function AppSidebar({
  isMobileOpen,
  onClose,
  onOpenTutorial,
  onOpenMobileMenu,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { wedding, currentUser } = useWedding();

  const effectivePartner = React.useMemo(() => {
    if (!wedding.isPartnerConnected) return null;
    const raw = wedding.partnerInfo;
    const myEmail = (currentUser?.email || "").toLowerCase().trim();
    const myName = (currentUser?.name || "").toLowerCase().trim();
    const rawEmail = (raw?.email || "").toLowerCase().trim();
    const rawName = (raw?.name || "").toLowerCase().trim();

    const isSelf =
      (rawEmail && myEmail && rawEmail === myEmail) ||
      (rawName && myName && rawName === myName) ||
      (currentUser?.role && raw?.role && currentUser.role === raw.role);

    if (!raw || isSelf) {
      if (currentUser?.role === "GROOM") {
        return {
          name: wedding.brideName || "Calon Istri",
          role: "BRIDE" as const,
          email: wedding.primaryUserEmail || "",
          avatarCardId: "duck-bride",
        };
      } else {
        return {
          name: wedding.groomName || "Calon Suami",
          role: "GROOM" as const,
          email: wedding.partnerUserEmail || "",
          avatarCardId: "penguin-groom",
        };
      }
    }

    return raw;
  }, [wedding.isPartnerConnected, wedding.partnerInfo, wedding.groomName, wedding.brideName, wedding.primaryUserEmail, wedding.partnerUserEmail, currentUser]);

  const groomNameShort = wedding.groomName ? wedding.groomName.split(" ")[0] : "";
  const brideNameShort = wedding.brideName ? wedding.brideName.split(" ")[0] : "";
  const coupleDisplay =
    groomNameShort && brideNameShort
      ? `${groomNameShort} & ${brideNameShort}`
      : groomNameShort
      ? `Suami: ${groomNameShort}`
      : brideNameShort
      ? `Istri: ${brideNameShort}`
      : "Calon Pengantin";

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container: Fixed on Desktop, Drawer on Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl logo-3d flex items-center justify-center animate-float-3d">
              <span className="text-lg filter drop-shadow-sm">💍</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-wider font-display">
                Hajat Kita
              </h1>
              <p className="text-[10px] font-semibold text-slate-500">
                Biar Nikah Lebih Terarah
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={onClose}
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isAccountLink = item.href === "/account";
            const effectiveBadge = isAccountLink
              ? (wedding.isPartnerConnected ? "Terhubung" : undefined)
              : item.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-pastel-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-pastel-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {effectiveBadge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isAccountLink && wedding.isPartnerConnected
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {effectiveBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Duo Status in Footer */}
        <div className="p-4 border-t border-slate-100 bg-[#FAF7F2]/50">
          {/* Dynamic Duo Status with Cute Cards */}
          <div className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Ruang Bersama
              </span>
              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                {wedding.inviteCode}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-1.5 shrink-0">
                <CuteAvatarBadge cardId={currentUser?.avatarCardId || "cat-prince"} size="xs" />
                <CuteAvatarBadge cardId={effectivePartner?.avatarCardId || (currentUser?.role === "GROOM" ? "cat-princess" : "cat-prince")} size="xs" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-slate-800 truncate font-serif">
                    {coupleDisplay}
                  </p>
                  {wedding.isPartnerConnected && (
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
                  )}
                </div>
                {wedding.isPartnerConnected ? (
                  <p className="text-[10px] font-bold text-emerald-600 truncate mt-0.5">
                    Saling Terhubung
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Belum Tersinkron
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Quick-Access Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-1.5 px-2 shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium ${
            pathname === "/" ? "text-pastel-600 font-bold" : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </Link>
        <Link
          href="/budget"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium ${
            pathname === "/budget" ? "text-pastel-600 font-bold" : "text-slate-500"
          }`}
        >
          <Wallet className="w-4 h-4 mb-0.5" />
          <span>Tabungan</span>
        </Link>
        <Link
          href="/seserahan"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium ${
            pathname === "/seserahan" ? "text-pastel-600 font-bold" : "text-slate-500"
          }`}
        >
          <Gift className="w-4 h-4 mb-0.5" />
          <span>Seserahan</span>
        </Link>
        <Link
          href="/timeline"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium ${
            pathname === "/timeline" ? "text-pastel-600 font-bold" : "text-slate-500"
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          <span>Checklist</span>
        </Link>
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
}
