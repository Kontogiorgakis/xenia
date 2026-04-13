"use client";

import { ExternalLink, MessageCircle, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GUEST_BASE_URL, getSourceColor } from "@/lib/admin/constants";
import { Link } from "@/lib/i18n/navigation";

export interface ReservationDetail {
  id: string;
  guestName: string;
  guestNationality: string | null;
  numberOfGuests: number;
  checkIn: Date | string;
  checkOut: Date | string;
  source: string;
  status: string;
  specialRequests: string | null;
  guestToken: string;
  propertyName: string;
}

interface ReservationDetailSheetProps {
  reservation: ReservationDetail | null;
  onClose: () => void;
}

function formatLong(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function ReservationDetailSheet({
  reservation,
  onClose,
}: ReservationDetailSheetProps) {
  const t = useTranslations("Admin.calendar");

  const nights = reservation
    ? Math.ceil(
        (new Date(reservation.checkOut).getTime() -
          new Date(reservation.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Sheet open={!!reservation} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        {reservation && (() => {
          const sourceColor = getSourceColor(reservation.source);
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
                  {reservation.guestName}
                </SheetTitle>
                {reservation.guestNationality && (
                  <p className="text-sm text-muted-foreground">
                    {reservation.guestNationality}
                  </p>
                )}
              </SheetHeader>

              <div className="space-y-6 px-4 pb-4">
                <Separator />

                <div className="space-y-3">
                  <DetailRow label="Property" value={reservation.propertyName} />
                  <DetailRow label="Check-in" value={formatLong(reservation.checkIn)} />
                  <DetailRow label="Check-out" value={formatLong(reservation.checkOut)} />
                  <DetailRow
                    label="Duration"
                    value={`${nights} ${t("nights")}`}
                  />
                  <DetailRow
                    label="Guests"
                    value={`${reservation.numberOfGuests} ${t("guests")}`}
                  />
                </div>

                {reservation.specialRequests && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Special requests
                      </p>
                      <p className="mt-1 text-sm">
                        {reservation.specialRequests}
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
                      href={`${GUEST_BASE_URL}/${reservation.guestToken}`}
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
                    <Link href={`/admin/reservations/${reservation.id}`}>
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
          );
        })()}
      </SheetContent>
    </Sheet>
  );
}
