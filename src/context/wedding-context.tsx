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
import { showToastWarning } from "@/lib/swal";
import { mergePlanData } from "@/lib/merge-plan-data";

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
  version: 0,
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
  addSavingContribution: (item: Omit<SavingContribution, "id"> & { id?: string }) => void;
  editSavingContribution: (idOrIdx: string | number, item: Omit<SavingContribution, "percentage">) => void;
  deleteSavingContribution: (idOrIdx: string | number) => void;

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

export function hashPayload(p: any): string {
  if (!p) return "";
  const weddingClean = p.wedding
    ? {
        ...p.wedding,
        version: undefined,
        id: undefined,
        partnerInfo: undefined,
      }
    : undefined;
  return JSON.stringify({
    ...p,
    wedding: weddingClean,
  });
}

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
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const deletedItemIdsRef = useRef<Set<string>>(new Set());

  const trackDeletedId = useCallback((id: string) => {
    if (!id) return;
    deletedItemIdsRef.current.add(id);
    setDeletedItemIds(Array.from(deletedItemIdsRef.current).slice(-500));
  }, []);

  const { data: session } = useSession();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef(false);
  const pendingAuthCallbackRef = useRef<(() => void) | null>(null);
  const currentUserRef = useRef<User | null>(currentUser);
  const weddingRef = useRef<WeddingProject>(wedding);
  const versionRef = useRef<number>(0);
  const lastServerHashRef = useRef<string>("");
  const hasLoadedRemoteRef = useRef<boolean>(false);
  const requestSeqRef = useRef<number>(0);
  const saveFailedRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveFailedToastShownRef = useRef(false);
  const inFlightRef = useRef(false);
  const dirtyAfterFlightRef = useRef(false);
  const latestPayloadRef = useRef<any>(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    weddingRef.current = wedding;
  }, [wedding]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

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
          id: (sessionUser as any).id || `u-${crypto.randomUUID()}`,
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

  // Helper to extract and build planning payload consistently
  const buildPlanPayload = useCallback(() => ({
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
    deletedItemIds: Array.from(deletedItemIdsRef.current).slice(-500),
  }), [
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
    deletedItemIds,
  ]);

  // Keep latest payload ref always updated with latest state
  latestPayloadRef.current = buildPlanPayload();

  // Load from Database whenever user logs in or polls
  const fetchDbData = useCallback(async (email?: string, code?: string, force = false) => {
    if (!force) {
      // Skip polling while a save is in progress, in flight, or waiting
      if (pendingSaveRef.current || inFlightRef.current || saveTimeoutRef.current !== null) return;
      // Skip polling if there are unsaved local modifications
      const currentPayload = buildPlanPayload();
      const currentHash = hashPayload(currentPayload);
      if (lastServerHashRef.current !== "" && currentHash !== lastServerHashRef.current) {
        if (saveFailedRef.current && retryCountRef.current >= 3) {
          if (!saveFailedToastShownRef.current) {
            saveFailedToastShownRef.current = true;
            showToastWarning(
              "Gagal Menyimpan",
              "Perubahan belum tersimpan. Periksa koneksi."
            );
          }
        }
        return;
      }
    }

    try {
      const activeUser = currentUserRef.current;
      const activeEmail = (email || activeUser?.email || "").toLowerCase().trim();
      const inviteCode = code || weddingRef.current.inviteCode || wedding.inviteCode;
      const query = activeEmail
        ? `email=${encodeURIComponent(activeEmail)}${inviteCode ? `&code=${encodeURIComponent(inviteCode)}` : ""}`
        : inviteCode
        ? `code=${encodeURIComponent(inviteCode)}`
        : "";
      if (!query) return;

      const currentSeq = ++requestSeqRef.current;
      const token = typeof window !== "undefined" ? localStorage.getItem("hajat_workspace_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["x-hajat-token"] = token;
      }

      const res = await fetch(`/api/wedding/sync?${query}`, { headers });
      const data = await res.json();

      // Drop stale response if a newer request was dispatched while this was in flight
      if (currentSeq !== requestSeqRef.current) return;

      if (data.token && typeof window !== "undefined") {
        try {
          localStorage.setItem("hajat_workspace_token", data.token);
        } catch {}
      }

      hasLoadedRemoteRef.current = true;

      if (data.success && data.exists) {
        if (typeof data.wedding?.version === "number") {
          versionRef.current = data.wedding.version;
        }

        if (data.user) {
          setCurrentUser((prev) => ({
            id: data.user.id || prev?.id || `u-${crypto.randomUUID()}`,
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

        let updatedWedding = weddingRef.current;
        if (data.wedding) {
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
                  name: data.wedding.brideName || weddingRef.current.brideName || "Calon Istri",
                  role: "BRIDE",
                  email: data.wedding.primaryUserEmail || "",
                  avatarCardId: "duck-bride",
                };
              } else {
                partnerInfo = {
                  name: data.wedding.groomName || weddingRef.current.groomName || "Calon Suami",
                  role: "GROOM",
                  email: data.wedding.partnerUserEmail || "",
                  avatarCardId: "penguin-groom",
                };
              }
            }
          }

          // Bug 10 fix: announce partner connection OUTSIDE the updater to prevent duplicate logs in StrictMode
          const prevConnected = weddingRef.current.isPartnerConnected;
          const newConnected = Boolean(data.wedding.isPartnerConnected);
          if (!prevConnected && newConnected) {
            addActivity(
              partnerInfo?.name || "Pasangan",
              partnerInfo?.role || "BRIDE",
              "Berhasil terhubung ke Duo Workspace! Rencana kini tersinkron."
            );
          }

          updatedWedding = {
            ...weddingRef.current,
            ...data.wedding,
            partnerInfo: partnerInfo || weddingRef.current.partnerInfo,
            id: data.wedding.id || weddingRef.current.id,
            version: typeof data.wedding.version === "number" ? data.wedding.version : versionRef.current,
          };
          setWedding(updatedWedding);
        }

        const remotePlan = data.planData || {};
        const localPlan = latestPayloadRef.current || buildPlanPayload();

        // Bi-directional smart reconciliation:
        // Combines local/offline data with remote server data so neither device loses items
        const mergedPlan = mergePlanData(localPlan, remotePlan);

        const incomingSavings = (Array.isArray(mergedPlan.savingContributions) ? mergedPlan.savingContributions : []).map((c: any) => ({
          ...c,
          id: c.id || `sc-${crypto.randomUUID()}`,
        }));
        const incomingChecklist = Array.isArray(mergedPlan.checklist) ? mergedPlan.checklist : [];
        const incomingSeserahan = Array.isArray(mergedPlan.seserahan) ? mergedPlan.seserahan : [];
        const incomingPostWedding = Array.isArray(mergedPlan.postWedding) ? mergedPlan.postWedding : [];
        const incomingGuests = Array.isArray(mergedPlan.guests) ? mergedPlan.guests : [];
        const incomingFamilyQuota = mergedPlan.familyQuota || defaultFamilyQuota;
        const incomingRundown = Array.isArray(mergedPlan.rundown) ? mergedPlan.rundown : [];
        const incomingBudgetCategories = Array.isArray(mergedPlan.budgetCategories) ? mergedPlan.budgetCategories : [];
        const incomingVendors = Array.isArray(mergedPlan.vendors) ? mergedPlan.vendors : [];
        const incomingAlignmentTopics = Array.isArray(mergedPlan.alignmentTopics) ? mergedPlan.alignmentTopics : [];
        const incomingAdminSteps = Array.isArray(mergedPlan.adminSteps) && mergedPlan.adminSteps.length > 0 ? mergedPlan.adminSteps : officialAdminSteps;
        const incomingActivityLogs = Array.isArray(mergedPlan.activityLogs) ? mergedPlan.activityLogs : [];

        setSavingContributions(incomingSavings);
        setChecklist(incomingChecklist);
        setSeserahan(incomingSeserahan);
        setPostWedding(incomingPostWedding);
        setGuests(incomingGuests);
        setFamilyQuota(incomingFamilyQuota);
        setRundown(incomingRundown);
        setBudgetCategories(incomingBudgetCategories);
        setVendors(incomingVendors);
        setAlignmentTopics(incomingAlignmentTopics);
        setAdminSteps(incomingAdminSteps);
        setActivityLogs(incomingActivityLogs);

        if (Array.isArray(mergedPlan.deletedItemIds)) {
          for (const dId of mergedPlan.deletedItemIds) {
            deletedItemIdsRef.current.add(dId);
          }
          setDeletedItemIds(Array.from(deletedItemIdsRef.current).slice(-500));
        }

        // Bug B: Record applied remote hash based on what server provided.
        // If local state had additional items merged in, currentPayload will differ from remote hash,
        // which triggers auto-save naturally to sync those local items up to Neon!
        lastServerHashRef.current = hashPayload({
          wedding: updatedWedding,
          savingContributions: remotePlan.savingContributions || incomingSavings,
          checklist: remotePlan.checklist || incomingChecklist,
          seserahan: remotePlan.seserahan || incomingSeserahan,
          postWedding: remotePlan.postWedding || incomingPostWedding,
          guests: remotePlan.guests || incomingGuests,
          familyQuota: remotePlan.familyQuota || incomingFamilyQuota,
          rundown: remotePlan.rundown || incomingRundown,
          budgetCategories: remotePlan.budgetCategories || incomingBudgetCategories,
          vendors: remotePlan.vendors || incomingVendors,
          alignmentTopics: remotePlan.alignmentTopics || incomingAlignmentTopics,
          adminSteps: remotePlan.adminSteps || incomingAdminSteps,
          activityLogs: remotePlan.activityLogs || incomingActivityLogs,
        });
      } else if (data.success && !data.exists) {
        hasLoadedRemoteRef.current = true;
      }
    } catch (e) {
      console.warn("Failed to fetch wedding data from database", e);
    }
  }, [buildPlanPayload]);

  // Fetch when currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      fetchDbData(currentUser.email, weddingRef.current.inviteCode || wedding.inviteCode, true);
    }
  }, [currentUser?.email, wedding.inviteCode, fetchDbData]);

  // Periodic background synchronization (every 6 seconds when window active)
  useEffect(() => {
    if (!isInitialized) return;

    const pollSync = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (currentUser?.email) {
        fetchDbData(currentUser.email);
      } else if (
        wedding.inviteCode &&
        wedding.id &&
        wedding.id.length > 10 &&
        wedding.id !== "w-main"
      ) {
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
  }, [isInitialized, currentUser?.email, wedding.id, wedding.inviteCode, fetchDbData]);

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
          if (Array.isArray(parsed.deletedItemIds)) {
            for (const dId of parsed.deletedItemIds) {
              deletedItemIdsRef.current.add(dId);
            }
            setDeletedItemIds(Array.from(deletedItemIdsRef.current).slice(-500));
          }
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
        deletedItemIds: Array.from(deletedItemIdsRef.current).slice(-500),
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
    deletedItemIds,
  ]);

  // 3. Auto-Save to Neon Database (Debounced 500ms across Local & Deploy)
  useEffect(() => {
    if (!isInitialized) return;
    if (!currentUser?.email && wedding.id === "w-main" && !wedding.groomName && !wedding.brideName) {
      return;
    }

    // Bug E: Mencegah data lama menimpa: Auto-save TIDAK boleh berjalan untuk user
    // yang sudah login sebelum fetch pertama (fetchDbData) selesai
    if (currentUser?.email && !hasLoadedRemoteRef.current) {
      return;
    }

    const currentPayload = buildPlanPayload();
    const currentHash = hashPayload(currentPayload);

    // Bug B: Mencegah echo: jika hash saat ini sama dengan lastServerHashRef, JANGAN menyimpan
    if (lastServerHashRef.current !== "" && currentHash === lastServerHashRef.current) {
      return;
    }

    // If a save is currently in-flight, mark dirty queue so it saves again after completion
    if (inFlightRef.current) {
      dirtyAfterFlightRef.current = true;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    pendingSaveRef.current = true;
    saveTimeoutRef.current = setTimeout(async () => {
      const executeSave = async (attempt = 0) => {
        if (inFlightRef.current) {
          dirtyAfterFlightRef.current = true;
          return;
        }

        const payloadToSave = latestPayloadRef.current || buildPlanPayload();
        const currentHash = hashPayload(payloadToSave);
        if (lastServerHashRef.current !== "" && currentHash === lastServerHashRef.current) {
          pendingSaveRef.current = false;
          return;
        }

        inFlightRef.current = true;
        const activeUser = currentUserRef.current;
        const sentVersion = versionRef.current;
        const token = typeof window !== "undefined" ? localStorage.getItem("hajat_workspace_token") : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) {
          headers["x-hajat-token"] = token;
        }

        try {
          const res = await fetch("/api/wedding/sync", {
            method: "POST",
            headers,
            body: JSON.stringify({
              ...payloadToSave,
              baseVersion: sentVersion,
              user: activeUser,
              token: token || undefined,
            }),
          });
          const resData = await res.json();

          // 409 Conflict Handling
          if (res.status === 409 || resData.conflict) {
            saveFailedRef.current = false;
            retryCountRef.current = 0;
            saveFailedToastShownRef.current = false;
            const isTrueConflict = sentVersion === versionRef.current;
            if (typeof resData.version === "number") {
              versionRef.current = resData.version;
            }
            if (isTrueConflict) {
              showToastWarning(
                "Data Diperbarui",
                "Data diperbarui dari perangkat lain, ulangi perubahan Anda jika perlu"
              );
              await fetchDbData(activeUser?.email, weddingRef.current.inviteCode, true);
            } else {
              // Self-conflict: version was already bumped locally, flag dirty to save with latest state
              dirtyAfterFlightRef.current = true;
            }
            return;
          }

          if (res.ok && resData.success) {
            saveFailedRef.current = false;
            retryCountRef.current = 0;
            saveFailedToastShownRef.current = false;
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
              retryTimeoutRef.current = null;
            }

            if (resData.token && typeof window !== "undefined") {
              try {
                localStorage.setItem("hajat_workspace_token", resData.token);
              } catch {}
            }

            if (typeof resData.version === "number") {
              versionRef.current = resData.version;
            }
            if (resData.weddingId) {
              setWedding((prev) => (prev.id !== resData.weddingId ? { ...prev, id: resData.weddingId, version: versionRef.current } : { ...prev, version: versionRef.current }));
            }

            if (resData.planData) {
              const p = resData.planData;
              if (Array.isArray(p.seserahan)) setSeserahan(p.seserahan);
              if (Array.isArray(p.postWedding)) setPostWedding(p.postWedding);
              if (Array.isArray(p.checklist)) setChecklist(p.checklist);
              if (Array.isArray(p.guests)) setGuests(p.guests);
              if (p.familyQuota) setFamilyQuota(p.familyQuota);
              if (Array.isArray(p.rundown)) setRundown(p.rundown);
              if (Array.isArray(p.budgetCategories)) setBudgetCategories(p.budgetCategories);
              if (Array.isArray(p.vendors)) setVendors(p.vendors);
              if (Array.isArray(p.alignmentTopics)) setAlignmentTopics(p.alignmentTopics);
              if (Array.isArray(p.savingContributions)) setSavingContributions(p.savingContributions);
              if (Array.isArray(p.activityLogs)) setActivityLogs(p.activityLogs);
              if (Array.isArray(p.deletedItemIds)) {
                for (const dId of p.deletedItemIds) {
                  deletedItemIdsRef.current.add(dId);
                }
                setDeletedItemIds(Array.from(deletedItemIdsRef.current).slice(-500));
              }
              lastServerHashRef.current = hashPayload({
                wedding: weddingRef.current,
                savingContributions: p.savingContributions || [],
                checklist: p.checklist || [],
                seserahan: p.seserahan || [],
                postWedding: p.postWedding || [],
                guests: p.guests || [],
                familyQuota: p.familyQuota || defaultFamilyQuota,
                rundown: p.rundown || [],
                budgetCategories: p.budgetCategories || [],
                vendors: p.vendors || [],
                alignmentTopics: p.alignmentTopics || [],
                adminSteps: p.adminSteps || officialAdminSteps,
                activityLogs: p.activityLogs || [],
              });
            } else {
              lastServerHashRef.current = hashPayload(payloadToSave);
            }
          } else {
            console.warn("Auto-save returned error from server:", resData?.error || resData?.message);
            triggerRetry(attempt);
          }
        } catch (e) {
          console.warn("Auto-save to database deferred", e);
          triggerRetry(attempt);
        } finally {
          inFlightRef.current = false;
          saveTimeoutRef.current = null;
          // Allow polling to resume after save completes
          setTimeout(() => { pendingSaveRef.current = false; }, 800);
          if (dirtyAfterFlightRef.current) {
            dirtyAfterFlightRef.current = false;
            const nextPayload = latestPayloadRef.current || buildPlanPayload();
            const nextHash = hashPayload(nextPayload);
            if (nextHash !== lastServerHashRef.current) {
              executeSave(0);
            }
          }
        }
      };

      const triggerRetry = (attempt: number) => {
        saveFailedRef.current = true;
        const backoffs = [2000, 5000, 15000];
        if (attempt < backoffs.length) {
          const nextAttempt = attempt + 1;
          retryCountRef.current = nextAttempt;
          const delay = backoffs[attempt];
          retryTimeoutRef.current = setTimeout(() => {
            if (inFlightRef.current) {
              dirtyAfterFlightRef.current = true;
              return;
            }
            const latestPayload = latestPayloadRef.current || buildPlanPayload();
            const latestHash = hashPayload(latestPayload);
            if (latestHash !== lastServerHashRef.current) {
              executeSave(nextAttempt);
            } else {
              saveFailedRef.current = false;
              retryCountRef.current = 0;
            }
          }, delay);
        } else {
          retryCountRef.current = 3;
        }
      };

      await executeSave(retryCountRef.current);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
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
    deletedItemIds,
    buildPlanPayload,
    fetchDbData,
  ]);

  // Explicit sync triggered on actions like copying invite code or link
  const syncNow = async (): Promise<boolean> => {
    try {
      const payload = buildPlanPayload();
      const token = typeof window !== "undefined" ? localStorage.getItem("hajat_workspace_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["x-hajat-token"] = token;
      }

      const res = await fetch("/api/wedding/sync", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...payload,
          baseVersion: versionRef.current,
          user: currentUser,
          token: token || undefined,
        }),
      });
      const resData = await res.json();

      // 409 Conflict Handling
      if (res.status === 409 || resData.conflict) {
        saveFailedRef.current = false;
        retryCountRef.current = 0;
        saveFailedToastShownRef.current = false;
        if (typeof resData.version === "number") {
          versionRef.current = resData.version;
        }
        showToastWarning(
          "Data Diperbarui",
          "Data diperbarui dari perangkat lain, ulangi perubahan Anda jika perlu"
        );
        await fetchDbData(currentUser?.email, wedding.inviteCode, true);
        return false;
      }

      if (res.ok && resData.success) {
        saveFailedRef.current = false;
        retryCountRef.current = 0;
        saveFailedToastShownRef.current = false;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }

        if (resData.token && typeof window !== "undefined") {
          try {
            localStorage.setItem("hajat_workspace_token", resData.token);
          } catch {}
        }

        if (typeof resData.version === "number") {
          versionRef.current = resData.version;
        }
        if (resData.weddingId) {
          setWedding((prev) => (prev.id !== resData.weddingId ? { ...prev, id: resData.weddingId, version: versionRef.current } : { ...prev, version: versionRef.current }));
        }

        if (resData.planData) {
          const p = resData.planData;
          if (Array.isArray(p.seserahan)) setSeserahan(p.seserahan);
          if (Array.isArray(p.postWedding)) setPostWedding(p.postWedding);
          if (Array.isArray(p.checklist)) setChecklist(p.checklist);
          if (Array.isArray(p.guests)) setGuests(p.guests);
          if (p.familyQuota) setFamilyQuota(p.familyQuota);
          if (Array.isArray(p.rundown)) setRundown(p.rundown);
          if (Array.isArray(p.budgetCategories)) setBudgetCategories(p.budgetCategories);
          if (Array.isArray(p.vendors)) setVendors(p.vendors);
          if (Array.isArray(p.alignmentTopics)) setAlignmentTopics(p.alignmentTopics);
          if (Array.isArray(p.savingContributions)) setSavingContributions(p.savingContributions);
          if (Array.isArray(p.activityLogs)) setActivityLogs(p.activityLogs);
          if (Array.isArray(p.deletedItemIds)) {
            for (const dId of p.deletedItemIds) {
              deletedItemIdsRef.current.add(dId);
            }
            setDeletedItemIds(Array.from(deletedItemIdsRef.current).slice(-500));
          }
          lastServerHashRef.current = hashPayload({
            wedding: weddingRef.current,
            savingContributions: p.savingContributions || [],
            checklist: p.checklist || [],
            seserahan: p.seserahan || [],
            postWedding: p.postWedding || [],
            guests: p.guests || [],
            familyQuota: p.familyQuota || defaultFamilyQuota,
            rundown: p.rundown || [],
            budgetCategories: p.budgetCategories || [],
            vendors: p.vendors || [],
            alignmentTopics: p.alignmentTopics || [],
            adminSteps: p.adminSteps || officialAdminSteps,
            activityLogs: p.activityLogs || [],
          });
        } else {
          lastServerHashRef.current = hashPayload(payload);
        }
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
      id: userData.id || `u-${crypto.randomUUID()}`,
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
    localStorage.removeItem(STORAGE_KEY);
    setIsProfileModalOpen(false);

    // Reset workspace state to clean empty defaults
    setWedding(cleanEmptyWedding);
    setSavingContributions([]);
    setChecklist([]);
    setSeserahan([]);
    setPostWedding([]);
    setGuests([]);
    setFamilyQuota(defaultFamilyQuota);
    setRundown([]);
    setBudgetCategories([]);
    setVendors([]);
    setAlignmentTopics([]);
    setAdminSteps(officialAdminSteps);
    setActivityLogs([]);
    deletedItemIdsRef.current.clear();
    setDeletedItemIds([]);

    // Reset sync refs
    hasLoadedRemoteRef.current = false;
    lastServerHashRef.current = "";
    versionRef.current = 0;
    retryCountRef.current = 0;
    saveFailedRef.current = false;
    inFlightRef.current = false;
    dirtyAfterFlightRef.current = false;

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
        if (typeof result.wedding.version === "number") {
          versionRef.current = result.wedding.version;
        }
        setWedding(result.wedding);
      }
      if (result.planData) {
        const p = result.planData;
        const incomingSavings = (Array.isArray(p.savingContributions) ? p.savingContributions : []).map((c: any) => ({
          ...c,
          id: c.id || `sc-${crypto.randomUUID()}`,
        }));
        const incomingChecklist = Array.isArray(p.checklist) ? p.checklist : [];
        const incomingSeserahan = Array.isArray(p.seserahan) ? p.seserahan : [];
        const incomingPostWedding = Array.isArray(p.postWedding) ? p.postWedding : [];
        const incomingGuests = Array.isArray(p.guests) ? p.guests : [];
        const incomingFamilyQuota = p.familyQuota || defaultFamilyQuota;
        const incomingRundown = Array.isArray(p.rundown) ? p.rundown : [];
        const incomingBudgetCategories = Array.isArray(p.budgetCategories) ? p.budgetCategories : [];
        const incomingVendors = Array.isArray(p.vendors) ? p.vendors : [];
        const incomingAlignmentTopics = Array.isArray(p.alignmentTopics) ? p.alignmentTopics : [];
        const incomingAdminSteps = Array.isArray(p.adminSteps) && p.adminSteps.length > 0 ? p.adminSteps : officialAdminSteps;
        const incomingActivityLogs = Array.isArray(p.activityLogs) ? p.activityLogs : [];

        setSavingContributions(incomingSavings);
        setChecklist(incomingChecklist);
        setSeserahan(incomingSeserahan);
        setPostWedding(incomingPostWedding);
        setGuests(incomingGuests);
        setFamilyQuota(incomingFamilyQuota);
        setRundown(incomingRundown);
        setBudgetCategories(incomingBudgetCategories);
        setVendors(incomingVendors);
        setAlignmentTopics(incomingAlignmentTopics);
        setAdminSteps(incomingAdminSteps);
        setActivityLogs(incomingActivityLogs);

        lastServerHashRef.current = hashPayload({
          wedding: result.wedding || weddingRef.current,
          savingContributions: incomingSavings,
          checklist: incomingChecklist,
          seserahan: incomingSeserahan,
          postWedding: incomingPostWedding,
          guests: incomingGuests,
          familyQuota: incomingFamilyQuota,
          rundown: incomingRundown,
          budgetCategories: incomingBudgetCategories,
          vendors: incomingVendors,
          alignmentTopics: incomingAlignmentTopics,
          adminSteps: incomingAdminSteps,
          activityLogs: incomingActivityLogs,
        });
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

    addActivity(updated.name || currentUser?.name || "Pengguna", updated.role || "GROOM", "Memperbarui profil biodata & foto");
  };

  const requireAuth = (callback?: () => void): boolean => {
    if (!currentUser) {
      if (callback) {
        pendingAuthCallbackRef.current = callback;
      }
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Helper to resolve accurate user name for activity logs
  const getActorName = (preferredName?: string, userRole?: "GROOM" | "BRIDE" | "COLLABORATOR"): string => {
    let name = (preferredName || "").trim();
    const activeUser = currentUserRef.current;
    if (!name || name === "Pengguna" || name === "Calon Pengantin") {
      name = (activeUser?.name || activeUser?.nickname || "").trim();
    }
    if (!name) {
      if (userRole === "BRIDE") {
        name = (weddingRef.current.brideName || "").trim();
      } else if (userRole === "GROOM") {
        name = (weddingRef.current.groomName || "").trim();
      }
    }
    if (!name) {
      name = (weddingRef.current.groomName || weddingRef.current.brideName || "Calon Pengantin").trim();
    }
    return name;
  };

  // Helper to add activity log with real timestamps and 200 items retention
  const addActivity = (userName: string, userRole: "GROOM" | "BRIDE" | "COLLABORATOR", action: string) => {
    const resolvedName = getActorName(userName, userRole);
    const now = Date.now();
    const isoString = new Date(now).toISOString();

    const newLog: ActivityLog = {
      id: `act-${crypto.randomUUID()}`,
      userName: resolvedName,
      userRole,
      action,
      timeAgo: "Baru saja",
      timestamp: now,
      createdAt: isoString,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 199)]);
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

  const addSavingContribution = (item: Omit<SavingContribution, "id"> & { id?: string }) => {
    const newItem: SavingContribution = {
      id: item.id || `sc-${crypto.randomUUID()}`,
      ...item,
    };
    const newItems = [...savingContributions, newItem];
    const total = newItems.reduce((acc, c) => acc + c.amount, 0);
    const withPercentages = newItems.map((c) => ({
      ...c,
      percentage: total > 0 ? Number(((c.amount / total) * 100).toFixed(1)) : 0,
    }));
    setSavingContributions(withPercentages);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan setoran tabungan: ${item.label} (Rp ${item.amount.toLocaleString("id-ID")})`);
  };

  const editSavingContribution = (idOrIdx: string | number, item: Omit<SavingContribution, "percentage">) => {
    const newItems = savingContributions.map((c, i) => {
      const match = typeof idOrIdx === "string" ? c.id === idOrIdx : i === idOrIdx;
      return match ? { ...c, ...item } : c;
    });
    const total = newItems.reduce((acc, c) => acc + c.amount, 0);
    const withPercentages = newItems.map((c) => ({
      ...c,
      percentage: total > 0 ? Number(((c.amount / total) * 100).toFixed(1)) : 0,
    }));
    setSavingContributions(withPercentages);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Memperbarui setoran tabungan: ${item.label}`);
  };

  const deleteSavingContribution = (idOrIdx: string | number) => {
    const newItems = savingContributions.filter((c, i) => {
      const match = typeof idOrIdx === "string" ? c.id === idOrIdx : i === idOrIdx;
      return !match;
    });
    const total = newItems.reduce((acc, c) => acc + c.amount, 0);
    const withPercentages = newItems.map((c) => ({
      ...c,
      percentage: total > 0 ? Number(((c.amount / total) * 100).toFixed(1)) : 0,
    }));
    setSavingContributions(withPercentages);
  };

  const addChecklist = (item: Omit<ChecklistItem, "id">) => {
    const newItem: ChecklistItem = {
      id: `chk-${crypto.randomUUID()}`,
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
    trackDeletedId(id);
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const addSeserahan = (item: Omit<SeserahanItem, "id">) => {
    const newItem: SeserahanItem = {
      id: `ses-${crypto.randomUUID()}`,
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
    trackDeletedId(id);
    setSeserahan((prev) => prev.filter((s) => s.id !== id));
  };

  const addPostWedding = (item: Omit<PostWeddingItem, "id">) => {
    const newItem: PostWeddingItem = {
      id: `pw-${crypto.randomUUID()}`,
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
    trackDeletedId(id);
    setPostWedding((prev) => prev.filter((item) => item.id !== id));
  };

  const addGuest = (item: Omit<GuestItem, "id">) => {
    const newItem: GuestItem = {
      id: `g-${crypto.randomUUID()}`,
      ...item,
    };
    setGuests((prev) => [newItem, ...prev]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan tamu undangan: ${item.name}`);
  };

  const editGuest = (item: GuestItem) => {
    setGuests((prev) => prev.map((g) => (g.id === item.id ? item : g)));
  };

  const deleteGuest = (id: string) => {
    trackDeletedId(id);
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
      id: `rd-${crypto.randomUUID()}`,
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
    trackDeletedId(id);
    setRundown((prev) => prev.filter((r) => r.id !== id));
  };

  const addBudgetCategory = (item: Omit<BudgetCategory, "id">) => {
    const newItem: BudgetCategory = {
      id: `b-${crypto.randomUUID()}`,
      ...item,
    };
    setBudgetCategories((prev) => [newItem, ...prev]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan pos anggaran: ${item.name}`);
  };

  const updateBudgetCategory = (item: BudgetCategory) => {
    setBudgetCategories((prev) => prev.map((b) => (b.id === item.id ? item : b)));
  };

  const deleteBudgetCategory = (id: string) => {
    trackDeletedId(id);
    setBudgetCategories((prev) => prev.filter((b) => b.id !== id));
  };

  const addVendor = (item: Omit<VendorMilestone, "id">) => {
    const newItem: VendorMilestone = {
      id: `vm-${crypto.randomUUID()}`,
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
    trackDeletedId(id);
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
    let targetQuestion = "";
    let nextAgreed = false;
    setAlignmentTopics((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          nextAgreed = !t.isAgreed;
          targetQuestion = t.question;
          return { ...t, isAgreed: nextAgreed };
        }
        return t;
      })
    );
    if (targetQuestion) {
      const actionText = nextAgreed
        ? `Menyepakati topik diskusi pranikah: "${targetQuestion.substring(0, 35)}..."`
        : `Membatalkan kesepakatan topik: "${targetQuestion.substring(0, 35)}..."`;
      addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", actionText);
    }
  };

  const addAlignmentTopic = (question: string, category: AlignmentTopic["category"]) => {
    const newTopic: AlignmentTopic = {
      id: `top-${crypto.randomUUID()}`,
      category,
      question,
      groomAnswer: "",
      brideAnswer: "",
      isAgreed: false,
    };
    setAlignmentTopics((prev) => [...prev, newTopic]);
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", `Menambahkan topik pranikah: "${question.substring(0, 35)}..."`);
  };

  const editAlignmentTopic = (id: string, question: string, category: AlignmentTopic["category"]) => {
    setAlignmentTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, question, category } : t))
    );
  };

  const deleteAlignmentTopic = (id: string) => {
    trackDeletedId(id);
    setAlignmentTopics((prev) => prev.filter((t) => t.id !== id));
    addActivity(currentUser?.name || "Calon Pengantin", currentUser?.role || "GROOM", "Menghapus topik diskusi pranikah");
  };

  const loadRecommendedAlignmentTopics = () => {
    setAlignmentTopics((prev) => {
      const existingQuestions = new Set(prev.map((t) => t.question.toLowerCase().trim()));
      const newTopics = defaultAlignmentTopics
        .filter((t) => !existingQuestions.has(t.question.toLowerCase().trim()))
        .map((t) => ({ ...t, id: `top-${crypto.randomUUID()}` }));
      return [...prev, ...newTopics];
    });
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
    deletedItemIdsRef.current.clear();
    setDeletedItemIds([]);
    setWedding((prev) => ({
      ...prev,
      targetBudget: 0,
      currentSavings: 0,
    }));
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
