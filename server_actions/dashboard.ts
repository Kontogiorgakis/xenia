"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export const getDashboardStats = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return {
      success: false,
      error: "Unauthorized",
      stats: { totalProperties: 0, activeGuests: 0, arrivingThisWeek: 0, reservationsThisMonth: 0 },
    };

  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [totalProperties, activeGuests, arrivingThisWeek, reservationsThisMonth] =
      await Promise.all([
        prisma.property.count({
          where: { hostId: session.user.id },
        }),
        prisma.reservation.count({
          where: {
            property: { hostId: session.user.id },
            checkIn: { lte: now },
            checkOut: { gte: now },
            status: { in: ["confirmed", "active"] },
          },
        }),
        prisma.reservation.count({
          where: {
            property: { hostId: session.user.id },
            checkIn: { gte: now, lte: nextWeek },
            status: { not: "cancelled" },
          },
        }),
        prisma.reservation.count({
          where: {
            property: { hostId: session.user.id },
            checkIn: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
      ]);

    return {
      success: true,
      stats: { totalProperties, activeGuests, arrivingThisWeek, reservationsThisMonth },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch stats",
      stats: { totalProperties: 0, activeGuests: 0, arrivingThisWeek: 0, reservationsThisMonth: 0 },
    };
  }
};
