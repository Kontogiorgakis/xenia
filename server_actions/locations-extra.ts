"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

// ─────────────────────────────────────────────────────────────
// Archive / Restore
// ─────────────────────────────────────────────────────────────

async function verifyLocationOwnership(locationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const location = await prisma.location.findFirst({
    where: { id: locationId, hostId: session.user.id },
  });
  return { session, location };
}

export const archiveLocation = async (id: string) => {
  try {
    const { location } = await verifyLocationOwnership(id);
    if (!location)
      return { success: false, error: "Location not found or unauthorized" };

    await prisma.location.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error archiving location:", error);
    return { success: false, error: "Failed to archive" };
  }
};

export const restoreLocation = async (id: string) => {
  try {
    const { location } = await verifyLocationOwnership(id);
    if (!location)
      return { success: false, error: "Location not found or unauthorized" };

    await prisma.location.update({
      where: { id },
      data: { archivedAt: null },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error restoring location:", error);
    return { success: false, error: "Failed to restore" };
  }
};

// ─────────────────────────────────────────────────────────────
// Knowledge Base CRUD
// ─────────────────────────────────────────────────────────────

export const getKnowledgeEntries = async (locationId: string) => {
  try {
    const { location } = await verifyLocationOwnership(locationId);
    if (!location)
      return { success: false, error: "Unauthorized", entries: [] };

    const entries = await prisma.knowledgeEntry.findMany({
      where: { locationId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, entries };
  } catch (error) {
    console.error("Error fetching knowledge entries:", error);
    return { success: false, error: "Failed to fetch", entries: [] };
  }
};

export const createKnowledgeEntry = async (
  locationId: string,
  data: { category: string; question: string; answer: string }
) => {
  try {
    const { location } = await verifyLocationOwnership(locationId);
    if (!location)
      return { success: false, error: "Unauthorized" };

    const entry = await prisma.knowledgeEntry.create({
      data: { ...data, locationId },
    });

    revalidatePath("/admin");
    return { success: true, entry };
  } catch (error) {
    console.error("Error creating knowledge entry:", error);
    return { success: false, error: "Failed to create" };
  }
};

export const updateKnowledgeEntry = async (
  id: string,
  data: { category?: string; question?: string; answer?: string }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const entry = await prisma.knowledgeEntry.findFirst({
      where: { id },
      include: { location: { select: { hostId: true } } },
    });
    if (!entry || entry.location.hostId !== session.user.id)
      return { success: false, error: "Not found" };

    await prisma.knowledgeEntry.update({ where: { id }, data });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating knowledge entry:", error);
    return { success: false, error: "Failed to update" };
  }
};

export const deleteKnowledgeEntry = async (id: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const entry = await prisma.knowledgeEntry.findFirst({
      where: { id },
      include: { location: { select: { hostId: true } } },
    });
    if (!entry || entry.location.hostId !== session.user.id)
      return { success: false, error: "Not found" };

    await prisma.knowledgeEntry.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting knowledge entry:", error);
    return { success: false, error: "Failed to delete" };
  }
};

// ─────────────────────────────────────────────────────────────
// Unanswered Questions
// ─────────────────────────────────────────────────────────────

export const getUnansweredQuestions = async (locationId: string) => {
  try {
    const { location } = await verifyLocationOwnership(locationId);
    if (!location)
      return { success: false, error: "Unauthorized", questions: [] };

    const questions = await prisma.unansweredQuestion.findMany({
      where: { locationId, resolved: false },
      orderBy: { askedCount: "desc" },
    });
    return { success: true, questions };
  } catch (error) {
    console.error("Error fetching unanswered questions:", error);
    return { success: false, error: "Failed to fetch", questions: [] };
  }
};

export const resolveUnansweredQuestion = async (
  id: string,
  answer?: { category: string; answer: string }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const question = await prisma.unansweredQuestion.findFirst({
      where: { id },
      include: { location: { select: { hostId: true, id: true } } },
    });
    if (!question || question.location.hostId !== session.user.id)
      return { success: false, error: "Not found" };

    if (answer) {
      await prisma.knowledgeEntry.create({
        data: {
          locationId: question.location.id,
          category: answer.category,
          question: question.question,
          answer: answer.answer,
        },
      });
    }

    await prisma.unansweredQuestion.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date() },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error resolving question:", error);
    return { success: false, error: "Failed to resolve" };
  }
};

export const logUnansweredQuestion = async (
  locationId: string,
  question: string
) => {
  try {
    // Check for existing identical question (case-insensitive)
    const existing = await prisma.unansweredQuestion.findFirst({
      where: { locationId, resolved: false, question },
    });

    if (existing) {
      await prisma.unansweredQuestion.update({
        where: { id: existing.id },
        data: { askedCount: existing.askedCount + 1 },
      });
    } else {
      await prisma.unansweredQuestion.create({
        data: { locationId, question },
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error logging unanswered question:", error);
    return { success: false };
  }
};

// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────

export const exportLocationData = async (locationId: string) => {
  try {
    const { location } = await verifyLocationOwnership(locationId);
    if (!location)
      return { success: false, error: "Unauthorized", data: null };

    const full = await prisma.location.findFirst({
      where: { id: locationId },
      include: {
        properties: {
          include: {
            reservations: {
              orderBy: { checkIn: "desc" },
            },
          },
        },
        contacts: { orderBy: { displayOrder: "asc" } },
        knowledgeEntries: { orderBy: { createdAt: "desc" } },
      },
    });

    return { success: true, data: full };
  } catch (error) {
    console.error("Error exporting location data:", error);
    return { success: false, error: "Failed to export", data: null };
  }
};
