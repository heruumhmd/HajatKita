"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
  Plus,
  Trash2,
  Phone,
  Check,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { formatRupiah } from "@/lib/utils";
import { VendorMilestone } from "@/types";

export default function VendorsPage() {
  const { vendors, addVendor, toggleVendorStage, deleteVendor, requireAuth } = useWedding();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vendorName, setVendorName] = useState("");
  const [serviceType, setServiceType] = useState("Gedung / Venue");
  const [totalContract, setTotalContract] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleOpenAddVendor = () => {
    if (!requireAuth()) return;
    setIsModalOpen(true);
  };

  const handleToggleStage = (vendorId: string, stageIndex: number) => {
    if (!requireAuth()) return;
    toggleVendorStage(vendorId, stageIndex);
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (!requireAuth()) return;
    deleteVendor(vendorId);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!vendorName.trim()) return;

    const contractNum = parseFloat(totalContract) || 0;

    // Default safe Indonesian wedding payment milestones
    const defaultStages = [
      {
        name: "DP Booking Tanggal (20%)",
        percentage: 20,
        amount: Math.round(contractNum * 0.2),
        isPaid: false,
        condition: "Menerima kwitansi & surat lock tanggal resmi",
      },
      {
        name: "Termin 2 / Technical Meeting (40%)",
        percentage: 40,
        amount: Math.round(contractNum * 0.4),
        isPaid: false,
        condition: "Layout panggung / food testing / fitting disetujui",
      },
      {
        name: "Pelunasan Pasca-Acara H+1 (40%)",
        percentage: 40,
        amount: Math.round(contractNum * 0.4),
        isPaid: false,
        condition: "Setelah pekerjaan selesai memuaskan di hari H",
      },
    ];

    addVendor({
      vendorName,
      serviceType,
      totalContract: contractNum,
      contactPerson,
      contactPhone,
      stages: defaultStages,
    });

    setIsModalOpen(false);
    setVendorName("");
    setTotalContract("");
    setContactPerson("");
    setContactPhone("");
  };

  const totalContractAll = vendors.reduce((acc, curr) => acc + curr.totalContract, 0);
  const totalPaidAll = vendors.reduce((acc, curr) => {
    const paidForVendor = curr.stages
      .filter((s) => s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0);
    return acc + paidForVendor;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/50 via-white to-pastel-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Proteksi Kontrak Vendor &amp; Termin Aman
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Mitigasi risiko penipuan WO dengan aturan termin bertahap berbasis bukti serah terima
            </p>
          </div>
        </div>

        <button
          id="tour-vendors-add"
          type="button"
          onClick={handleOpenAddVendor}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors w-full sm:w-auto self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kontrak Vendor</span>
        </button>
      </div>

      {/* Anti-Scam Golden Rules Banner */}
      <div id="tour-vendors-golden" className="p-4 bg-amber-50/70 border border-amber-200 rounded-3xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-amber-900">Prinsip Aman Pembayaran Hajat Kita:</strong> Jangan pernah melunasi 100% biaya vendor (terutama katering, dekorasi, &amp; dokumentasi) jauh sebelum hari H. Sisakan minimal <strong>20% - 30%</strong> yang baru dilunasi pada H+1 setelah pekerjaan selesai secara memuaskan di lapangan.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Komitmen Kontrak Vendor</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
            {formatRupiah(totalContractAll)}
          </span>
          <span className="text-[11px] text-slate-400">{vendors.length} Rekanan Terdaftar</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle-sm">
          <span className="text-xs text-slate-500 font-semibold block">Realisasi Termin Terbayar</span>
          <span className="text-2xl font-black font-mono text-emerald-700 mt-1 block">
            {formatRupiah(totalPaidAll)}
          </span>
          <span className="text-[11px] text-slate-400">
            Sisa kewajiban termin: {formatRupiah(Math.max(0, totalContractAll - totalPaidAll))}
          </span>
        </div>
      </div>

      {/* Vendor List Cards */}
      <div id="tour-vendors-list">
      {vendors.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-subtle-sm space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Rekanan Vendor</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Catat vendor gedung, katering, WO, atau dokumentasi Anda dan kelola termin pembayarannya agar aman.
          </p>
          <button
            type="button"
            onClick={handleOpenAddVendor}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Vendor Pertama</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {vendors.map((vm) => {
            const paidSum = vm.stages
              .filter((s) => s.isPaid)
              .reduce((sum, s) => sum + s.amount, 0);

            return (
              <div
                key={vm.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-800 bg-pastel-50 px-2 py-0.5 rounded-md border border-pastel-200">
                      {vm.serviceType}
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 font-serif">
                      {vm.vendorName}
                    </h3>
                    {vm.contactPerson && (
                      <p className="text-xs text-slate-500">
                        Kontak: {vm.contactPerson} {vm.contactPhone ? `(${vm.contactPhone})` : ""}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 font-medium">Nilai Kontrak:</span>
                      <p className="text-base font-black font-mono text-slate-900">
                        {formatRupiah(vm.totalContract)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteVendor(vm.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                      title="Hapus Kontrak"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stages List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {vm.stages.map((stage, sIdx) => (
                    <div
                      key={sIdx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        stage.isPaid
                          ? "bg-emerald-50/30 border-emerald-200"
                          : "bg-slate-50/70 border-slate-200"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">{stage.name}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              stage.isPaid
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {stage.isPaid ? "Lunas" : "Belum Dibayar"}
                          </span>
                        </div>
                        <p className="text-base font-black font-mono text-slate-900">
                          {formatRupiah(stage.amount)}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-snug pt-1">
                          Syarat: {stage.condition}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleToggleStage(vm.id, sIdx)}
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 ${
                            stage.isPaid
                              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                              : "bg-pastel-600 hover:bg-pastel-700 text-white"
                          }`}
                        >
                          {stage.isPaid ? (
                            <span>Batalkan Lunas</span>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tandai Terbayar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Add Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                Tambah Kontrak Rekanan Vendor
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Vendor / Penyedia Jasa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Grand Ballroom Bandung / Wardah MUA"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Layanan
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  >
                    <option value="Gedung / Venue">Gedung / Venue</option>
                    <option value="Katering Utama">Katering Utama &amp; Stall</option>
                    <option value="Busana & Rias MUA">Busana &amp; Rias MUA</option>
                    <option value="Dekorasi & Panggung">Dekorasi &amp; Pelaminan</option>
                    <option value="Foto & Video Dokumentasi">Foto &amp; Video</option>
                    <option value="Wedding Organizer (WO)">Wedding Organizer (WO)</option>
                    <option value="Hiburan Musik">Hiburan &amp; Sound</option>
                    <option value="Undangan & Souvenir">Undangan &amp; Souvenir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Nilai Kontrak (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 28000000"
                    value={totalContract}
                    onChange={(e) => setTotalContract(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kontak PIC Vendor
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mas Budi"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon / WA PIC
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                Sistem akan otomatis membagi termin pembayaran aman: <strong>DP 20%</strong>, <strong>Termin 2 40%</strong>, dan <strong>Pelunasan 40%</strong> pasca-acara.
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
                  Simpan Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
