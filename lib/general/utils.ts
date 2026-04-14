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
