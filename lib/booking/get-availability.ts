import "server-only";

import { prisma } from "@/lib/db";

export type BlockedRange = {
  start: Date;
  end: Date;
  reason: "reservation" | "manual";
};

export async function getBlockedRanges(
  locationId: string,
  bookingWindowDays = 365
): Promise<BlockedRange[]> {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + bookingWindowDays);

  const [reservations, dateBlocks] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        property: { locationId },
        status: { in: ["confirmed", "active"] },
        checkOut: { gte: now },
        checkIn: { lte: horizon },
      },
      select: { checkIn: true, checkOut: true },
      take: 1000,
    }),
    prisma.dateBlock.findMany({
      where: {
        locationId,
        endDate: { gte: now },
        startDate: { lte: horizon },
      },
      select: { startDate: true, endDate: true },
      take: 1000,
    }),
  ]);

  return [
    ...reservations.map((r) => ({
      start: r.checkIn,
      end: r.checkOut,
      reason: "reservation" as const,
    })),
    ...dateBlocks.map((b) => ({
      start: b.startDate,
      end: b.endDate,
      reason: "manual" as const,
    })),
  ];
}

export type AvailabilityUnit = {
  id: string;
  name: string;
  nightlyRate: number | null;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareMeters: number | null;
  coverPhoto: string | null;
  description: string | null;
};

export async function checkAvailability(
  locationId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ available: boolean; units: AvailabilityUnit[] }> {
  if (checkOut <= checkIn) {
    return { available: false, units: [] };
  }

  const [units, dateBlockConflict] = await Promise.all([
    prisma.property.findMany({
      where: { locationId },
      select: {
        id: true,
        name: true,
        nightlyRate: true,
        maxGuests: true,
        bedrooms: true,
        bathrooms: true,
        squareMeters: true,
        coverPhoto: true,
        description: true,
        reservations: {
          where: {
            status: { in: ["confirmed", "active"] },
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
          select: { id: true },
        },
      },
    }),
    prisma.dateBlock.findFirst({
      where: {
        locationId,
        startDate: { lt: checkOut },
        endDate: { gt: checkIn },
      },
      select: { id: true },
    }),
  ]);

  if (dateBlockConflict) {
    return { available: false, units: [] };
  }

  const availableUnits: AvailabilityUnit[] = units
    .filter((u) => u.reservations.length === 0)
    .map(({ reservations: _reservations, ...rest }) => rest);

  return { available: availableUnits.length > 0, units: availableUnits };
}
