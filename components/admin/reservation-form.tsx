"use client";

import {
  CalendarDays,
  Check,
  Copy,
  Mail,
  MessageCircle,
  Phone,
  Save,
  User,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GUEST_BASE_URL, RESERVATION_SOURCES } from "@/lib/admin/constants";
import { createReservation } from "@/server_actions/reservations";

interface ReservationFormProps {
  properties: { id: string; name: string }[];
}

export function ReservationForm({ properties }: ReservationFormProps) {
  const t = useTranslations("Admin.reservations");
  const [isPending, startTransition] = useTransition();
  const [created, setCreated] = useState<{
    guestToken: string;
    guestName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [propertyId, setPropertyId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestNationality, setGuestNationality] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [source, setSource] = useState("direct");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !propertyId || !checkIn || !checkOut) return;

    startTransition(async () => {
      const result = await createReservation({
        propertyId,
        guestName: guestName.trim(),
        guestEmail: guestEmail || undefined,
        guestPhone: guestPhone || undefined,
        guestNationality: guestNationality || undefined,
        numberOfGuests,
        checkIn,
        checkOut,
        specialRequests: specialRequests || undefined,
        source,
      });

      if (result.success && result.reservation) {
        toast.success(t("created"));
        setCreated({
          guestToken: result.reservation.guestToken,
          guestName: result.reservation.guestName,
        });
      } else {
        toast.error(result.error);
      }
    });
  };

  const guestUrl = created
    ? `${GUEST_BASE_URL}/${created.guestToken}`
    : "";

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => () => { if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current); }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    toast.success(t("linkCopied"));
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi ${created?.guestName}! Here's your guest page for your stay: ${guestUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  // Success screen
  if (created) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>{t("created")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("guestPageUrl")}</Label>
              <div className="flex gap-2">
                <Input value={guestUrl} readOnly />
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  icon={
                    copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )
                  }
                  className="cursor-pointer"
                >
                  {t("copyLink")}
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              icon={<MessageCircle className="size-4" />}
              className="w-full cursor-pointer"
            >
              {t("sendWhatsapp")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {/* Guest Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("guestDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              <User className="inline size-3.5" /> {t("guestName")}
            </Label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                <Mail className="inline size-3.5" /> {t("guestEmail")}
              </Label>
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                <Phone className="inline size-3.5" /> {t("guestPhone")}
              </Label>
              <Input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("nationality")}</Label>
              <Input
                value={guestNationality}
                onChange={(e) => setGuestNationality(e.target.value)}
                placeholder="e.g. Greek, German, British"
              />
            </div>
            <div className="space-y-2">
              <Label>
                <Users className="inline size-3.5" /> {t("numberOfGuests")}
              </Label>
              <Input
                type="number"
                min={1}
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stay Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("stayDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("property")}</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={t("selectProperty")} />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                <CalendarDays className="inline size-3.5" /> {t("checkIn")}
              </Label>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                <CalendarDays className="inline size-3.5" /> {t("checkOut")}
              </Label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("source")}</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={t("selectSource")} />
              </SelectTrigger>
              <SelectContent>
                {RESERVATION_SOURCES.map((s) => (
                  <SelectItem key={s} value={s} className="cursor-pointer">
                    {t(`sources.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("specialRequests")}</Label>
            <Textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder={t("specialRequestsPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        loading={isPending}
        icon={<Save className="size-4" />}
        className="w-full cursor-pointer"
      >
        {isPending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
