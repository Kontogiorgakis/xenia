interface Reservation {
  id: string;
  guestName: string;
  guestNationality: string | null;
  checkIn: Date;
  checkOut: Date;
}

export type UnitStatus =
  | "available"
  | "arriving_today"
  | "occupied"
  | "departing_today"
  | "arriving_soon"
  | "back_to_back";

export interface UnitStatusResult {
  status: UnitStatus;
  activeReservation?: Reservation;
}

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function getUnitStatus(
  reservations: Reservation[],
  today: Date = new Date()
): UnitStatusResult {
  const todayMs = startOfDay(today);

  // Check back-to-back first (highest urgency): checkout + checkin same day
  for (let i = 0; i < reservations.length - 1; i++) {
    const outMs = startOfDay(new Date(reservations[i].checkOut));
    const inMs = startOfDay(new Date(reservations[i + 1].checkIn));
    if (outMs === todayMs && inMs === todayMs) {
      return { status: "back_to_back", activeReservation: reservations[i + 1] };
    }
  }

  for (const r of reservations) {
    const ciMs = startOfDay(new Date(r.checkIn));
    const coMs = startOfDay(new Date(r.checkOut));

    // Arriving today
    if (ciMs === todayMs) {
      return { status: "arriving_today", activeReservation: r };
    }
    // Departing today
    if (coMs === todayMs) {
      return { status: "departing_today", activeReservation: r };
    }
    // Currently occupied
    if (ciMs < todayMs && coMs > todayMs) {
      return { status: "occupied", activeReservation: r };
    }
  }

  // Check arriving soon (within next 2 days)
  for (const r of reservations) {
    const ciMs = startOfDay(new Date(r.checkIn));
    const diffDays = (ciMs - todayMs) / (1000 * 60 * 60 * 24);
    if (diffDays > 0 && diffDays <= 2) {
      return { status: "arriving_soon", activeReservation: r };
    }
  }

  return { status: "available" };
}

export const STATUS_CONFIG: Record<
  UnitStatus,
  { dotColor: string; bgColor: string; label: string }
> = {
  available: {
    dotColor: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    label: "statusAvailable",
  },
  occupied: {
    dotColor: "bg-primary",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    label: "statusOccupied",
  },
  arriving_today: {
    dotColor: "bg-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    label: "statusArrivingToday",
  },
  departing_today: {
    dotColor: "bg-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    label: "statusDepartingToday",
  },
  arriving_soon: {
    dotColor: "bg-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    label: "statusArrivingSoon",
  },
  back_to_back: {
    dotColor: "bg-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    label: "statusBackToBack",
  },
};
