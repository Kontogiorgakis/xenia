import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PropertyForm } from "@/components/admin/property-form";
import { Button } from "@/components/ui/button";
import { TypographyH3 } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
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
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="cursor-pointer">
          <Link href="/admin/properties">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <TypographyH3>{t("editProperty")}</TypographyH3>
      </div>
      <PropertyForm initialData={result.property} />
    </div>
  );
};

export default PropertyEditPage;
