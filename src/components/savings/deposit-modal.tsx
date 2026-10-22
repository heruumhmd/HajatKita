"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LifeSavingsGoal } from "@/types";
import { formatShortRupiah } from "@/lib/utils";

interface DepositModalProps {
  isOpen: boolean;
  targetGoal: LifeSavingsGoal | null;
  defaultContributor?: "GROOM" | "BRIDE" | "BOTH";
  onClose: () => void;
  onSubmit: (amount: number, date: string, contributor: "GROOM" | "BRIDE" | "BOTH", notes?: string) => void;
}

export function DepositModal({
  isOpen,
  targetGoal,
  defaultContributor = "BOTH",
  onClose,
  onSubmit,
}: DepositModalProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDate, setDepositDate] = useState(new Date().toISOString().slice(0, 10));
  const [depositContributor, setDepositContributor] = useState<"GROOM" | "BRIDE" | "BOTH">(defaultContributor);
  const [depositNotes, setDepositNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDepositAmount("");
      setDepositDate(new Date().toISOString().slice(0, 10));
      setDepositContributor(defaultContributor);
      setDepositNotes("");
    }
  }, [isOpen, defaultContributor]);

  if (!isOpen || !targetGoal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (!amountNum || amountNum <= 0) return;

    onSubmit(
      amountNum,
      depositDate || new Date().toISOString().slice(0, 10),
      depositContributor,
      depositNotes.trim() || undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-700">
              Setor Tabungan Impian
            </span>
            <h3 className="text-base font-black text-slate-900 font-serif">
              {targetGoal.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nominal Setoran (Rp)</label>
            <input
              type="number"
              required
              autoFocus
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Contoh: 2000000"
              className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 font-mono font-black text-base text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[500000, 1000000, 2500000, 5000000, 10000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDepositAmount(String(val))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-pastel-100 text-[11px] font-mono font-bold text-slate-700 hover:text-pastel-800 transition-colors"
                >
                  +{formatShortRupiah(val)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Penyetor Dana</label>
              <select
                value={depositContributor}
                onChange={(e) => setDepositContributor(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
              >
                <option value="GROOM">Calon Suami</option>
                <option value="BRIDE">Calon Istri</option>
                <option value="BOTH">Tabungan Bersama</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Setor</label>
              <input
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan / Sumber Dana</label>
            <input
              type="text"
              value={depositNotes}
              onChange={(e) => setDepositNotes(e.target.value)}
              placeholder="Misal: Gaji bulanan, bonus proyek, bagi hasil dividen"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold shadow-xs transition-colors"
            >
              Konfirmasi Setoran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
