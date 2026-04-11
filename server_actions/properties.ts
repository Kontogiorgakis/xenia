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
    const properties = await prisma.property.findMany({
      where: { hostId: session.user.id },
      include: {
        _count: { select: { reservations: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, properties };
  } catch (error) {
    console.error("Error fetching properties:", error);
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
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const slug = generateSlug(data.name);

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
