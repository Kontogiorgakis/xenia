"use client";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Pencil,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TypographyH3, TypographyRegular } from "@/components/ui/typography";
import { Link } from "@/lib/i18n/navigation";
import {
  GUEST_BASE_URL,
  SOURCE_COLORS,
  getSourceColor,
} from "@/lib/admin/constants";
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

  // Compute detail panel info
  const selectedResource = selectedEvent?.resource;
  const nights = selectedEvent
    ? Math.ceil(
        (selectedEvent.end.getTime() - selectedEvent.start.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

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

      {/* Reservation Detail Sheet */}
      <Sheet
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedResource && (() => {
            const sourceColor = getSourceColor(selectedResource.source);
            return (
            <>
              <SheetHeader>
                <div className="mb-2">
                  <Badge
                    style={{
                      backgroundColor: sourceColor.bg,
                      color: sourceColor.text,
                    }}
                  >
                    {sourceColor.label}
                  </Badge>
                </div>
                <SheetTitle className="text-xl">
                  {selectedResource.guestName}
                </SheetTitle>
                {selectedResource.guestNationality && (
                  <p className="text-sm text-muted-foreground">
                    {selectedResource.guestNationality}
                  </p>
                )}
              </SheetHeader>

              <div className="space-y-6 px-4 pb-4">
                <Separator />

                <div className="space-y-3">
                  <DetailRow
                    label="Property"
                    value={selectedResource.propertyName}
                  />
                  <DetailRow
                    label="Check-in"
                    value={selectedEvent!.start.toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                  <DetailRow
                    label="Check-out"
                    value={selectedEvent!.end.toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                  <DetailRow
                    label="Duration"
                    value={`${nights} ${t("nights")}`}
                  />
                  <DetailRow
                    label="Guests"
                    value={`${selectedResource.numberOfGuests} ${t("guests")}`}
                  />
                </div>

                {selectedResource.specialRequests && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Special requests
                      </p>
                      <p className="mt-1 text-sm">
                        {selectedResource.specialRequests}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full cursor-pointer"
                    icon={<ExternalLink className="size-4" />}
                  >
                    <a
                      href={`${GUEST_BASE_URL}/${selectedResource.guestToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("viewGuestPage")}
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full cursor-pointer"
                    icon={<Pencil className="size-4" />}
                  >
                    <Link href={`/admin/reservations/${selectedEvent!.id}`}>
                      {t("editReservation")}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled
                    icon={<MessageCircle className="size-4" />}
                  >
                    {t("messageGuest")} — {t("comingSoon")}
                  </Button>
                </div>
              </div>
            </>
          );})()}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
