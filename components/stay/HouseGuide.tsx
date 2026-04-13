"use client";

import {
  Clock,
  DoorOpen,
  Home,
  Key,
  LogOut,
  MapPin,
  Moon,
  ParkingCircle,
  ScrollText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { SectionTitle } from "./SectionTitle";

interface HouseGuideProps {
  address: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  houseRules: string | null;
  description: string | null;
  gateCode: string | null;
  parkingInfo: string | null;
  buildingAccess: string | null;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export function HouseGuide({
  address,
  checkInTime,
  checkOutTime,
  houseRules,
  description,
  gateCode,
  parkingInfo,
  buildingAccess,
  quietHoursStart,
  quietHoursEnd,
}: HouseGuideProps) {
  const t = useTranslations("Stay");
  const [rulesExpanded, setRulesExpanded] = useState(false);

  const rulesTruncated =
    houseRules && houseRules.length > 180
      ? rulesExpanded
        ? houseRules
        : houseRules.slice(0, 180) + "…"
      : houseRules;

  const rows: { icon: typeof Home; label: string; value: string | null }[] = [
    { icon: MapPin, label: t("address"), value: address },
    { icon: Clock, label: t("checkin"), value: checkInTime },
    { icon: LogOut, label: t("checkout"), value: checkOutTime },
    { icon: Key, label: t("gateCode"), value: gateCode },
    { icon: ParkingCircle, label: t("parking"), value: parkingInfo },
    { icon: DoorOpen, label: t("buildingAccess"), value: buildingAccess },
    {
      icon: Moon,
      label: t("quietHours"),
      value:
        quietHoursStart && quietHoursEnd
          ? `${quietHoursStart} — ${quietHoursEnd}`
          : null,
    },
  ].filter((r) => r.value);

  return (
    <section id="guide" className="mx-5 mt-10 scroll-mt-20">
      <div className="mx-auto max-w-md">
        <SectionTitle icon={Home} title={t("yourApartment")} />

        {description && (
          <p className="mb-5 text-[15px] leading-[1.65] text-foreground/85">
            {description}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl bg-xenia-surface-low">
          {rows.map((row, idx) => (
            <div
              key={row.label}
              className={
                idx === 0
                  ? "flex items-start gap-4 px-5 py-4"
                  : "flex items-start gap-4 border-t border-border/20 px-5 py-4"
              }
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-card">
                <row.icon
                  className="size-3.5 text-primary"
                  strokeWidth={2}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {row.label}
                </p>
                <p className="mt-0.5 text-[14px] font-medium leading-snug">
                  {row.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {houseRules && (
          <div className="mt-4 rounded-2xl bg-xenia-surface-low p-5">
            <div className="mb-3 flex items-center gap-2">
              <ScrollText className="size-3.5 text-primary" strokeWidth={2} />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("houseRules")}
              </p>
            </div>
            <p className="whitespace-pre-wrap text-[14px] leading-[1.65]">
              {rulesTruncated}
            </p>
            {houseRules.length > 180 && (
              <button
                type="button"
                onClick={() => setRulesExpanded(!rulesExpanded)}
                className="mt-2 cursor-pointer text-[12px] font-semibold text-primary"
              >
                {rulesExpanded ? t("readLess") : t("readMore")} →
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
