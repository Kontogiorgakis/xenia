import { Building2, CalendarDays, Plus, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { getDashboardStats } from "@/server_actions/dashboard";
import {
  getActiveReservations,
  getUpcomingReservations,
} from "@/server_actions/reservations";
import { BasePageProps } from "@/types/page-props";

const DashboardPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.dashboard");

  const [statsResult, upcomingResult, activeResult] = await Promise.all([
    getDashboardStats(),
    getUpcomingReservations(),
    getActiveReservations(),
  ]);

  const stats = statsResult.stats;
  const upcoming = upcomingResult.reservations;
  const active = activeResult.reservations;

  const statCards = [
    {
      label: t("totalProperties"),
      value: stats.totalProperties,
      icon: Building2,
    },
    {
      label: t("activeGuests"),
      value: stats.activeGuests,
      icon: Users,
    },
    {
      label: t("arrivingThisWeek"),
      value: stats.arrivingThisWeek,
      icon: CalendarDays,
    },
    {
      label: t("reservationsThisMonth"),
      value: stats.reservationsThisMonth,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <TypographyH3>{t("title")}</TypographyH3>
        <TypographyRegular className="text-muted-foreground">
          {t("description")}
        </TypographyRegular>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two columns: Arriving Soon + Currently Staying */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Arriving Soon */}
        <Card>
          <CardHeader>
            <CardTitle>{t("arrivingSoon")}</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <TypographyRegular className="text-muted-foreground">
                {t("noUpcoming")}
              </TypographyRegular>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("guestName")}</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {t("property")}
                    </TableHead>
                    <TableHead>{t("checkIn")}</TableHead>
                    <TableHead className="text-right">{t("guests")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.guestName}
                        {r.guestNationality && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({r.guestNationality})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {r.property.name}
                      </TableCell>
                      <TableCell>
                        {new Date(r.checkIn).toLocaleDateString(locale)}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.numberOfGuests}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Currently Staying */}
        <Card>
          <CardHeader>
            <CardTitle>{t("currentlyStaying")}</CardTitle>
          </CardHeader>
          <CardContent>
            {active.length === 0 ? (
              <TypographyRegular className="text-muted-foreground">
                {t("noActive")}
              </TypographyRegular>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("guestName")}</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {t("property")}
                    </TableHead>
                    <TableHead>{t("checkOut")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.map((r) => {
                    const daysLeft = Math.ceil(
                      (new Date(r.checkOut).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.guestName}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {r.property.name}
                        </TableCell>
                        <TableCell>
                          {new Date(r.checkOut).toLocaleDateString(locale)}
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({daysLeft} {t("daysLeft")})
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild icon={<Plus className="size-4" />}>
          <Link href="/admin/properties">{t("addProperty")}</Link>
        </Button>
        <Button asChild variant="outline" icon={<Plus className="size-4" />}>
          <Link href="/admin/reservations/new">{t("addReservation")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/reservations">{t("viewAll")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
