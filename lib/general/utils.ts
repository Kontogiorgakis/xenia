import { type ClassValue,clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export function parseJsonArray<T>(s: string | null | undefined): T[] {
  if (!s) return [];
  try {
    const p = JSON.parse(s);
    return Array.isArray(p) ? (p as T[]) : [];
  } catch {
    return [];
  }
}

export function scrollAdminShellTop() {
  document
    .querySelector<HTMLElement>(".admin-shell [data-radix-scroll-area-viewport]")
    ?.scrollTo({ top: 0, behavior: "smooth" });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDateForInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}
