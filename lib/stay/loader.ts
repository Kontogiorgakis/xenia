import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";

export type StayData = Awaited<ReturnType<typeof loadStayByToken>>;

// React cache dedupes calls within a single request — critical because
// generateMetadata and the page default export both call this.
export const loadStayByToken = cache(async (token: string) => {
  const reservation = await prisma.reservation.findUnique({
    where: { guestToken: token },
    include: {
      property: {
        include: {
          host: {
            select: {
              id: true,
              name: true,
              displayName: true,
              phone: true,
              avatarUrl: true,
              image: true,
              bio: true,
            },
          },
          location: {
            include: {
              contacts: { orderBy: { displayOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!reservation) return null;

  // Parse amenities JSON
  const amenities = reservation.property.location?.amenities
    ? (() => {
        try {
          return JSON.parse(reservation.property.location.amenities);
        } catch {
          return [];
        }
      })()
    : [];

  return { reservation, amenities };
});
