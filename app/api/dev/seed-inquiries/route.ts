import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

// Dev-only endpoint to create fake inquiries for the current host.
// Hit GET /api/dev/seed-inquiries in the browser while logged in.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    where: { hostId: session.user.id, archivedAt: null },
    include: { properties: { select: { id: true, name: true } } },
  });

  if (locations.length === 0) {
    return NextResponse.json(
      { error: "No properties found — create a property first." },
      { status: 400 }
    );
  }

  const day = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(15, 0, 0, 0);
    return d;
  };

  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  const seeds: Prisma.InquiryCreateManyInput[] = [];

  const bookingSamples = [
    {
      guestName: "Maria Hoffmann",
      guestEmail: "maria.hoffmann@example.com",
      guestPhone: "+49 176 1234 5678",
      guestNationality: "Germany",
      message: "Hi! We'd love a sea view if possible. We're celebrating our anniversary.",
      specialRequests: "Sea view, bottle of wine on arrival if possible 🙏",
      numberOfGuests: 2,
      offsetStart: 14,
      nights: 5,
      status: "new",
    },
    {
      guestName: "Liam O'Connor",
      guestEmail: "liam.oconnor@example.com",
      guestPhone: "+353 86 999 1234",
      guestNationality: "Ireland",
      message: "Is the pool heated in April? Travelling with two kids (ages 6 and 9).",
      specialRequests: "Crib if possible",
      numberOfGuests: 4,
      offsetStart: 25,
      nights: 7,
      status: "new",
    },
    {
      guestName: "Yuki Tanaka",
      guestEmail: "yuki.tanaka@example.com",
      guestPhone: "+81 90 1234 5678",
      guestNationality: "Japan",
      message: "Hello, we'd like to book for our honeymoon. Is the unit quiet at night?",
      specialRequests: null,
      numberOfGuests: 2,
      offsetStart: 40,
      nights: 10,
      status: "read",
    },
    {
      guestName: "Sophie Martin",
      guestEmail: "sophie.martin@example.com",
      guestPhone: "+33 6 78 12 34 56",
      guestNationality: "France",
      message: "Bonjour! Can we check in early, around noon? Flight lands at 10am.",
      specialRequests: "Early check-in if possible",
      numberOfGuests: 3,
      offsetStart: 7,
      nights: 4,
      status: "replied",
    },
    {
      guestName: "David Sanchez",
      guestEmail: "david.sanchez@example.com",
      guestPhone: "+34 612 345 678",
      guestNationality: "Spain",
      message: "Group of friends, 4 guys. Quiet and respectful! Looking for beach access.",
      specialRequests: null,
      numberOfGuests: 4,
      offsetStart: 60,
      nights: 3,
      status: "new",
    },
  ];

  const questionSamples = [
    {
      guestName: "Emma Wilson",
      guestEmail: "emma.wilson@example.com",
      guestPhone: "+44 7700 900123",
      guestNationality: "United Kingdom",
      message:
        "Hi! Do you allow dogs? We have a small well-behaved labrador. We'd love to stay with you this summer.",
      status: "new",
    },
    {
      guestName: "Giulia Rossi",
      guestEmail: "giulia.rossi@example.com",
      guestPhone: null,
      guestNationality: "Italy",
      message:
        "Is there parking on site? And how far is the nearest supermarket? Grazie!",
      status: "read",
    },
    {
      guestName: "Alex Petrov",
      guestEmail: "alex.petrov@example.com",
      guestPhone: "+7 926 123 4567",
      guestNationality: "Russia",
      message: "Hello, do you offer airport transfers? Arriving at HER airport on July 12.",
      status: "replied",
    },
  ];

  for (const b of bookingSamples) {
    const loc = pick(locations);
    const unit = loc.properties.length > 0 ? pick(loc.properties) : null;
    seeds.push({
      type: "booking",
      locationId: loc.id,
      unitId: unit?.id ?? null,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      guestPhone: b.guestPhone,
      guestNationality: b.guestNationality,
      message: b.message,
      specialRequests: b.specialRequests,
      numberOfGuests: b.numberOfGuests,
      checkIn: day(b.offsetStart),
      checkOut: day(b.offsetStart + b.nights),
      status: b.status,
      source: "booking_page",
    });
  }

  for (const q of questionSamples) {
    const loc = pick(locations);
    seeds.push({
      type: "question",
      locationId: loc.id,
      guestName: q.guestName,
      guestEmail: q.guestEmail,
      guestPhone: q.guestPhone,
      guestNationality: q.guestNationality,
      message: q.message,
      status: q.status,
      source: "booking_page",
    });
  }

  const { count } = await prisma.inquiry.createMany({ data: seeds });

  return NextResponse.json({
    success: true,
    created: count,
    message: `Created ${count} inquiries. Refresh /admin/inbox to see them.`,
  });
}
