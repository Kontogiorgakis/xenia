import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ContactsSection } from "@/components/admin/contacts-section";
import { Button } from "@/components/ui/button";
import { TypographyH3 } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { getLocationById } from "@/server_actions/locations";

interface ContactsPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const ContactsPage = async ({ params }: ContactsPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.locations.contacts");

  const result = await getLocationById(id);
  if (!result.success || !result.location) {
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
        <TypographyH3>{t("title")} — {result.location.name}</TypographyH3>
      </div>
      <ContactsSection locationId={id} initialContacts={result.location.contacts} />
    </div>
  );
};

export default ContactsPage;
