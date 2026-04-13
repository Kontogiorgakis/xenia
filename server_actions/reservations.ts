"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export const getReservations = async (propertyId?: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", reservations: [] };

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        property: { hostId: session.user.id },
        ...(propertyId ? { propertyId } : {}),
      },
      include: { property: { select: { name: true, id: true } } },
      orderBy: { checkIn: "desc" },
    });

    return { success: true, reservations };
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return { success: false, error: "Failed to fetch reservations", reservations: [] };
  }
};

export const getReservationById = async (id: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", reservation: null };

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, property: { hostId: session.user.id } },
      include: { property: { select: { name: true, id: true } } },
    });

    if (!reservation)
      return { success: false, error: "Reservation not found", reservation: null };

    return { success: true, reservation };
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return { success: false, error: "Failed to fetch reservation", reservation: null };
  }
};

export const getReservationByToken = async (token: string) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { guestToken: token },
      include: {
        property: true,
      },
    });

    if (!reservation)
      return { success: false, error: "Reservation not found", reservation: null };

    return { success: true, reservation };
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return { success: false, error: "Failed to fetch reservation", reservation: null };
  }
};

export const createReservation = async (data: {
  propertyId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestNationality?: string;
  guestLanguage?: string;
  numberOfGuests?: number;
  checkIn: string;
  checkOut: string;
  specialRequests?: string;
  source?: string;
  externalId?: string;
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: { id: data.propertyId, hostId: session.user.id },
    });

    if (!property)
      return { success: false, error: "Property not found or unauthorized" };

    const reservation = await prisma.reservation.create({
      data: {
        ...data,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        numberOfGuests: data.numberOfGuests ?? 1,
      },
    });

    revalidatePath("/admin");
    return { success: true, reservation };
  } catch (error) {
    console.error("Error creating reservation:", error);
    return { success: false, error: "Failed to create reservation" };
  }
};

export const updateReservation = async (
  id: string,
  data: {
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestNationality?: string;
    guestLanguage?: string;
    numberOfGuests?: number;
    checkIn?: string;
    checkOut?: string;
    specialRequests?: string;
    source?: string;
    status?: string;
  }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const existing = await prisma.reservation.findFirst({
      where: { id, property: { hostId: session.user.id } },
    });

    if (!existing)
      return { success: false, error: "Reservation not found or unauthorized" };

    const updateData: Record<string, unknown> = { ...data };
    if (data.checkIn) updateData.checkIn = new Date(data.checkIn);
    if (data.checkOut) updateData.checkOut = new Date(data.checkOut);

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin");
    return { success: true, reservation };
  } catch (error) {
    console.error("Error updating reservation:", error);
    return { success: false, error: "Failed to update reservation" };
  }
};

export const getUpcomingReservations = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", reservations: [] };

  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const reservations = await prisma.reservation.findMany({
      where: {
        property: { hostId: session.user.id },
        checkIn: { gte: now, lte: nextWeek },
        status: { not: "cancelled" },
      },
      include: { property: { select: { name: true } } },
      orderBy: { checkIn: "asc" },
      take: 5,
    });

    return { success: true, reservations };
  } catch (error) {
    console.error("Error fetching upcoming reservations:", error);
    return { success: false, error: "Failed to fetch reservations", reservations: [] };
  }
};

export const getActiveReservations = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", reservations: [] };

  try {
    const now = new Date();

    const reservations = await prisma.reservation.findMany({
      where: {
        property: { hostId: session.user.id },
        checkIn: { lte: now },
        checkOut: { gte: now },
        status: { in: ["confirmed", "active"] },
      },
      include: { property: { select: { name: true } } },
      orderBy: { checkOut: "asc" },
    });

    return { success: true, reservations };
  } catch (error) {
    console.error("Error fetching active reservations:", error);
    return { success: false, error: "Failed to fetch reservations", reservations: [] };
  }
};
