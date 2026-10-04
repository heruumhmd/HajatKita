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
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
