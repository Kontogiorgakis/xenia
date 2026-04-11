import { getTranslations, setRequestLocale } from "next-intl/server";

import { ReservationForm } from "@/components/admin/reservation-form";
import { TypographyH3 } from "@/components/ui/typography";
import { getProperties } from "@/server_actions/properties";
import { BasePageProps } from "@/types/page-props";

const NewReservationPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.reservations");

  const result = await getProperties();
  const properties = result.properties.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="space-y-6">
      <TypographyH3>{t("addReservation")}</TypographyH3>
      <ReservationForm properties={properties} />
    </div>
  );
};

export default NewReservationPage;
