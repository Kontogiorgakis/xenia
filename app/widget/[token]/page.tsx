import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingPageClient } from "@/components/booking/booking-page-client";
import { getBlockedRanges } from "@/lib/booking/get-availability";
import { getBookingPageData } from "@/lib/booking/get-booking-page-data";

interface PageProps {
  params: Promise<{ token: string }>;
}

// Widgets are iframe-embedded — don't index them.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function WidgetPage({ params }: PageProps) {
  const { token } = await params;

  const data = await getBookingPageData(token);
  if (!data) notFound();

  const blockedDates = await getBlockedRanges(
    data.id,
    data.bookingWindow ?? 365
  );

  return (
    <div className="min-h-screen bg-white p-4">
      <BookingPageClient
        data={data}
        blockedDates={blockedDates}
        token={token}
        isCompact
        isWidget
      />
    </div>
  );
}
