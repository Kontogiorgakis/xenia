"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { formatDateForInput } from "@/lib/general/utils";
import { convertInquiryToReservation } from "@/server_actions/inquiries";

interface InquiryLike {
  id: string;
  locationId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guestNationality: string | null;
  numberOfGuests: number | null;
  checkIn: Date | null;
  checkOut: Date | null;
  specialRequests: string | null;
  unitId: string | null;
}

interface LocationLite {
  id: string;
  name: string;
  properties: { id: string; name: string }[];
}

interface ConvertSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: InquiryLike;
  locations: LocationLite[];
  onConverted: () => void;
}

export function ConvertToReservationSheet({
  open,
  onOpenChange,
  inquiry,
  locations,
  onConverted,
}: ConvertSheetProps) {
  const t = useTranslations("Admin.inbox.convert");
  const [isPending, startTransition] = useTransition();

  const location = locations.find((l) => l.id === inquiry.locationId);
  const units = location?.properties ?? [];
  const defaultUnitId = inquiry.unitId ?? units[0]?.id ?? "";

  const [propertyId, setPropertyId] = useState(defaultUnitId);
  const [guestName, setGuestName] = useState(inquiry.guestName);
  const [guestEmail, setGuestEmail] = useState(inquiry.guestEmail);
  const [guestPhone, setGuestPhone] = useState(inquiry.guestPhone ?? "");
  const [guestNationality, setGuestNationality] = useState(
    inquiry.guestNationality ?? ""
  );
  const [numberOfGuests, setNumberOfGuests] = useState(inquiry.numberOfGuests ?? 1);
  const [checkIn, setCheckIn] = useState(formatDateForInput(inquiry.checkIn));
  const [checkOut, setCheckOut] = useState(formatDateForInput(inquiry.checkOut));
  const [specialRequests, setSpecialRequests] = useState(
    inquiry.specialRequests ?? ""
  );

  const handleConfirm = () => {
    if (!propertyId) {
      toast.error(t("selectUnit"));
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error(t("selectDates"));
      return;
    }
    startTransition(async () => {
      const r = await convertInquiryToReservation(inquiry.id, {
        propertyId,
        guestName,
        guestEmail,
        guestPhone: guestPhone || undefined,
        guestNationality: guestNationality || undefined,
        numberOfGuests,
        checkIn,
        checkOut,
        specialRequests: specialRequests || undefined,
        source: "direct",
      });
      if (r.success) {
        toast.success(t("success"));
        onConverted();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border/40 px-6 py-4">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label>{t("unit")}</Label>
            {units.length > 0 ? (
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="cursor-pointer">
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                {t("noUnits")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("guestName")}</Label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("phone")}</Label>
              <Input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("nationality")}</Label>
              <Input
                value={guestNationality}
                onChange={(e) => setGuestNationality(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("guests")}</Label>
              <Input
                type="number"
                min={1}
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Number(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("checkIn")}</Label>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("checkOut")}</Label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("specialRequests")}</Label>
            <Textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <SheetFooter className="border-t border-border/40 px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isPending}
            disabled={units.length === 0}
            className="cursor-pointer"
          >
            {t("confirm")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
