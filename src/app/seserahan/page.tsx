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
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { SeserahanItem } from "@/types";
import { formatRupiah } from "@/lib/utils";

export default function SeserahanPage() {
  const {
    seserahan,
    addSeserahan,
    toggleSeserahan,
    editSeserahan,
    deleteSeserahan,
    requireAuth,
  } = useWedding();

  const [selectedBox, setSelectedBox] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeserahanItem | null>(null);

  // Form State
  const [newItemName, setNewItemName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newBoxNumber, setNewBoxNumber] = useState(1);
  const [newCategory, setNewCategory] = useState("Ibadah");
  const [newPrice, setNewPrice] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const boxNames: Record<number, string> = {
    1: "Box 1: Perlengkapan Ibadah",
    2: "Box 2: Skincare & Body Care",
    3: "Box 3: Tas & Sepatu",
    4: "Box 4: Busana & Pakaian",
    5: "Box 5: Perhiasan & Logam Mulia",
    6: "Box 6: Makanan Khas Tradisional",
    7: "Box 7: Perlengkapan Mandi",
    8: "Box 8: Hobi & Aksesoris Khusus",
  };

  const handleOpenAdd = () => {
    if (!requireAuth()) return;
    setEditingItem(null);
    setNewItemName("");
    setNewBrand("");
    setNewBoxNumber(1);
    setNewCategory("Ibadah");
    setNewPrice("");
    setNewUrl("");
    setNewNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SeserahanItem) => {
    if (!requireAuth()) return;
    setEditingItem(item);
    setNewItemName(item.name);
    setNewBrand(item.brand);
    setNewBoxNumber(item.boxNumber);
    setNewCategory(item.category);
    setNewPrice(String(item.estimatedPrice));
    setNewUrl(item.purchaseUrl);
    setNewNotes(item.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const priceNum = parseFloat(newPrice) || 0;

    if (editingItem) {
      editSeserahan({
        ...editingItem,
        boxNumber: newBoxNumber,
        boxName: boxNames[newBoxNumber] || `Box ${newBoxNumber}`,
        name: newItemName,
        brand: newBrand || "Custom",
        category: newCategory,
        estimatedPrice: priceNum,
        purchaseUrl: newUrl || "https://shopee.co.id",
        notes: newNotes,
      });
    } else {
      addSeserahan({
        boxNumber: newBoxNumber,
        boxName: boxNames[newBoxNumber] || `Box ${newBoxNumber}`,
        name: newItemName,
        brand: newBrand || "Custom",
        category: newCategory,
        estimatedPrice: priceNum,
        purchaseUrl: newUrl || "https://shopee.co.id",
        isPurchased: false,
        notes: newNotes,
      });
    }

    setIsModalOpen(false);
  };

  const filteredItems = seserahan.filter((item) => {
    const matchBox = selectedBox === "ALL" || item.boxNumber === selectedBox;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBox && matchSearch;
  });

  const totalEstimated = seserahan.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
  const totalPurchased = seserahan
    .filter((i) => i.isPurchased)
    .reduce((acc, curr) => acc + (curr.actualPrice || curr.estimatedPrice), 0);
  const purchasedCount = seserahan.filter((i) => i.isPurchased).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-rose-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <Gift className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Katalog Kotak Seserahan &amp; Hantaran
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Rincian barang hantaran per box, estimasi anggaran, dan checklist belanja
            </p>
          </div>
        </div>

        <button
          id="tour-seserahan-add"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-all w-full sm:w-auto self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang Seserahan</span>
        </button>
      </div>

      {/* Progress & Budget Summary Cards */}
      <div id="tour-seserahan-summary" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
          <span className="text-xs text-slate-500 font-semibold block">Progres Pembelian</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900">
              {purchasedCount}/{seserahan.length}
            </span>
            <span className="text-xs text-emerald-700 font-bold">
              ({seserahan.length > 0 ? Math.round((purchasedCount / seserahan.length) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${seserahan.length > 0 ? (purchasedCount / seserahan.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Estimasi Anggaran</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
            {formatRupiah(totalEstimated)}
          </span>
          <span className="text-[11px] text-slate-400">Total anggaran seluruh box</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
          <span className="text-xs text-slate-500 font-semibold block">Realisasi Terbeli</span>
          <span className="text-2xl font-black font-mono text-emerald-700 mt-1 block">
            {formatRupiah(totalPurchased)}
          </span>
          <span className="text-[11px] text-slate-400">
            Sisa belanja: {formatRupiah(Math.max(0, totalEstimated - totalPurchased))}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Box Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedBox("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedBox === "ALL"
                ? "bg-pastel-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Box ({seserahan.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((boxNum) => {
            const count = seserahan.filter((i) => i.boxNumber === boxNum).length;
            return (
              <button
                key={boxNum}
                type="button"
                onClick={() => setSelectedBox(boxNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedBox === boxNum
                    ? "bg-pastel-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Box {boxNum} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari barang atau merk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-300"
          />
        </div>
      </div>

      {/* Items List */}
      <div id="tour-seserahan-boxes">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-subtle-sm space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Belum Ada Barang Seserahan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mulai susun daftar barang hantaran seperti mukena, skincare, sepatu, atau perhiasan per box.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Barang Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 border transition-all shadow-subtle-sm flex flex-col justify-between ${
                item.isPurchased
                  ? "border-emerald-200 bg-emerald-50/10"
                  : "border-slate-200/90 hover:border-pastel-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-800 bg-pastel-50 px-2 py-0.5 rounded-md border border-pastel-200">
                    {item.boxName}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.isPurchased
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {item.isPurchased ? "Terbeli" : "Rencana Beli"}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{item.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>Merk: <strong className="text-slate-700">{item.brand}</strong></span>
                  <span>•</span>
                  <span>{item.category}</span>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl mt-2">
                    Catatan: {item.notes}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Estimasi Harga:</span>
                  <span className="text-xs font-black font-mono text-slate-800">
                    {formatRupiah(item.estimatedPrice)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {item.purchaseUrl && (
                    <a
                      href={item.purchaseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-pastel-600 rounded-lg"
                      title="Lihat Link Toko"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!requireAuth()) return;
                      toggleSeserahan(item.id);
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                      item.isPurchased
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.isPurchased ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </>
                    ) : (
                      <span>Tandai Terbeli</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-pastel-600 rounded-lg transition-colors"
                    title="Edit Barang"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!requireAuth()) return;
                      deleteSeserahan(item.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    title="Hapus Barang"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {editingItem ? "Edit Barang Seserahan" : "Tambah Barang Seserahan"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Barang / Rincian *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Set Mukena Silk Royale Premium & Sajadah"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Kotak (Box) *
                  </label>
                  <select
                    value={newBoxNumber}
                    onChange={(e) => setNewBoxNumber(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        Box {num} ({boxNames[num]?.split(": ")[1] || `Kotak ${num}`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merk / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Royale Silk / Wardah"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibadah, Skincare, Pakaian"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1250000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tautan Pembelian / E-Commerce (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://shopee.co.id/... atau Tokopedia"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan (Warna, Ukuran, Varian)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Warna Rose Gold, Ukuran 38"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                >
                  {editingItem ? "Simpan Perubahan" : "Tambah Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
