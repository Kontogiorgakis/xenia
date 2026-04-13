"use client";

import { CalendarDays, Clock, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuickInfoStripProps {
  checkInTime: string;
  checkOutTime: string;
  checkIn: Date;
  checkOut: Date;
}

function daysDiff(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function QuickInfoStrip({
  checkInTime,
  checkOutTime,
  checkIn,
  checkOut,
}: QuickInfoStripProps) {
  const t = useTranslations("Stay");
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  let timingLabel: string;
  if (now < checkInDate) {
    const days = daysDiff(now, checkInDate);
    timingLabel = `${t("arrivingIn")} ${days}d`;
  } else if (now > checkOutDate) {
    timingLabel = t("stayComplete");
  } else {
    const days = daysDiff(now, checkOutDate);
    if (days === 0) timingLabel = t("checkoutToday");
    else timingLabel = `${days} ${days === 1 ? "day" : "days"} ${t("left")}`;
  }

  return (
    <div className="relative z-10 -mt-10 px-5">
      <div
        className="mx-auto max-w-md rounded-2xl bg-white px-2 py-4 shadow-[0_12px_48px_rgba(10,46,79,0.12)] dark:bg-card"
      >
        <div className="flex items-center divide-x divide-border/40">
          <InfoPill
            icon={<Clock className="size-4" strokeWidth={1.75} />}
            label={t("checkin")}
            value={checkInTime}
          />
          <InfoPill
            icon={<LogOut className="size-4" strokeWidth={1.75} />}
            label={t("checkout")}
            value={checkOutTime}
          />
          <InfoPill
            icon={<CalendarDays className="size-4" strokeWidth={1.75} />}
            label={t("stay")}
            value={timingLabel}
          />
        </div>
      </div>
    </div>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-2 text-center">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <span className="text-[13px] font-semibold">{value}</span>
    </div>
  );
}
