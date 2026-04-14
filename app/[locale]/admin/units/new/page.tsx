import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PropertyForm } from "@/components/admin/property-form";
import { WizardSteps } from "@/components/admin/wizard-steps";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link, redirect } from "@/lib/i18n/navigation";
import { getLocationById } from "@/server_actions/locations";

interface NewUnitPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ propertyId?: string; firstUnit?: string }>;
}

const NewUnitPage = async ({ params, searchParams }: NewUnitPageProps) => {
  const { locale } = await params;
  const { propertyId, firstUnit } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.properties");
  const tl = await getTranslations("Admin.locations");

  if (!propertyId) {
    redirect({ href: "/admin/properties", locale });
  }

  const result = await getLocationById(propertyId!);
  if (!result.success || !result.location) {
    redirect({ href: "/admin/properties", locale });
  }

  const location = result.location!;
  const assignToLocation = {
    id: location.id,
    name: location.name,
    address: location.address,
    city: location.city,
    country: location.country,
  };

  const isFirstUnit = firstUnit === "1";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="cursor-pointer">
          <Link href="/admin/properties">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <TypographyH3>{t("addProperty")}</TypographyH3>
          <TypographyRegular className="text-sm text-muted-foreground">
            {location.name}
          </TypographyRegular>
        </div>
      </div>

      {isFirstUnit && (
        <WizardSteps
          currentStep={2}
          steps={[
            { number: 1, title: tl("wizard.step1Title"), description: tl("wizard.step1Desc") },
            { number: 2, title: tl("wizard.step2Title"), description: tl("wizard.step2Desc") },
          ]}
        />
      )}

      <PropertyForm assignToLocation={assignToLocation} />
    </div>
  );
};

export default NewUnitPage;
