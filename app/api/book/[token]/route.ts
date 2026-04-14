import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { checkAvailability } from "@/lib/booking/get-availability";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { token } = await params;

  let body: {
    action?: string;
    checkIn?: string;
    checkOut?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestNationality?: string;
    numberOfGuests?: number;
    specialRequests?: string;
    message?: string;
    unitId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, ...data } = body;

  const location = await prisma.location.findUnique({
    where: { bookingToken: token },
    select: {
      id: true,
      bookingEnabled: true,
      bookingMode: true,
      unitSelectionMode: true,
      archivedAt: true,
    },
  });

  if (!location || !location.bookingEnabled || location.archivedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "check_availability") {
    if (!data.checkIn || !data.checkOut) {
      return NextResponse.json({ error: "Missing dates" }, { status: 400 });
    }
    const result = await checkAvailability(
      location.id,
      new Date(data.checkIn),
      new Date(data.checkOut)
    );
    return NextResponse.json(result);
  }

  if (action === "submit_inquiry") {
    if (!data.guestName || !data.guestEmail || !data.checkIn || !data.checkOut) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const inquiry = await prisma.inquiry.create({
      data: {
        locationId: location.id,
        type: "booking",
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || null,
        guestNationality: data.guestNationality || null,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        numberOfGuests: data.numberOfGuests ?? 1,
        specialRequests: data.specialRequests || null,
        message: data.message || null,
        unitId: data.unitId || null,
        source: "booking_page",
        status: "new",
      },
    });
    return NextResponse.json({ success: true, inquiryId: inquiry.id });
  }

  if (action === "submit_question") {
    if (!data.guestName || !data.guestEmail || !data.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const inquiry = await prisma.inquiry.create({
      data: {
        locationId: location.id,
        type: "question",
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || null,
        message: data.message,
        source: "booking_page",
        status: "new",
      },
    });
    return NextResponse.json({ success: true, inquiryId: inquiry.id });
  }

  if (action === "instant_book") {
    if (location.bookingMode !== "instant_book") {
      return NextResponse.json({ error: "Instant book not enabled" }, { status: 400 });
    }
    if (!data.guestName || !data.guestEmail || !data.checkIn || !data.checkOut) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const availability = await checkAvailability(
      location.id,
      new Date(data.checkIn),
      new Date(data.checkOut)
    );

    if (!availability.available) {
      return NextResponse.json(
        { error: "These dates are no longer available" },
        { status: 409 }
      );
    }

    const unitId =
      location.unitSelectionMode === "auto_assign"
        ? availability.units[0]?.id
        : data.unitId;

    if (!unitId) {
      return NextResponse.json({ error: "No unit available" }, { status: 409 });
    }

    // Verify the chosen unit is still available (guard against guest_chooses
    // race where the guest picked a unit that's since been booked).
    if (location.unitSelectionMode === "guest_chooses") {
      const stillAvailable = availability.units.some((u) => u.id === unitId);
      if (!stillAvailable) {
        return NextResponse.json(
          { error: "This unit is no longer available" },
          { status: 409 }
        );
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        propertyId: unitId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || null,
        guestNationality: data.guestNationality || null,
        numberOfGuests: data.numberOfGuests ?? 1,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        specialRequests: data.specialRequests || null,
        source: "direct",
        status: "confirmed",
      },
    });

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      guestToken: reservation.guestToken,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
