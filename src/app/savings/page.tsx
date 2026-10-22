"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Plus,
  Home,
  Car,
  Landmark,
  GraduationCap,
  Sparkles,
  Calculator,
  Wallet,
  Coins,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import {
  LifeSavingsGoal,
  LifeSavingsCategory,
  LifeSavingsDeposit,
} from "@/types";
import { formatRupiah, formatShortRupiah } from "@/lib/utils";
import { showToastSuccess, showConfirmDialog } from "@/lib/swal";
import confetti from "canvas-confetti";

import { KprCalculator } from "@/components/savings/kpr-calculator";
import { EducationCalculator } from "@/components/savings/education-calculator";
import { HajjCalculator } from "@/components/savings/hajj-calculator";
import { EmergencyFundCalculator } from "@/components/savings/emergency-fund-calculator";
import { GoalCardsGrid } from "@/components/savings/goal-cards-grid";
import { GoalModal } from "@/components/savings/goal-modal";
import { DepositModal } from "@/components/savings/deposit-modal";
import { HistoryModal } from "@/components/savings/history-modal";

const categoryMeta: Record<
  LifeSavingsCategory,
  {
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    badgeColor: string;
    defaultInstrument: string;
    description: string;
  }
> = {
  RUMAH_KPR: {
    label: "Rumah & DP KPR",
    shortLabel: "Rumah",
    icon: Home,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-800",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    defaultInstrument: "Reksadana Pasar Uang & Tabungan Bersama",
    description: "DP KPR, biaya notaris, BPHTB, & renovasi rumah pertama",
  },
  KENDARAAN: {
    label: "Kendaraan (Mobil/Motor)",
    shortLabel: "Kendaraan",
    icon: Car,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    defaultInstrument: "Tabungan Auto-Debit Berjangka",
    description: "DP mobil keluarga, motor harian, atau beli cash",
  },
  HARI_TUA: {
    label: "Hari Tua & Pensiun",
    shortLabel: "Pensiun",
    icon: Landmark,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-800",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    defaultInstrument: "DPLK Syariah, Saham Dividen, & SBN",
    description: "Dana pensiun mandiri, DPLK, dan kebebasan finansial hari tua",
  },
  INVESTASI: {
    label: "Investasi & Portofolio",
    shortLabel: "Investasi",
    icon: TrendingUp,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-800",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    defaultInstrument: "Emas Batangan Antam, SBN Ritel, & Reksadana",
    description: "Reksadana, saham syariah, SBN, dan logam mulia emas fisik",
  },
  PENDIDIKAN_ANAK: {
    label: "Pendidikan & Buah Hati",
    shortLabel: "Anak",
    icon: GraduationCap,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-800",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    defaultInstrument: "Reksadana Saham & Asuransi Pendidikan",
    description: "Biaya persalinan, perlengkapan bayi, & dana kuliah anak",
  },
  HAJI_UMROH: {
    label: "Ibadah Haji & Umroh",
    shortLabel: "Haji",
    icon: Landmark,
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    textColor: "text-teal-800",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    defaultInstrument: "Tabungan Haji BPKH & Emas Batangan",
    description: "Porsi awal haji reguler/khusus & paket umroh berdua",
  },
  DANA_DARURAT: {
    label: "Dana Darurat Keluarga",
    shortLabel: "Darurat",
    icon: Wallet,
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
    textColor: "text-slate-800",
    badgeColor: "bg-slate-200 text-slate-800 border-slate-300",
    defaultInstrument: "Rekening Tabungan Likuid & Deposito",
    description: "Jaring pengaman 6-12 bulan pengeluaran rumah tangga",
  },
  LAINNYA: {
    label: "Impian & Liburan Lainnya",
    shortLabel: "Lainnya",
    icon: Sparkles,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
    defaultInstrument: "Tabungan Khusus Liburan",
    description: "Honeymoon impian, modal usaha, atau renovasi samping",
  },
};

