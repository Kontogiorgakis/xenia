"use client";

import { Reorder, useDragControls } from "framer-motion";
import {
  Building2,
  Home,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { LocationCardMulti } from "@/components/admin/location-card-multi";
import { LocationCardSingle } from "@/components/admin/location-card-single";
import { cn } from "@/lib/utils";
import type { UnitStatus } from "@/lib/utils/unit-status";
import { getUnitStatus, STATUS_CONFIG } from "@/lib/utils/unit-status";
import { reorderLocations } from "@/server_actions/locations";

type Reservation = {
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
};

type PropertyLite = {
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

export type LocationCard = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  coverPhoto: string | null;
  isSingleUnit: boolean;
  amenities: string | null;
  bookingToken: string | null;
  bookingEnabled: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  properties: PropertyLite[];
};

interface SortablePropertiesListProps {
  initialLocations: LocationCard[];
  locale: string;
}

type TypeFilter = "all" | "standalone" | "complex";

const STATUS_FILTERS: UnitStatus[] = [
  "available",
  "occupied",
  "arriving_today",
  "departing_today",
  "arriving_soon",
  "back_to_back",
];

function getLocationStatuses(location: LocationCard): Set<UnitStatus> {
  const statuses = new Set<UnitStatus>();
  for (const p of location.properties) {
    const { status } = getUnitStatus(p.reservations);
    statuses.add(status);
  }
  if (location.properties.length === 0) statuses.add("available");
  return statuses;
}

export function SortablePropertiesList({
  initialLocations,
  locale,
}: SortablePropertiesListProps) {
  const t = useTranslations("Admin.locations");
  const tp = useTranslations("Admin.properties");
  const [locations, setLocations] = useState(initialLocations);
  const lastCommittedRef = useRef(initialLocations);
  const [, startTransition] = useTransition();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<UnitStatus | null>(null);

  const hasActiveFilter = typeFilter !== "all" || statusFilter !== null;

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      const isSingle = loc.isSingleUnit && loc.properties.length === 1;

      if (typeFilter === "standalone" && !isSingle) return false;
      if (typeFilter === "complex" && isSingle) return false;

      if (statusFilter) {
        const statuses = getLocationStatuses(loc);
        if (!statuses.has(statusFilter)) return false;
      }

      return true;
    });
  }, [locations, typeFilter, statusFilter]);

  const handleReorder = (next: LocationCard[]) => {
    setLocations(next);
    startTransition(async () => {
      const result = await reorderLocations(next.map((l) => l.id));
      if (result.success) {
        lastCommittedRef.current = next;
      } else {
        toast.error(result.error ?? "Failed to save order");
        setLocations(lastCommittedRef.current);
      }
    });
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter(null);
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filters */}
        <FilterPill
          active={typeFilter === "all"}
          onClick={() => setTypeFilter("all")}
        >
          {t("filters.all")}
        </FilterPill>
        <FilterPill
          active={typeFilter === "standalone"}
          onClick={() => setTypeFilter(typeFilter === "standalone" ? "all" : "standalone")}
          icon={<Home className="size-3" />}
        >
          {t("filters.standalone")}
        </FilterPill>
        <FilterPill
          active={typeFilter === "complex"}
          onClick={() => setTypeFilter(typeFilter === "complex" ? "all" : "complex")}
          icon={<Building2 className="size-3" />}
        >
          {t("filters.complex")}
        </FilterPill>

        <span className="mx-1 h-4 w-px bg-border" />

        {/* Status filters */}
        {STATUS_FILTERS.map((s) => {
          const config = STATUS_CONFIG[s];
          return (
            <FilterPill
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
              dot={config.dotColor}
            >
              {tp(config.label)}
            </FilterPill>
          );
        })}

        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <X className="size-3" />
            {t("filters.clear")}
          </button>
        )}
      </div>

      {/* Results count when filtered */}
      {hasActiveFilter && (
        <p className="text-xs text-muted-foreground">
          {t("filters.showing", { count: filtered.length, total: locations.length })}
        </p>
      )}

      <Reorder.Group
        as="div"
        axis="y"
        values={locations}
        onReorder={handleReorder}
        className="space-y-6"
        layoutScroll
      >
        {locations.map((location) => {
          const isVisible = filtered.includes(location);
          return (
            <LocationCardWrapper
              key={location.id}
              location={location}
              locale={locale}
              hidden={!isVisible}
              statusFilter={statusFilter}
            />
          );
        })}
      </Reorder.Group>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  icon,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition duration-300",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {dot && <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />}
      {icon}
      {children}
    </button>
  );
}

function LocationCardWrapper({
  location,
  locale,
  hidden,
  statusFilter,
}: {
  location: LocationCard;
  locale: string;
  hidden: boolean;
  statusFilter: UnitStatus | null;
}) {
  const dragControls = useDragControls();
  const isSingle = location.isSingleUnit && location.properties.length === 1;

  return (
    <Reorder.Item
      as="div"
      value={location}
      dragListener={false}
      dragControls={dragControls}
      style={{ display: hidden ? "none" : undefined }}
    >
      {isSingle ? (
        <LocationCardSingle
          location={location}
          locale={locale}
          dragControls={dragControls}
        />
      ) : (
        <LocationCardMulti
          location={location}
          locale={locale}
          dragControls={dragControls}
          statusFilter={statusFilter}
        />
      )}
    </Reorder.Item>
  );
}
