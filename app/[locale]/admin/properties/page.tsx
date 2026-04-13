import {
  Building2,
  Edit,
  MapPin,
  Phone,
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

  const locationsResult = await getLocations();
  const locations = locationsResult.locations;
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
          <Link href="/admin/locations/new">{t("addLocation")}</Link>
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
                <Link href="/admin/locations/new">{t("addLocation")}</Link>
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
                      <Link href={`/admin/locations/${location.id}`}>
                        <Edit className="mr-1 size-3" /> {t("editLocation")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <Link href={`/admin/locations/${location.id}/contacts`}>
                        <Phone className="mr-1 size-3" /> {t("viewContacts")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <Link href={`/admin/properties/new?locationId=${location.id}`}>
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
                      <Link href={`/admin/properties/new?locationId=${location.id}&firstUnit=1`}>
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
                        className="rounded-lg bg-muted/50 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{property.name}</span>
                          <PropertyActions
                            propertyId={property.id}
                            propertyName={property.name}
                            compact
                          />
                        </div>
                        <PropertySpecs
                          squareMeters={property.squareMeters}
                          bedrooms={property.bedrooms}
                          bathrooms={property.bathrooms}
                          maxGuests={property.maxGuests}
                        />
                        <PropertyAlert reservations={property.reservations} />
                        <UpcomingReservations
                          reservations={property.reservations}
                          propertyName={property.name}
                          locale={locale}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
