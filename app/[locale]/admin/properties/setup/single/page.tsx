import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SinglePropertyForm } from "@/components/admin/single-property-form";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { BasePageProps } from "@/types/page-props";

const SinglePropertyPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.propertySetup.singleForm");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="cursor-pointer">
          <Link href="/admin/properties/setup">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <TypographyH3>{t("title")}</TypographyH3>
          <TypographyRegular className="text-muted-foreground">
            {t("subtitle")}
          </TypographyRegular>
        </div>
      </div>
      <SinglePropertyForm />
    </div>
  );
};

export default SinglePropertyPage;
