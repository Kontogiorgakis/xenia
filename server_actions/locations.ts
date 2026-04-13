"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/general/slug";

export const getLocations = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", locations: [] };

  try {
    const locations = await prisma.location.findMany({
      where: { hostId: session.user.id },
      include: {
        properties: {
          include: {
            _count: { select: { reservations: true } },
          },
        },
        _count: { select: { contacts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, locations };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { success: false, error: "Failed to fetch locations", locations: [] };
  }
};

export const getLocationById = async (id: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", location: null };

  try {
    const location = await prisma.location.findFirst({
      where: { id, hostId: session.user.id },
      include: {
        properties: true,
        contacts: { orderBy: { displayOrder: "asc" } },
      },
    });

    if (!location)
      return { success: false, error: "Location not found", location: null };

    return { success: true, location };
  } catch (error) {
    console.error("Error fetching location:", error);
    return { success: false, error: "Failed to fetch location", location: null };
  }
};

export const createLocation = async (data: {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  amenities?: string;
  rules?: string;
  gateCode?: string;
  parkingInfo?: string;
  buildingAccess?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const slug = generateSlug(data.name);

    const location = await prisma.location.create({
      data: {
        ...data,
        slug,
        hostId: session.user.id,
      },
    });

    revalidatePath("/admin");
    return { success: true, location };
  } catch (error) {
    console.error("Error creating location:", error);
    return { success: false, error: "Failed to create location" };
  }
};

export const updateLocation = async (
  id: string,
  data: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    amenities?: string;
    rules?: string;
    gateCode?: string;
    parkingInfo?: string;
    buildingAccess?: string;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const existing = await prisma.location.findFirst({
      where: { id, hostId: session.user.id },
    });

    if (!existing)
      return { success: false, error: "Location not found or unauthorized" };

    const location = await prisma.location.update({
      where: { id },
      data,
    });

    revalidatePath("/admin");
    return { success: true, location };
  } catch (error) {
    console.error("Error updating location:", error);
    return { success: false, error: "Failed to update location" };
  }
};

export const deleteLocation = async (id: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const existing = await prisma.location.findFirst({
      where: { id, hostId: session.user.id },
    });

    if (!existing)
      return { success: false, error: "Location not found or unauthorized" };

    // Unassign properties before deleting
    await prisma.property.updateMany({
      where: { locationId: id },
      data: { locationId: null },
    });

    await prisma.location.delete({ where: { id } });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting location:", error);
    return { success: false, error: "Failed to delete location" };
  }
};

// Contacts CRUD
export const getContacts = async (locationId: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", contacts: [] };

  try {
    const location = await prisma.location.findFirst({
      where: { id: locationId, hostId: session.user.id },
    });

    if (!location)
      return { success: false, error: "Location not found", contacts: [] };

    const contacts = await prisma.contact.findMany({
      where: { locationId },
      orderBy: { displayOrder: "asc" },
    });

    return { success: true, contacts };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { success: false, error: "Failed to fetch contacts", contacts: [] };
  }
};

export const createContact = async (
  locationId: string,
  data: {
    category: string;
    name: string;
    phone: string;
    notes?: string;
    icon?: string;
  }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const location = await prisma.location.findFirst({
      where: { id: locationId, hostId: session.user.id },
    });

    if (!location)
      return { success: false, error: "Location not found or unauthorized" };

    const maxOrder = await prisma.contact.aggregate({
      where: { locationId },
      _max: { displayOrder: true },
    });

    const contact = await prisma.contact.create({
      data: {
        ...data,
        locationId,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });

    revalidatePath("/admin");
    return { success: true, contact };
  } catch (error) {
    console.error("Error creating contact:", error);
    return { success: false, error: "Failed to create contact" };
  }
};

export const updateContact = async (
  id: string,
  data: {
    category?: string;
    name?: string;
    phone?: string;
    notes?: string;
    icon?: string;
  }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const existing = await prisma.contact.findFirst({
      where: { id },
      include: { location: { select: { hostId: true } } },
    });

    if (!existing || existing.location.hostId !== session.user.id)
      return { success: false, error: "Contact not found or unauthorized" };

    const contact = await prisma.contact.update({
      where: { id },
      data,
    });

    revalidatePath("/admin");
    return { success: true, contact };
  } catch (error) {
    console.error("Error updating contact:", error);
    return { success: false, error: "Failed to update contact" };
  }
};

export const deleteContact = async (id: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const existing = await prisma.contact.findFirst({
      where: { id },
      include: { location: { select: { hostId: true } } },
    });

    if (!existing || existing.location.hostId !== session.user.id)
      return { success: false, error: "Contact not found or unauthorized" };

    await prisma.contact.delete({ where: { id } });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { success: false, error: "Failed to delete contact" };
  }
};

// Property assignment
export const assignPropertyToLocation = async (
  propertyId: string,
  locationId: string
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, hostId: session.user.id },
    });
    const location = await prisma.location.findFirst({
      where: { id: locationId, hostId: session.user.id },
    });

    if (!property || !location)
      return { success: false, error: "Not found or unauthorized" };

    await prisma.property.update({
      where: { id: propertyId },
      data: { locationId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error assigning property:", error);
    return { success: false, error: "Failed to assign property" };
  }
};

export const removePropertyFromLocation = async (propertyId: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, hostId: session.user.id },
    });

    if (!property)
      return { success: false, error: "Property not found or unauthorized" };

    await prisma.property.update({
      where: { id: propertyId },
      data: { locationId: null },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error removing property from location:", error);
    return { success: false, error: "Failed to remove property" };
  }
};
