import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PropertySetupChoice } from "@/components/admin/property-setup-choice";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { BasePageProps } from "@/types/page-props";

const PropertySetupPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations("Admin.propertySetup");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-[680px]">
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="cursor-pointer gap-1.5 text-muted-foreground">
            <Link href="/admin/properties">
              <ArrowLeft className="size-3.5" />
              <span>{/* Back handled by icon */}</span>
            </Link>
          </Button>
        </div>
        <PropertySetupChoice />
      </div>
    </div>
  );
};

export default PropertySetupPage;
