import { Building2, MapPin, Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  type LocationCard,
  SortablePropertiesList,
} from "@/components/admin/sortable-properties-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { getArchivedLocations, getLocations } from "@/server_actions/locations";
import { BasePageProps } from "@/types/page-props";

const PropertiesPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.locations");

  const [activeResult, archivedResult] = await Promise.all([
    getLocations(),
    getArchivedLocations(),
  ]);
  const locations = activeResult.locations;
  const archivedLocations = archivedResult.locations;
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
        <SortablePropertiesList
          locale={locale}
          initialLocations={locations.map<LocationCard>((l) => ({
            id: l.id,
            name: l.name,
            city: l.city,
            country: l.country,
            coverPhoto: l.coverPhoto,
            properties: l.properties.map((p) => ({
              id: p.id,
              name: p.name,
              squareMeters: p.squareMeters,
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              maxGuests: p.maxGuests,
              nightlyRate: p.nightlyRate,
              reservations: p.reservations,
              _count: p._count,
            })),
          }))}
        />
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
