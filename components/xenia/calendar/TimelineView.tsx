"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSourceColor } from "@/lib/admin/constants";
import { CalendarEvent } from "@/types/xenia";

interface TimelineViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onSelectEvent: (event: CalendarEvent) => void;
  t: (key: string) => string;
}

const DAYS_TO_SHOW = 30;

function getDaysBetween(start: Date, end: Date): number {
  return Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, { day: "numeric" });
}

function formatDayOfWeek(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function TimelineView({
  events,
  currentDate,
  onSelectEvent,
  t,
}: TimelineViewProps) {
  // Generate date columns
  const dates = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, [currentDate]);

  // Group events by property
  const propertyGroups = useMemo(() => {
    const groups: Record<
      string,
      { name: string; events: CalendarEvent[] }
    > = {};
    for (const event of events) {
      const pid = event.resource.propertyId;
      if (!groups[pid]) {
        groups[pid] = { name: event.resource.propertyName, events: [] };
      }
      groups[pid].events.push(event);
    }
    return Object.entries(groups);
  }, [events]);

  // Detect back-to-back bookings (checkout = checkin on same property)
  const backToBackDates = useMemo(() => {
    const result = new Set<string>();
    for (const [propertyId, group] of propertyGroups) {
      const sorted = [...group.events].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      );
      for (let i = 0; i < sorted.length - 1; i++) {
        if (isSameDay(sorted[i].end, sorted[i + 1].start)) {
          result.add(`${propertyId}-${sorted[i].end.toDateString()}`);
        }
      }
    }
    return result;
  }, [propertyGroups]);

  const today = new Date();

  if (propertyGroups.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[900px]">
        {/* Header row with dates */}
        <div className="flex border-b bg-muted/50">
          <div className="w-40 shrink-0 border-r px-3 py-2 text-sm font-medium">
            Property
          </div>
          <div className="flex flex-1">
            {dates.map((date) => {
              const isToday = isSameDay(date, today);
              return (
                <div
                  key={date.toISOString()}
                  className={`flex-1 min-w-[40px] border-r px-1 py-2 text-center text-xs ${
                    isToday
                      ? "bg-primary/10 font-bold"
                      : date.getDay() === 0 || date.getDay() === 6
                        ? "bg-muted/30"
                        : ""
                  }`}
                >
                  <div className="text-muted-foreground">
                    {formatDayOfWeek(date)}
                  </div>
                  <div>{formatDay(date)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Property rows */}
        {propertyGroups.map(([propertyId, group]) => (
          <div key={propertyId} className="flex border-b last:border-b-0">
            <div className="w-40 shrink-0 border-r px-3 py-3 text-sm font-medium">
              {group.name}
            </div>
            <div className="relative flex flex-1">
              {/* Date cell backgrounds */}
              {dates.map((date) => {
                const isToday = isSameDay(date, today);
                const btbKey = `${propertyId}-${date.toDateString()}`;
                const isBackToBack = backToBackDates.has(btbKey);

                return (
                  <div
                    key={date.toISOString()}
                    className={`flex-1 min-w-[40px] border-r min-h-[48px] relative ${
                      isToday
                        ? "bg-primary/5"
                        : date.getDay() === 0 || date.getDay() === 6
                          ? "bg-muted/20"
                          : ""
                    }`}
                  >
                    {isBackToBack && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute top-1 right-1 z-10">
                            <AlertTriangle className="size-3 text-yellow-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{t("backToBack")}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                );
              })}

              {/* Reservation blocks overlaid */}
              {group.events.map((event) => {
                const timelineStart = dates[0];
                const timelineEnd = dates[dates.length - 1];

                const eventStart =
                  event.start < timelineStart ? timelineStart : event.start;
                const eventEnd =
                  event.end > timelineEnd ? timelineEnd : event.end;

                const startOffset = getDaysBetween(timelineStart, eventStart);
                const duration = getDaysBetween(eventStart, eventEnd);

                if (startOffset >= DAYS_TO_SHOW || duration <= 0) return null;

                const leftPercent = (startOffset / DAYS_TO_SHOW) * 100;
                const widthPercent = (duration / DAYS_TO_SHOW) * 100;

                const colors = getSourceColor(event.resource.source);

                return (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="absolute top-2 h-8 rounded px-1.5 text-xs font-medium truncate cursor-pointer transition-opacity hover:opacity-90 z-[5]"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: colors.bg,
                      color: colors.text,
                    }}
                    title={event.title}
                  >
                    {widthPercent > 8 ? event.title : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
