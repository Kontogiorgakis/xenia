"use client";

import { AlertTriangle, CalendarClock, LogIn, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
}

interface PropertyAlertProps {
  reservations: Reservation[];
}

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function daysFromToday(d: Date): number {
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

type AlertType = "arriving-today" | "departing-today" | "departing-tomorrow" | "back-to-back" | "arriving-soon";

interface Alert {
  type: AlertType;
  guestName: string;
  tone: "urgent" | "info";
}

function computeAlerts(reservations: Reservation[]): Alert[] {
  const alerts: Alert[] = [];
  const seenTypes = new Set<AlertType>();

  for (const r of reservations) {
    const inDays = daysFromToday(new Date(r.checkIn));
    const outDays = daysFromToday(new Date(r.checkOut));

    if (inDays === 0 && !seenTypes.has("arriving-today")) {
      alerts.push({ type: "arriving-today", guestName: r.guestName, tone: "urgent" });
      seenTypes.add("arriving-today");
    }
    if (outDays === 0 && !seenTypes.has("departing-today")) {
      alerts.push({ type: "departing-today", guestName: r.guestName, tone: "urgent" });
      seenTypes.add("departing-today");
    }
    if (outDays === 1 && !seenTypes.has("departing-tomorrow")) {
      alerts.push({ type: "departing-tomorrow", guestName: r.guestName, tone: "info" });
      seenTypes.add("departing-tomorrow");
    }
  }

  // Back-to-back: same-day checkout + checkin. Reservations arrive sorted by checkIn,
  // so only adjacent pairs can form a back-to-back turnover.
  for (let i = 0; i < reservations.length - 1; i++) {
    const outA = startOfDay(new Date(reservations[i].checkOut));
    const inB = startOfDay(new Date(reservations[i + 1].checkIn));
    if (outA === inB) {
      alerts.push({
        type: "back-to-back",
        guestName: reservations[i + 1].guestName,
        tone: "urgent",
      });
      break;
    }
  }

  return alerts;
}

export function PropertyAlert({ reservations }: PropertyAlertProps) {
  const t = useTranslations("Admin.properties");
  const alerts = computeAlerts(reservations);

  if (alerts.length === 0) return null;

  const alert = alerts[0];

  const icon = {
    "arriving-today": LogIn,
    "departing-today": LogOut,
    "departing-tomorrow": CalendarClock,
    "back-to-back": AlertTriangle,
    "arriving-soon": CalendarClock,
  }[alert.type];

  const message = t(`alerts.${alert.type}`, { name: alert.guestName });

  const Icon = icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
        alert.tone === "urgent"
          ? "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
          : "bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-300"
      )}
    >
      <Icon className="size-3 shrink-0" strokeWidth={2.2} />
      <span className="truncate">{message}</span>
    </div>
  );
}
