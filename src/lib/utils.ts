import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortRupiah(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)} M`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)} Jt`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)} Rb`;
  }
  return `Rp ${amount}`;
}

export function calculateDaysRemaining(targetDate: string): number {
  if (!targetDate) return 0;
  const dateStr = targetDate.trim();
  const target = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
  if (isNaN(target.getTime())) return 0;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = target.getTime() - todayMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function safeUrl(input?: string | null): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // If no scheme present, prepend https://
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

export function parseActivityDate(timestamp?: number | string | Date | null): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? null : timestamp;
  }
  if (typeof timestamp === "number") {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }
  const str = String(timestamp).trim();
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function formatExactDateTime(timestamp?: number | string | Date | null): string {
  const d = parseActivityDate(timestamp);
  if (!d) return "";
  
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(d) + " WIB";
}

export function formatRelativeTime(
  timestamp?: number | string | Date | null,
  fallbackText = "Baru saja"
): string {
  const d = parseActivityDate(timestamp);
  if (!d) return fallbackText;

  const now = Date.now();
  const diffMs = now - d.getTime();

  if (diffMs < 0 || diffMs < 60000) return "Baru saja";
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    const timeStr = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
    return `Kemarin, ${timeStr} WIB`;
  }
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return formatExactDateTime(d);
}


