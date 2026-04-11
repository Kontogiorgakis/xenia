import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PropertyForm } from "@/components/admin/property-form";
import { TypographyH3 } from "@/components/ui/typography";
import { getPropertyById } from "@/server_actions/properties";

interface PropertyEditPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const PropertyEditPage = async ({ params }: PropertyEditPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.properties");

  const result = await getPropertyById(id);
  if (!result.success || !result.property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <TypographyH3>{t("editProperty")}</TypographyH3>
      <PropertyForm initialData={result.property} />
    </div>
  );
};

export default PropertyEditPage;
