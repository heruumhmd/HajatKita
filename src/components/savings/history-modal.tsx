"use client";

import React from "react";
import { Coins, Trash2, X } from "lucide-react";
import { LifeSavingsGoal, LifeSavingsDeposit } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface HistoryModalProps {
  isOpen: boolean;
  targetGoal: LifeSavingsGoal | null;
  onClose: () => void;
  onDeleteDeposit: (goalId: string, deposit: LifeSavingsDeposit) => void;
}

export function HistoryModal({
  isOpen,
  targetGoal,
  onClose,
  onDeleteDeposit,
}: HistoryModalProps) {
  if (!isOpen || !targetGoal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-700">
              Riwayat Setoran
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

        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
          {targetGoal.deposits.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Coins className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Belum ada catatan setoran untuk impian ini.</p>
            </div>
          ) : (
            targetGoal.deposits.map((dep) => (
              <div
                key={dep.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black font-mono text-emerald-700 text-sm">
                      {formatRupiah(dep.amount)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      {dep.contributor === "GROOM"
                        ? "Suami"
                        : dep.contributor === "BRIDE"
                        ? "Istri"
                        : "Bersama"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    <span>{dep.date}</span>
                    {dep.notes && <span> • {dep.notes}</span>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteDeposit(targetGoal.id, dep)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Hapus setoran ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold shrink-0">
          <span className="text-slate-500">Total Akumulasi:</span>
          <span className="text-emerald-700 font-mono font-black text-sm">
            {formatRupiah(targetGoal.currentAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
