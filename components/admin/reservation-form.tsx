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
import { GUEST_BASE_URL, RESERVATION_SOURCES, RESERVATION_STATUSES } from "@/lib/admin/constants";
import { formatDateForInput } from "@/lib/general/utils";
import { useRouter } from "@/lib/i18n/navigation";
import { getAvailableProperties } from "@/server_actions/properties";
import { createReservation, updateReservation } from "@/server_actions/reservations";

interface ReservationFormProps {
  properties: { id: string; name: string }[];
  initialData?: {
    id: string;
    propertyId: string;
    guestName: string;
    guestEmail: string | null;
    guestPhone: string | null;
    guestNationality: string | null;
    numberOfGuests: number;
    checkIn: Date | string;
    checkOut: Date | string;
    specialRequests: string | null;
    source: string;
    status: string;
    guestToken: string;
  };
}

export function ReservationForm({ properties, initialData }: ReservationFormProps) {
  const t = useTranslations("Admin.reservations");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const [created, setCreated] = useState<{
    guestToken: string;
    guestName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [propertyId, setPropertyId] = useState(initialData?.propertyId ?? "");
  const [availableProperties, setAvailableProperties] = useState<
    { id: string; name: string }[]
  >(isEditing ? properties : []);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [guestName, setGuestName] = useState(initialData?.guestName ?? "");
  const [guestEmail, setGuestEmail] = useState(initialData?.guestEmail ?? "");
  const [guestPhone, setGuestPhone] = useState(initialData?.guestPhone ?? "");
  const [guestNationality, setGuestNationality] = useState(initialData?.guestNationality ?? "");
  const [numberOfGuests, setNumberOfGuests] = useState(initialData?.numberOfGuests ?? 1);
  const [checkIn, setCheckIn] = useState(initialData ? formatDateForInput(initialData.checkIn) : "");
  const [checkOut, setCheckOut] = useState(initialData ? formatDateForInput(initialData.checkOut) : "");
  const [specialRequests, setSpecialRequests] = useState(initialData?.specialRequests ?? "");
  const [source, setSource] = useState(initialData?.source ?? "direct");
  const [status, setStatus] = useState(initialData?.status ?? "confirmed");

  // Fetch available properties when dates change (create mode only)
  useEffect(() => {
    if (isEditing) return;
    if (!checkIn || !checkOut) {
      setAvailableProperties([]);
      return;
    }
    let cancelled = false;
    setLoadingAvailability(true);
    // Debounce so rapid date-picker typing doesn't fire a request per keystroke
    const timer = setTimeout(() => {
      if (cancelled) return;
      getAvailableProperties(checkIn, checkOut).then((result) => {
        if (cancelled) return;
        const list = result.success ? result.properties : [];
        setAvailableProperties(list);
        setPropertyId((prev) => (list.some((p) => p.id === prev) ? prev : ""));
        setLoadingAvailability(false);
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkIn, checkOut, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !propertyId || !checkIn || !checkOut) return;

    startTransition(async () => {
      if (isEditing) {
        const result = await updateReservation(initialData.id, {
          guestName: guestName.trim(),
          guestEmail: guestEmail || undefined,
          guestPhone: guestPhone || undefined,
          guestNationality: guestNationality || undefined,
          numberOfGuests,
          checkIn,
          checkOut,
          specialRequests: specialRequests || undefined,
          source,
          status,
        });
        if (result.success) {
          toast.success(t("updated"));
          router.push("/admin/reservations");
        } else {
          toast.error(result.error);
        }
      } else {
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

      <Card>
        <CardHeader>
          <CardTitle>{t("stayDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {isEditing ? (
            <div className="space-y-2">
              <Label>{t("property")}</Label>
              <Select value={propertyId} onValueChange={setPropertyId} disabled>
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
          ) : checkIn && checkOut ? (
            loadingAvailability ? (
              <div className="space-y-2">
                <Label>{t("property")}</Label>
                <div className="flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                  {t("checkingAvailability")}
                </div>
              </div>
            ) : availableProperties.length === 0 ? (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {t("noPropertiesAvailable")}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{t("availableProperties")}</Label>
                <Select value={propertyId} onValueChange={setPropertyId}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder={t("selectProperty")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProperties.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("selectDatesFirst")}
            </p>
          )}
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
          {isEditing && (
            <div className="space-y-2">
              <Label>{t("status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESERVATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="cursor-pointer">
                      {t(`statuses.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
