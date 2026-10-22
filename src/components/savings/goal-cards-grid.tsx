"use client";

import React, { useMemo } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  History,
  Coins,
  Wallet,
  Calendar,
  CheckCircle2,
  Filter,
  PiggyBank,
} from "lucide-react";
import { LifeSavingsGoal, LifeSavingsCategory } from "@/types";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";

interface GoalCardsGridProps {
  lifeGoals: LifeSavingsGoal[];
  categoryMeta: Record<LifeSavingsCategory, any>;
  selectedCategory: LifeSavingsCategory | "ALL";
  setSelectedCategory: (cat: LifeSavingsCategory | "ALL") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAddGoal: (defaultCat?: LifeSavingsCategory, prefillTitle?: string, prefillTarget?: number) => void;
  onOpenEditGoal: (goal: LifeSavingsGoal) => void;
  onDeleteGoal: (goal: LifeSavingsGoal) => void;
  onOpenDeposit: (goal: LifeSavingsGoal) => void;
  onOpenHistory: (goal: LifeSavingsGoal) => void;
  onLoadTemplate: () => void;
}

export function GoalCardsGrid({
  lifeGoals,
  categoryMeta,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onOpenAddGoal,
  onOpenEditGoal,
  onDeleteGoal,
  onOpenDeposit,
  onOpenHistory,
  onLoadTemplate,
}: GoalCardsGridProps) {
  const filteredGoals = useMemo(() => {
    return lifeGoals.filter((g) => {
      const matchCategory = selectedCategory === "ALL" || g.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.notes && g.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.instrument && g.instrument.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [lifeGoals, selectedCategory, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Filter Pills Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Category horizontal scrolling buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Semua ({lifeGoals.length})
          </button>

          {(Object.keys(categoryMeta) as LifeSavingsCategory[]).map((catKey) => {
            const meta = categoryMeta[catKey];
            const count = lifeGoals.filter((g) => g.category === catKey).length;
            const isSelected = selectedCategory === catKey;
            const Icon = meta.icon;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? `${meta.bgColor} ${meta.textColor} border ${meta.borderColor} shadow-2xs`
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{meta.shortLabel}</span>
                {count > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/80 rounded-full border border-slate-200">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari impian..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pastel-500 outline-none"
          />
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700 mx-auto shadow-xs">
            <PiggyBank className="w-8 h-8 text-pastel-600" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Belum Ada Target Impian Terpasang
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mulai petakan rencana kehidupan berdua setelah pernikahan: DP Rumah pertama, tabungan haji, dana darurat, hingga pensiun.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onLoadTemplate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs shadow-2xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Muat Template 7 Impian Indonesia</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAddGoal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Impian Mandiri</span>
            </button>
          </div>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const meta = categoryMeta[goal.category] || categoryMeta.LAINNYA;
            const Icon = meta.icon;
            const percent =
              goal.targetAmount > 0
                ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className={`rounded-3xl bg-white border p-5 sm:p-6 shadow-subtle-sm transition-all subtle-hover flex flex-col justify-between ${
                  isCompleted ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200/90"
                }`}
              >
                <div>
                  {/* Top Header of Card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-2xs ${meta.bgColor} ${meta.borderColor} ${meta.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span
                          className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                        >
                          {meta.shortLabel}
                        </span>
                        {goal.priority === "HIGH" && (
                          <span className="ml-1 text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
                            Prioritas
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions icons */}
                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => onOpenEditGoal(goal)}
                        className="p-1.5 hover:text-pastel-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Target"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteGoal(goal)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Goal Title */}
                  <h3 className="font-extrabold text-slate-900 text-base font-serif tracking-tight leading-snug">
                    {goal.title}
                  </h3>

                  {goal.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {goal.notes}
                    </p>
                  )}

                  {/* Progress Bar & Numerical stats */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold block">Terkumpul:</span>
                        <span className="text-base font-black font-mono text-emerald-700">
                          {formatRupiah(goal.currentAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-semibold block">Target:</span>
                        <span className="text-xs font-bold font-mono text-slate-700">
                          {formatRupiah(goal.targetAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-emerald-500"
                            : percent > 50
                            ? "bg-pastel-600"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="font-bold text-slate-700">{percent.toFixed(1)}% Tercapai</span>
                      {isCompleted ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lunas / Selesai</span>
                        </span>
                      ) : (
                        <span>Sisa {formatRupiah(remainingAmount)}</span>
                      )}
                    </div>
                  </div>

                  {/* Extra Meta Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    {goal.instrument && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        <Coins className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{goal.instrument}</span>
                      </span>
                    )}

                    {goal.monthlyCommitment && goal.monthlyCommitment > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                        <Wallet className="w-3 h-3 text-amber-600" />
                        <span>{formatShortRupiah(goal.monthlyCommitment)}/bln</span>
                      </span>
                    )}

                    {goal.targetDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{goal.targetDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenHistory(goal)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-pastel-700 transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Riwayat ({goal.deposits.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDeposit(goal)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Setor / Top-up</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
