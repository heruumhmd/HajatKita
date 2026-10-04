export type RoleType = "GROOM" | "BRIDE" | "COLLABORATOR";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export type TaskCategory =
  | "ADMINISTRASI_KUA"
  | "VENUE_CATERING"
  | "DEKORASI"
  | "DOKUMENTASI"
  | "BUSANA_MUA"
  | "UNDANGAN_SOUVENIR"
  | "LAINNYA";

export type ItemPriority = "MUST_HAVE" | "NICE_TO_HAVE" | "DREAM_ITEM";

export type GuestSide = "GROOM" | "BRIDE" | "BOTH";

export type RSVPStatus = "PENDING" | "CONFIRMED_ATTENDING" | "DECLINED";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: RoleType;
}

export interface WeddingProject {
  id: string;
  title: string;
  groomName: string;
  brideName: string;
  weddingDate: string; // ISO string
  city: string;
  targetBudget: number;
  currentSavings: number;
  inviteCode: string;
  isPartnerConnected: boolean;
  partnerInfo?: {
    name: string;
    role: RoleType;
    image?: string;
    email: string;
  };
}

export interface SavingContribution {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  timelineTag: string; // e.g., 'H-6 Bulan', 'H-3 Bulan', 'H-1 Bulan'
  status: TaskStatus;
  assignedTo: string; // 'Dwiki (Suami)', 'Sarah (Istri)', 'Bersama'
  dueDate?: string;
  attachmentUrl?: string;
  isOfficialKUA?: boolean;
}

export interface SeserahanItem {
  id: string;
  boxNumber: number;
  boxName: string;
  name: string;
  brand: string;
  category: string;
  estimatedPrice: number;
  actualPrice?: number;
  purchaseUrl: string;
  isPurchased: boolean;
  notes?: string;
}

export interface PostWeddingItem {
  id: string;
  name: string;
  roomCategory: string; // 'Kamar Tidur', 'Dapur', 'Ruang Keluarga', 'Elektronik'
  brand: string;
  price: number;
  purchaseUrl: string;
  priority: ItemPriority;
  isAcquired: boolean;
  isGiftClaimable: boolean;
  claimedBy?: string; // Nama teman/keluarga yang menghadiahkan
}

export interface GuestItem {
  id: string;
  name: string;
  side: GuestSide;
  category: string; // 'Keluarga Inti', 'Sahabat', 'Rekan Kantor', 'VIP'
  pax: number;
  phone: string;
  rsvpStatus: RSVPStatus;
  envelopeAmount?: number;
  giftDescription?: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: RoleType;
  action: string;
  timeAgo: string;
}

export interface RundownItem {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  picName: string;
  picPhone: string;
  location: string;
  phase: "Akad Nikah" | "Adat & Sungkeman" | "Resepsi Siang" | "Resepsi Malam";
}

export interface FamilyQuota {
  venueCapacity: number;
  groomQuota: number;
  brideQuota: number;
  groomParentsQuota: number;
  brideParentsQuota: number;
  costPerPax: number;
}
