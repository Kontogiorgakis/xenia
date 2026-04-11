export const RESERVATION_SOURCES = ["direct", "booking", "airbnb", "other"] as const;
export type ReservationSource = (typeof RESERVATION_SOURCES)[number];

export const RESERVATION_STATUSES = ["confirmed", "active", "completed", "cancelled"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const SOURCE_COLORS: Record<
  ReservationSource,
  { bg: string; text: string; label: string }
> = {
  booking: { bg: "#1a56db", text: "#ffffff", label: "Booking.com" },
  airbnb: { bg: "#e8442c", text: "#ffffff", label: "Airbnb" },
  direct: { bg: "#057a55", text: "#ffffff", label: "Direct" },
  other: { bg: "#6b7280", text: "#ffffff", label: "Other" },
};

export const getSourceColor = (source: string) =>
  SOURCE_COLORS[source as ReservationSource] ?? SOURCE_COLORS.other;

export const GUEST_BASE_URL = "https://xenia.app/stay";
