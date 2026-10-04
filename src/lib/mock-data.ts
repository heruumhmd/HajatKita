import {
  WeddingProject,
  SavingContribution,
  ChecklistItem,
  SeserahanItem,
  PostWeddingItem,
  GuestItem,
  ActivityLog,
  RundownItem,
} from "@/types";

export const mockWedding: WeddingProject = {
  id: "w-empty",
  title: "Rencana Pernikahan Kita",
  groomName: "",
  brideName: "",
  weddingDate: new Date().toISOString(),
  city: "",
  targetBudget: 0,
  currentSavings: 0,
  inviteCode: "",
  slug: "",
  isPartnerConnected: false,
};

export const mockSavingContributions: SavingContribution[] = [];
export const mockActivityLogs: ActivityLog[] = [];
export const mockChecklist: ChecklistItem[] = [];
export const mockSeserahan: SeserahanItem[] = [];
export const mockPostWedding: PostWeddingItem[] = [];
export const mockGuests: GuestItem[] = [];
export const mockRundown: RundownItem[] = [];
