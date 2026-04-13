import {
  Building2,
  Edit,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  QrCode,
  Wifi,
  WifiOff,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { getLocations } from "@/server_actions/locations";
import { getProperties } from "@/server_actions/properties";
import { BasePageProps } from "@/types/page-props";

const PropertiesPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.locations");
  const tp = await getTranslations("Admin.properties");

  const [locationsResult, propertiesResult] = await Promise.all([
    getLocations(),
    getProperties(),
  ]);

  const locations = locationsResult.locations;
  const standaloneProperties = propertiesResult.properties.filter(
    (p) => !p.locationId
  );

  const hasContent = locations.length > 0 || standaloneProperties.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TypographyH3>{t("title")}</TypographyH3>
          <TypographyRegular className="text-muted-foreground">
            {t("pageDescription")}
          </TypographyRegular>
        </div>
        <div className="flex gap-2">
          <Button asChild icon={<Plus className="size-4" />} className="cursor-pointer">
            <Link href="/admin/locations/new">{t("addLocation")}</Link>
          </Button>
          <Button asChild variant="outline" icon={<Plus className="size-4" />} className="cursor-pointer">
            <Link href="/admin/properties/new">{t("addStandalone")}</Link>
          </Button>
        </div>
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
                    <Badge variant="secondary">
                      {location.properties.length} {t("properties")}
                    </Badge>
                    <Badge variant="secondary">
                      {location._count.contacts} {t("viewContacts")}
                    </Badge>
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
              {location.properties.length > 0 && (
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {location.properties.map((property) => (
                      <div
                        key={property.id}
                        className="rounded-lg bg-muted/50 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{property.name}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 cursor-pointer">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/admin/properties/${property.id}`}>
                                  <Edit className="mr-2 size-4" /> {tp("editProperty")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/admin/properties/${property.id}/qr`}>
                                  <QrCode className="mr-2 size-4" /> {tp("getQr")}
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2">
                          {property.wifiName ? (
                            <Badge variant="secondary" className="text-xs">
                              <Wifi className="mr-1 size-3" /> {tp("wifiConfigured")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <WifiOff className="mr-1 size-3" /> {tp("wifiNotConfigured")}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {property._count.reservations} {tp("activeReservations")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Standalone properties */}
          {standaloneProperties.length > 0 && (
            <>
              <TypographyRegular className="font-medium text-muted-foreground">
                {t("standalone")}
              </TypographyRegular>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {standaloneProperties.map((property) => (
                  <Card key={property.id}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">{property.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-auto cursor-pointer">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href={`/admin/properties/${property.id}`}>
                                <Edit className="mr-2 size-4" /> {tp("editProperty")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href={`/admin/properties/${property.id}/qr`}>
                                <QrCode className="mr-2 size-4" /> {tp("getQr")}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {property.city && (
                        <p className="text-sm text-muted-foreground">
                          {property.city}{property.country ? `, ${property.country}` : ""}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {property.wifiName ? (
                          <Badge variant="secondary">
                            <Wifi className="mr-1 size-3" /> {tp("wifiConfigured")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <WifiOff className="mr-1 size-3" /> {tp("wifiNotConfigured")}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {property._count.reservations} {tp("activeReservations")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
