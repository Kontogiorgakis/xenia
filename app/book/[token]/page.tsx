import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingPageClient } from "@/components/booking/booking-page-client";
import { getBlockedRanges } from "@/lib/booking/get-availability";
import { getBookingPageData } from "@/lib/booking/get-booking-page-data";

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getBookingPageData(token);
  if (!data) return { title: "Xenia" };

  return {
    title: `Book ${data.name}${data.city ? ` — ${data.city}` : ""}`,
    description:
      data.hostBio ??
      `Book directly at ${data.name}${data.city ? ` in ${data.city}` : ""}`,
    openGraph: {
      title: `Book ${data.name}`,
      description: data.hostBio ?? undefined,
      images: data.coverPhoto ? [data.coverPhoto] : [],
    },
  };
}

export default async function BookingPage({ params, searchParams }: PageProps) {
  const [{ token }, { mode }] = await Promise.all([params, searchParams]);

  const data = await getBookingPageData(token);
  if (!data) notFound();

  const blockedDates = await getBlockedRanges(
    data.id,
    data.bookingWindow ?? 365
  );
  const isCompact = mode === "compact";

  return (
    <BookingPageClient
      data={data}
      blockedDates={blockedDates}
      token={token}
      isCompact={isCompact}
    />
  );
}
