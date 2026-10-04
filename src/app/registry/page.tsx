"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWedding } from "@/context/wedding-context";

export default function RegistryIndexPage() {
  const router = useRouter();
  const { wedding } = useWedding();

  useEffect(() => {
    const slug = wedding.slug || "heru-nurul";
    router.replace(`/registry/${slug}`);
  }, [wedding.slug, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500">
        Membuka registry kado pernikahan...
      </div>
    </div>
  );
}
