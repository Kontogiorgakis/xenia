"use client";

import type { DragControls } from "framer-motion";
import { Edit, Home, MapPin, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

import { AmenityPills } from "@/components/admin/amenity-pills";
import {
  BookingPageButton,
  DragHandle,
  StatusPill,
} from "@/components/admin/location-card-parts";
import { PropertySpecs } from "@/components/admin/property-specs";
import type { LocationCard } from "@/components/admin/sortable-properties-list";
import { UpcomingReservations } from "@/components/admin/upcoming-reservations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";
import { getUnitStatus } from "@/lib/utils/unit-status";

interface LocationCardSingleProps {
  location: LocationCard;
  locale: string;
  dragControls: DragControls;
}

export function LocationCardSingle({
  location,
  locale,
  dragControls,
}: LocationCardSingleProps) {
  const t = useTranslations("Admin.locations");
  const tp = useTranslations("Admin.properties");

  const unit = location.properties[0];
  if (!unit) return null;

  const { status } = getUnitStatus(unit.reservations);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex items-start gap-3 p-6 sm:p-0">
            <DragHandle dragControls={dragControls} />
            <div className="min-w-0 space-y-1.5">
              <StatusPill status={status} />
              <CardTitle className="flex items-center gap-2 truncate">
                <Home className="size-4 shrink-0 text-primary" />
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
                <PropertySpecs
                  squareMeters={unit.squareMeters}
                  bedrooms={unit.bedrooms}
                  bathrooms={unit.bathrooms}
                  maxGuests={unit.maxGuests}
                />
                {unit.wifiName && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Wifi className="size-3" />
                    {unit.wifiName}
                  </span>
                )}
              </div>
              {(location.checkInTime || location.checkOutTime) && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {location.checkInTime && `Check-in: ${location.checkInTime}`}
                  {location.checkInTime && location.checkOutTime && " · "}
                  {location.checkOutTime &&
                    `Check-out: ${location.checkOutTime}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 px-6 pb-4 sm:p-0">
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
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Amenity pills */}
          <AmenityPills amenitiesJson={location.amenities} />

          {/* Reservations */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>{tp("reservations")}</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                {unit._count.reservations}
              </span>
            </div>
            <UpcomingReservations
              reservations={unit.reservations}
              propertyName={unit.name}
              locale={locale}
              compact
              activeStatus={status}
            />
          </div>

          {/* Nightly rate */}
          {unit.nightlyRate != null && (
            <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              €{unit.nightlyRate}/{tp("night")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
