"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, X } from "lucide-react";
import { LifeSavingsGoal, LifeSavingsCategory } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface GoalModalProps {
  isOpen: boolean;
  editingGoal: LifeSavingsGoal | null;
  categoryMeta: Record<LifeSavingsCategory, { label: string; defaultInstrument: string }>;
  initialCategory?: LifeSavingsCategory;
  initialTitle?: string;
  initialTarget?: number;
  onClose: () => void;
  onSave: (goalData: {
    title: string;
    category: LifeSavingsCategory;
    targetAmount: number;
    targetDate?: string;
    monthlyCommitment?: number;
    instrument?: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    notes?: string;
  }) => void;
}

export function GoalModal({
  isOpen,
  editingGoal,
  categoryMeta,
  initialCategory = "RUMAH_KPR",
  initialTitle = "",
  initialTarget,
  onClose,
  onSave,
}: GoalModalProps) {
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState<LifeSavingsCategory>("RUMAH_KPR");
  const [goalTargetAmount, setGoalTargetAmount] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalMonthlyCommitment, setGoalMonthlyCommitment] = useState("");
  const [goalInstrument, setGoalInstrument] = useState("");
  const [goalPriority, setGoalPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [goalNotes, setGoalNotes] = useState("");

  useEffect(() => {
    if (editingGoal) {
      setGoalTitle(editingGoal.title);
      setGoalCategory(editingGoal.category);
      setGoalTargetAmount(String(editingGoal.targetAmount));
      setGoalTargetDate(editingGoal.targetDate || "");
      setGoalMonthlyCommitment(editingGoal.monthlyCommitment ? String(editingGoal.monthlyCommitment) : "");
      setGoalInstrument(editingGoal.instrument || categoryMeta[editingGoal.category]?.defaultInstrument || "");
      setGoalPriority(editingGoal.priority);
      setGoalNotes(editingGoal.notes || "");
    } else {
      setGoalTitle(initialTitle || "");
      setGoalCategory(initialCategory);
      setGoalTargetAmount(initialTarget ? String(initialTarget) : "");
      setGoalTargetDate("");
      setGoalMonthlyCommitment("");
      setGoalInstrument(categoryMeta[initialCategory]?.defaultInstrument || "");
      setGoalPriority("HIGH");
      setGoalNotes("");
    }
  }, [editingGoal, initialCategory, initialTitle, initialTarget, categoryMeta, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const targetNum = Math.max(0, parseFloat(goalTargetAmount) || 0);
    const monthlyNum = Math.max(0, parseFloat(goalMonthlyCommitment) || 0);

    onSave({
      title: goalTitle.trim(),
      category: goalCategory,
      targetAmount: targetNum,
      targetDate: goalTargetDate || undefined,
      monthlyCommitment: monthlyNum || undefined,
      instrument: goalInstrument.trim() || categoryMeta[goalCategory]?.defaultInstrument,
      priority: goalPriority,
      notes: goalNotes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-serif">
              {editingGoal ? "Edit Target Impian" : "Tambah Target Impian Baru"}
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
            <label className="block font-bold text-slate-700 mb-1">Kategori Impian</label>
            <select
              value={goalCategory}
              onChange={(e) => {
                const c = e.target.value as LifeSavingsCategory;
                setGoalCategory(c);
                if (!goalInstrument) {
                  setGoalInstrument(categoryMeta[c]?.defaultInstrument || "");
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
            >
              {(Object.keys(categoryMeta) as LifeSavingsCategory[]).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {categoryMeta[catKey].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Judul / Nama Impian</label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Misal: DP KPR Rumah Pertama di BSD"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Nominal (Rp)</label>
              <input
                type="number"
                required
                value={goalTargetAmount}
                onChange={(e) => setGoalTargetAmount(e.target.value)}
                placeholder="Contoh: 120000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
              />
              {parseFloat(goalTargetAmount) > 0 && (
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  = {formatRupiah(parseFloat(goalTargetAmount))}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Komitmen Nabung/Bln (Rp)</label>
              <input
                type="number"
                value={goalMonthlyCommitment}
                onChange={(e) => setGoalMonthlyCommitment(e.target.value)}
                placeholder="Contoh: 3000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Tanggal Tercapai</label>
              <input
                type="date"
                value={goalTargetDate}
                onChange={(e) => setGoalTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tingkat Prioritas</label>
              <select
                value={goalPriority}
                onChange={(e) => setGoalPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
              >
                <option value="HIGH">Tinggi (Wajib / Utama)</option>
                <option value="MEDIUM">Sedang (Penting)</option>
                <option value="LOW">Rendah (Fleksibel)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Wadah / Rekening Instrumen Tabungan
            </label>
            <input
              type="text"
              value={goalInstrument}
              onChange={(e) => setGoalInstrument(e.target.value)}
              placeholder="Misal: Reksadana Bibit, Emas Antam, Tabungan BSI"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={2}
              value={goalNotes}
              onChange={(e) => setGoalNotes(e.target.value)}
              placeholder="Rencana strategi atau detail spesifik..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-pastel-500 outline-none resize-none"
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
              {editingGoal ? "Simpan Perubahan" : "Buat Impian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
