"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Gift,
  Home,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Bed,
  UtensilsCrossed,
  Tv,
  Check,
} from "lucide-react";
import Link from "next/link";
import { PostWeddingItem } from "@/types";
import { formatRupiah } from "@/lib/utils";
import confetti from "canvas-confetti";
import { showToastSuccess, showToastError } from "@/lib/swal";

export default function DynamicRegistryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "kami-berdua";

  const [weddingData, setWeddingData] = useState<any | null>(null);
  const [dbItems, setDbItems] = useState<PostWeddingItem[]>([]);
  const [pageStatus, setPageStatus] = useState<"loading" | "ready" | "notFound">("loading");

  useEffect(() => {
    async function loadRegistryBySlug() {
      try {
        setPageStatus("loading");
        const res = await fetch(`/api/wedding/sync?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success && data.exists && data.wedding) {
          setWeddingData(data.wedding);
          if (data.planData && Array.isArray(data.planData.postWedding)) {
            setDbItems(data.planData.postWedding);
          } else {
            setDbItems([]);
          }
          setPageStatus("ready");
        } else {
          setWeddingData(null);
          setDbItems([]);
          setPageStatus("notFound");
        }
      } catch (e) {
        console.error("Failed to load registry from DB", e);
        setWeddingData(null);
        setDbItems([]);
        setPageStatus("notFound");
      }
    }
    if (slug) {
      loadRegistryBySlug();
    } else {
      setPageStatus("notFound");
    }
  }, [slug]);

  const activePostWedding = dbItems;

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("");

  const claimableItems = activePostWedding.filter((i) => i.isGiftClaimable);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingId || !friendName.trim() || !weddingData) return;

    // 1. Persist direct to database
    try {
      const res = await fetch("/api/wedding/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CLAIM_GIFT",
          slug,
          weddingId: weddingData.id,
          itemId: claimingId,
          friendName: friendName.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToastError("Gagal Mengklaim", data.message || "Gagal mengklaim kado.");
        return;
      }
    } catch (err) {
      console.warn("Direct gift claim to DB error", err);
      showToastError("Gagal Mengklaim", "Terjadi kesalahan jaringan saat mengklaim kado.");
      return;
    }

    // 2. Update local state
    setDbItems((prev) =>
      prev.map((i) => (i.id === claimingId ? { ...i, isAcquired: true, claimedBy: friendName.trim() } : i))
    );

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }
    showToastSuccess(`Terima kasih! Kado berhasil diklaim atas nama ${friendName} 🎁`);
    setClaimingId(null);
    setFriendName("");
  };

  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-100 shadow-xl text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-amber-100/60 mx-auto" />
          <div className="h-6 bg-slate-200 rounded-full w-3/4 mx-auto" />
          <div className="h-4 bg-slate-100 rounded-full w-1/2 mx-auto" />
          <div className="h-10 bg-slate-100 rounded-xl w-full mt-4" />
        </div>
      </div>
    );
  }

  if (pageStatus === "notFound" || !weddingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 mx-auto">
            <Gift className="w-8 h-8 text-pastel-600" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Registry Tidak Ditemukan
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-3 font-serif">
              404 • Registry Belum Terdaftar
            </h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Daftar kado pernikahan dengan tautan ini tidak ditemukan atau alamat tautan telah diubah oleh calon pengantin.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>Kembali ke Beranda HajatKita</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 p-4 sm:p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-amber-100/80 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 mx-auto">
            <Gift className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Wedding Gift Registry
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight pt-2">
              Wishlist Kado Pernikahan
            </h1>
            <p className="text-sm font-serif italic text-amber-700">
              {weddingData.groomName && weddingData.brideName
                ? `${weddingData.groomName} & ${weddingData.brideName}`
                : "Calon Mempelai"}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Terima kasih banyak atas perhatian dan kasih sayang rekan-rekan serta sahabat.
            Daftar ini adalah barang kebutuhan rumah pasca-nikah kami. Anda bisa mengklaim barang yang
            ingin Anda hadiahkan agar tidak ada kado yang ganda!
          </p>
        </div>

        {/* Claim Modal Popup */}
        {claimingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-bold text-slate-800">
                Klaim Kado Pernikahan
              </h3>
              <p className="text-xs text-slate-500">
                Tuliskan nama Anda atau nama kelompok (misal: Teman Kantor / Geng SMA) yang menghadiahkan barang ini:
              </p>

              <form onSubmit={handleClaimSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: Dimas & Tim Engineering"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setClaimingId(null);
                      setFriendName("");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                  >
                    Konfirmasi Hadiahkan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Items List */}
        {claimableItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
            <Home className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">Belum Ada Wishlist Terbuka</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Kedua calon mempelai belum menambahkan daftar kado yang dapat diklaim publik saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {claimableItems.map((item) => {
              const isClaimed = item.isAcquired || Boolean(item.claimedBy);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-5 border transition-all shadow-subtle-sm flex flex-col justify-between ${
                    isClaimed ? "border-slate-200 opacity-80 bg-slate-50/50" : "border-amber-100/90 hover:border-amber-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.roomCategory}
                      </span>
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Sudah Dihadiahi
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Bisa Dihadiahkan
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Merk / Tipe: {item.brand}</p>
                    <p className="text-xs font-mono font-bold text-slate-700">
                      Estimasi: {formatRupiah(item.price)}
                    </p>

                    {item.claimedBy && (
                      <p className="text-xs text-emerald-700 font-semibold italic bg-emerald-50/60 p-2 rounded-xl">
                        Dihadiahkan oleh: {item.claimedBy}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {item.purchaseUrl && (
                      <a
                        href={item.purchaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-pastel-600 font-semibold hover:underline"
                      >
                        <span>Lihat Referensi Toko</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {!isClaimed && (
                      <button
                        type="button"
                        onClick={() => setClaimingId(item.id)}
                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Saya Hadiahkan Ini</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-6">
          Hajat Kita • Biar Nikah Lebih Terarah • hajatkita.id/registry/{slug}
        </div>
      </div>
    </div>
  );
}
