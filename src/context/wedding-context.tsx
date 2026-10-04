"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  WeddingProject,
  SavingContribution,
  ChecklistItem,
  SeserahanItem,
  PostWeddingItem,
  GuestItem,
  FamilyQuota,
  RundownItem,
  BudgetCategory,
  VendorMilestone,
  AlignmentTopic,
  AdminStep,
  ActivityLog,
  RSVPStatus,
  User,
} from "@/types";
import { getDefaultCuteCardForRole } from "@/lib/cute-cards";

const STORAGE_KEY = "HAJAT_KITA_STORE_V2";
const AUTH_STORAGE_KEY = "HAJAT_AUTH_USER_V2";

export function generateUniqueInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "HAJAT-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const cleanEmptyWedding: WeddingProject = {
  id: "w-main",
  title: "Pernikahan Kita",
  groomName: "",
  brideName: "",
  weddingDate: "",
  city: "",
  targetBudget: 0,
  currentSavings: 0,
  inviteCode: generateUniqueInviteCode(),
  slug: "",
  venueName: "",
  venueAddress: "",
  maharDetails: "",
  waliNikah: "",
  penghulu: "",
  saksiNikah: "",
  isPartnerConnected: false,
};

export const defaultFamilyQuota: FamilyQuota = {
  venueCapacity: 500,
  groomQuota: 125,
  brideQuota: 125,
  groomParentsQuota: 125,
  brideParentsQuota: 125,
  costPerPax: 85000,
};

export const officialAdminSteps: AdminStep[] = [
  {
    id: "step-1",
    stepNumber: 1,
    stageName: "Pengurusan di RT, RW & Kelurahan / Desa",
    agency: "Kelurahan Domisili Catin",
    estimatedDays: "1 - 3 Hari Kerja",
    cost: "Gratis (Bebas Biaya)",
    requirements: [
      { id: "r1", title: "Surat Pengantar RT & RW setempat", isDone: false },
      { id: "r2", title: "Formulir N1 (Surat Pengantar Nikah dari Kelurahan)", isDone: false },
      { id: "r3", title: "Formulir N2 (Permohonan Kehendak Nikah)", isDone: false },
      { id: "r4", title: "Formulir N4 (Surat Persetujuan Calon Mempelai)", isDone: false },
      { id: "r5", title: "Fotokopi KTP, Kartu Keluarga (KK), dan Akta Kelahiran", isDone: false },
    ],
  },
  {
    id: "step-2",
    stepNumber: 2,
    stageName: "Pemeriksaan Kesehatan Catin Puskesmas & Sertifikat Elsimil",
    agency: "Puskesmas Kecamatan & BKKBN",
    estimatedDays: "1 Hari",
    cost: "Gratis / Rp 20.000 (Lab Puskesmas)",
    requirements: [
      { id: "r6", title: "Pemeriksaan Fisik & Skrining Anemia (Hemoglobin)", isDone: false },
      { id: "r7", title: "Imunisasi Tetanus Toxoid (TT) bagi Calon Istri", isDone: false },
      { id: "r8", title: "Registrasi Aplikasi Elsimil BKKBN di smartphone", isDone: false },
      { id: "r9", title: "Unduh Sertifikat Layak Kawin Elsimil (Syarat Wajib)", isDone: false },
    ],
  },
  {
    id: "step-3",
    stepNumber: 3,
    stageName: "Pendaftaran KUA & SIMKAH Kemenag",
    agency: "Kantor Urusan Agama (KUA)",
    estimatedDays: "Maksimal H-10 Hari Kerja Sebelum Akad",
    cost: "Rp 0 (di KUA jam kerja) / Rp 600.000 (di Luar KUA)",
    requirements: [
      { id: "r10", title: "Daftar Online di portal simkah4.kemenag.go.id", isDone: false },
      { id: "r11", title: "Pas foto latar belakang biru (2x3 = 4 lbr, 4x6 = 2 lbr)", isDone: false, note: "Pria berjas, wanita berkerudung/busana sopan" },
      { id: "r12", title: "Surat Rekomendasi Nikah (Jika nikah di luar domisili)", isDone: false },
      { id: "r13", title: "Bayar Kode Billing PNBP Rp 600.000 via Bank (Bila luar kantor KUA)", isDone: false },
    ],
  },
  {
    id: "step-4",
    stepNumber: 4,
    stageName: "Bimbingan Perkawinan (Bimwin) & Penetapan Wali",
    agency: "KUA & Penghulu",
    estimatedDays: "2 Hari",
    cost: "Gratis",
    requirements: [
      { id: "r14", title: "Mengikuti Bimbingan Perkawinan (Bimwin) Pra-Nikah", isDone: false },
      { id: "r15", title: "Konfirmasi Kehadiran Wali Nikah Sah (Ayah Kandung / Wali Hakim)", isDone: false },
      { id: "r16", title: "Penetapan 2 Orang Saksi Akad Nikah yang Memenuhi Syarat", isDone: false },
    ],
  },
];

