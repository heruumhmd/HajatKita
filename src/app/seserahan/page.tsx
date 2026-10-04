"use client";

import React, { useState } from "react";
import {
  Gift,
  Plus,
  ExternalLink,
  CheckCircle2,
  Circle,
  Tag,
  DollarSign,
  Package,
  Search,
  Filter,
} from "lucide-react";
import { mockSeserahanItems } from "@/lib/mock-data";
import { SeserahanItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

export default function SeserahanPage() {
  const [items, setItems] = useState<SeserahanItem[]>(mockSeserahanItems);
  const [selectedBox, setSelectedBox] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new item
  const [newItemName, setNewItemName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newBoxNumber, setNewBoxNumber] = useState(1);
  const [newCategory, setNewCategory] = useState("Ibadah");
  const [newPrice, setNewPrice] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const togglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
      )
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const priceNum = parseFloat(newPrice) || 0;
    const boxNames: Record<number, string> = {
      1: "Box 1: Perlengkapan Ibadah",
      2: "Box 2: Skincare & Body Care",
      3: "Box 3: Tas & Sepatu",
      4: "Box 4: Busana & Pakaian",
      5: "Box 5: Perhiasan & Logam Mulia",
      6: "Box 6: Makanan Khas Tradisional",
    };

    const newItem: SeserahanItem = {
      id: `ses-${Date.now()}`,
      boxNumber: newBoxNumber,
      boxName: boxNames[newBoxNumber] || `Box ${newBoxNumber}`,
      name: newItemName,
      brand: newBrand || "Custom / Local",
      category: newCategory,
      estimatedPrice: priceNum,
      purchaseUrl: newUrl || "https://shopee.co.id",
      isPurchased: false,
      notes: newNotes,
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    // Reset form
    setNewItemName("");
    setNewBrand("");
    setNewPrice("");
    setNewUrl("");
    setNewNotes("");
  };

  const filteredItems = items.filter((item) => {
    const matchBox = selectedBox === "ALL" || item.boxNumber === selectedBox;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBox && matchSearch;
  });

  const totalEstimated = items.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
  const totalPurchased = items
    .filter((i) => i.isPurchased)
    .reduce((acc, curr) => acc + (curr.actualPrice || curr.estimatedPrice), 0);
  const purchasedCount = items.filter((i) => i.isPurchased).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Gift className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Katalog Seserahan & Hantaran
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Tracking barang seserahan lengkap dengan <strong>Merk, Estimasi Harga, dan Link Pembelian</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-500 hover:bg-pastel-600 text-white font-bold text-xs shadow-pastel-sm transition-all active:scale-95 self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang Seserahan</span>
        </button>
      </div>

      {/* Summary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Estimasi Anggaran</span>
          <p className="text-lg font-extrabold text-slate-800 mt-0.5">{formatRupiah(totalEstimated)}</p>
          <span className="text-[11px] text-pastel-600 font-semibold">{items.length} Barang Terdaftar</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Sudah Terbeli / Siap</span>
          <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{formatRupiah(totalPurchased)}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {purchasedCount} dari {items.length} Barang ({((purchasedCount / (items.length || 1)) * 100).toFixed(0)}%)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Sisa Belanja yang Belum</span>
          <p className="text-lg font-extrabold text-slate-700 mt-0.5">
            {formatRupiah(Math.max(0, totalEstimated - totalPurchased))}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold">
            {items.length - purchasedCount} Barang Masih Menunggu
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama barang, merk (Wardah, Charles & Keith), atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-300"
          />
        </div>

        {/* Box Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { label: "Semua Box", value: "ALL" },
            { label: "Box 1: Ibadah", value: 1 },
            { label: "Box 2: Skincare", value: 2 },
            { label: "Box 3: Tas & Sepatu", value: 3 },
            { label: "Box 4: Busana", value: 4 },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setSelectedBox(tab.value as number | "ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBox === tab.value
                  ? "bg-pastel-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-pastel-50 hover:text-pastel-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seserahan Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
              item.isPurchased
                ? "border-emerald-200 bg-emerald-50/20"
                : "border-sky-100 hover:border-pastel-300 pastel-glow-hover"
            }`}
          >
            <div>
              {/* Top Tags */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-pastel-100 text-pastel-700 px-2 py-0.5 rounded-lg border border-sky-200/60 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {item.boxName}
                </span>

                <button
                  type="button"
                  onClick={() => togglePurchased(item.id)}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    item.isPurchased
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500 hover:bg-pastel-100 hover:text-pastel-700"
                  }`}
                >
                  {item.isPurchased ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sudah Dibeli</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>Belum Dibeli</span>
                    </>
                  )}
                </button>
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
                <span className="text-[11px] text-slate-400">•</span>
                <span className="text-xs text-slate-500">{item.category}</span>
              </div>

              {/* Price Details */}
              <div className="mt-3 p-2.5 rounded-xl bg-pastel-50/60 border border-sky-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Estimasi Harga:</span>
                <span className="text-xs font-extrabold text-pastel-700">
                  {formatRupiah(item.estimatedPrice)}
                </span>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-500 italic mt-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  &ldquo;{item.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Bottom Purchase Link & Action */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={item.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pastel-600 hover:text-pastel-700 hover:underline"
              >
                <span>Buka Link Toko</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => togglePurchased(item.id)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                  item.isPurchased
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-pastel-500 hover:bg-pastel-600 text-white shadow-xs"
                }`}
              >
                {item.isPurchased ? "Batalkan Ceklis" : "Ceklis Sudah Beli"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Barang Seserahan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-pastel-600">
                <Gift className="w-5 h-5 text-pastel-500" />
                <h3 className="font-bold text-slate-800 text-base">Tambah Item Seserahan Baru</h3>
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
                  Nama Barang Seserahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mukena Silk Royale Premium / Tas Selempang"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
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
                    placeholder="Contoh: Wardah, Dior, Charles & Keith"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilihan Kotak / Box
                  </label>
                  <select
                    value={newBoxNumber}
                    onChange={(e) => setNewBoxNumber(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value={1}>Box 1: Perlengkapan Ibadah</option>
                    <option value={2}>Box 2: Skincare & Body Care</option>
                    <option value={3}>Box 3: Tas & Sepatu</option>
                    <option value={4}>Box 4: Busana & Pakaian</option>
                    <option value={5}>Box 5: Perhiasan & Logam Mulia</option>
                    <option value={6}>Box 6: Makanan Khas Tradisional</option>
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
                    placeholder="Contoh: 1250000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Item
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Perawatan, Pakaian, Ibadah"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Pembelian Toko (Shopee / Tokopedia / Official Web)
                </label>
                <input
                  type="url"
                  placeholder="https://shopee.co.id/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Khusus (Warna, Ukuran, Varian)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Warna Rose Gold Soft, ukuran sepatu 38"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-300"
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
                  Simpan Item ke Box
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
