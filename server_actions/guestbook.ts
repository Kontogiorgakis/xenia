"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export const getGuestbookData = async (locationId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: null };
  }

  try {
    const location = await prisma.location.findFirst({
      where: { id: locationId, hostId: session.user.id, archivedAt: null },
      include: {
        contacts: { orderBy: { displayOrder: "asc" } },
        knowledgeEntries: { orderBy: { createdAt: "desc" } },
        unansweredQuestions: {
          where: { resolved: false },
          orderBy: { askedCount: "desc" },
        },
        host: {
          select: { displayName: true, bio: true, avatarUrl: true },
        },
      },
    });

    if (!location) {
      return { success: false, error: "Property not found", data: null };
    }

    const { host, ...locationFields } = location;
    return {
      success: true,
      data: { location: locationFields, host },
    };
  } catch (error) {
    console.error("Error fetching guestbook data:", error);
    return { success: false, error: "Failed to fetch guestbook data", data: null };
  }
};