export const defaultAlignmentTopics: AlignmentTopic[] = [
  {
    id: "top-1",
    category: "LIVING",
    question: "Di mana rencana tempat tinggal kita setelah akad nikah?",
    groomAnswer: "",
    brideAnswer: "",
    isAgreed: false,
  },
  {
    id: "top-2",
    category: "FINANCIAL",
    question: "Bagaimana sistem pengelolaan rekening dan pos gaji bulanan?",
    groomAnswer: "",
    brideAnswer: "",
    isAgreed: false,
  },
  {
    id: "top-3",
    category: "FINANCIAL",
    question: "Apakah ada kewajiban cicilan berjalan atau komitmen finansial keluarga?",
    groomAnswer: "",
    brideAnswer: "",
    isAgreed: false,
  },
  {
    id: "top-4",
    category: "PARENTS",
    question: "Bagaimana batasan privasi dan campur tangan orang tua/mertua?",
    groomAnswer: "",
    brideAnswer: "",
    isAgreed: false,
  },
  {
    id: "top-5",
    category: "CAREER",
    question: "Bagaimana pembagian peran domestik dan kelanjutan karir bersama?",
    groomAnswer: "",
    brideAnswer: "",
    isAgreed: false,
  },
];

interface WeddingContextType {
  isInitialized: boolean;
  wedding: WeddingProject;
  currentUser: User | null;
  isLoggedIn: boolean;

  // Auth UI state
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isTourOpen: boolean;
  setIsTourOpen: (open: boolean) => void;

  // Data
  savingContributions: SavingContribution[];
  checklist: ChecklistItem[];
  seserahan: SeserahanItem[];
  postWedding: PostWeddingItem[];
  guests: GuestItem[];
  familyQuota: FamilyQuota;
  rundown: RundownItem[];
  budgetCategories: BudgetCategory[];
  vendors: VendorMilestone[];
  alignmentTopics: AlignmentTopic[];
  adminSteps: AdminStep[];
  activityLogs: ActivityLog[];

  // Auth Actions
  login: (userData: Partial<User>) => void;
  loginWithGoogle: () => void;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  requireAuth: (callback?: () => void) => boolean;

  // Partner Duo Workspace Actions
  pairWithPartner: (inviteCode: string) => Promise<{ success: boolean; message: string }>;
  unpairPartner: () => Promise<{ success: boolean; message: string }>;
  generateNewInviteCode: () => void;

  // Project Actions
  updateWedding: (data: Partial<WeddingProject>) => void;
  addSavingContribution: (item: Omit<SavingContribution, "id">) => void;
  deleteSavingContribution: (idx: number) => void;

  addChecklist: (item: Omit<ChecklistItem, "id">) => void;
  toggleChecklist: (id: string) => void;
  deleteChecklist: (id: string) => void;

  addSeserahan: (item: Omit<SeserahanItem, "id">) => void;
  toggleSeserahan: (id: string) => void;
  editSeserahan: (item: SeserahanItem) => void;
  deleteSeserahan: (id: string) => void;

  addPostWedding: (item: Omit<PostWeddingItem, "id">) => void;
  togglePostWedding: (id: string) => void;
  claimPostWedding: (id: string, friendName: string) => void;
  deletePostWedding: (id: string) => void;

  addGuest: (item: Omit<GuestItem, "id">) => void;
  editGuest: (item: GuestItem) => void;
  deleteGuest: (id: string) => void;
  updateGuestRSVP: (id: string, status: RSVPStatus, pax?: number, note?: string) => void;
  recordEnvelope: (guestId: string, amount: number, giftDesc?: string) => void;

  updateFamilyQuota: (quota: Partial<FamilyQuota>) => void;

  addRundown: (item: Omit<RundownItem, "id">) => void;
  editRundown: (item: RundownItem) => void;
  deleteRundown: (id: string) => void;

  addBudgetCategory: (item: Omit<BudgetCategory, "id">) => void;
  updateBudgetCategory: (item: BudgetCategory) => void;
  deleteBudgetCategory: (id: string) => void;

  addVendor: (item: Omit<VendorMilestone, "id">) => void;
  toggleVendorStage: (vendorId: string, stageIdx: number) => void;
  deleteVendor: (id: string) => void;

  updateAlignmentAnswer: (id: string, role: "GROOM" | "BRIDE", answer: string) => void;
  toggleAlignmentAgreed: (id: string) => void;
  addAlignmentTopic: (question: string, category: AlignmentTopic["category"]) => void;

  toggleAdminRequirement: (stepId: string, reqId: string) => void;
  addActivity: (userName: string, userRole: "GROOM" | "BRIDE" | "COLLABORATOR", action: string) => void;

