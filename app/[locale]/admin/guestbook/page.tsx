import { BookOpen, Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GuestbookEditor } from "@/components/admin/guestbook/guestbook-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { getGuestbookData } from "@/server_actions/guestbook";
import { getLocations } from "@/server_actions/locations";
import { BasePageProps } from "@/types/page-props";

const GuestbookPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.guestbook");

  const { locations } = await getLocations();
  const firstId = locations[0]?.id;
  const initial = firstId ? await getGuestbookData(firstId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <TypographyH3>{t("title")}</TypographyH3>
        <TypographyRegular className="text-muted-foreground">
          {t("subtitle")}
        </TypographyRegular>
      </div>

      {locations.length === 0 || !initial?.data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="mb-4 size-12 text-muted-foreground" />
            <TypographyH3>{t("noProperties")}</TypographyH3>
            <TypographyRegular className="mb-6 text-center text-muted-foreground">
              {t("noPropertiesHint")}
            </TypographyRegular>
            <Button asChild icon={<Plus className="size-4" />} className="cursor-pointer">
              <Link href="/admin/properties/setup">{t("addProperty")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <GuestbookEditor
          propertyOptions={locations.map((l) => ({ id: l.id, name: l.name }))}
          initialData={initial.data}
        />
      )}
    </div>
  );
};

export default GuestbookPage;
