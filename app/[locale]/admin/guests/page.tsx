import { Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Card, CardContent } from "@/components/ui/card";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { BasePageProps } from "@/types/page-props";

const GuestsPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.guestsCrm");

  return (
    <div className="space-y-6">
      <TypographyH3>{t("title")}</TypographyH3>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="mb-4 size-16 text-muted-foreground/50" />
          <TypographyH3 className="mb-2">{t("comingSoon")}</TypographyH3>
          <TypographyRegular className="max-w-md text-center text-muted-foreground">
            {t("comingSoonHint")}
          </TypographyRegular>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestsPage;