export default function SavingsPage() {
  const {
    lifeGoals,
    addLifeGoal,
    updateLifeGoal,
    deleteLifeGoal,
    addLifeGoalDeposit,
    deleteLifeGoalDeposit,
    loadTemplateLifeGoals,
    requireAuth,
    currentUser,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<"GOALS" | "CALCULATOR">("GOALS");
  const [calcType, setCalcType] = useState<"KPR" | "EDUCATION" | "HAJJ" | "EMERGENCY">("KPR");
  const [selectedCategory, setSelectedCategory] = useState<LifeSavingsCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeSavingsGoal | null>(null);
  const [prefillCat, setPrefillCat] = useState<LifeSavingsCategory>("RUMAH_KPR");
  const [prefillTitle, setPrefillTitle] = useState("");
  const [prefillTarget, setPrefillTarget] = useState<number | undefined>(undefined);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositTargetGoal, setDepositTargetGoal] = useState<LifeSavingsGoal | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetGoal, setHistoryTargetGoal] = useState<LifeSavingsGoal | null>(null);

  // Aggregate Metrics
  const totalTarget = useMemo(() => lifeGoals.reduce((acc, g) => acc + g.targetAmount, 0), [lifeGoals]);
  const totalCurrent = useMemo(() => lifeGoals.reduce((acc, g) => acc + g.currentAmount, 0), [lifeGoals]);
  const totalMonthlyCommitment = useMemo(
    () => lifeGoals.reduce((acc, g) => acc + (g.monthlyCommitment || 0), 0),
    [lifeGoals]
  );
  const overallPercentage = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : "0";
  const completedGoalsCount = useMemo(() => lifeGoals.filter((g) => g.currentAmount >= g.targetAmount).length, [lifeGoals]);

  // Open Add Goal Modal
  const handleOpenAddGoal = (defaultCat?: LifeSavingsCategory, titlePrefill?: string, targetPrefill?: number) => {
    if (!requireAuth()) return;
    setEditingGoal(null);
    setPrefillCat(defaultCat || "RUMAH_KPR");
    setPrefillTitle(titlePrefill || "");
    setPrefillTarget(targetPrefill);
    setIsGoalModalOpen(true);
  };

  // Open Edit Goal Modal
  const handleOpenEditGoal = (goal: LifeSavingsGoal) => {
    if (!requireAuth()) return;
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  // Save Goal Handler
  const handleSaveGoal = (goalData: {
    title: string;
    category: LifeSavingsCategory;
    targetAmount: number;
    targetDate?: string;
    monthlyCommitment?: number;
    instrument?: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    notes?: string;
  }) => {
    if (editingGoal) {
      updateLifeGoal({
        ...editingGoal,
        ...goalData,
      });
      showToastSuccess(`Target impian "${goalData.title}" berhasil diperbarui! 🎯`);
    } else {
      addLifeGoal({
        ...goalData,
        currentAmount: 0,
      });
      showToastSuccess(`Target impian "${goalData.title}" berhasil ditambahkan! 🌟`);
    }
    setIsGoalModalOpen(false);
  };

  // Delete Goal
  const handleDeleteGoal = async (goal: LifeSavingsGoal) => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Target Impian?",
      text: `Apakah Anda yakin ingin menghapus target tabungan "${goal.title}"? Riwayat setoran untuk impian ini juga akan dihapus.`,
      confirmButtonText: "Ya, Hapus",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    deleteLifeGoal(goal.id);
    showToastSuccess(`Target impian "${goal.title}" berhasil dihapus`);
  };

  // Open Deposit Modal
  const handleOpenDeposit = (goal: LifeSavingsGoal) => {
    if (!requireAuth()) return;
    setDepositTargetGoal(goal);
    setIsDepositModalOpen(true);
  };

  // Submit Deposit
  const handleSubmitDeposit = (
    amountNum: number,
    date: string,
    contributor: "GROOM" | "BRIDE" | "BOTH",
    notes?: string
  ) => {
    if (!depositTargetGoal) return;

    addLifeGoalDeposit(depositTargetGoal.id, {
      date,
      amount: amountNum,
      contributor,
      notes,
    });

    const newEstimatedTotal = depositTargetGoal.currentAmount + amountNum;
    if (newEstimatedTotal >= depositTargetGoal.targetAmount) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {}
      showToastSuccess(`Alhamdulillah! Target "${depositTargetGoal.title}" tercapai 100%! 🎉`);
    } else {
      showToastSuccess(`Setoran ${formatRupiah(amountNum)} berhasil dicatat! 💰`);
    }

    setIsDepositModalOpen(false);
  };

  // Open History Modal
  const handleOpenHistory = (goal: LifeSavingsGoal) => {
    setHistoryTargetGoal(goal);
    setIsHistoryModalOpen(true);
  };

  // Delete Deposit from history
  const handleDeleteDeposit = async (goalId: string, deposit: LifeSavingsDeposit) => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Setoran?",
      text: `Hapus catatan setoran ${formatRupiah(deposit.amount)} tanggal ${deposit.date}?`,
      confirmButtonText: "Ya, Hapus",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    deleteLifeGoalDeposit(goalId, deposit.id);
    showToastSuccess("Setoran berhasil dihapus");
    if (historyTargetGoal && historyTargetGoal.id === goalId) {
      setHistoryTargetGoal((prev) => {
        if (!prev) return null;
        const updated = prev.deposits.filter((d) => d.id !== deposit.id);
        const newTotal = updated.reduce((acc, d) => acc + d.amount, 0);
        return { ...prev, deposits: updated, currentAmount: newTotal };
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Banner Header */}
      <div className="bg-gradient-to-r from-pastel-50/70 via-white to-amber-50/60 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-100 border border-pastel-300 flex items-center justify-center text-pastel-700 shadow-xs shrink-0">
            <TrendingUp className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                Tabungan Masa Depan &amp; Life Goals
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-pastel-700 bg-pastel-50 px-2 py-0.5 rounded-full border border-pastel-200 hidden sm:inline-block">
                Pasca-Nikah
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Rencanakan tabungan DP Rumah / KPR, Kendaraan, Pensiun, Reksadana, Sekolah Anak, &amp; Porsi Haji berdua
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "GOALS" ? "CALCULATOR" : "GOALS")}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          >
            <Calculator className="w-4 h-4 text-pastel-600" />
            <span>{activeTab === "GOALS" ? "Buka Kalkulator" : "Kembali ke Impian"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddGoal()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Impian</span>
          </button>
        </div>
      </div>

      {/* 2. Top Aggregate Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Terkumpul */}
        <div className="bg-white rounded-3xl p-4.5 sm:p-5 border border-slate-200/90 shadow-subtle-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Terkumpul Bersama</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black font-mono text-emerald-700">
              {formatRupiah(totalCurrent)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              dari total target {formatShortRupiah(totalTarget)}
            </p>
          </div>
        </div>

        {/* Card 2: Progres Capaian */}
        <div className="bg-white rounded-3xl p-4.5 sm:p-5 border border-slate-200/90 shadow-subtle-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Progres Capaian</span>
            <div className="w-8 h-8 rounded-xl bg-pastel-50 border border-pastel-200 flex items-center justify-center text-pastel-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black font-mono text-pastel-700">
              {overallPercentage}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-pastel-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, parseFloat(overallPercentage))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Komitmen Nabung Bulanan */}
        <div className="bg-white rounded-3xl p-4.5 sm:p-5 border border-slate-200/90 shadow-subtle-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Komitmen Bulanan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black font-mono text-amber-700">
              {formatRupiah(totalMonthlyCommitment)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              alokasi rutin gabungan / bln
            </p>
          </div>
        </div>

        {/* Card 4: Target Selesai */}
        <div className="bg-white rounded-3xl p-4.5 sm:p-5 border border-slate-200/90 shadow-subtle-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Target Tercapai</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black font-mono text-slate-900">
              {completedGoalsCount}/{lifeGoals.length}{" "}
              <span className="text-xs font-semibold text-slate-500">Tercapai</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {lifeGoals.length - completedGoalsCount} impian sedang berproses
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Views: GOALS vs CALCULATOR */}
      {activeTab === "CALCULATOR" ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-subtle-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-serif">
                Kalkulator &amp; Simulasi Finansial Keluarga
              </h2>
              <p className="text-xs text-slate-500">
                Hitung estimasi kebutuhan nyata sebelum mengunci target tabungan bersama
              </p>
            </div>

            {/* Simulator Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setCalcType("KPR")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  calcType === "KPR" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Rumah &amp; KPR
              </button>
              <button
                type="button"
                onClick={() => setCalcType("EDUCATION")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  calcType === "EDUCATION" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pendidikan Anak
              </button>
              <button
                type="button"
                onClick={() => setCalcType("HAJJ")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  calcType === "HAJJ" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Porsi Haji
              </button>
              <button
                type="button"
                onClick={() => setCalcType("EMERGENCY")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  calcType === "EMERGENCY" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dana Darurat
              </button>
            </div>
          </div>

          {/* Calculator Content by Type */}
          {calcType === "KPR" && (
            <KprCalculator
              onSetGoal={(category, title, amount) => {
                setActiveTab("GOALS");
                handleOpenAddGoal(category, title, amount);
              }}
            />
          )}

          {calcType === "EDUCATION" && (
            <EducationCalculator
              onSetGoal={(category, title, amount) => {
                setActiveTab("GOALS");
                handleOpenAddGoal(category, title, amount);
              }}
            />
          )}

          {calcType === "HAJJ" && (
            <HajjCalculator
              onSetGoal={(category, title, amount) => {
                setActiveTab("GOALS");
                handleOpenAddGoal(category, title, amount);
              }}
            />
          )}

          {calcType === "EMERGENCY" && (
            <EmergencyFundCalculator
              onSetGoal={(category, title, amount) => {
                setActiveTab("GOALS");
                handleOpenAddGoal(category, title, amount);
              }}
            />
          )}
        </div>
      ) : (
        <GoalCardsGrid
          lifeGoals={lifeGoals}
          categoryMeta={categoryMeta}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAddGoal={handleOpenAddGoal}
          onOpenEditGoal={handleOpenEditGoal}
          onDeleteGoal={handleDeleteGoal}
          onOpenDeposit={handleOpenDeposit}
          onOpenHistory={handleOpenHistory}
          onLoadTemplate={loadTemplateLifeGoals}
        />
      )}

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        editingGoal={editingGoal}
        categoryMeta={categoryMeta}
        initialCategory={prefillCat}
        initialTitle={prefillTitle}
        initialTarget={prefillTarget}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        targetGoal={depositTargetGoal}
        defaultContributor={currentUser?.role === "BRIDE" ? "BRIDE" : "GROOM"}
        onClose={() => setIsDepositModalOpen(false)}
        onSubmit={handleSubmitDeposit}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        targetGoal={historyTargetGoal}
        onClose={() => setIsHistoryModalOpen(false)}
        onDeleteDeposit={handleDeleteDeposit}
      />
    </div>
  );
}
