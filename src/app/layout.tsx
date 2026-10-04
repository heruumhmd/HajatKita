import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/navigation/app-sidebar";

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
      <body className="min-h-screen bg-slate-50/50 text-slate-900 antialiased font-sans">
        <div className="flex min-h-screen">
          {/* Responsive Sidebar for Desktop / Tablet + Mobile Drawer */}
          <AppSidebar />

          {/* Main Content Area */}
          <main className="flex-1 md:pl-72 flex flex-col min-w-0 pb-20 md:pb-10">
            <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
