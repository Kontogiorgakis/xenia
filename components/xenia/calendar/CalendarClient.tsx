"use client";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  ReservationDetail,
  ReservationDetailSheet,
} from "@/components/admin/reservation-detail-sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import { SOURCE_COLORS, getSourceColor } from "@/lib/admin/constants";
import { CalendarEvent } from "@/types/xenia";

import { TimelineView } from "./TimelineView";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type ViewType = "month" | "week" | "timeline";

interface CalendarClientProps {
  events: CalendarEvent[];
  properties: { id: string; name: string }[];
}

export function CalendarClient({ events, properties }: CalendarClientProps) {
  const t = useTranslations("Admin.calendar");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [propertyFilter, setPropertyFilter] = useState("all");

  // Filter events by property
  const filteredEvents = useMemo(() => {
    if (propertyFilter === "all") return events;
    return events.filter((e) => e.resource.propertyId === propertyFilter);
  }, [events, propertyFilter]);

  // Event style getter for react-big-calendar
  const eventPropGetter = useCallback(
    (event: CalendarEvent) => {
      const colors = getSourceColor(event.resource.source);
      return {
        style: {
          backgroundColor: colors.bg,
          color: colors.text,
          border: "none",
          borderRadius: "4px",
          fontSize: "12px",
        },
      };
    },
    []
  );

  // Navigation
  const handleNavigate = useCallback(
    (direction: "prev" | "next" | "today") => {
      setCurrentDate((prev) => {
        const d = new Date(prev);
        if (direction === "today") return new Date();
        const offset =
          view === "month" ? 30 : view === "week" ? 7 : 30;
        d.setDate(d.getDate() + (direction === "next" ? offset : -offset));
        return d;
      });
    },
    [view]
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const selectedDetail: ReservationDetail | null = selectedEvent
    ? {
        id: selectedEvent.id,
        guestName: selectedEvent.resource.guestName,
        guestNationality: selectedEvent.resource.guestNationality,
        numberOfGuests: selectedEvent.resource.numberOfGuests,
        checkIn: selectedEvent.start,
        checkOut: selectedEvent.end,
        source: selectedEvent.resource.source,
        status: selectedEvent.resource.status,
        specialRequests: selectedEvent.resource.specialRequests,
        guestToken: selectedEvent.resource.guestToken,
        propertyName: selectedEvent.resource.propertyName,
      }
    : null;

  const bigCalendarView: View = view === "timeline" ? "month" : view;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TypographyH3>{t("title")}</TypographyH3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigate("prev")}
            className="cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handleNavigate("today")}
            className="cursor-pointer"
          >
            {t("today")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigate("next")}
            className="cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
            className="cursor-pointer"
          >
            {t("month")}
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
            className="cursor-pointer"
          >
            {t("week")}
          </Button>
          <Button
            variant={view === "timeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("timeline")}
            className="cursor-pointer"
          >
            {t("timeline")}
          </Button>
        </div>
      </div>

      {/* Filter and Legend */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {Object.entries(SOURCE_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: val.bg }}
              />
              <span className="text-xs text-muted-foreground">{val.label}</span>
            </div>
          ))}
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-48 cursor-pointer">
            <SelectValue placeholder={t("allProperties")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              {t("allProperties")}
            </SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar / Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border py-16">
          <CalendarDays className="mb-4 size-12 text-muted-foreground" />
          <TypographyH3>{t("noReservations")}</TypographyH3>
          <TypographyRegular className="mb-6 text-muted-foreground">
            {t("noReservationsHint")}
          </TypographyRegular>
          <Button asChild icon={<Plus className="size-4" />} className="cursor-pointer">
            <Link href="/admin/reservations/new">{t("addReservation")}</Link>
          </Button>
        </div>
      ) : view === "timeline" ? (
        <TimelineView
          events={filteredEvents}
          currentDate={currentDate}
          onSelectEvent={handleSelectEvent}
          t={t}
        />
      ) : (
        <div className="rounded-lg border p-4 [&_.rbc-event]:cursor-pointer">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            date={currentDate}
            onNavigate={setCurrentDate}
            view={bigCalendarView}
            onView={() => {}}
            views={["month", "week"]}
            toolbar={false}
            eventPropGetter={eventPropGetter}
            onSelectEvent={handleSelectEvent}
            style={{ height: 600 }}
            popup
          />
        </div>
      )}

      <ReservationDetailSheet
        reservation={selectedDetail}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
