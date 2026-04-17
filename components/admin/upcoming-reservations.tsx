"use client";

import { CalendarCheck, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { UnitStatus } from "@/lib/utils/unit-status";
import { STATUS_CONFIG } from "@/lib/utils/unit-status";

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
  activeStatus?: UnitStatus;
}

function formatShort(date: Date, locale: string): string {
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

type Phase = "departing_today" | "arriving_today" | "active" | "upcoming";

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function getPhase(checkIn: Date, checkOut: Date): Phase {
  const today = startOfDay(new Date());
  const ci = startOfDay(checkIn);
  const co = startOfDay(checkOut);
  if (co === today) return "departing_today";
  if (ci === today) return "arriving_today";
  if (ci < today && co > today) return "active";
  return "upcoming";
}

function getPhaseConfig(
  phase: Phase,
  activeConfig: (typeof STATUS_CONFIG)[UnitStatus] | null
) {
  if (phase === "departing_today") return STATUS_CONFIG.departing_today;
  if (phase === "arriving_today") return STATUS_CONFIG.arriving_today;
  if (phase === "active") return activeConfig;
  return null;
}

export function UpcomingReservations({
  reservations,
  propertyName,
  locale,
  compact = false,
  activeStatus,
}: UpcomingReservationsProps) {
  const t = useTranslations("Admin.properties");
  const [selected, setSelected] = useState<ReservationDetail | null>(null);
  const activeConfig = activeStatus ? STATUS_CONFIG[activeStatus] : null;

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
          const phaseConfig = getPhaseConfig(phase, activeConfig);
          const rowBg = phaseConfig?.bgColor ?? "bg-muted/40";
          const dotBg = phaseConfig?.dotColor ?? "bg-primary";
          // Show date that's most relevant to the phase
          const displayDate =
            phase === "departing_today" ? r.checkOut : r.checkIn;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected({ ...r, propertyName })}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition hover:brightness-95 cursor-pointer",
                rowBg
              )}
            >
              <span
                className={cn("size-1.5 shrink-0 rounded-full", dotBg)}
              />

              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                {r.guestName}
              </span>

              {phaseConfig && phase !== "active" && (
                <span
                  className={cn(
                    "flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white",
                    phaseConfig.dotColor
                  )}
                >
                  {t(phaseConfig.label)}
                </span>
              )}
              {phase === "upcoming" && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  {t("statusUpcoming")}
                </span>
              )}

              <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground">
                <Users className="size-2.5" />
                {r.numberOfGuests}
              </span>
              <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                {formatShort(displayDate, locale)}
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
