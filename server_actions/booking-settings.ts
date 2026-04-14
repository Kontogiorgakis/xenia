"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

type BookingMode = "instant_book" | "contact_only";
type UnitSelectionMode = "auto_assign" | "guest_chooses";

async function requireOwnership(locationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const location = await prisma.location.findFirst({
    where: { id: locationId, hostId: session.user.id },
    select: { id: true },
  });
  return location ? session.user.id : null;
}

export const setBookingEnabled = async (locationId: string, enabled: boolean) => {
  const ok = await requireOwnership(locationId);
  if (!ok) return { success: false, error: "Unauthorized" };

  try {
    await prisma.location.update({
      where: { id: locationId },
      data: { bookingEnabled: enabled },
    });
    revalidatePath("/admin/guestbook");
    return { success: true };
  } catch (error) {
    console.error("Error toggling booking:", error);
    return { success: false, error: "Failed to update" };
  }
};

export const setBookingMode = async (locationId: string, mode: BookingMode) => {
  const ok = await requireOwnership(locationId);
  if (!ok) return { success: false, error: "Unauthorized" };

  try {
    await prisma.location.update({
      where: { id: locationId },
      data: { bookingMode: mode },
    });
    revalidatePath("/admin/guestbook");
    return { success: true };
  } catch (error) {
    console.error("Error updating booking mode:", error);
    return { success: false, error: "Failed to update" };
  }
};

export const setUnitSelectionMode = async (
  locationId: string,
  mode: UnitSelectionMode
) => {
  const ok = await requireOwnership(locationId);
  if (!ok) return { success: false, error: "Unauthorized" };

  try {
    await prisma.location.update({
      where: { id: locationId },
      data: { unitSelectionMode: mode },
    });
    revalidatePath("/admin/guestbook");
    return { success: true };
  } catch (error) {
    console.error("Error updating unit selection mode:", error);
    return { success: false, error: "Failed to update" };
  }
};

export const regenerateBookingToken = async (locationId: string) => {
  const ok = await requireOwnership(locationId);
  if (!ok) return { success: false, error: "Unauthorized" };

  try {
    const newToken = nanoid(21);
    await prisma.location.update({
      where: { id: locationId },
      data: {
        bookingToken: newToken,
        bookingTokenUpdatedAt: new Date(),
      },
    });
    revalidatePath("/admin/guestbook");
    return { success: true, token: newToken };
  } catch (error) {
    console.error("Error regenerating booking token:", error);
    return { success: false, error: "Failed to regenerate" };
  }
};
