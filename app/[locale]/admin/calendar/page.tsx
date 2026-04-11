import { setRequestLocale } from "next-intl/server";

import { CalendarClient } from "@/components/xenia/calendar/CalendarClient";
import { getProperties } from "@/server_actions/properties";
import { getReservations } from "@/server_actions/reservations";
import { ReservationSource } from "@/lib/admin/constants";
import { CalendarEvent } from "@/types/xenia";
import { BasePageProps } from "@/types/page-props";

const CalendarPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const [reservationsResult, propertiesResult] = await Promise.all([
    getReservations(),
    getProperties(),
  ]);

  const events: CalendarEvent[] = reservationsResult.reservations.map((r) => ({
    id: r.id,
    title: r.guestName,
    start: new Date(r.checkIn),
    end: new Date(r.checkOut),
    resource: {
      propertyId: r.propertyId,
      propertyName: r.property.name,
      source: r.source as ReservationSource,
      status: r.status,
      guestName: r.guestName,
      guestNationality: r.guestNationality,
      numberOfGuests: r.numberOfGuests,
      guestToken: r.guestToken,
      specialRequests: r.specialRequests,
    },
  }));

  const properties = propertiesResult.properties.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return <CalendarClient events={events} properties={properties} />;
};

export default CalendarPage;
