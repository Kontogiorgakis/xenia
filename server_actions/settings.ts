"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export const getHostProfile = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", profile: null };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        displayName: true,
        phone: true,
        bio: true,
        avatarUrl: true,
      },
    });

    return { success: true, profile: user };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "Failed to fetch profile", profile: null };
  }
};

export const updateHostProfile = async (data: {
  displayName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  name?: string;
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    revalidatePath("/admin");
    return { success: true, profile: user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
};

export const getNotificationPreferences = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return { success: false, error: "Unauthorized", prefs: {} };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPrefs: true },
    });

    const prefs = user?.notificationPrefs
      ? JSON.parse(user.notificationPrefs)
      : {};

    return { success: true, prefs };
  } catch (error) {
    console.error("Error fetching notification prefs:", error);
    return { success: false, error: "Failed to fetch preferences", prefs: {} };
  }
};

export const updateNotificationPreferences = async (
  prefs: Record<string, { email: boolean; push: boolean }>
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { notificationPrefs: JSON.stringify(prefs) },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating notification prefs:", error);
    return { success: false, error: "Failed to update preferences" };
  }
};
