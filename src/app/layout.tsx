import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { WeddingProvider } from "@/context/wedding-context";
import { AppShell } from "@/components/layout/app-shell";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hajat Kita - Biar Nikah Lebih Terarah",
  description:
    "Platform Wedding Planner kolaboratif Indonesia. Kelola target tabungan, checklist KUA, seserahan, barang pasca-nikah, dan sinkronisasi dengan pasangan Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#FBFBFA] text-slate-900 antialiased font-sans">
        <AuthSessionProvider>
          <WeddingProvider>
            <AppShell>{children}</AppShell>
          </WeddingProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
