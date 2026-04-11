import {
  Building2,
  Edit,
  MoreHorizontal,
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
import { getProperties } from "@/server_actions/properties";
import { BasePageProps } from "@/types/page-props";

const PropertiesPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.properties");

  const result = await getProperties();
  const properties = result.properties;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <TypographyH3>{t("title")}</TypographyH3>
          <TypographyRegular className="text-muted-foreground">
            {t("description")}
          </TypographyRegular>
        </div>
        <Button asChild icon={<Plus className="size-4" />} className="cursor-pointer">
          <Link href="/admin/properties/new">{t("addProperty")}</Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="mb-4 size-12 text-muted-foreground" />
            <TypographyH3>{t("noProperties")}</TypographyH3>
            <TypographyRegular className="mb-6 text-muted-foreground">
              {t("addFirst")}
            </TypographyRegular>
            <Button asChild icon={<Plus className="size-4" />} className="cursor-pointer">
              <Link href="/admin/properties/new">{t("addProperty")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  {property.city && (
                    <p className="text-sm text-muted-foreground">
                      {property.city}
                      {property.country ? `, ${property.country}` : ""}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/admin/properties/${property.id}`}>
                        <Edit className="mr-2 size-4" />
                        {t("editProperty")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/admin/properties/${property.id}/qr`}>
                        <QrCode className="mr-2 size-4" />
                        {t("getQr")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {property.wifiName ? (
                    <Badge variant="secondary">
                      <Wifi className="mr-1 size-3" />
                      {t("wifiConfigured")}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <WifiOff className="mr-1 size-3" />
                      {t("wifiNotConfigured")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {property._count.reservations} {t("activeReservations")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
