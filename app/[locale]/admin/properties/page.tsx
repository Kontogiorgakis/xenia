import {
  Building2,
  Edit,
  MapPin,
  Plus,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PropertyActions } from "@/components/admin/property-actions";
import { PropertyAlert } from "@/components/admin/property-alert";
import { PropertySpecs } from "@/components/admin/property-specs";
import { UpcomingReservations } from "@/components/admin/upcoming-reservations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { getLocations } from "@/server_actions/locations";
import { BasePageProps } from "@/types/page-props";

const PropertiesPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.locations");
  const tp = await getTranslations("Admin.properties");

  const [activeResult, archivedResult] = await Promise.all([
    getLocations(),
    getLocations(true),
  ]);
  const locations = activeResult.locations;
  const archivedLocations = archivedResult.locations.filter((l) => l.archivedAt);
  const hasContent = locations.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TypographyH3>{t("title")}</TypographyH3>
          <TypographyRegular className="text-muted-foreground">
            {t("pageDescription")}
          </TypographyRegular>
        </div>
        <Button asChild icon={<Plus className="size-4" />} className="cursor-pointer">
          <Link href="/admin/properties/new">{t("addLocation")}</Link>
        </Button>
      </div>

      {!hasContent ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="mb-4 size-12 text-muted-foreground" />
            <TypographyH3>{t("noLocations")}</TypographyH3>
            <TypographyRegular className="mb-6 text-center text-muted-foreground">
              {t("noLocationsHint")}
            </TypographyRegular>
            <div className="flex gap-2">
              <Button asChild icon={<Plus className="size-4" />} className="cursor-pointer">
                <Link href="/admin/properties/new">{t("addLocation")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Locations with their properties */}
          {locations.map((location) => (
            <Card key={location.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      {location.name}
                    </CardTitle>
                    {location.city && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {location.city}{location.country ? `, ${location.country}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
                      <Link href={`/admin/units/new?propertyId=${location.id}&firstUnit=1`}>
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
                        className="flex flex-col gap-3 rounded-lg border border-border/40 bg-card p-4 shadow-xenia"
                      >
                        <div className="flex items-start justify-between gap-2">
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
          ))}

        </div>
      )}

      {archivedLocations.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            {t("archive.showArchived")} ({archivedLocations.length})
          </summary>
          <div className="mt-4 space-y-3">
            {archivedLocations.map((location) => (
              <Card key={location.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="size-3.5" />
                        {location.name}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                          {t("archive.archivedBadge")}
                        </span>
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {location.city}
                        {location.country ? `, ${location.country}` : ""}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <Link href={`/admin/properties/${location.id}`}>
                        {t("editLocation")}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default PropertiesPage;
