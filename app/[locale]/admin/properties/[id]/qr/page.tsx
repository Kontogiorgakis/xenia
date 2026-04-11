import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PropertyQrCode } from "@/components/admin/property-qr-code";
import { Button } from "@/components/ui/button";
import { TypographyH3 } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { GUEST_BASE_URL } from "@/lib/admin/constants";
import { getPropertyById } from "@/server_actions/properties";

interface QrPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const QrPage = async ({ params }: QrPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.qr");

  const result = await getPropertyById(id);
  if (!result.success || !result.property) {
    notFound();
  }

  const property = result.property;
  const guestUrl = `${GUEST_BASE_URL}/${property.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="cursor-pointer">
          <Link href={`/admin/properties/${property.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <TypographyH3>
          {t("title")} — {property.name}
        </TypographyH3>
      </div>

      <PropertyQrCode url={guestUrl} propertyName={property.name} />
    </div>
  );
};

export default QrPage;
