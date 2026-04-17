"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PropertyActions } from "@/components/admin/property-actions";
import { PropertySpecs } from "@/components/admin/property-specs";
import { cn } from "@/lib/utils";
import { getUnitStatus, STATUS_CONFIG } from "@/lib/utils/unit-status";

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

interface UnitMiniCardProps {
  property: {
    id: string;
    name: string;
    squareMeters: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    maxGuests: number | null;
    nightlyRate: number | null;
    wifiName: string | null;
    reservations: Reservation[];
    _count: { reservations: number };
  };
  locale: string;
  index: number;
}

function formatShort(date: Date, locale: string): string {
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function UnitMiniCard({ property, locale, index }: UnitMiniCardProps) {
  const tp = useTranslations("Admin.properties");
  const { status, activeReservation } = getUnitStatus(property.reservations);
  const config = STATUS_CONFIG[status];
  const [selected, setSelected] = useState<ReservationDetail | null>(null);

  const isUrgent =
    status === "arriving_today" ||
    status === "departing_today" ||
    status === "back_to_back";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
        className="flex flex-col gap-3 overflow-hidden rounded-xl border border-border/40 bg-card shadow-xenia"
      >
        {/* Status bar */}
        <div className={cn("h-1 w-full", config.barColor)} />

        <div className="flex flex-col gap-3 px-4 pb-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Home className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    config.dotColor,
                    (status === "occupied" || isUrgent) && "animate-pulse"
                  )}
                />
                <span className="truncate text-sm font-medium">
                  {property.name}
                </span>
              </div>
              <PropertySpecs
                squareMeters={property.squareMeters}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                maxGuests={property.maxGuests}
              />
            </div>
            {property.nightlyRate != null && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                €{property.nightlyRate}/{tp("night")}
              </span>
            )}
          </div>

          {/* Status / active reservation */}
          {activeReservation ? (
            <button
              type="button"
              onClick={() => {
                const r = property.reservations.find(
                  (res) => res.id === activeReservation.id
                );
                if (r) setSelected({ ...r, propertyName: property.name });
              }
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition hover:brightness-95 cursor-pointer",
                config.bgColor
              )}
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", config.dotColor)} />
              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                {activeReservation.guestName}
              </span>
              <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                {formatShort(activeReservation.checkIn, locale)} –{" "}
                {formatShort(activeReservation.checkOut, locale)}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-2.5 py-1.5 dark:bg-green-950/20">
              <span className="size-1.5 shrink-0 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                {tp("statusAvailable")}
              </span>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex items-center justify-end">
            <PropertyActions
              propertyId={property.id}
              propertyName={property.name}
              compact
            />
          </div>
        </div>
      </motion.div>

      <ReservationDetailSheet
        reservation={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
