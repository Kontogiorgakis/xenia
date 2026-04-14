"use client";

import { CalendarDays, MessageCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { createManualInquiry, type InquiryType } from "@/server_actions/inquiries";

interface LocationLite {
  id: string;
  name: string;
  properties: { id: string; name: string }[];
}

interface ManualInquirySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: LocationLite[];
  onCreated: () => void;
}

export function ManualInquirySheet({
  open,
  onOpenChange,
  locations,
  onCreated,
}: ManualInquirySheetProps) {
  const t = useTranslations("Admin.inbox.manual");
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<InquiryType>("booking");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestNationality, setGuestNationality] = useState("");
  const [message, setMessage] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState("");

  const reset = () => {
    setType("booking");
    setLocationId(locations[0]?.id ?? "");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setGuestNationality("");
    setMessage("");
    setCheckIn("");
    setCheckOut("");
    setNumberOfGuests(1);
    setSpecialRequests("");
  };

  const handleSave = () => {
    if (!guestName.trim() || !guestEmail.trim()) {
      toast.error(t("missingRequired"));
      return;
    }
    if (!locationId) {
      toast.error(t("selectProperty"));
      return;
    }
    if (type === "booking" && (!checkIn || !checkOut)) {
      toast.error(t("selectDates"));
      return;
    }

    startTransition(async () => {
      const r = await createManualInquiry({
        locationId,
        type,
        guestName,
        guestEmail,
        guestPhone: guestPhone || undefined,
        guestNationality: guestNationality || undefined,
        message: message || undefined,
        checkIn: type === "booking" ? checkIn : undefined,
        checkOut: type === "booking" ? checkOut : undefined,
        numberOfGuests: type === "booking" ? numberOfGuests : undefined,
        specialRequests: specialRequests || undefined,
      });

      if (r.success) {
        toast.success(t("created"));
        reset();
        onOpenChange(false);
        onCreated();
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
          <SheetDescription>{t("hint")}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label>{t("type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("booking")}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
                  type === "booking"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:bg-muted/50"
                )}
              >
                <CalendarDays className="size-4" />
                {t("typeBooking")}
              </button>
              <button
                type="button"
                onClick={() => setType("question")}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
                  type === "question"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:bg-muted/50"
                )}
              >
                <MessageCircle className="size-4" />
                {t("typeQuestion")}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("property")}</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="cursor-pointer">
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                {t("guestName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("email")} <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("phone")}</Label>
              <Input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("nationality")}</Label>
              <Input
                value={guestNationality}
                onChange={(e) => setGuestNationality(e.target.value)}
              />
            </div>
          </div>

          {type === "booking" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    {t("checkIn")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("checkOut")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("numberOfGuests")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(Number(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("specialRequests")}</Label>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>{t("message")}</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
            onClick={handleSave}
            loading={isPending}
            className="cursor-pointer"
          >
            {t("save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
