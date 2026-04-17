"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatusPill } from "@/components/admin/location-card-parts";
import { PropertyActions } from "@/components/admin/property-actions";
import { PropertySpecs } from "@/components/admin/property-specs";
import { UpcomingReservations } from "@/components/admin/upcoming-reservations";
import { getUnitStatus } from "@/lib/utils/unit-status";

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

export function UnitMiniCard({ property, locale, index }: UnitMiniCardProps) {
  const tp = useTranslations("Admin.properties");
  const { status } = getUnitStatus(property.reservations);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="flex flex-col gap-3 overflow-hidden rounded-xl border border-border/40 bg-card shadow-xenia"
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Status pill + actions */}
        <div className="flex items-start justify-between gap-2">
          <StatusPill status={status} size="sm" />
          <PropertyActions
            propertyId={property.id}
            propertyName={property.name}
            compact
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Home className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {property.name}
            </span>
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

        {/* Reservations */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>{tp("reservations")}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground">
              {property._count.reservations}
            </span>
          </div>
          <UpcomingReservations
            reservations={property.reservations}
            propertyName={property.name}
            locale={locale}
            compact
            activeStatus={status}
          />
        </div>
      </div>
    </motion.div>
  );
}
