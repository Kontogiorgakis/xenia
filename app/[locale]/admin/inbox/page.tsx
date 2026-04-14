import { setRequestLocale } from "next-intl/server";

import { InboxClient } from "@/components/admin/inbox/inbox-client";
import { getInboxCounts, getInquiries } from "@/server_actions/inquiries";
import { getLocations } from "@/server_actions/locations";
import { BasePageProps } from "@/types/page-props";

const InboxPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const [inquiriesResult, countsResult, locationsResult] = await Promise.all([
    getInquiries(),
    getInboxCounts(),
    getLocations(),
  ]);

  return (
    <InboxClient
      locale={locale}
      initialInquiries={inquiriesResult.inquiries}
      initialCounts={countsResult.counts}
      locations={locationsResult.locations.map((l) => ({
        id: l.id,
        name: l.name,
        baseNightlyRate: l.baseNightlyRate,
        cleaningFee: l.cleaningFee,
        cityTax: l.cityTax,
        properties: l.properties.map((p) => ({ id: p.id, name: p.name })),
      }))}
    />
  );
};

export default InboxPage;
