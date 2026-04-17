"use client";

import type { DragControls } from "framer-motion";
import { Building2, Edit, MapPin, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { AmenityPills } from "@/components/admin/amenity-pills";
import {
  BookingPageButton,
  DragHandle,
} from "@/components/admin/location-card-parts";
import { PropertyAlert } from "@/components/admin/property-alert";
import type { LocationCard } from "@/components/admin/sortable-properties-list";
import { UnitMiniCard } from "@/components/admin/unit-mini-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";
import type { UnitStatus } from "@/lib/utils/unit-status";
import { getUnitStatus } from "@/lib/utils/unit-status";

interface LocationCardMultiProps {
  location: LocationCard;
  locale: string;
  dragControls: DragControls;
  statusFilter: UnitStatus | null;
}

export function LocationCardMulti({
  location,
  locale,
  dragControls,
  statusFilter,
}: LocationCardMultiProps) {
  const t = useTranslations("Admin.locations");

  // Compute occupancy summary
  const { availableCount, occupiedCount } = useMemo(() => {
    let available = 0;
    let occupied = 0;
    for (const p of location.properties) {
      const { status } = getUnitStatus(p.reservations);
      if (status === "available") available++;
      else occupied++;
    }
    return { availableCount: available, occupiedCount: occupied };
  }, [location.properties]);

  // Aggregate alerts from all units
  const allReservations = useMemo(
    () => location.properties.flatMap((p) => p.reservations),
    [location.properties]
  );

  const filteredProperties = useMemo(() => {
    if (!statusFilter) return location.properties;
    return location.properties.filter((p) => {
      const { status } = getUnitStatus(p.reservations);
      return status === statusFilter;
    });
  }, [location.properties, statusFilter]);

  const hasUnits = location.properties.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3 p-6 sm:p-0">
            <DragHandle dragControls={dragControls} />
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 truncate">
                <Building2 className="size-4 shrink-0 text-primary" />
                {location.name}
              </CardTitle>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {location.city && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {location.city}
                    {location.country ? `, ${location.country}` : ""}
                  </span>
                )}
                {hasUnits && (
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-green-600">
                      {availableCount}
                    </span>{" "}
                    {t("availableCount")}{" "}
                    <span className="text-muted-foreground/50">·</span>{" "}
                    <span className="font-semibold">{occupiedCount}</span>{" "}
                    {t("occupiedCount")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-6 pb-4 sm:p-0">
            {location.bookingToken && (
              <BookingPageButton bookingToken={location.bookingToken} />
            )}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              <Link href={`/admin/properties/${location.id}`}>
                <Edit className="mr-1 size-3" /> {t("editLocation")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              <Link href={`/admin/units/new?propertyId=${location.id}`}>
                <Plus className="mr-1 size-3" /> {t("addProperty")}
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Aggregate alert banner */}
        <PropertyAlert reservations={allReservations} />

        {/* Amenity pills */}
        <AmenityPills amenitiesJson={location.amenities} />

        {/* Empty state */}
        {!hasUnits && (
          <div className="flex flex-col items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                {t("noUnits")}
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                {t("noUnitsHint")}
              </p>
            </div>
            <Button asChild size="sm" className="cursor-pointer">
              <Link
                href={`/admin/units/new?propertyId=${location.id}&firstUnit=1`}
              >
                {t("addFirstUnit")}
              </Link>
            </Button>
          </div>
        )}

        {/* Unit grid */}
        {hasUnits && filteredProperties.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property, i) => (
              <UnitMiniCard
                key={property.id}
                property={property}
                locale={locale}
                index={i}
              />
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
