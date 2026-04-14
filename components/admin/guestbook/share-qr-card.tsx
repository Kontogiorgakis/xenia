"use client";

import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Printer,
  QrCode as QrIcon,
  RotateCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState, useTransition } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { copyToClipboard } from "@/lib/general/clipboard";
import { downloadQrAsPng } from "@/lib/general/qr-download";
import {
  regenerateBookingToken,
  setBookingEnabled,
  setBookingMode,
  setUnitSelectionMode,
} from "@/server_actions/booking-settings";

interface BookingSettings {
  locationId: string;
  bookingToken: string;
  bookingEnabled: boolean;
  bookingMode: "instant_book" | "contact_only";
  unitSelectionMode: "auto_assign" | "guest_chooses";
}

interface ShareQrCardProps {
  url: string;
  propertyName: string;
  booking?: BookingSettings;
}

export function ShareQrCard({ url, propertyName, booking }: ShareQrCardProps) {
  const t = useTranslations("Admin.guestbook");
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [url, t]);

  const handleDownload = useCallback(() => {
    downloadQrAsPng(qrRef.current?.querySelector("svg") ?? null, propertyName);
  }, [propertyName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <QrIcon className="size-4" />
          {t("shareTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("guestPageUrl")}
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs">
              {url}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0 cursor-pointer"
              aria-label={t("copyLink")}
            >
              {copied ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div
            ref={qrRef}
            className="flex size-40 items-center justify-center rounded-xl border bg-white p-3"
          >
            <QRCode value={url} size={136} />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("qrInstructions")}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleDownload}
                icon={<Download className="size-4" />}
                className="cursor-pointer"
              >
                {t("downloadQr")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                icon={<Printer className="size-4" />}
                className="cursor-pointer"
              >
                {t("printQr")}
              </Button>
            </div>
          </div>
        </div>

        {booking && <BookingSection booking={booking} />}
      </CardContent>
    </Card>
  );
}

function BookingSection({ booking }: { booking: BookingSettings }) {
  const t = useTranslations("Admin.guestbook.booking");
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState(booking);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/book/${state.bookingToken}`
      : `/book/${state.bookingToken}`;

  const embedCode = `<iframe
  src="${bookingUrl.replace("/book/", "/widget/")}"
  width="100%"
  height="750"
  style="border:none;border-radius:12px;"
></iframe>`;

  const toggleEnabled = (enabled: boolean) => {
    setState((p) => ({ ...p, bookingEnabled: enabled }));
    startTransition(async () => {
      const r = await setBookingEnabled(state.locationId, enabled);
      if (!r.success) {
        toast.error(r.error ?? "Failed");
        setState((p) => ({ ...p, bookingEnabled: !enabled }));
      }
    });
  };

  const changeMode = (mode: BookingSettings["bookingMode"]) => {
    setState((p) => ({ ...p, bookingMode: mode }));
    startTransition(async () => {
      const r = await setBookingMode(state.locationId, mode);
      if (!r.success) toast.error(r.error ?? "Failed");
    });
  };

  const changeUnitMode = (mode: BookingSettings["unitSelectionMode"]) => {
    setState((p) => ({ ...p, unitSelectionMode: mode }));
    startTransition(async () => {
      const r = await setUnitSelectionMode(state.locationId, mode);
      if (!r.success) toast.error(r.error ?? "Failed");
    });
  };

  const handleRegenerate = () => {
    startTransition(async () => {
      const r = await regenerateBookingToken(state.locationId);
      if (r.success && r.token) {
        setState((p) => ({ ...p, bookingToken: r.token! }));
        setConfirmRegen(false);
        toast.success(t("regenerated"));
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  };

  return (
    <>
      <Separator className="my-6" />
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Link2 className="size-4" />
              {t("title")}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="booking-enabled" className="text-xs">
              {state.bookingEnabled ? t("enabled") : t("disabled")}
            </Label>
            <Switch
              id="booking-enabled"
              checked={state.bookingEnabled}
              onCheckedChange={toggleEnabled}
              disabled={isPending}
              className="cursor-pointer"
            />
          </div>
        </div>

        {state.bookingEnabled && (
          <>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("urlLabel")}
              </p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs">
                  {bookingUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(bookingUrl, t("copied"))}
                  className="shrink-0 cursor-pointer"
                  aria-label={t("copyLink")}
                >
                  <Copy className="size-4" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="shrink-0 cursor-pointer"
                  aria-label={t("open")}
                >
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("modeLabel")}
                </p>
                <RadioGroup
                  value={state.bookingMode}
                  onValueChange={(v) => changeMode(v as BookingSettings["bookingMode"])}
                  className="gap-2"
                >
                  <Label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/60 p-3 hover:bg-muted/40">
                    <RadioGroupItem value="instant_book" className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("instantBook")}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("instantBookHint")}
                      </p>
                    </div>
                  </Label>
                  <Label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/60 p-3 hover:bg-muted/40">
                    <RadioGroupItem value="contact_only" className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("contactOnly")}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("contactOnlyHint")}
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("unitModeLabel")}
                </p>
                <RadioGroup
                  value={state.unitSelectionMode}
                  onValueChange={(v) =>
                    changeUnitMode(v as BookingSettings["unitSelectionMode"])
                  }
                  className="gap-2"
                >
                  <Label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/60 p-3 hover:bg-muted/40">
                    <RadioGroupItem value="auto_assign" className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("autoAssign")}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("autoAssignHint")}
                      </p>
                    </div>
                  </Label>
                  <Label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/60 p-3 hover:bg-muted/40">
                    <RadioGroupItem value="guest_chooses" className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t("guestChooses")}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("guestChoosesHint")}
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("embedLabel")}
              </p>
              <p className="text-xs text-muted-foreground">{t("embedHint")}</p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[11px] leading-snug">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(embedCode, t("embedCopied"))}
                  className="absolute right-2 top-2 size-7 cursor-pointer"
                  aria-label={t("copyEmbed")}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-50 p-3 dark:bg-amber-950/20">
              <div>
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  {t("regenTitle")}
                </p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  {t("regenHint")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRegen(true)}
                icon={<RotateCcw className="size-3.5" />}
                className="cursor-pointer"
              >
                {t("regenerate")}
              </Button>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={confirmRegen} onOpenChange={setConfirmRegen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("regenConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("regenConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRegenerate();
              }}
              className="cursor-pointer"
            >
              {t("regenerate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
