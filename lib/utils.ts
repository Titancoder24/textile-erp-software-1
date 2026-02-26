import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getDaysRemaining(date: string | Date): number {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDeliveryUrgency(
  date: string | Date
): "safe" | "warning" | "danger" | "overdue" {
  const days = getDaysRemaining(date);
  if (days < 0) return "overdue";
  if (days < 7) return "danger";
  if (days < 15) return "warning";
  return "safe";
}

export function calculateEfficiency(
  produced: number,
  smv: number,
  minutes: number,
  operators: number
): number {
  if (minutes === 0 || operators === 0) return 0;
  return Math.round(((produced * smv) / (minutes * operators)) * 100);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateDocumentNumber(
  prefix: string,
  sequence: number,
  year?: number
): string {
  const y = year || new Date().getFullYear();
  const seq = String(sequence).padStart(4, "0");
  return `${prefix}-${y}-${seq}`;
}
