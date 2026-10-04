"use client";

import React, { useState } from "react";
import {
  Home,
  Plus,
  ExternalLink,
  CheckCircle2,
  Circle,
  Tag,
  Gift,
  Share2,
  Sparkles,
  Bed,
  UtensilsCrossed,
  Tv,
} from "lucide-react";
import { mockPostWeddingItems } from "@/lib/mock-data";
import { PostWeddingItem, ItemPriority } from "@/types";
import { formatRupiah } from "@/lib/utils";

export default function PostWeddingPage() {
  const [items, setItems] = useState<PostWeddingItem[]>(mockPostWeddingItems);
  const [selectedRoom, setSelectedRoom] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [roomCategory, setRoomCategory] = useState("Kamar Tidur");
  const [price, setPrice] = useState("");
  const [purchaseUrl, setPurchaseUrl] = useState("");
  const [priority, setPriority] = useState<ItemPriority>("MUST_HAVE");

  const toggleAcquired = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAcquired: !item.isAcquired } : item
      )
    );
  };

  const handleClaim = (id: string) => {
    const friendName = prompt("Masukkan nama rekan / keluarga yang menghadiahkan barang ini:");
    if (!friendName) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isAcquired: true, claimedBy: friendName }
          : item
      )
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const priceNum = parseFloat(price) || 0;
    const newItem: PostWeddingItem = {
      id: `pw-${Date.now()}`,
      name,
      roomCategory,
      brand: brand || "Generic",
      price: priceNum,
      purchaseUrl: purchaseUrl || "https://tokopedia.com",
      priority,
      isAcquired: false,
      isGiftClaimable: true,
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    // Reset
    setName("");
    setBrand("");
    setPrice("");
    setPurchaseUrl("");
  };

  const filteredItems = items.filter((item) => {
    const matchRoom = selectedRoom === "ALL" || item.roomCategory === selectedRoom;
    const matchPriority = selectedPriority === "ALL" || item.priority === selectedPriority;
    return matchRoom && matchPriority;
  });

  const totalCost = items.reduce((acc, curr) => acc + curr.price, 0);
  const acquiredCost = items
    .filter((i) => i.isAcquired)
    .reduce((acc, curr) => acc + curr.price, 0);
  const acquiredCount = items.filter((i) => i.isAcquired).length;

  const copyShareLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://hajatkita.vercel.app/registry/dwiki-sarah");
      alert("Link Wishlist Kado Sahabat berhasil disalin! Bagikan ke teman kantor atau sahabat.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Home className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Barang Pasca-Nikah & Rumah Tangga
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Rencana mengisi rumah impian dengan <strong>Merk, Harga, Link Toko, & Registry Kado Sahabat</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-pastel-50 text-pastel-700 font-bold text-xs border border-sky-200 shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan Wishlist Kado</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-pastel-500 hover:bg-pastel-600 text-white font-bold text-xs shadow-pastel-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kebutuhan Rumah</span>
          </button>
        </div>
      </div>

      {/* Summary Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Estimasi Perabotan</span>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">{formatRupiah(totalCost)}</p>
          <span className="text-[11px] text-pastel-600 font-semibold">{items.length} Item Terdaftar</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Sudah Dimiliki / Dihadiahkan</span>
          <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{formatRupiah(acquiredCost)}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {acquiredCount} dari {items.length} Item ({((acquiredCount / (items.length || 1)) * 100).toFixed(0)}%)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Belum Terpenuhi</span>
          <p className="text-lg font-extrabold text-slate-700 mt-0.5">
            {formatRupiah(Math.max(0, totalCost - acquiredCost))}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold">
            {items.length - acquiredCount} Item Masih Dibutuhkan
          </span>
        </div>
      </div>

      {/* Filter Category & Priority Bar */}
      <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Room Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["ALL", "Kamar Tidur", "Dapur", "Ruang Keluarga"].map((room) => (
            <button
              key={room}
              type="button"
              onClick={() => setSelectedRoom(room)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRoom === room
                  ? "bg-pastel-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-pastel-50 hover:text-pastel-700"
              }`}
            >
              {room === "ALL" ? "Semua Ruangan" : room}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Prioritas:</span>
          {[
            { label: "Semua", value: "ALL" },
            { label: "Wajib Segera", value: "MUST_HAVE" },
            { label: "Bisa Nanti", value: "NICE_TO_HAVE" },
          ].map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setSelectedPriority(p.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                selectedPriority === p.value
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post Wedding Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
              item.isAcquired
                ? "border-emerald-200 bg-emerald-50/20"
                : "border-sky-100 hover:border-pastel-300 pastel-glow-hover"
            }`}
          >
            <div>
              {/* Top Tags */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-pastel-100 text-pastel-700 px-2 py-0.5 rounded-lg border border-sky-200/60">
                  {item.roomCategory}
                </span>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    item.priority === "MUST_HAVE"
                      ? "bg-rose-100 text-rose-700"
                      : item.priority === "NICE_TO_HAVE"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.priority === "MUST_HAVE"
                    ? "Wajib Segera"
                    : item.priority === "NICE_TO_HAVE"
                    ? "Bisa Nanti"
                    : "Impian"}
                </span>
              </div>

              {/* Title & Brand */}
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                {item.name}
              </h3>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Tag className="w-3 h-3 text-pastel-500" />
                  Merk: <strong className="text-slate-900">{item.brand}</strong>
                </span>
              </div>

              {/* Price Details */}
              <div className="mt-3 p-2.5 rounded-xl bg-pastel-50/60 border border-sky-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Estimasi Harga:</span>
                <span className="text-xs font-extrabold text-pastel-700">
                  {formatRupiah(item.price)}
                </span>
              </div>

              {/* Gift Claimed Status */}
              {item.claimedBy && (
                <div className="mt-2.5 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                  <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    Dihadiahkan: <strong>{item.claimedBy}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={item.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pastel-600 hover:text-pastel-700 hover:underline"
              >
                <span>Link Produk</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-1.5">
                {!item.claimedBy && !item.isAcquired && (
                  <button
                    type="button"
                    onClick={() => handleClaim(item.id)}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                    title="Tandai ada teman/keluarga yang menghadiahkan ini"
                  >
                    Klaim Kado
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleAcquired(item.id)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                    item.isAcquired
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-pastel-500 hover:bg-pastel-600 text-white shadow-xs"
                  }`}
                >
                  {item.isAcquired ? "Batal Ceklis" : "Ceklis Dimiliki"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Barang Rumah Tangga */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-pastel-600">
                <Home className="w-5 h-5 text-pastel-500" />
                <h3 className="font-bold text-slate-800 text-base">Tambah Kebutuhan Rumah Tangga</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Barang Rumah Tangga
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kasur Springbed 160x200 / Kulkas Inverter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merk / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Comforta, LG, Philips, Steincookware"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ruangan / Area
                  </label>
                  <select
                    value={roomCategory}
                    onChange={(e) => setRoomCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="Kamar Tidur">Kamar Tidur</option>
                    <option value="Dapur">Dapur & Masak</option>
                    <option value="Ruang Keluarga">Ruang Keluarga / Elektronik</option>
                    <option value="Kamar Mandi">Kamar Mandi & Cuci</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Harga (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 3500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Skala Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ItemPriority)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="MUST_HAVE">Wajib Segera (Kebutuhan Pokok)</option>
                    <option value="NICE_TO_HAVE">Bisa Nanti (Kebutuhan Sekunder)</option>
                    <option value="DREAM_ITEM">Wishlist Impian (Bila Ada Rezeki Lebih)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Pembelian / Referensi Produk (Tokopedia / Shopee / Official)
                </label>
                <input
                  type="url"
                  placeholder="https://tokopedia.com/..."
                  value={purchaseUrl}
                  onChange={(e) => setPurchaseUrl(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-pastel-500 hover:bg-pastel-600 text-white text-xs font-bold shadow-pastel-sm"
                >
                  Simpan ke Wishlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
