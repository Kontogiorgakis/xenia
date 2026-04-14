"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { cache } from "react";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

import { createReservation } from "./reservations";

export type InquiryStatus = "new" | "read" | "replied" | "converted" | "closed";
export type InquiryType = "booking" | "question";

export const getInquiries = async (filters?: {
  type?: InquiryType;
  status?: InquiryStatus;
  locationId?: string;
  search?: string;
}) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", inquiries: [] };

  try {
    const inquiries = await prisma.inquiry.findMany({
      where: {
        location: { hostId: session.user.id },
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.locationId && { locationId: filters.locationId }),
        ...(filters?.search && {
          OR: [
            { guestName: { contains: filters.search } },
            { guestEmail: { contains: filters.search } },
            { message: { contains: filters.search } },
          ],
        }),
      },
      include: {
        location: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true } },
        reservation: { select: { id: true, guestToken: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, inquiries };
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return { success: false, error: "Failed to fetch inquiries", inquiries: [] };
  }
};

export const getInquiryById = async (id: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", inquiry: null };

  try {
    const inquiry = await prisma.inquiry.findFirst({
      where: { id, location: { hostId: session.user.id } },
      include: {
        location: true,
        unit: true,
        reservation: true,
      },
    });

    if (!inquiry)
      return { success: false, error: "Inquiry not found", inquiry: null };

    return { success: true, inquiry };
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return { success: false, error: "Failed to fetch inquiry", inquiry: null };
  }
};

const EMPTY_COUNTS = {
  total: 0,
  booking: 0,
  question: 0,
  converted: 0,
  closed: 0,
  unread: 0,
};

// React.cache dedupes calls within a single RSC render — e.g. layout + inbox
// page both calling it in the same navigation only hits the DB once.
export const getInboxCounts = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", counts: EMPTY_COUNTS };
  }

  try {
    // One groupBy instead of 6 count() queries.
    const groups = await prisma.inquiry.groupBy({
      by: ["type", "status"],
      where: { location: { hostId: session.user.id } },
      _count: { _all: true },
    });

    const counts = { ...EMPTY_COUNTS };
    for (const g of groups) {
      const n = g._count._all;
      if (g.status === "closed") {
        counts.closed += n;
        continue;
      }
      counts.total += n;
      if (g.status === "new") counts.unread += n;
      if (g.status === "converted") {
        counts.converted += n;
        if (g.type === "question") counts.question += n;
      } else {
        if (g.type === "booking") counts.booking += n;
        if (g.type === "question") counts.question += n;
      }
    }

    return { success: true, counts };
  } catch (error) {
    console.error("Error fetching inbox counts:", error);
    return { success: false, error: "Failed to fetch inbox counts", counts: EMPTY_COUNTS };
  }
});

export const markInquiryAsRead = async (id: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.inquiry.updateMany({
      where: { id, location: { hostId: session.user.id }, status: "new" },
      data: { status: "read" },
    });
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    console.error("Error marking inquiry as read:", error);
    return { success: false, error: "Failed to mark as read" };
  }
};

export const updateInquiryStatus = async (id: string, status: InquiryStatus) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const result = await prisma.inquiry.updateMany({
      where: { id, location: { hostId: session.user.id } },
      data: { status },
    });
    if (result.count === 0) {
      return { success: false, error: "Inquiry not found" };
    }
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return { success: false, error: "Failed to update status" };
  }
};

export const replyToInquiry = async (id: string, reply: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  if (!reply.trim()) return { success: false, error: "Reply cannot be empty" };

  try {
    const result = await prisma.inquiry.updateMany({
      where: { id, location: { hostId: session.user.id } },
      data: {
        hostReply: reply,
        repliedAt: new Date(),
        status: "replied",
      },
    });
    if (result.count === 0) {
      return { success: false, error: "Inquiry not found" };
    }
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    console.error("Error saving reply:", error);
    return { success: false, error: "Failed to save reply" };
  }
};

export const deleteInquiry = async (id: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const result = await prisma.inquiry.deleteMany({
      where: { id, location: { hostId: session.user.id } },
    });
    if (result.count === 0) {
      return { success: false, error: "Inquiry not found" };
    }
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return { success: false, error: "Failed to delete inquiry" };
  }
};

export const convertInquiryToReservation = async (
  inquiryId: string,
  data: {
    propertyId: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    guestNationality?: string;
    numberOfGuests: number;
    checkIn: string;
    checkOut: string;
    specialRequests?: string;
    source?: string;
  }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const inquiry = await prisma.inquiry.findFirst({
      where: { id: inquiryId, location: { hostId: session.user.id } },
    });
    if (!inquiry) return { success: false, error: "Inquiry not found" };
    if (inquiry.reservationId)
      return { success: false, error: "Inquiry already converted" };

    const result = await createReservation({
      propertyId: data.propertyId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestNationality: data.guestNationality,
      numberOfGuests: data.numberOfGuests,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      specialRequests: data.specialRequests,
      source: data.source ?? "direct",
    });

    if (!result.success || !result.reservation) {
      return { success: false, error: result.error ?? "Failed to create reservation" };
    }

    try {
      await prisma.inquiry.update({
        where: { id: inquiryId },
        data: {
          reservationId: result.reservation.id,
          status: "converted",
          convertedAt: new Date(),
        },
      });
    } catch (linkError) {
      // Compensate: if we can't link the inquiry, roll back the reservation so
      // we don't leave an orphaned booking behind.
      console.error("Failed to link inquiry — rolling back reservation", linkError);
      await prisma.reservation
        .delete({ where: { id: result.reservation.id } })
        .catch(() => undefined);
      return { success: false, error: "Failed to link inquiry to reservation" };
    }

    revalidatePath("/admin/inbox");
    revalidatePath("/admin/reservations");
    revalidatePath("/admin/calendar");
    return { success: true, reservation: result.reservation };
  } catch (error) {
    console.error("Error converting inquiry:", error);
    return { success: false, error: "Failed to convert inquiry" };
  }
};

export const createManualInquiry = async (data: {
  locationId: string;
  type: InquiryType;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestNationality?: string;
  message?: string;
  checkIn?: string;
  checkOut?: string;
  numberOfGuests?: number;
  specialRequests?: string;
  unitId?: string;
}) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  if (!data.guestName.trim() || !data.guestEmail.trim()) {
    return { success: false, error: "Name and email are required" };
  }

  try {
    const location = await prisma.location.findFirst({
      where: { id: data.locationId, hostId: session.user.id },
      select: { id: true },
    });
    if (!location) return { success: false, error: "Property not found" };

    const inquiry = await prisma.inquiry.create({
      data: {
        locationId: data.locationId,
        type: data.type,
        guestName: data.guestName.trim(),
        guestEmail: data.guestEmail.trim(),
        guestPhone: data.guestPhone,
        guestNationality: data.guestNationality,
        message: data.message,
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        numberOfGuests: data.numberOfGuests,
        specialRequests: data.specialRequests,
        unitId: data.unitId,
        source: "manual",
        status: "read",
      },
    });

    revalidatePath("/admin/inbox");
    return { success: true, inquiry };
  } catch (error) {
    console.error("Error creating manual inquiry:", error);
    return { success: false, error: "Failed to create inquiry" };
  }
};
