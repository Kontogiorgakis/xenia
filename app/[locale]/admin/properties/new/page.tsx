import { getTranslations, setRequestLocale } from "next-intl/server";

import { PropertyForm } from "@/components/admin/property-form";
import { TypographyH3 } from "@/components/ui/typography";
import { BasePageProps } from "@/types/page-props";

const NewPropertyPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.properties");

  return (
    <div className="space-y-6">
      <TypographyH3>{t("addProperty")}</TypographyH3>
      <PropertyForm />
    </div>
  );
};

export default NewPropertyPage;
