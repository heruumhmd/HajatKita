"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { SpotlightTour } from "@/components/modal/spotlight-tour";
import { AuthModal } from "@/components/auth/auth-modal";
import { ProfileModal } from "@/components/profile/profile-modal";
import { CuteAvatarBadge } from "@/components/profile/cute-card-badge";
import { HelpCircle, LogIn, Menu, ShieldAlert } from "lucide-react";
import { useWedding } from "@/context/wedding-context";

import { getCoupleDisplayName } from "@/lib/partner-helper";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    wedding,
    currentUser,
    isLoggedIn,
    guestEnteredWorkspace,
    setGuestEnteredWorkspace,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setIsTourOpen,
  } = useWedding();

  const isPublicRoute =
    pathname.startsWith("/invitation") || pathname.startsWith("/registry");

  const isLandingMode = pathname === "/" && !isLoggedIn && !guestEnteredWorkspace;

  // Auto-open spotlight tour once per page at initial visit, never repeatedly
  useEffect(() => {
    if (!isPublicRoute && !isLandingMode && pathname) {
      try {
        const pageKey = `HAJAT_TOUR_SEEN_${pathname}`;
        const hasSeenPageTour = localStorage.getItem(pageKey);
        if (!hasSeenPageTour) {
          setIsTourOpen(true);
          localStorage.setItem(pageKey, "true");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isPublicRoute, isLandingMode, pathname, setIsTourOpen]);

  if (isPublicRoute || isLandingMode) {
    return (
      <>
        {children}
        <AuthModal />
        <ProfileModal />
      </>
    );
  }

  const { coupleTitle } = getCoupleDisplayName(wedding, currentUser);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-900 flex flex-col">
      {/* Sidebar: Desktop fixed w-72, Mobile offcanvas drawer */}
      <AppSidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Content Area: lg:pl-72 on desktop, pl-0 on mobile/tablet */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 pb-20 lg:pb-10">
        {/* Unified Top Navbar Header */}
        <header className="sticky top-0 z-30 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Hamburger & Couple Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-pastel-700 hover:bg-slate-100 transition-colors"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-serif font-black text-slate-900 text-sm sm:text-base truncate">
                {coupleTitle}
              </span>
              {wedding.city && (
                <span className="text-slate-400 text-xs hidden sm:inline truncate">
                  • {wedding.city}
                </span>
              )}
            </div>
          </div>

          {/* Right: Tutorial & Profile/Login */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Spotlight Tour Trigger (Top Nav only) */}
            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-2xs"
              title="Panduan Fitur Halaman Ini"
            >
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span className="hidden xs:inline sm:inline">Panduan Fitur</span>
            </button>

            {/* Profile Avatar / Login Button */}
            {isLoggedIn && currentUser ? (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-xs font-bold transition-all shadow-2xs group shrink-0"
                title="Buka Profil & Kartu Karakter"
              >
                <CuteAvatarBadge cardId={currentUser.avatarCardId} size="xs" />
                <span className="text-slate-800 group-hover:text-pastel-700 max-w-[80px] sm:max-w-[120px] truncate text-xs">
                  {currentUser.nickname || currentUser.name.split(" ")[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-pastel-600 hover:bg-pastel-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>
        </header>

        {/* Not Logged In Warning Callout */}
        {!isLoggedIn && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="truncate">
                Mode Tamu: Masuk dengan Google agar seluruh data pernikahan tersimpan permanen di cloud.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setGuestEnteredWorkspace(false);
                  router.push("/");
                }}
                className="text-slate-600 hover:text-slate-900 font-bold underline text-[11px]"
              >
                ← Buka Landing Page
              </button>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-pastel-700 hover:text-pastel-800 font-bold underline text-[11px]"
              >
                Masuk Cloud →
              </button>
            </div>
          </div>
        )}

        {/* Main Viewport Container */}
        <main className="max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>

      {/* Interactive Spotlight Tour */}
      <SpotlightTour />

      {/* Auth Modal */}
      <AuthModal />

      {/* User Profile Modal */}
      <ProfileModal />
    </div>
  );
}
