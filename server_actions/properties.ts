"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/general/slug";

export const getProperties = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", properties: [] };

  try {
    const now = new Date();
    const properties = await prisma.property.findMany({
      where: { hostId: session.user.id },
      include: {
        reservations: {
          where: {
            checkOut: { gte: now },
            status: { not: "cancelled" },
          },
          orderBy: { checkIn: "asc" },
          take: 3,
          select: {
            id: true,
            guestName: true,
            guestNationality: true,
            checkIn: true,
            checkOut: true,
            numberOfGuests: true,
            source: true,
            status: true,
            specialRequests: true,
            guestToken: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, properties };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { success: false, error: "Failed to fetch properties", properties: [] };
  }
};

export const getAvailableProperties = async (
  checkIn: string,
  checkOut: string
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", properties: [] };

  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime()) ||
      checkOutDate <= checkInDate
    ) {
      return { success: false, error: "Invalid dates", properties: [] };
    }

    const properties = await prisma.property.findMany({
      where: {
        hostId: session.user.id,
        reservations: {
          none: {
            status: { not: "cancelled" },
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
          },
        },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return { success: true, properties };
  } catch (error) {
    console.error("Error fetching available properties:", error);
    return { success: false, error: "Failed to fetch properties", properties: [] };
  }
};

export const getPropertyById = async (id: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", property: null };

  try {
    const property = await prisma.property.findFirst({
      where: { id, hostId: session.user.id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            country: true,
            checkInTime: true,
            checkOutTime: true,
          },
        },
        reservations: {
          orderBy: { checkIn: "desc" },
        },
      },
    });

    if (!property)
      return { success: false, error: "Property not found", property: null };

    return { success: true, property };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { success: false, error: "Failed to fetch property", property: null };
  }
};

export const createProperty = async (data: {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  wifiName?: string;
  wifiPassword?: string;
  checkInTime?: string;
  checkOutTime?: string;
  houseRules?: string;
  description?: string;
  localTips?: string;
  emergencyPhone?: string;
  locationId?: string;
  squareMeters?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  maxGuests?: number;
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const slug = generateSlug(data.name);

    // If assigning to a location, verify ownership
    if (data.locationId) {
      const location = await prisma.location.findFirst({
        where: { id: data.locationId, hostId: session.user.id },
      });
      if (!location) {
        return { success: false, error: "Location not found or unauthorized" };
      }
    }

    const property = await prisma.property.create({
      data: {
        ...data,
        slug,
        hostId: session.user.id,
      },
    });

    revalidatePath("/admin");
    return { success: true, property };
  } catch (error) {
    console.error("Error creating property:", error);
    return { success: false, error: "Failed to create property" };
  }
};

export const updateProperty = async (
  id: string,
  data: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    wifiName?: string;
    wifiPassword?: string;
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string;
    description?: string;
    localTips?: string;
    emergencyPhone?: string;
    squareMeters?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    beds?: number | null;
    maxGuests?: number | null;
  }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const existing = await prisma.property.findFirst({
      where: { id, hostId: session.user.id },
    });

    if (!existing)
      return { success: false, error: "Property not found or unauthorized" };

    const property = await prisma.property.update({
      where: { id },
      data,
    });

    revalidatePath("/admin");
    return { success: true, property };
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, error: "Failed to update property" };
  }
};

export const duplicateProperty = async (id: string, newName: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const source = await prisma.property.findFirst({
      where: { id, hostId: session.user.id },
    });
    if (!source)
      return { success: false, error: "Property not found or unauthorized" };

    const slug = generateSlug(newName);
    const {
      id: _id,
      slug: _slug,
      createdAt: _c,
      updatedAt: _u,
      ...rest
    } = source;
    void _id;
    void _slug;
    void _c;
    void _u;

    const copy = await prisma.property.create({
      data: {
        ...rest,
        name: newName.trim(),
        slug,
      },
    });

    revalidatePath("/admin");
    return { success: true, property: copy };
  } catch (error) {
    console.error("Error duplicating property:", error);
    return { success: false, error: "Failed to duplicate" };
  }
};

export const deleteProperty = async (id: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const existing = await prisma.property.findFirst({
      where: { id, hostId: session.user.id },
    });

    if (!existing)
      return { success: false, error: "Property not found or unauthorized" };

    await prisma.property.delete({ where: { id } });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, error: "Failed to delete property" };
  }
};
