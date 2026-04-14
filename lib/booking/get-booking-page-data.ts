import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";

// Wrapped in React.cache so `generateMetadata` and the page render share one
// DB read per request.
export const getBookingPageData = cache(async (token: string) => {
  const location = await prisma.location.findUnique({
    where: { bookingToken: token },
    select: {
      id: true,
      bookingEnabled: true,
      bookingToken: true,
      bookingMode: true,
      unitSelectionMode: true,
      archivedAt: true,
      name: true,
      address: true,
      city: true,
      country: true,
      coverPhoto: true,
      description: true,
      localTips: true,
      hostDisplayName: true,
      hostPhoto: true,
      hostBio: true,
      brandColor: true,
      amenities: true,
      smokingPolicy: true,
      petsPolicy: true,
      partiesPolicy: true,
      childrenPolicy: true,
      maxGuests: true,
      quietHoursStart: true,
      quietHoursEnd: true,
      checkInTime: true,
      checkOutTime: true,
      baseNightlyRate: true,
      cleaningFee: true,
      cityTax: true,
      securityDeposit: true,
      minStayDefault: true,
      minStayPeak: true,
      peakSeasonStart: true,
      peakSeasonEnd: true,
      cancellationPolicy: true,
      advanceNotice: true,
      bookingWindow: true,
      properties: {
        select: {
          id: true,
          name: true,
          coverPhoto: true,
          description: true,
          checkInTime: true,
          checkOutTime: true,
          squareMeters: true,
          bedrooms: true,
          bathrooms: true,
          beds: true,
          maxGuests: true,
          nightlyRate: true,
        },
      },
      contacts: {
        where: { category: "emergency" },
        select: { name: true, phone: true, category: true },
      },
    },
  });

  if (!location || !location.bookingEnabled || location.archivedAt) {
    return null;
  }

  return location;
});

export type BookingPageData = NonNullable<
  Awaited<ReturnType<typeof getBookingPageData>>
>;
