import { CalendarDays, Edit, Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { getReservations } from "@/server_actions/reservations";
import { BasePageProps } from "@/types/page-props";

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
      return "default";
    case "active":
      return "default";
    case "completed":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function getSourceVariant(
  source: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (source) {
    case "booking":
      return "default";
    case "airbnb":
      return "destructive";
    case "direct":
      return "outline";
    default:
      return "secondary";
  }
}

interface ReservationsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; property?: string }>;
}

const ReservationsPage = async ({
  params,
  searchParams,
}: ReservationsPageProps) => {
  const { locale } = await params;
  const { status: statusFilter } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.reservations");

  const result = await getReservations();
  let reservations = result.reservations;

  // Filter by status
  if (statusFilter && statusFilter !== "all") {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (statusFilter === "upcoming") {
      reservations = reservations.filter(
        (r) => new Date(r.checkIn) > now && r.status !== "cancelled"
      );
    } else if (statusFilter === "active") {
      reservations = reservations.filter(
        (r) =>
          new Date(r.checkIn) <= now &&
          new Date(r.checkOut) >= now &&
          ["confirmed", "active"].includes(r.status)
      );
    } else if (statusFilter === "completed") {
      reservations = reservations.filter(
        (r) => r.status === "completed" || new Date(r.checkOut) < now
      );
    }
  }

  const currentFilter = statusFilter || "all";

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
          <Link href="/admin/reservations/new">{t("addReservation")}</Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={currentFilter}>
        <TabsList>
          <TabsTrigger value="all" asChild className="cursor-pointer">
            <Link href="/admin/reservations">{t("all")}</Link>
          </TabsTrigger>
          <TabsTrigger value="upcoming" asChild className="cursor-pointer">
            <Link href="/admin/reservations?status=upcoming">
              {t("upcoming")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="active" asChild className="cursor-pointer">
            <Link href="/admin/reservations?status=active">{t("active")}</Link>
          </TabsTrigger>
          <TabsTrigger value="completed" asChild className="cursor-pointer">
            <Link href="/admin/reservations?status=completed">
              {t("completed")}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="mb-4 size-12 text-muted-foreground" />
            <TypographyH3>{t("noReservations")}</TypographyH3>
            <TypographyRegular className="mb-6 text-muted-foreground">
              {t("addFirst")}
            </TypographyRegular>
            <Button asChild icon={<Plus className="size-4" />} className="cursor-pointer">
              <Link href="/admin/reservations/new">{t("addReservation")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("title")} ({reservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("guestName")}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t("property")}
                  </TableHead>
                  <TableHead>{t("checkIn")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("checkOut")}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t("source")}
                  </TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span className="font-medium">{r.guestName}</span>
                      {r.guestNationality && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({r.guestNationality})
                        </span>
                      )}
                      <span className="ml-1 text-xs text-muted-foreground">
                        · {r.numberOfGuests} {t("numberOfGuests").toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {r.property.name}
                    </TableCell>
                    <TableCell>
                      {new Date(r.checkIn).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(r.checkOut).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getSourceVariant(r.source)}>
                        {t(`sources.${r.source as "direct" | "booking" | "airbnb" | "other"}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(r.status)}>
                        {t(`statuses.${r.status as "confirmed" | "active" | "completed" | "cancelled"}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon" className="cursor-pointer">
                        <Link href={`/admin/reservations/${r.id}`}>
                          <Edit className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReservationsPage;
