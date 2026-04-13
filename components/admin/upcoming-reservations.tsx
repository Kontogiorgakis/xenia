"use client";

import { CalendarCheck, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "@/lib/utils";

import {
  ReservationDetail,
  ReservationDetailSheet,
} from "./reservation-detail-sheet";

interface Reservation {
  id: string;
  guestName: string;
  guestNationality: string | null;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  source: string;
  status: string;
  specialRequests: string | null;
  guestToken: string;
}

interface UpcomingReservationsProps {
  reservations: Reservation[];
  propertyName: string;
  locale: string;
  compact?: boolean;
}

function formatShort(date: Date, locale: string): string {
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

type Phase = "active" | "upcoming";

function getPhase(checkIn: Date, checkOut: Date): Phase {
  const now = Date.now();
  const ci = new Date(checkIn).getTime();
  const co = new Date(checkOut).getTime();
  if (ci <= now && co >= now) return "active";
  return "upcoming";
}

export function UpcomingReservations({
  reservations,
  propertyName,
  locale,
  compact = false,
}: UpcomingReservationsProps) {
  const t = useTranslations("Admin.properties");
  const [selected, setSelected] = useState<ReservationDetail | null>(null);

  if (reservations.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarCheck className="size-3" />
        <span>{t("noUpcoming")}</span>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-1.5", compact && "space-y-1")}>
        {reservations.slice(0, compact ? 2 : 3).map((r) => {
          const phase = getPhase(r.checkIn, r.checkOut);
          const isActive = phase === "active";
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected({ ...r, propertyName })}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition hover:brightness-95 cursor-pointer",
                isActive
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-muted/40"
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  isActive ? "bg-green-600" : "bg-primary"
                )}
              />

              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                {r.guestName}
              </span>

              {isActive ? (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                  </span>
                  {t("statusActive")}
                </span>
              ) : (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  {t("statusUpcoming")}
                </span>
              )}

              <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground">
                <Users className="size-2.5" />
                {r.numberOfGuests}
              </span>
              <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                {formatShort(r.checkIn, locale)}
              </span>
            </button>
          );
        })}
      </div>

      <ReservationDetailSheet
        reservation={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
