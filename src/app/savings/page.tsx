"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Plus,
  Home,
  Car,
  Landmark,
  GraduationCap,
  Compass,
  ShieldCheck,
  Sparkles,
  Calculator,
  Wallet,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Edit3,
  History,
  Coins,
  DollarSign,
  PiggyBank,
  Heart,
  AlertCircle,
  HelpCircle,
  Filter,
  Check,
} from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import {
  LifeSavingsGoal,
  LifeSavingsCategory,
  LifeSavingsDeposit,
} from "@/types";
import { formatRupiah, formatShortRupiah, calculateDaysRemaining } from "@/lib/utils";
import { showToastSuccess, showConfirmDialog } from "@/lib/swal";
import confetti from "canvas-confetti";

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
    defaultInstrument: "Tabungan Berjangka Pendidikan & Reksadana",
    description: "Persalinan, aqiqah, perlengkapan bayi, & uang pangkal sekolah/kuliah",
  },
  HAJI_UMROH: {
    label: "Haji & Umroh",
    shortLabel: "Haji/Umroh",
    icon: Compass,
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    textColor: "text-teal-800",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    defaultInstrument: "Tabungan Haji BSI / Bank Muamalat",
    description: "Setoran awal porsi haji Kemenag berdua atau paket umroh",
  },
  DANA_DARURAT: {
    label: "Dana Darurat (Emergency)",
    shortLabel: "Darurat",
    icon: ShieldCheck,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-800",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    defaultInstrument: "Reksadana Pasar Uang (Bibit / Bareksa) Likuid",
    description: "Bantalan aman 6-12 bulan pengeluaran rutin keluarga",
  },
  LAINNYA: {
    label: "Impian Lainnya",
    shortLabel: "Lainnya",
    icon: Sparkles,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    textColor: "text-slate-800",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    defaultInstrument: "Tabungan Khusus",
    description: "Qurban tahunan, liburan keluarga, gadget kerja, dll",
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
  const [selectedCategory, setSelectedCategory] = useState<LifeSavingsCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeSavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositTargetGoal, setDepositTargetGoal] = useState<LifeSavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDate, setDepositDate] = useState(new Date().toISOString().slice(0, 10));
  const [depositContributor, setDepositContributor] = useState<"GROOM" | "BRIDE" | "BOTH">("BOTH");
  const [depositNotes, setDepositNotes] = useState("");

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetGoal, setHistoryTargetGoal] = useState<LifeSavingsGoal | null>(null);

  // Goal Form States
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState<LifeSavingsCategory>("RUMAH_KPR");
  const [goalTargetAmount, setGoalTargetAmount] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalMonthlyCommitment, setGoalMonthlyCommitment] = useState("");
  const [goalInstrument, setGoalInstrument] = useState("");
  const [goalPriority, setGoalPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [goalNotes, setGoalNotes] = useState("");

  // Calculator Sub-Tab & States
  const [calcType, setCalcType] = useState<"KPR" | "EDUCATION" | "HAJJ" | "EMERGENCY">("KPR");

  // KPR Simulator states
  const [kprHomePrice, setKprHomePrice] = useState("650000000");
  const [kprDpPercent, setKprDpPercent] = useState("15");
  const [kprTenor, setKprTenor] = useState("15");
  const [kprInterestRate, setKprInterestRate] = useState("7.25");
  const [kprJointIncome, setKprJointIncome] = useState("20000000");

  // Education Simulator states
  const [eduCurrentAge, setEduCurrentAge] = useState("0");
  const [eduTargetStage, setEduTargetStage] = useState<"PERSALINAN" | "SD" | "SMP" | "SMA" | "KULIAH">("SD");
  const [eduPresentCost, setEduPresentCost] = useState("35000000");
  const [eduInflationRate, setEduInflationRate] = useState("10");

  // Hajj Simulator states
  const [hajjType, setHajjType] = useState<"HAJI_REGULER" | "HAJI_PLUS" | "UMROH_DUO">("HAJI_REGULER");
  const [hajjPersons, setHajjPersons] = useState("2");

  // Emergency Fund Simulator states
  const [emgMonthlyExpense, setEmgMonthlyExpense] = useState("8000000");
  const [emgMultiplier, setEmgMultiplier] = useState("6");

  // Filtered & Sorted Goals
  const filteredGoals = useMemo(() => {
    return lifeGoals.filter((goal) => {
      const matchCategory = selectedCategory === "ALL" || goal.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        goal.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (goal.instrument && goal.instrument.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (goal.notes && goal.notes.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchCategory && matchQuery;
    });
  }, [lifeGoals, selectedCategory, searchQuery]);

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
  const handleOpenAddGoal = (defaultCat?: LifeSavingsCategory, prefillTitle?: string, prefillTarget?: number) => {
    if (!requireAuth()) return;
    setEditingGoal(null);
    setGoalTitle(prefillTitle || "");
    const cat = defaultCat || "RUMAH_KPR";
    setGoalCategory(cat);
    setGoalTargetAmount(prefillTarget ? String(prefillTarget) : "");
    setGoalTargetDate("");
    setGoalMonthlyCommitment("");
    setGoalInstrument(categoryMeta[cat].defaultInstrument);
    setGoalPriority("HIGH");
    setGoalNotes("");
    setIsGoalModalOpen(true);
  };

  // Open Edit Goal Modal
  const handleOpenEditGoal = (goal: LifeSavingsGoal) => {
    if (!requireAuth()) return;
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalCategory(goal.category);
    setGoalTargetAmount(String(goal.targetAmount));
    setGoalTargetDate(goal.targetDate || "");
    setGoalMonthlyCommitment(goal.monthlyCommitment ? String(goal.monthlyCommitment) : "");
    setGoalInstrument(goal.instrument || categoryMeta[goal.category].defaultInstrument);
    setGoalPriority(goal.priority);
    setGoalNotes(goal.notes || "");
    setIsGoalModalOpen(true);
  };

  // Save Goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const targetNum = Math.max(0, parseFloat(goalTargetAmount) || 0);
    const monthlyNum = Math.max(0, parseFloat(goalMonthlyCommitment) || 0);

    if (editingGoal) {
      updateLifeGoal({
        ...editingGoal,
        title: goalTitle.trim(),
        category: goalCategory,
        targetAmount: targetNum,
        targetDate: goalTargetDate || undefined,
        monthlyCommitment: monthlyNum || undefined,
        instrument: goalInstrument.trim() || undefined,
        priority: goalPriority,
        notes: goalNotes.trim() || undefined,
      });
      showToastSuccess(`Target impian "${goalTitle}" berhasil diperbarui! 🎯`);
    } else {
      addLifeGoal({
        title: goalTitle.trim(),
        category: goalCategory,
        targetAmount: targetNum,
        currentAmount: 0,
        targetDate: goalTargetDate || undefined,
        monthlyCommitment: monthlyNum || undefined,
        instrument: goalInstrument.trim() || categoryMeta[goalCategory].defaultInstrument,
        priority: goalPriority,
        notes: goalNotes.trim() || undefined,
      });
      showToastSuccess(`Target impian "${goalTitle}" berhasil ditambahkan! 🌟`);
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
    setDepositAmount("");
    setDepositDate(new Date().toISOString().slice(0, 10));
    setDepositContributor(currentUser?.role === "BRIDE" ? "BRIDE" : "GROOM");
    setDepositNotes("");
    setIsDepositModalOpen(true);
  };

  // Submit Deposit
  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositTargetGoal) return;
    const amountNum = parseFloat(depositAmount);
    if (!amountNum || amountNum <= 0) return;

    addLifeGoalDeposit(depositTargetGoal.id, {
      date: depositDate || new Date().toISOString().slice(0, 10),
      amount: amountNum,
      contributor: depositContributor,
      notes: depositNotes.trim() || undefined,
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
    // Update local historyTargetGoal reference
    if (historyTargetGoal && historyTargetGoal.id === goalId) {
      setHistoryTargetGoal((prev) => {
        if (!prev) return null;
        const updated = prev.deposits.filter((d) => d.id !== deposit.id);
        const newTotal = updated.reduce((acc, d) => acc + d.amount, 0);
        return { ...prev, deposits: updated, currentAmount: newTotal };
      });
    }
  };

  // KPR Calculator Computations
  const kprCalculations = useMemo(() => {
    const price = Math.max(0, parseFloat(kprHomePrice) || 0);
    const dpPercent = Math.max(0, Math.min(100, parseFloat(kprDpPercent) || 0));
    const tenor = Math.max(1, parseInt(kprTenor, 10) || 15);
    const rate = Math.max(0, parseFloat(kprInterestRate) || 7.25);
    const income = Math.max(0, parseFloat(kprJointIncome) || 0);

    const dpNominal = (price * dpPercent) / 100;
    const loanPrincipal = Math.max(0, price - dpNominal);
    const estimatedExtraFees = loanPrincipal * 0.055; // BPHTB, AJB, Provisi, Notaris, Asuransi ~ 5.5%
    const totalCashNeededForDP = dpNominal + estimatedExtraFees;

    // Monthly installment using annuity formula: P * (r/12) / (1 - (1 + r/12)^(-12*t))
    const monthlyRate = rate / 100 / 12;
    const totalMonths = tenor * 12;
    let monthlyInstallment = 0;
    if (loanPrincipal > 0 && monthlyRate > 0) {
      monthlyInstallment =
        (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else if (loanPrincipal > 0) {
      monthlyInstallment = loanPrincipal / totalMonths;
    }

    const dsr = income > 0 ? ((monthlyInstallment / income) * 100).toFixed(1) : "0";
    const dsrNum = parseFloat(dsr);
    let dsrStatus: "SEHAT" | "WASPADA" | "BERBAHAYA" = "SEHAT";
    if (dsrNum > 40) {
      dsrStatus = "BERBAHAYA";
    } else if (dsrNum > 30) {
      dsrStatus = "WASPADA";
    }

    return {
      price,
      dpNominal,
      estimatedExtraFees,
      totalCashNeededForDP,
      loanPrincipal,
      monthlyInstallment,
      dsr,
      dsrStatus,
    };
  }, [kprHomePrice, kprDpPercent, kprTenor, kprInterestRate, kprJointIncome]);

  // Education Calculator Computations
  const eduCalculations = useMemo(() => {
    const currentAge = Math.max(0, parseInt(eduCurrentAge, 10) || 0);
    const presentCost = Math.max(0, parseFloat(eduPresentCost) || 0);
    const inflation = Math.max(0, parseFloat(eduInflationRate) || 10) / 100;

    let targetAge = 7;
    if (eduTargetStage === "PERSALINAN") targetAge = 1;
    if (eduTargetStage === "SD") targetAge = 7;
    if (eduTargetStage === "SMP") targetAge = 13;
    if (eduTargetStage === "SMA") targetAge = 16;
    if (eduTargetStage === "KULIAH") targetAge = 18;

    const yearsRemaining = Math.max(1, targetAge - currentAge);
    // Future Value: FV = PV * (1 + i)^n
    const futureCost = presentCost * Math.pow(1 + inflation, yearsRemaining);
    const monthlyNeeded = futureCost / (yearsRemaining * 12);

    return {
      yearsRemaining,
      futureCost,
      monthlyNeeded,
    };
  }, [eduCurrentAge, eduTargetStage, eduPresentCost, eduInflationRate]);

  // Hajj Calculator Computations
  const hajjCalculations = useMemo(() => {
    const persons = Math.max(1, parseInt(hajjPersons, 10) || 2);
    let porsiPerPerson = 25000000;
    let totalEstPelunasanPerPerson = 55000000;

    if (hajjType === "HAJI_PLUS") {
      porsiPerPerson = 65000000;
      totalEstPelunasanPerPerson = 180000000;
    } else if (hajjType === "UMROH_DUO") {
      porsiPerPerson = 35000000;
      totalEstPelunasanPerPerson = 35000000;
    }

    const totalSetoranAwal = porsiPerPerson * persons;
    const totalEstBiaya = totalEstPelunasanPerPerson * persons;

    return {
      totalSetoranAwal,
      totalEstBiaya,
      porsiPerPerson,
      persons,
    };
  }, [hajjType, hajjPersons]);

  // Emergency Fund Computations
  const emgCalculations = useMemo(() => {
    const monthly = Math.max(0, parseFloat(emgMonthlyExpense) || 0);
    const multiplier = Math.max(1, parseInt(emgMultiplier, 10) || 6);
    const totalTargetEmergency = monthly * multiplier;
    return {
      totalTargetEmergency,
      monthly,
      multiplier,
    };
  }, [emgMonthlyExpense, emgMultiplier]);

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
            <div className="text-lg sm:text-2xl font-black font-mono text-slate-900">
              {formatRupiah(totalMonthlyCommitment)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              alokasi tabungan berdua per bulan
            </p>
          </div>
        </div>

        {/* Card 4: Target Impian Selesai */}
        <div className="bg-white rounded-3xl p-4.5 sm:p-5 border border-slate-200/90 shadow-subtle-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Status Impian</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">
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
        /* ================== CALCULATOR VIEW ================== */
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Harga Properti Rumah (Rp)
                  </label>
                  <input
                    type="number"
                    value={kprHomePrice}
                    onChange={(e) => setKprHomePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    = {formatRupiah(parseFloat(kprHomePrice) || 0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Uang Muka (DP %)
                    </label>
                    <input
                      type="number"
                      value={kprDpPercent}
                      onChange={(e) => setKprDpPercent(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tenor Pinjaman (Tahun)
                    </label>
                    <select
                      value={kprTenor}
                      onChange={(e) => setKprTenor(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-pastel-500 outline-none bg-white"
                    >
                      <option value="5">5 Tahun (60 Bln)</option>
                      <option value="10">10 Tahun (120 Bln)</option>
                      <option value="15">15 Tahun (180 Bln)</option>
                      <option value="20">20 Tahun (240 Bln)</option>
                      <option value="25">25 Tahun (300 Bln)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Suku Bunga / Margin (%/tahun)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={kprInterestRate}
                      onChange={(e) => setKprInterestRate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Gaji Berdua (Joint Income)
                    </label>
                    <input
                      type="number"
                      value={kprJointIncome}
                      onChange={(e) => setKprJointIncome(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* KPR Output Card */}
              <div className="lg:col-span-6 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-6 rounded-3xl border border-emerald-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Hasil Simulasi KPR
                  </span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      kprCalculations.dsrStatus === "SEHAT"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : kprCalculations.dsrStatus === "WASPADA"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    DSR {kprCalculations.dsr}% ({kprCalculations.dsrStatus})
                  </span>
                </div>

                <div className="space-y-3 divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Nominal Uang Muka (DP Murni):</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatRupiah(kprCalculations.dpNominal)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Est. BPHTB, AJB, Notaris &amp; Provisi (5.5%):</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatRupiah(kprCalculations.estimatedExtraFees)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-emerald-50/80 p-2 rounded-xl">
                    <span className="font-extrabold text-emerald-900">
                      Total Cash Wajib Ditabung (DP + Biaya):
                    </span>
                    <span className="font-black font-mono text-emerald-800 text-sm">
                      {formatRupiah(kprCalculations.totalCashNeededForDP)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Plafon Pinjaman Bank:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatRupiah(kprCalculations.loanPrincipal)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-100/70 p-2 rounded-xl">
                    <span className="font-bold text-slate-800">Estimasi Cicilan per Bulan:</span>
                    <span className="font-black font-mono text-pastel-700 text-sm">
                      {formatRupiah(kprCalculations.monthlyInstallment)} / bulan
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("GOALS");
                      handleOpenAddGoal(
                        "RUMAH_KPR",
                        `DP Rumah Pertama & Biaya KPR (${kprTenor} Thn)`,
                        Math.round(kprCalculations.totalCashNeededForDP)
                      );
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Jadikan Target Tabungan ({formatShortRupiah(kprCalculations.totalCashNeededForDP)})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Education Simulator */}
          {calcType === "EDUCATION" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenjang Pendidikan yang Dituju
                  </label>
                  <select
                    value={eduTargetStage}
                    onChange={(e) => setEduTargetStage(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-pastel-500 outline-none bg-white"
                  >
                    <option value="PERSALINAN">Persalinan &amp; Aqiqah (Tahun 1)</option>
                    <option value="SD">Uang Pangkal SD (Usia 7 Tahun)</option>
                    <option value="SMP">Uang Pangkal SMP (Usia 13 Tahun)</option>
                    <option value="SMA">Uang Pangkal SMA (Usia 16 Tahun)</option>
                    <option value="KULIAH">Kuliah S1 (Usia 18 Tahun)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Usia Anak Saat Ini (Tahun)
                    </label>
                    <input
                      type="number"
                      value={eduCurrentAge}
                      onChange={(e) => setEduCurrentAge(e.target.value)}
                      placeholder="0 jika belum lahir"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Asumsi Inflasi Biaya (%/thn)
                    </label>
                    <input
                      type="number"
                      value={eduInflationRate}
                      onChange={(e) => setEduInflationRate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Biaya Jenjang Tersebut Saat Ini (Rp)
                  </label>
                  <input
                    type="number"
                    value={eduPresentCost}
                    onChange={(e) => setEduPresentCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    = {formatRupiah(parseFloat(eduPresentCost) || 0)}
                  </span>
                </div>
              </div>

              {/* Output Education */}
              <div className="lg:col-span-6 bg-gradient-to-br from-rose-50/70 via-white to-slate-50 p-6 rounded-3xl border border-rose-200/80 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Estimasi Biaya Masa Depan (FV)
                </span>

                <div className="space-y-3 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Sisa Waktu Menabung:</span>
                    <span className="font-bold text-slate-900">{eduCalculations.yearsRemaining} Tahun</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Biaya Standar Hari Ini:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatRupiah(parseFloat(eduPresentCost) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-rose-50/80 p-2.5 rounded-xl">
                    <span className="font-bold text-rose-900">
                      Total Biaya Masa Depan (Terkena Inflasi {eduInflationRate}%):
                    </span>
                    <span className="font-black font-mono text-rose-800 text-sm">
                      {formatRupiah(eduCalculations.futureCost)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-100/70 p-2.5 rounded-xl">
                    <span className="font-bold text-slate-800">Rekomendasi Nabung Bulanan:</span>
                    <span className="font-black font-mono text-pastel-700 text-sm">
                      {formatRupiah(eduCalculations.monthlyNeeded)} / bulan
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("GOALS");
                    handleOpenAddGoal(
                      "PENDIDIKAN_ANAK",
                      `Dana Pendidikan (${eduTargetStage})`,
                      Math.round(eduCalculations.futureCost)
                    );
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Jadikan Target Tabungan ({formatShortRupiah(eduCalculations.futureCost)})</span>
                </button>
              </div>
            </div>
          )}

          {/* Hajj Simulator */}
          {calcType === "HAJJ" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Ibadah ke Tanah Suci
                  </label>
                  <select
                    value={hajjType}
                    onChange={(e) => setHajjType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-pastel-500 outline-none bg-white"
                  >
                    <option value="HAJI_REGULER">Haji Reguler Kemenag (Setoran Awal Rp 25 Jt)</option>
                    <option value="HAJI_PLUS">Haji Khusus / Plus / Furoda</option>
                    <option value="UMROH_DUO">Paket Umroh Honeymoon Berdua</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Jamaah (Orang)
                  </label>
                  <input
                    type="number"
                    value={hajjPersons}
                    onChange={(e) => setHajjPersons(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                  />
                </div>
              </div>

              {/* Hajj Output */}
              <div className="lg:col-span-6 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 p-6 rounded-3xl border border-teal-200/80 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Target Tabungan Porsi Haji / Umroh
                </span>

                <div className="space-y-3 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1.5 bg-teal-50/80 p-2.5 rounded-xl">
                    <span className="font-extrabold text-teal-900">
                      Target Setoran Awal BPIH (Dapat Nomor Porsi):
                    </span>
                    <span className="font-black font-mono text-teal-800 text-sm">
                      {formatRupiah(hajjCalculations.totalSetoranAwal)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Estimasi Pelunasan H-Keberangkatan:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatRupiah(hajjCalculations.totalEstBiaya)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("GOALS");
                    handleOpenAddGoal(
                      "HAJI_UMROH",
                      `Setoran Awal Porsi ${hajjType === "UMROH_DUO" ? "Umroh" : "Haji"} (${hajjCalculations.persons} Orang)`,
                      Math.round(hajjCalculations.totalSetoranAwal)
                    );
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Jadikan Target Setoran Awal ({formatShortRupiah(hajjCalculations.totalSetoranAwal)})</span>
                </button>
              </div>
            </div>
          )}

          {/* Emergency Simulator */}
          {calcType === "EMERGENCY" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pengeluaran Rutin Bulanan Keluarga (Rp)
                  </label>
                  <input
                    type="number"
                    value={emgMonthlyExpense}
                    onChange={(e) => setEmgMonthlyExpense(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-pastel-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">
                    = {formatRupiah(parseFloat(emgMonthlyExpense) || 0)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faktor Pengali Dana Darurat
                  </label>
                  <select
                    value={emgMultiplier}
                    onChange={(e) => setEmgMultiplier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-pastel-500 outline-none bg-white"
                  >
                    <option value="3">3 Bulan (Pasangan baru, belum punya anak, 2 income)</option>
                    <option value="6">6 Bulan (Standar ideal pasangan berkeluarga)</option>
                    <option value="9">9 Bulan (1 anak, income tunggal)</option>
                    <option value="12">12 Bulan (Pekerja lepas / freelancer / wirausaha)</option>
                  </select>
                </div>
              </div>

              {/* Output Emergency */}
              <div className="lg:col-span-6 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-6 rounded-3xl border border-indigo-200/80 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                  Target Dana Darurat Ideal
                </span>

                <div className="space-y-3 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1.5 bg-indigo-50/80 p-2.5 rounded-xl">
                    <span className="font-extrabold text-indigo-900">
                      Total Dana Darurat ({emgCalculations.multiplier}x Pengeluaran):
                    </span>
                    <span className="font-black font-mono text-indigo-800 text-base">
                      {formatRupiah(emgCalculations.totalTargetEmergency)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    💡 Disarankan untuk menyimpan 20% di tabungan rekening operasional dan 80% di Reksadana Pasar Uang (RDPU) yang likuid tanpa biaya penarikan.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("GOALS");
                    handleOpenAddGoal(
                      "DANA_DARURAT",
                      `Dana Darurat Keluarga (${emgCalculations.multiplier} Bulan)`,
                      Math.round(emgCalculations.totalTargetEmergency)
                    );
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Jadikan Target Dana Darurat ({formatShortRupiah(emgCalculations.totalTargetEmergency)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================== GOALS LIST VIEW ================== */
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
                  onClick={loadTemplateLifeGoals}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs shadow-2xs transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Muat Template 7 Impian Indonesia</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAddGoal()}
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

                        {/* Actions drop / icons */}
                        <div className="flex items-center gap-1 text-slate-400">
                          <button
                            type="button"
                            onClick={() => handleOpenEditGoal(goal)}
                            className="p-1.5 hover:text-pastel-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Target"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(goal)}
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
                        onClick={() => handleOpenHistory(goal)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-pastel-700 transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Riwayat ({goal.deposits.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDeposit(goal)}
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
      )}

      {/* ========================================================
          MODAL 1: ADD / EDIT GOAL MODAL
      ======================================================== */}
      {isGoalModalOpen && (
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
                onClick={() => setIsGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Impian</label>
                <select
                  value={goalCategory}
                  onChange={(e) => {
                    const c = e.target.value as LifeSavingsCategory;
                    setGoalCategory(c);
                    if (!goalInstrument) {
                      setGoalInstrument(categoryMeta[c].defaultInstrument);
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
                  onClick={() => setIsGoalModalOpen(false)}
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
      )}

      {/* ========================================================
          MODAL 2: DEPOSIT / TOP-UP MODAL
      ======================================================== */}
      {isDepositModalOpen && depositTargetGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-700">
                  Setor Tabungan Impian
                </span>
                <h3 className="text-base font-black text-slate-900 font-serif">
                  {depositTargetGoal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDeposit} className="space-y-4 text-xs">
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
                {/* Quick Add Chips */}
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
                  onClick={() => setIsDepositModalOpen(false)}
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
      )}

      {/* ========================================================
          MODAL 3: DEPOSITS HISTORY MODAL
      ======================================================== */}
      {isHistoryModalOpen && historyTargetGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-700">
                  Riwayat Setoran
                </span>
                <h3 className="text-base font-black text-slate-900 font-serif">
                  {historyTargetGoal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
              {historyTargetGoal.deposits.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Coins className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">Belum ada catatan setoran untuk impian ini.</p>
                </div>
              ) : (
                historyTargetGoal.deposits.map((dep) => (
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
                      onClick={() => handleDeleteDeposit(historyTargetGoal.id, dep)}
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
                {formatRupiah(historyTargetGoal.currentAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
