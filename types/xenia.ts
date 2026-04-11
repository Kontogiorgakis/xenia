import { ReservationSource } from "@/lib/admin/constants";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    propertyId: string;
    propertyName: string;
    source: ReservationSource;
    status: string;
    guestName: string;
    guestNationality: string | null;
    numberOfGuests: number;
    guestToken: string;
    specialRequests: string | null;
  };
};
