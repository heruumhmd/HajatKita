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
  Check,
  Trash2,
  Copy,
  Edit2,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { PostWeddingItem, ItemPriority } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { showToastSuccess, showToastInfo, showConfirmDialog, showPromptDialog } from "@/lib/swal";

export default function PostWeddingPage() {
  const {
    postWedding,
    addPostWedding,
    editPostWedding,
    togglePostWedding,
    claimPostWedding,
    deletePostWedding,
    wedding,
    requireAuth,
  } = useWedding();

  const [selectedRoom, setSelectedRoom] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PostWeddingItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [roomCategory, setRoomCategory] = useState("Kamar Tidur");
  const [price, setPrice] = useState("");
  const [purchaseUrl, setPurchaseUrl] = useState("");
  const [priority, setPriority] = useState<ItemPriority>("MUST_HAVE");

  const handleClaim = async (item: PostWeddingItem) => {
    if (!requireAuth()) return;
    const friendName = await showPromptDialog({
      title: "Klaim Kado Pernikahan",
      text: `Masukkan nama rekan / keluarga yang menghadiahkan "${item.name}":`,
      inputPlaceholder: "Contoh: Bpk. Hendra & Rekan Kerja",
      confirmButtonText: "Konfirmasi Hadiahkan",
    });
    if (!friendName) return;
    claimPostWedding(item.id, friendName);
    showToastSuccess(`Kado "${item.name}" berhasil diklaim atas nama ${friendName}! 🎁`);
  };

  const handleOpenAdd = () => {
    if (!requireAuth()) return;
    setEditingItem(null);
    setName("");
    setBrand("");
    setRoomCategory("Kamar Tidur");
    setPrice("");
    setPurchaseUrl("");
    setPriority("MUST_HAVE");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PostWeddingItem) => {
    if (!requireAuth()) return;
    setEditingItem(item);
    setName(item.name);
    setBrand(item.brand);
    setRoomCategory(item.roomCategory);
    setPrice(item.price.toString());
    setPurchaseUrl(item.purchaseUrl || "");
    setPriority(item.priority);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const priceNum = parseFloat(price) || 0;
    if (editingItem) {
      editPostWedding({
        ...editingItem,
        name,
        roomCategory,
        brand: brand || "Generic",
        price: priceNum,
        purchaseUrl: purchaseUrl || "https://tokopedia.com",
        priority,
      });
      showToastSuccess(`Wishlist "${name}" berhasil diperbarui! 🏠`);
    } else {
      addPostWedding({
        name,
        roomCategory,
        brand: brand || "Generic",
        price: priceNum,
        purchaseUrl: purchaseUrl || "https://tokopedia.com",
        priority,
        isAcquired: false,
        isGiftClaimable: true,
      });
      showToastSuccess(`Wishlist "${name}" berhasil ditambahkan! 🏠`);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setName("");
    setBrand("");
    setPrice("");
    setPurchaseUrl("");
  };

  const handleTogglePostWedding = (item: PostWeddingItem) => {
    if (!requireAuth()) return;
    togglePostWedding(item.id);
    const willBeAcquired = !item.isAcquired;
    if (willBeAcquired) {
      showToastSuccess(`"${item.name}" ditandai sudah terpenuhi! 🎉`);
    } else {
      showToastInfo(`Status "${item.name}" diubah ke belum terpenuhi`);
    }
  };

  const handleDeletePostWedding = async (item: PostWeddingItem) => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Kebutuhan Rumah?",
      text: `Apakah Anda yakin ingin menghapus "${item.name}" dari daftar kebutuhan pasca-nikah?`,
      confirmButtonText: "Ya, Hapus",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    deletePostWedding(item.id);
    showToastSuccess(`"${item.name}" berhasil dihapus dari daftar`);
  };

  const filteredItems = postWedding.filter((item) => {
    const matchRoom = selectedRoom === "ALL" || item.roomCategory === selectedRoom;
    const matchPriority = selectedPriority === "ALL" || item.priority === selectedPriority;
    return matchRoom && matchPriority;
  });

  const totalCost = postWedding.reduce((acc, curr) => acc + curr.price, 0);
  const acquiredCost = postWedding
    .filter((i) => i.isAcquired)
    .reduce((acc, curr) => acc + curr.price, 0);
  const acquiredCount = postWedding.filter((i) => i.isAcquired).length;

  const copyShareLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const origin = window.location.origin;
      const url = `${origin}/registry/${wedding.slug || "kami-berdua"}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToastSuccess("Tautan wishlist kado berhasil disalin! 🎁");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <Home className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Kebutuhan Rumah Pasca-Nikah &amp; Registry Kado
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Daftar perabotan primer rumah baru dan wishlist kado agar sahabat tidak memberi barang dobel
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs transition-colors w-full sm:w-auto"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-pastel-600" />}
            <span>{copiedLink ? "Link Tersalin!" : "Salin Link Wishlist"}</span>
          </button>

          <button
            id="tour-postwedding-add"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kebutuhan</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div id="tour-postwedding-guard" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Kebutuhan Rumah</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
            {formatRupiah(totalCost)}
          </span>
          <span className="text-[11px] text-slate-400">Total nilai seluruh perabotan</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
          <span className="text-xs text-slate-500 font-semibold block">Telah Terpenuhi / Dihadiahi</span>
          <span className="text-2xl font-black font-mono text-emerald-700 mt-1 block">
            {formatRupiah(acquiredCost)}
          </span>
          <span className="text-[11px] text-slate-400">
            {acquiredCount} dari {postWedding.length} item telah siap
          </span>
        </div>

        <div id="tour-postwedding-registry" className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
          <span className="text-xs text-slate-500 font-semibold block">Tautan Registry Publik</span>
          <a
            href={`/registry/${wedding.slug || "registry-kami"}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-pastel-700 hover:underline flex items-center gap-1 mt-2"
          >
            <span>Buka /registry/{wedding.slug || "registry-kami"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-[10px] text-slate-400 block mt-1">Dapat diklaim oleh rekan kerja &amp; kerabat</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-subtle-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["ALL", "Kamar Tidur", "Dapur", "Ruang Keluarga", "Elektronik"].map((room) => (
            <button
              key={room}
              type="button"
              onClick={() => setSelectedRoom(room)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRoom === room
                  ? "bg-pastel-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {room === "ALL" ? "Semua Ruangan" : room}
            </button>
          ))}
        </div>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none"
        >
          <option value="ALL">Semua Prioritas</option>
          <option value="MUST_HAVE">Wajib Ada (Must Have)</option>
          <option value="NICE_TO_HAVE">Pelengkap (Nice to Have)</option>
          <option value="DREAM_ITEM">Barang Impian (Dream Item)</option>
        </select>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-subtle-sm space-y-3">
          <Home className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Barang Pasca-Nikah</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Mulai susun barang kebutuhan awal rumah seperti kasur, kulkas, mesin cuci, atau set alat masak.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kebutuhan Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 border transition-all shadow-subtle-sm flex flex-col justify-between ${
                item.isAcquired
                  ? "border-emerald-200 bg-emerald-50/10"
                  : "border-slate-200/90 hover:border-pastel-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.roomCategory}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === "MUST_HAVE"
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : item.priority === "NICE_TO_HAVE"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-purple-50 text-purple-800 border border-purple-200"
                    }`}
                  >
                    {item.priority === "MUST_HAVE"
                      ? "Wajib Ada"
                      : item.priority === "NICE_TO_HAVE"
                      ? "Pelengkap"
                      : "Impian"}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Merk: <strong className="text-slate-700">{item.brand}</strong></p>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  Estimasi: {formatRupiah(item.price)}
                </p>

                {item.claimedBy && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl mt-2 font-medium">
                    Dihadiahi oleh: <strong>{item.claimedBy}</strong>
                  </p>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePostWedding(item)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                      item.isAcquired
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.isAcquired ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Terpenuhi</span>
                      </>
                    ) : (
                      <span>Tandai Terpenuhi</span>
                    )}
                  </button>

                  {!item.isAcquired && (
                    <button
                      type="button"
                      onClick={() => handleClaim(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold"
                    >
                      <Gift className="w-3 h-3 text-amber-600" />
                      <span>Klaim Kado</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
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
                    onClick={() => handleDeletePostWedding(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {editingItem ? "Edit Kebutuhan Pasca-Nikah" : "Tambah Kebutuhan Rumah Pasca-Nikah"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Barang *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kulkas 2 Pintu Inverter, Kasur Springbed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Ruangan
                  </label>
                  <select
                    value={roomCategory}
                    onChange={(e) => setRoomCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="Kamar Tidur">Kamar Tidur</option>
                    <option value="Dapur">Dapur</option>
                    <option value="Ruang Keluarga">Ruang Keluarga</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merk / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: LG, Electrolux, Comforta"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 3500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Skala Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="MUST_HAVE">Wajib Ada (Primer)</option>
                    <option value="NICE_TO_HAVE">Pelengkap (Sekunder)</option>
                    <option value="DREAM_ITEM">Barang Impian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tautan Referensi Toko Online (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://tokopedia.com/... atau Shopee"
                  value={purchaseUrl}
                  onChange={(e) => setPurchaseUrl(e.target.value)}
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
                  {editingItem ? "Simpan Perubahan" : "Tambah Kebutuhan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
