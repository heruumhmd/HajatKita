import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { WeddingProvider } from "@/context/wedding-context";
import { AppShell } from "@/components/layout/app-shell";

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
    <html lang="id">
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