  clearAllData: () => void;
  loadTemplateData: () => void;
}

const WeddingContext = createContext<WeddingContextType | null>(null);

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // States - Clean & Empty by default
  const [wedding, setWedding] = useState<WeddingProject>(cleanEmptyWedding);
  const [savingContributions, setSavingContributions] = useState<SavingContribution[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [seserahan, setSeserahan] = useState<SeserahanItem[]>([]);
  const [postWedding, setPostWedding] = useState<PostWeddingItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [familyQuota, setFamilyQuota] = useState<FamilyQuota>(defaultFamilyQuota);
  const [rundown, setRundown] = useState<RundownItem[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [vendors, setVendors] = useState<VendorMilestone[]>([]);
  const [alignmentTopics, setAlignmentTopics] = useState<AlignmentTopic[]>(defaultAlignmentTopics);
  const [adminSteps, setAdminSteps] = useState<AdminStep[]>(officialAdminSteps);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const { data: session } = useSession();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync NextAuth session with currentUser
  useEffect(() => {
    if (session?.user && session.user.email) {
      const sessionUser = session.user;
      const email = sessionUser.email!.toLowerCase().trim();
      setCurrentUser((prev) => {
        if (prev && prev.email.toLowerCase() === email) return prev;
        const name = sessionUser.name || "Calon Pengantin";
        const nickname = name.split(" ")[0];
        const defaultCard = prev?.avatarCardId || getDefaultCuteCardForRole(prev?.role).id;
        return {
          id: (sessionUser as any).id || `u-${Date.now()}`,
          name,
          nickname,
          email,
          image: sessionUser.image || undefined,
          avatarCardId: defaultCard,
          role: prev?.role || "GROOM",
          provider: "google",
          phone: prev?.phone || "",
          bio: prev?.bio || "Mempersiapkan pernikahan impian bersama pasangan.",
        };
      });
    }
  }, [session]);

  // Load from Database whenever user logs in
  const fetchDbData = useCallback(async (email?: string, code?: string) => {
    try {
      const query = email
        ? `email=${encodeURIComponent(email)}`
        : code
        ? `code=${encodeURIComponent(code)}`
        : "";
      if (!query) return;

      const res = await fetch(`/api/wedding/sync?${query}`);
      const data = await res.json();

      if (data.success && data.exists && data.wedding) {
        setWedding(data.wedding);
        if (data.planData) {
          const p = data.planData;
          if (Array.isArray(p.savingContributions)) setSavingContributions(p.savingContributions);
          if (Array.isArray(p.checklist)) setChecklist(p.checklist);
          if (Array.isArray(p.seserahan)) setSeserahan(p.seserahan);
          if (Array.isArray(p.postWedding)) setPostWedding(p.postWedding);
          if (Array.isArray(p.guests)) setGuests(p.guests);
          if (p.familyQuota) setFamilyQuota(p.familyQuota);
          if (Array.isArray(p.rundown)) setRundown(p.rundown);
          if (Array.isArray(p.budgetCategories)) setBudgetCategories(p.budgetCategories);
          if (Array.isArray(p.vendors)) setVendors(p.vendors);
          if (Array.isArray(p.alignmentTopics)) setAlignmentTopics(p.alignmentTopics);
          if (Array.isArray(p.adminSteps)) setAdminSteps(p.adminSteps);
          if (Array.isArray(p.activityLogs)) setActivityLogs(p.activityLogs);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch wedding data from database", e);
    }
  }, []);

  // Fetch when currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      fetchDbData(currentUser.email);
    }
  }, [currentUser?.email, fetchDbData]);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      // Load user
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      // Load wedding data
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.wedding) setWedding(parsed.wedding);
        if (parsed.savingContributions) setSavingContributions(parsed.savingContributions);
        if (parsed.checklist) setChecklist(parsed.checklist);
        if (parsed.seserahan) setSeserahan(parsed.seserahan);
        if (parsed.postWedding) setPostWedding(parsed.postWedding);
        if (parsed.guests) setGuests(parsed.guests);
        if (parsed.familyQuota) setFamilyQuota(parsed.familyQuota);
        if (parsed.rundown) setRundown(parsed.rundown);
        if (parsed.budgetCategories) setBudgetCategories(parsed.budgetCategories);
        if (parsed.vendors) setVendors(parsed.vendors);
        if (parsed.alignmentTopics) setAlignmentTopics(parsed.alignmentTopics);
        if (parsed.adminSteps) setAdminSteps(parsed.adminSteps);
        if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
      }
    } catch (e) {
      console.error("Failed to load stored wedding data", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Auto Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const payload = {
        wedding,
        savingContributions,
        checklist,
        seserahan,
        postWedding,
        guests,
        familyQuota,
        rundown,
        budgetCategories,
        vendors,
        alignmentTopics,
        adminSteps,
        activityLogs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save wedding data", e);
    }
  }, [
    isInitialized,
    wedding,
    savingContributions,
    checklist,
    seserahan,
    postWedding,
    guests,
    familyQuota,
    rundown,
    budgetCategories,
    vendors,
    alignmentTopics,
    adminSteps,
    activityLogs,
  ]);

  // 3. Auto-Save to Neon Database (Debounced 1.2s across Local & Deploy)
  useEffect(() => {
    if (!isInitialized) return;
    if (!currentUser?.email && wedding.id === "w-main" && !wedding.groomName && !wedding.brideName) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch("/api/wedding/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wedding,
            savingContributions,
            checklist,
            seserahan,
            postWedding,
            guests,
            familyQuota,
            rundown,
            budgetCategories,
            vendors,
            alignmentTopics,
            adminSteps,
            activityLogs,
            user: currentUser,
          }),
        });
      } catch (e) {
        console.warn("Auto-save to database deferred", e);
      }
    }, 1200);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    isInitialized,
    currentUser,
    wedding,
    savingContributions,
    checklist,
    seserahan,
    postWedding,
    guests,
    familyQuota,
    rundown,
    budgetCategories,
    vendors,
    alignmentTopics,
    adminSteps,
    activityLogs,
  ]);

  // Save auth user to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save user session", e);
    }
  }, [isInitialized, currentUser]);

  // Recalculate total savings when savingContributions change
  useEffect(() => {
    const total = savingContributions.reduce((acc, curr) => acc + curr.amount, 0);
    setWedding((prev) => (prev.currentSavings !== total ? { ...prev, currentSavings: total } : prev));
  }, [savingContributions]);

  // Auth Helpers
  const login = (userData: Partial<User>) => {
    const userRole = userData.role || "GROOM";
    const user: User = {
      id: userData.id || `u-${Date.now()}`,
      name: userData.name || "Calon Pengantin",
      nickname: userData.nickname || userData.name?.split(" ")[0] || "Saya",
      email: userData.email || "pengantin@hajatkita.id",
      image: userData.image || undefined,
      avatarCardId: userData.avatarCardId || getDefaultCuteCardForRole(userRole).id,
      role: userRole,
      phone: userData.phone || "",
      bio: userData.bio || "Mempersiapkan pernikahan impian bersama pasangan.",
      provider: userData.provider || "credentials",
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    // If wedding groom/bride name is empty, sync from user
    setWedding((prev) => {
      if (user.role === "GROOM" && !prev.groomName) {
        return { ...prev, groomName: user.name };
      }
      if (user.role === "BRIDE" && !prev.brideName) {
        return { ...prev, brideName: user.name };
      }
      return prev;
    });

    addActivity(user.name, user.role, "Berhasil masuk ke Hajat Kita");
  };

  const loginWithGoogle = () => {
    // Initiate Google OAuth flow via NextAuth
    signIn("google", { callbackUrl: window.location.href });
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsProfileModalOpen(false);
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.error("SignOut error", e);
    }
  };

  const pairWithPartner = async (inviteCode: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/partner/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
          userEmail: currentUser?.email,
          userName: currentUser?.name,
          userRole: currentUser?.role,
          userAvatarCardId: currentUser?.avatarCardId,
        }),
      });
      const result = await res.json();
      if (!result.success) {
        return { success: false, message: result.message || "Gagal menghubungkan pasangan" };
      }

      if (result.wedding) {
        setWedding(result.wedding);
      }
      if (result.planData) {
        const p = result.planData;
        if (Array.isArray(p.savingContributions)) setSavingContributions(p.savingContributions);
        if (Array.isArray(p.checklist)) setChecklist(p.checklist);
        if (Array.isArray(p.seserahan)) setSeserahan(p.seserahan);
        if (Array.isArray(p.postWedding)) setPostWedding(p.postWedding);
        if (Array.isArray(p.guests)) setGuests(p.guests);
        if (p.familyQuota) setFamilyQuota(p.familyQuota);
        if (Array.isArray(p.rundown)) setRundown(p.rundown);
        if (Array.isArray(p.budgetCategories)) setBudgetCategories(p.budgetCategories);
        if (Array.isArray(p.vendors)) setVendors(p.vendors);
        if (Array.isArray(p.alignmentTopics)) setAlignmentTopics(p.alignmentTopics);
        if (Array.isArray(p.adminSteps)) setAdminSteps(p.adminSteps);
        if (Array.isArray(p.activityLogs)) setActivityLogs(p.activityLogs);
      }

      addActivity(
        currentUser?.name || "Pengguna",
        currentUser?.role || "GROOM",
        result.isRestoredFromSamePartner
          ? "Memulihkan seluruh rencana pernikahan bersama pasangan lama"
          : `Terhubung dengan pasangan (${result.wedding?.partnerInfo?.name || "Pasangan"})`
      );

      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, message: err.message || "Terjadi kesalahan saat menghubungkan pasangan" };
    }
  };

  const unpairPartner = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/partner/unpair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUser?.email,
          weddingId: wedding.id,
        }),
      });
      const result = await res.json();
      if (!result.success) {
        return { success: false, message: result.message || "Gagal membatalkan hubungan" };
      }

      setWedding((prev) => ({
        ...prev,
        isPartnerConnected: false,
        partnerInfo: undefined,
      }));

      addActivity(
        currentUser?.name || "Pengguna",
        currentUser?.role || "GROOM",
        "Membatalkan hubungan pasangan (seluruh data tersimpan aman di database)"
      );

      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, message: err.message || "Gagal membatalkan koneksi pasangan" };
    }
  };

  const generateNewInviteCode = () => {
    const newCode = generateUniqueInviteCode();
    setWedding((prev) => ({ ...prev, inviteCode: newCode }));
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);

    // Sync to wedding names if appropriate
    if (data.name) {
      setWedding((prev) => {
        if (updated.role === "GROOM") {
          return { ...prev, groomName: data.name! };
        }
        if (updated.role === "BRIDE") {
          return { ...prev, brideName: data.name! };
        }
        return prev;
      });
    }

    addActivity(updated.name, updated.role, "Memperbarui profil biodata & foto");
  };

  const requireAuth = (callback?: () => void): boolean => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }
    if (callback) {
      callback();
    }
    return true;
  };

  // Helper to add activity log
  const addActivity = (userName: string, userRole: "GROOM" | "BRIDE" | "COLLABORATOR", action: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      userName,
      userRole,
      action,
      timeAgo: "Baru saja",
      timestamp: Date.now(),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // Actions
  const updateWedding = (data: Partial<WeddingProject>) => {
    setWedding((prev) => {
      const updated = { ...prev, ...data };
      if (data.groomName && data.brideName && !data.slug) {
        const slug = `${data.groomName.split(" ")[0]}-${data.brideName.split(" ")[0]}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        updated.slug = slug;
      }
      return updated;
    });
    addActivity(currentUser?.name || "Pengguna", currentUser?.role || "GROOM", "Memperbarui detail profil pernikahan");
  };

  const addSavingContribution = (item: Omit<SavingContribution, "id">) => {
    const newItems = [...savingContributions, item];
    const total = newItems.reduce((acc, c) => acc + c.amount, 0);
    const withPercentages = newItems.map((c) => ({
      ...c,
      percentage: total > 0 ? Number(((c.amount / total) * 100).toFixed(1)) : 0,
    }));
    setSavingContributions(withPercentages);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan setoran tabungan: ${item.label} (Rp ${item.amount.toLocaleString("id-ID")})`);
  };

  const deleteSavingContribution = (idx: number) => {
    const newItems = savingContributions.filter((_, i) => i !== idx);
    const total = newItems.reduce((acc, c) => acc + c.amount, 0);
    const withPercentages = newItems.map((c) => ({
      ...c,
      percentage: total > 0 ? Number(((c.amount / total) * 100).toFixed(1)) : 0,
    }));
    setSavingContributions(withPercentages);
  };

  const addChecklist = (item: Omit<ChecklistItem, "id">) => {
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      ...item,
    };
    setChecklist((prev) => [newItem, ...prev]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan tugas baru: ${item.title}`);
  };

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "COMPLETED" ? "TODO" : "COMPLETED";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const deleteChecklist = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const addSeserahan = (item: Omit<SeserahanItem, "id">) => {
    const newItem: SeserahanItem = {
      id: `ses-${Date.now()}`,
      ...item,
    };
    setSeserahan((prev) => [newItem, ...prev]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "BRIDE", `Menambahkan barang seserahan: ${item.name}`);
  };

  const toggleSeserahan = (id: string) => {
    setSeserahan((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPurchased: !item.isPurchased } : item))
    );
  };

  const editSeserahan = (item: SeserahanItem) => {
    setSeserahan((prev) => prev.map((s) => (s.id === item.id ? item : s)));
  };

  const deleteSeserahan = (id: string) => {
    setSeserahan((prev) => prev.filter((s) => s.id !== id));
  };

  const addPostWedding = (item: Omit<PostWeddingItem, "id">) => {
    const newItem: PostWeddingItem = {
      id: `pw-${Date.now()}`,
      ...item,
    };
    setPostWedding((prev) => [newItem, ...prev]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan wishlist rumah pasca-nikah: ${item.name}`);
  };

  const togglePostWedding = (id: string) => {
    setPostWedding((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAcquired: !item.isAcquired } : item))
    );
  };

  const claimPostWedding = (id: string, friendName: string) => {
    setPostWedding((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAcquired: true, claimedBy: friendName } : item
      )
    );
    addActivity(friendName, "COLLABORATOR", "Mengklaim kado pernikahan dari wishlist");
  };

  const deletePostWedding = (id: string) => {
    setPostWedding((prev) => prev.filter((item) => item.id !== id));
  };

  const addGuest = (item: Omit<GuestItem, "id">) => {
    const newItem: GuestItem = {
      id: `g-${Date.now()}`,
      ...item,
    };
    setGuests((prev) => [newItem, ...prev]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan tamu undangan: ${item.name}`);
  };

  const editGuest = (item: GuestItem) => {
    setGuests((prev) => prev.map((g) => (g.id === item.id ? item : g)));
  };

  const deleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGuestRSVP = (id: string, status: RSVPStatus, pax?: number, note?: string) => {
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            rsvpStatus: status,
            pax: pax !== undefined ? pax : g.pax,
            notes: note || g.notes,
          };
        }
        return g;
      })
    );
  };

  const recordEnvelope = (guestId: string, amount: number, giftDesc?: string) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId
          ? {
              ...g,
              envelopeAmount: amount,
              giftDescription: giftDesc || g.giftDescription,
            }
          : g
      )
    );
  };

  const updateFamilyQuota = (quota: Partial<FamilyQuota>) => {
    setFamilyQuota((prev) => ({ ...prev, ...quota }));
  };

  const addRundown = (item: Omit<RundownItem, "id">) => {
    const newItem: RundownItem = {
      id: `rd-${Date.now()}`,
      ...item,
    };
    setRundown((prev) =>
      [...prev, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan agenda rundown: ${item.activity}`);
  };

  const editRundown = (item: RundownItem) => {
    setRundown((prev) =>
      prev.map((r) => (r.id === item.id ? item : r)).sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
  };

  const deleteRundown = (id: string) => {
    setRundown((prev) => prev.filter((r) => r.id !== id));
  };

  const addBudgetCategory = (item: Omit<BudgetCategory, "id">) => {
    const newItem: BudgetCategory = {
      id: `b-${Date.now()}`,
      ...item,
    };
    setBudgetCategories((prev) => [newItem, ...prev]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan pos anggaran: ${item.name}`);
  };

  const updateBudgetCategory = (item: BudgetCategory) => {
    setBudgetCategories((prev) => prev.map((b) => (b.id === item.id ? item : b)));
  };

  const deleteBudgetCategory = (id: string) => {
    setBudgetCategories((prev) => prev.filter((b) => b.id !== id));
  };

  const addVendor = (item: Omit<VendorMilestone, "id">) => {
    const newItem: VendorMilestone = {
      id: `vm-${Date.now()}`,
      ...item,
    };
    setVendors((prev) => [newItem, ...prev]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan kontrak vendor: ${item.vendorName}`);
  };

  const toggleVendorStage = (vendorId: string, stageIdx: number) => {
    setVendors((prev) =>
      prev.map((vm) => {
        if (vm.id === vendorId) {
          const updatedStages = vm.stages.map((stage, i) =>
            i === stageIdx ? { ...stage, isPaid: !stage.isPaid } : stage
          );
          return { ...vm, stages: updatedStages };
        }
        return vm;
      })
    );
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  };

  const updateAlignmentAnswer = (id: string, role: "GROOM" | "BRIDE", answer: string) => {
    setAlignmentTopics((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = {
            ...t,
            groomAnswer: role === "GROOM" ? answer : t.groomAnswer,
            brideAnswer: role === "BRIDE" ? answer : t.brideAnswer,
          };
          return updated;
        }
        return t;
      })
    );
  };

  const toggleAlignmentAgreed = (id: string) => {
    setAlignmentTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isAgreed: !t.isAgreed } : t))
    );
  };

  const addAlignmentTopic = (question: string, category: AlignmentTopic["category"]) => {
    const newTopic: AlignmentTopic = {
      id: `top-${Date.now()}`,
      category,
      question,
      groomAnswer: "",
      brideAnswer: "",
      isAgreed: false,
    };
    setAlignmentTopics((prev) => [...prev, newTopic]);
  };

  const toggleAdminRequirement = (stepId: string, reqId: string) => {
    setAdminSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              requirements: step.requirements.map((r) =>
                r.id === reqId ? { ...r, isDone: !r.isDone } : r
              ),
            }
          : step
      )
    );
  };

  // Clear data to completely empty state
  const clearAllData = () => {
    setSavingContributions([]);
    setChecklist([]);
    setSeserahan([]);
    setPostWedding([]);
    setGuests([]);
    setRundown([]);
    setBudgetCategories([]);
    setVendors([]);
    setAlignmentTopics(defaultAlignmentTopics.map((t) => ({ ...t, groomAnswer: "", brideAnswer: "", isAgreed: false })));
    setAdminSteps(officialAdminSteps.map((s) => ({ ...s, requirements: s.requirements.map((r) => ({ ...r, isDone: false })) })));
    setActivityLogs([]);
    setWedding(cleanEmptyWedding);
    localStorage.removeItem(STORAGE_KEY);
    addActivity(currentUser?.name || "Pengguna", currentUser?.role || "GROOM", "Mengosongkan seluruh data rencana pernikahan");
  };

  // Load realistic template starter
  const loadTemplateData = () => {
    setWedding({
      id: "w-main",
      title: "Pernikahan Heru & Nurul",
      groomName: "Muhammad Heru",
      brideName: "Nurul Fathonah",
      weddingDate: "2026-12-19T08:00:00.000Z",
      city: "Bandung, Jawa Barat",
      targetBudget: 120000000,
      currentSavings: 82500000,
      inviteCode: "HAJAT-89X2",
      slug: "heru-nurul",
      venueName: "Grand Ballroom Bandung",
      venueAddress: "Jl. Diponegoro No. 1, Bandung",
      maharDetails: "Logam Mulia Antam 10 Gram & Seperangkat Alat Sholat",
      waliNikah: "Bpk. H. Rahmat Sudrajat",
      penghulu: "Drs. H. Ahmad Fauzi, M.Ag (KUA Coblong)",
      saksiNikah: "Keluarga Besar Kedua Mempelai",
      isPartnerConnected: true,
      partnerInfo: {
        name: "Nurul Fathonah",
        role: "BRIDE",
        email: "nurul.fathonah@gmail.com",
      },
    });

    setSavingContributions([
      { label: "Tabungan Heru (Suami)", amount: 46000000, percentage: 55.8, color: "#1D50A2" },
      { label: "Tabungan Nurul (Istri)", amount: 28500000, percentage: 34.5, color: "#5D92DC" },
      { label: "Hibah Keluarga", amount: 8000000, percentage: 9.7, color: "#C9DEF5" },
    ]);

    setChecklist([
      {
        id: "chk-1",
        title: "Pengurusan Surat Pengantar RT/RW & Kelurahan (N1-N4)",
        description: "Bawa berkas KTP, KK, dan Akta Kelahiran kedua calon mempelai.",
        category: "ADMINISTRASI_KUA",
        timelineTag: "H-3 Bulan",
        status: "COMPLETED",
        assignedTo: "Heru (Suami)",
        isOfficialKUA: true,
      },
      {
        id: "chk-2",
        title: "Pemeriksaan Kesehatan Puskesmas & Sertifikat Elsimil",
        description: "Skrining HB, suntik TT catin wanita, download sertifikat Elsimil BKKBN.",
        category: "ADMINISTRASI_KUA",
        timelineTag: "H-3 Bulan",
        status: "COMPLETED",
        assignedTo: "Nurul (Istri)",
        isOfficialKUA: true,
      },
      {
        id: "chk-3",
        title: "Pendaftaran Online SIMKAH Kemenag & Kode Billing",
        description: "Daftar di simkah4.kemenag.go.id, upload pas foto latar biru 2x3 & 4x6.",
        category: "ADMINISTRASI_KUA",
        timelineTag: "H-2 Bulan",
        status: "IN_PROGRESS",
        assignedTo: "Bersama",
        isOfficialKUA: true,
      },
      {
        id: "chk-4",
        title: "Finalisasi Booking Venue & Katering (DP)",
        description: "Food testing 6 menu gubukan dan lock tanggal gedung.",
        category: "VENUE_CATERING",
        timelineTag: "H-6 Bulan",
        status: "COMPLETED",
        assignedTo: "Bersama",
      },
    ]);

    setSeserahan([
      {
        id: "ses-1",
        boxNumber: 1,
        boxName: "Box 1: Perlengkapan Ibadah",
        name: "Set Mukena Silk Premium & Sajadah",
        brand: "Royale Premium Silk",
        category: "Ibadah",
        estimatedPrice: 1250000,
        actualPrice: 1150000,
        purchaseUrl: "https://shopee.co.id",
        isPurchased: true,
        notes: "Warna Rose Gold Soft",
      },
      {
        id: "ses-2",
        boxNumber: 2,
        boxName: "Box 2: Skincare & Body Care",
        name: "Crystallure Supreme Revitalizing Set",
        brand: "Wardah Crystallure",
        category: "Perawatan Wajah",
        estimatedPrice: 1400000,
        actualPrice: 1350000,
        purchaseUrl: "https://shopee.co.id",
        isPurchased: true,
        notes: "Lengkap dengan essence & serum",
      },
    ]);

    setPostWedding([
      {
        id: "pw-1",
        name: "Kasur Springbed Orthopedic 160x200 (Queen Size)",
        roomCategory: "Kamar Tidur",
        brand: "Comforta Perfect Choice",
        price: 4850000,
        purchaseUrl: "https://tokopedia.com",
        priority: "MUST_HAVE",
        isAcquired: true,
        isGiftClaimable: false,
        claimedBy: "Tabungan Bersama",
      },
      {
        id: "pw-2",
        name: "Kulkas 2 Pintu Inverter Smart Cooling 210L",
        roomCategory: "Dapur",
        brand: "LG Inverter",
        price: 3550000,
        purchaseUrl: "https://tokopedia.com",
        priority: "MUST_HAVE",
        isAcquired: false,
        isGiftClaimable: true,
      },
    ]);

    setGuests([
      {
        id: "g-1",
        name: "Bpk. H. Hendra Wijaya & Keluarga",
        side: "GROOM",
        category: "Keluarga Inti",
        pax: 4,
        phone: "081234567890",
        rsvpStatus: "CONFIRMED_ATTENDING",
        envelopeAmount: 1000000,
      },
      {
        id: "g-2",
        name: "Ibu Dra. Hj. Ratna Sari",
        side: "BRIDE",
        category: "Keluarga Inti",
        pax: 2,
        phone: "081398765432",
        rsvpStatus: "CONFIRMED_ATTENDING",
        envelopeAmount: 750000,
      },
    ]);

    setRundown([
      {
        id: "rd-1",
        startTime: "05:00",
        endTime: "07:30",
        activity: "Make Up & Rias Pengantin, Ibu, dan Bridesmaids",
        picName: "MUA Wardah Gallery",
        picPhone: "081299887766",
        location: "Ruang Rias Utama Gedung",
        phase: "Akad Nikah",
      },
      {
        id: "rd-2",
        startTime: "08:00",
        endTime: "09:00",
        activity: "Pelaksanaan Akad Nikah (Ijab Qabul, Khutbah Nikah)",
        picName: "Penghulu KUA & Saksi",
        picPhone: "081188990011",
        location: "Meja Akad Nikah",
        phase: "Akad Nikah",
      },
    ]);

    setBudgetCategories([
      { id: "b-1", name: "Venue & Gedung Ballroom", allocated: 28000000, spent: 28000000, status: "LUNAS", vendor: "Grand Ballroom Bandung" },
      { id: "b-2", name: "Katering Utama & Gubukan (500 Pax)", allocated: 42500000, spent: 20000000, status: "DP_TERBAYAR", vendor: "Royal Catering" },
      { id: "b-3", name: "Rias Pengantin (MUA) & Busana", allocated: 15000000, spent: 7500000, status: "DP_TERBAYAR", vendor: "Wedding Gallery" },
    ]);

    setVendors([
      {
        id: "vm-1",
        vendorName: "Grand Ballroom Bandung",
        serviceType: "Gedung / Venue",
        totalContract: 28000000,
        stages: [
          { name: "DP Booking Tanggal", percentage: 20, amount: 5600000, isPaid: true, condition: "Kwitansi & Lock tanggal" },
          { name: "Termin 2 (Technical Meeting)", percentage: 40, amount: 11200000, isPaid: true, condition: "Layout panggung disepakati" },
          { name: "Pelunasan H-14", percentage: 40, amount: 11200000, isPaid: true, condition: "Final briefing bersama WO" },
        ],
      },
    ]);

    addActivity("Calon Pengantin", "GROOM", "Memuat template contoh rencana pernikahan");
  };

  return (
    <WeddingContext.Provider
      value={{
        isInitialized,
        wedding,
        currentUser,
        isLoggedIn: Boolean(currentUser),

        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isTourOpen,
        setIsTourOpen,

        savingContributions,
        checklist,
        seserahan,
        postWedding,
        guests,
        familyQuota,
        rundown,
        budgetCategories,
        vendors,
        alignmentTopics,
        adminSteps,
        activityLogs,

        login,
        loginWithGoogle,
        logout,
        updateUserProfile,
        requireAuth,
        pairWithPartner,
        unpairPartner,
        generateNewInviteCode,

        updateWedding,
        addSavingContribution,
        deleteSavingContribution,
        addChecklist,
        toggleChecklist,
        deleteChecklist,
        addSeserahan,
        toggleSeserahan,
        editSeserahan,
        deleteSeserahan,
        addPostWedding,
        togglePostWedding,
        claimPostWedding,
        deletePostWedding,
        addGuest,
        editGuest,
        deleteGuest,
        updateGuestRSVP,
        recordEnvelope,
        updateFamilyQuota,
        addRundown,
        editRundown,
        deleteRundown,
        addBudgetCategory,
        updateBudgetCategory,
        deleteBudgetCategory,
        addVendor,
        toggleVendorStage,
        deleteVendor,
        updateAlignmentAnswer,
        toggleAlignmentAgreed,
        addAlignmentTopic,
        toggleAdminRequirement,
        addActivity,
        clearAllData,
        loadTemplateData,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error("useWedding must be used within a WeddingProvider");
  }
  return context;
}
