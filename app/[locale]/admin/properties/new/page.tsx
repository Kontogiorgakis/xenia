import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PropertyForm } from "@/components/admin/property-form";
import { WizardSteps } from "@/components/admin/wizard-steps";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link, redirect } from "@/lib/i18n/navigation";
import { getLocationById } from "@/server_actions/locations";

interface NewPropertyPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ locationId?: string; firstUnit?: string }>;
}

const NewPropertyPage = async ({ params, searchParams }: NewPropertyPageProps) => {
  const { locale } = await params;
  const { locationId, firstUnit } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.properties");
  const tl = await getTranslations("Admin.locations");

  // Units must belong to a property — no locationId means standalone, which is no longer allowed
  if (!locationId) {
    redirect({ href: "/admin/properties", locale });
  }

  const result = await getLocationById(locationId!);
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

export default NewPropertyPage;
