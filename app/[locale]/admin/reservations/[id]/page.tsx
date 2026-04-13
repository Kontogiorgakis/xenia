import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ReservationForm } from "@/components/admin/reservation-form";
import { Button } from "@/components/ui/button";
import { TypographyH3 } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { getProperties } from "@/server_actions/properties";
import { getReservationById } from "@/server_actions/reservations";

interface ReservationEditPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const ReservationEditPage = async ({ params }: ReservationEditPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.reservations");

  const [reservationResult, propertiesResult] = await Promise.all([
    getReservationById(id),
    getProperties(),
  ]);

  if (!reservationResult.success || !reservationResult.reservation) {
    notFound();
  }

  const properties = propertiesResult.properties.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="cursor-pointer">
          <Link href="/admin/reservations">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <TypographyH3>{t("editReservation")}</TypographyH3>
      </div>
      <ReservationForm
        properties={properties}
        initialData={reservationResult.reservation}
      />
    </div>
  );
};

export default ReservationEditPage;
