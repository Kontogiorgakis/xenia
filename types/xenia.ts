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

// Location types
export type AmenityCategory =
  | "pool"
  | "parking"
  | "garden"
  | "bbq"
  | "gym"
  | "spa"
  | "laundry"
  | "reception"
  | "restaurant"
  | "other";

export type ContactCategory =
  | "emergency"
  | "medical"
  | "transport"
  | "food"
  | "services"
  | "pharmacy"
  | "other";

export type XeniaAmenity = {
  id: string;
  category: AmenityCategory;
  name: string;
  hours?: string;
  notes?: string;
};

export type XeniaRule = {
  id: string;
  category: string;
  text: string;
};

export type XeniaContact = {
  id: string;
  locationId: string;
  category: ContactCategory;
  name: string;
  phone: string;
  notes?: string;
  icon?: string;
  order: number;
};
