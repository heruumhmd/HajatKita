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
  syncNow: () => Promise<boolean>;
  refreshWorkspace: () => Promise<void>;

  // Project Actions
  updateWedding: (data: Partial<WeddingProject>) => void;
  addSavingContribution: (item: Omit<SavingContribution, "id">) => void;
  editSavingContribution: (idx: number, item: Omit<SavingContribution, "percentage">) => void;
  deleteSavingContribution: (idx: number) => void;

  addChecklist: (item: Omit<ChecklistItem, "id">) => void;
  editChecklist: (item: ChecklistItem) => void;
  toggleChecklist: (id: string) => void;
  deleteChecklist: (id: string) => void;

  addSeserahan: (item: Omit<SeserahanItem, "id">) => void;
  toggleSeserahan: (id: string) => void;
  editSeserahan: (item: SeserahanItem) => void;
  deleteSeserahan: (id: string) => void;

  addPostWedding: (item: Omit<PostWeddingItem, "id">) => void;
  editPostWedding: (item: PostWeddingItem) => void;
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
  editVendor: (item: VendorMilestone) => void;
  toggleVendorStage: (vendorId: string, stageIdx: number) => void;
  deleteVendor: (id: string) => void;

  updateAlignmentAnswer: (id: string, role: "GROOM" | "BRIDE", answer: string) => void;
  toggleAlignmentAgreed: (id: string) => void;
  addAlignmentTopic: (question: string, category: AlignmentTopic["category"]) => void;
  editAlignmentTopic: (id: string, question: string, category: AlignmentTopic["category"]) => void;
  deleteAlignmentTopic: (id: string) => void;
  loadRecommendedAlignmentTopics: () => void;

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
  const [alignmentTopics, setAlignmentTopics] = useState<AlignmentTopic[]>([]);
  const [adminSteps, setAdminSteps] = useState<AdminStep[]>(officialAdminSteps);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const { data: session } = useSession();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingAuthCallbackRef = useRef<(() => void) | null>(null);
  const currentUserRef = useRef<User | null>(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

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

  // Load from Database whenever user logs in or polls
  const fetchDbData = useCallback(async (email?: string, code?: string) => {
    try {
      const activeUser = currentUserRef.current;
      const activeEmail = (email || activeUser?.email || "").toLowerCase().trim();
      const query = activeEmail
        ? `email=${encodeURIComponent(activeEmail)}${code ? `&code=${encodeURIComponent(code)}` : ""}`
        : code
        ? `code=${encodeURIComponent(code)}`
        : "";
      if (!query) return;

      const res = await fetch(`/api/wedding/sync?${query}`);
      const data = await res.json();

      if (data.success && data.exists) {
        if (data.user) {
          setCurrentUser((prev) => ({
            id: data.user.id || prev?.id || `u-${Date.now()}`,
            name: data.user.name || prev?.name || "Calon Pengantin",
            nickname: data.user.nickname || prev?.nickname || "Saya",
            email: data.user.email || prev?.email || "",
            image: data.user.image || prev?.image,
            avatarCardId: data.user.avatarCardId || prev?.avatarCardId || "cat-prince",
            role: data.user.role || prev?.role || "GROOM",
            phone: data.user.phone || prev?.phone || "",
            bio: data.user.bio || prev?.bio || "",
            provider: prev?.provider || "google",
          }));
        }

        if (data.wedding) {
          setWedding((prev) => {
            const userNow = currentUserRef.current;
            let partnerInfo = data.wedding.partnerInfo;

            // Reciprocal partner resolution using couple data
            if (data.wedding.couple && userNow?.email) {
              const myEmail = userNow.email.toLowerCase().trim();
              const u1 = data.wedding.couple.user1;
              const u2 = data.wedding.couple.user2;
              if (u1 && u1.email && u1.email.toLowerCase().trim() === myEmail) {
                partnerInfo = u2;
              } else if (u2 && u2.email && u2.email.toLowerCase().trim() === myEmail) {
                partnerInfo = u1;
              }
            }

            // Infallible Safeguard: A user can NEVER be their own partner!
            if (partnerInfo && userNow) {
              const myEmail = (userNow.email || "").toLowerCase().trim();
              const myName = (userNow.name || "").toLowerCase().trim();
              const pEmail = (partnerInfo.email || "").toLowerCase().trim();
              const pName = (partnerInfo.name || "").toLowerCase().trim();

              const isSelf =
                (myEmail && pEmail && myEmail === pEmail) ||
                (myName && pName && myName === pName) ||
                (userNow.role && partnerInfo.role && userNow.role === partnerInfo.role);

              if (isSelf) {
                if (userNow.role === "GROOM") {
                  partnerInfo = {
                    name: data.wedding.brideName || prev.brideName || "Calon Istri",
                    role: "BRIDE",
                    email: data.wedding.primaryUserEmail || "",
                    avatarCardId: "duck-bride",
                  };
                } else {
                  partnerInfo = {
                    name: data.wedding.groomName || prev.groomName || "Calon Suami",
                    role: "GROOM",
                    email: data.wedding.partnerUserEmail || "",
                    avatarCardId: "penguin-groom",
                  };
                }
              }
            }

            // If partner newly connected in the database, announce activity
            if (!prev.isPartnerConnected && data.wedding.isPartnerConnected) {
              addActivity(
                partnerInfo?.name || "Pasangan",
                partnerInfo?.role || "BRIDE",
                "Berhasil terhubung ke Duo Workspace! Rencana kini tersinkron."
              );
            }

            return {
              ...prev,
              ...data.wedding,
              partnerInfo: partnerInfo || prev.partnerInfo,
              // Keep existing ID if valid UUID
              id: data.wedding.id || prev.id,
            };
          });
        }

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

  // Periodic background synchronization (every 6 seconds when window active)
  useEffect(() => {
    if (!isInitialized) return;

    const pollSync = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (currentUser?.email) {
        fetchDbData(currentUser.email);
      } else if (wedding.inviteCode && wedding.inviteCode !== "HAJAT-89X2") {
        fetchDbData(undefined, wedding.inviteCode);
      }
    };

    const intervalId = setInterval(pollSync, 6000);
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        pollSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInitialized, currentUser?.email, wedding.inviteCode, fetchDbData]);

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
        // If stored data contains legacy mock template data ("Heru & Nurul"), purge it cleanly
        const isLegacyMock =
          parsed.wedding &&
          (parsed.wedding.title === "Pernikahan Heru & Nurul" ||
            parsed.wedding.slug === "heru-nurul" ||
            parsed.wedding.groomName === "Muhammad Heru" ||
            parsed.wedding.inviteCode === "HAJAT-89X2");

        if (isLegacyMock && !storedUser) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
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
        const res = await fetch("/api/wedding/sync", {
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
        const resData = await res.json();
        if (resData.success && resData.weddingId) {
          setWedding((prev) => (prev.id !== resData.weddingId ? { ...prev, id: resData.weddingId } : prev));
        }
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

  // Explicit sync triggered on actions like copying invite code or link
  const syncNow = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/wedding/sync", {
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
      const resData = await res.json();
      if (resData.success && resData.weddingId) {
        setWedding((prev) => (prev.id !== resData.weddingId ? { ...prev, id: resData.weddingId } : prev));
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Manual sync error", e);
      return false;
    }
  };

  const refreshWorkspace = useCallback(async () => {
    if (currentUser?.email) {
      await fetchDbData(currentUser.email);
    } else if (wedding.inviteCode && wedding.inviteCode !== "HAJAT-89X2") {
      await fetchDbData(undefined, wedding.inviteCode);
    } else {
      await syncNow();
    }
  }, [currentUser?.email, wedding.inviteCode, fetchDbData]);

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

    // Execute pending action after login if exists
    if (pendingAuthCallbackRef.current) {
      const cb = pendingAuthCallbackRef.current;
      pendingAuthCallbackRef.current = null;
      setTimeout(() => cb(), 150);
    }
  };

  const loginWithGoogle = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    signIn("google", { redirectTo: origin || "/", callbackUrl: origin || "/" });
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
      if (callback) {
        pendingAuthCallbackRef.current = callback;
      }
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

  const editSavingContribution = (idx: number, item: Omit<SavingContribution, "percentage">) => {
    const newItems = savingContributions.map((c, i) => (i === idx ? { ...c, ...item } : c));
    const total = newItems.reduce((acc, c) => acc + c.amount, 0);
    const withPercentages = newItems.map((c) => ({
      ...c,
      percentage: total > 0 ? Number(((c.amount / total) * 100).toFixed(1)) : 0,
    }));
    setSavingContributions(withPercentages);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Memperbarui setoran tabungan: ${item.label}`);
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

  const editChecklist = (item: ChecklistItem) => {
    setChecklist((prev) => prev.map((c) => (c.id === item.id ? item : c)));
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Memperbarui tugas: ${item.title}`);
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

  const editPostWedding = (item: PostWeddingItem) => {
    setPostWedding((prev) => prev.map((p) => (p.id === item.id ? item : p)));
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Memperbarui wishlist pasca-nikah: ${item.name}`);
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

  const editVendor = (item: VendorMilestone) => {
    setVendors((prev) => prev.map((v) => (v.id === item.id ? item : v)));
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Memperbarui kontrak vendor: ${item.vendorName}`);
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

  const editAlignmentTopic = (id: string, question: string, category: AlignmentTopic["category"]) => {
    setAlignmentTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, question, category } : t))
    );
  };

  const deleteAlignmentTopic = (id: string) => {
    setAlignmentTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const loadRecommendedAlignmentTopics = () => {
    setAlignmentTopics(defaultAlignmentTopics);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", "Memuat rekomendasi topik diskusi pranikah");
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
    setAlignmentTopics([]);
    setAdminSteps(officialAdminSteps.map((s) => ({ ...s, requirements: s.requirements.map((r) => ({ ...r, isDone: false })) })));
    setActivityLogs([]);
    setWedding(cleanEmptyWedding);
    localStorage.removeItem(STORAGE_KEY);
    addActivity(currentUser?.name || "Pengguna", currentUser?.role || "GROOM", "Mengosongkan seluruh data rencana pernikahan");
  };

  // Clean template / reset
  const loadTemplateData = () => {
    clearAllData();
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
        syncNow,
        refreshWorkspace,

        updateWedding,
        addSavingContribution,
        editSavingContribution,
        deleteSavingContribution,
        addChecklist,
        editChecklist,
        toggleChecklist,
        deleteChecklist,
        addSeserahan,
        toggleSeserahan,
        editSeserahan,
        deleteSeserahan,
        addPostWedding,
        editPostWedding,
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
        editVendor,
        toggleVendorStage,
        deleteVendor,
        updateAlignmentAnswer,
        toggleAlignmentAgreed,
        addAlignmentTopic,
        editAlignmentTopic,
        deleteAlignmentTopic,
        loadRecommendedAlignmentTopics,
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
