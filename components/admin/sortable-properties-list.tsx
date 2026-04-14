"use client";

import { Reorder, useDragControls } from "framer-motion";
import { Edit, GripVertical, Home, MapPin, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { PropertyActions } from "@/components/admin/property-actions";
import { PropertyAlert } from "@/components/admin/property-alert";
import { PropertySpecs } from "@/components/admin/property-specs";
import { UpcomingReservations } from "@/components/admin/upcoming-reservations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";
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
  reservations: Reservation[];
  _count: { reservations: number };
};

export type LocationCard = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  coverPhoto: string | null;
  properties: PropertyLite[];
};

interface SortablePropertiesListProps {
  initialLocations: LocationCard[];
  locale: string;
}

export function SortablePropertiesList({
  initialLocations,
  locale,
}: SortablePropertiesListProps) {
  const [locations, setLocations] = useState(initialLocations);
  const lastCommittedRef = useRef(initialLocations);
  const [, startTransition] = useTransition();

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

  return (
    <Reorder.Group
      as="div"
      axis="y"
      values={locations}
      onReorder={handleReorder}
      className="space-y-6"
      layoutScroll
    >
      {locations.map((location) => (
        <LocationCardItem key={location.id} location={location} locale={locale} />
      ))}
    </Reorder.Group>
  );
}

function LocationCardItem({
  location,
  locale,
}: {
  location: LocationCard;
  locale: string;
}) {
  const t = useTranslations("Admin.locations");
  const tp = useTranslations("Admin.properties");
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={location}
      dragListener={false}
      dragControls={dragControls}
    >
      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3 p-6 sm:p-0">
              <button
                type="button"
                onPointerDown={(e) => dragControls.start(e)}
                className="mt-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="size-4" />
              </button>
              <div className="min-w-0">
                <CardTitle className="truncate">{location.name}</CardTitle>
                {location.city && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {location.city}
                    {location.country ? `, ${location.country}` : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 px-6 pb-4 sm:p-0">
              <Button asChild variant="outline" size="sm" className="cursor-pointer">
                <Link href={`/admin/properties/${location.id}`}>
                  <Edit className="mr-1 size-3" /> {t("editLocation")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="cursor-pointer">
                <Link href={`/admin/units/new?propertyId=${location.id}`}>
                  <Plus className="mr-1 size-3" /> {t("addProperty")}
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        {location.properties.length === 0 ? (
          <CardContent>
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
          </CardContent>
        ) : (
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {location.properties.map((property) => (
                <div
                  key={property.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card p-4 shadow-xenia"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Home className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{property.name}</div>
                      <PropertySpecs
                        squareMeters={property.squareMeters}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        maxGuests={property.maxGuests}
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {property.nightlyRate != null && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          €{property.nightlyRate}/{tp("night")}
                        </span>
                      )}
                      <PropertyActions
                        propertyId={property.id}
                        propertyName={property.name}
                        compact
                      />
                    </div>
                  </div>

                  <PropertyAlert reservations={property.reservations} />

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
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Reorder.Item>
  );
}
