"use client";

import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { updateLocation } from "@/server_actions/locations";

interface BookingSettingsTabProps {
  locationId: string;
  initialData: {
    baseNightlyRate: number | null;
    cleaningFee: number | null;
    cityTax: number | null;
    securityDeposit: number | null;
    minStayDefault: number | null;
    minStayPeak: number | null;
    peakSeasonStart: string | null;
    peakSeasonEnd: string | null;
    instantBook: boolean;
    cancellationPolicy: string | null;
    advanceNotice: number | null;
    bookingWindow: number | null;
    paymentMethod: string | null;
    depositPercent: number | null;
  };
}

const num = (s: string) => (s ? parseFloat(s) : null);
const int = (s: string) => (s ? parseInt(s, 10) : null);
const str = (n: number | null) => (n != null ? String(n) : "");

export function BookingSettingsTab({
  locationId,
  initialData,
}: BookingSettingsTabProps) {
  const t = useTranslations("Admin.locations.bookingSettings");
  const tl = useTranslations("Admin.locations");
  const [isPending, startTransition] = useTransition();

  const [baseRate, setBaseRate] = useState(str(initialData.baseNightlyRate));
  const [cleaningFee, setCleaningFee] = useState(str(initialData.cleaningFee));
  const [cityTax, setCityTax] = useState(str(initialData.cityTax));
  const [deposit, setDeposit] = useState(str(initialData.securityDeposit));
  const [minStayDefault, setMinStayDefault] = useState(str(initialData.minStayDefault));
  const [minStayPeak, setMinStayPeak] = useState(str(initialData.minStayPeak));
  const [peakStart, setPeakStart] = useState(initialData.peakSeasonStart ?? "");
  const [peakEnd, setPeakEnd] = useState(initialData.peakSeasonEnd ?? "");
  const [instantBook, setInstantBook] = useState(initialData.instantBook);
  const [cancellation, setCancellation] = useState(initialData.cancellationPolicy ?? "moderate");
  const [advanceNotice, setAdvanceNotice] = useState(str(initialData.advanceNotice ?? 1));
  const [bookingWindow, setBookingWindow] = useState(str(initialData.bookingWindow ?? 365));
  const [paymentMethod, setPaymentMethod] = useState(initialData.paymentMethod ?? "full");
  const [depositPercent, setDepositPercent] = useState(str(initialData.depositPercent ?? 30));

  const save = () => {
    startTransition(async () => {
      const result = await updateLocation(locationId, {
        baseNightlyRate: num(baseRate),
        cleaningFee: num(cleaningFee),
        cityTax: num(cityTax),
        securityDeposit: num(deposit),
        minStayDefault: int(minStayDefault),
        minStayPeak: int(minStayPeak),
        peakSeasonStart: peakStart || null,
        peakSeasonEnd: peakEnd || null,
        instantBook,
        cancellationPolicy: cancellation,
        advanceNotice: int(advanceNotice),
        bookingWindow: int(bookingWindow),
        paymentMethod,
        depositPercent: int(depositPercent),
      });
      if (result.success) toast.success(tl("updated"));
      else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-8">
      {/* Pricing */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">{t("pricing")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("baseRate")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("baseRateHint")}</p>
          </div>
          <div className="space-y-2">
            <Label>{t("cleaningFee")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("cityTax")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={cityTax}
                onChange={(e) => setCityTax(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("cityTaxHint")}</p>
          </div>
          <div className="space-y-2">
            <Label>{t("deposit")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Season */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">{t("season")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("peakStart")}</Label>
            <Input
              value={peakStart}
              onChange={(e) => setPeakStart(e.target.value)}
              placeholder="06-15"
            />
            <p className="text-xs text-muted-foreground">{t("seasonHint")}</p>
          </div>
          <div className="space-y-2">
            <Label>{t("peakEnd")}</Label>
            <Input
              value={peakEnd}
              onChange={(e) => setPeakEnd(e.target.value)}
              placeholder="09-15"
            />
          </div>
        </div>
        <Label>{t("minStay")}</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t("minStayDefault")}</Label>
            <Input
              type="number"
              min={1}
              value={minStayDefault}
              onChange={(e) => setMinStayDefault(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t("minStayPeak")}</Label>
            <Input
              type="number"
              min={1}
              value={minStayPeak}
              onChange={(e) => setMinStayPeak(e.target.value)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Rules */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">{t("rules")}</h3>

        <div className="flex items-start justify-between rounded-lg bg-muted/30 p-4">
          <div className="min-w-0 flex-1">
            <Label className="text-sm font-semibold">{t("instantBook")}</Label>
            <p className="text-xs text-muted-foreground">{t("instantBookHint")}</p>
          </div>
          <Switch
            checked={instantBook}
            onCheckedChange={setInstantBook}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <Label>{t("advanceNotice")}</Label>
          <ToggleGroup
            type="single"
            value={advanceNotice}
            onValueChange={(v) => v && setAdvanceNotice(v)}
            className="grid grid-cols-4 gap-1"
          >
            {["1", "2", "3", "7"].map((v) => (
              <ToggleGroupItem key={v} value={v} className="cursor-pointer">
                {v}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">{t("advanceNoticeHint")}</p>
        </div>

        <div className="space-y-2">
          <Label>{t("bookingWindow")}</Label>
          <ToggleGroup
            type="single"
            value={bookingWindow}
            onValueChange={(v) => v && setBookingWindow(v)}
            className="grid grid-cols-4 gap-1"
          >
            {[
              { v: "90", l: "90d" },
              { v: "180", l: "180d" },
              { v: "365", l: "1y" },
              { v: "730", l: "2y" },
            ].map((opt) => (
              <ToggleGroupItem key={opt.v} value={opt.v} className="cursor-pointer">
                {opt.l}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">{t("bookingWindowHint")}</p>
        </div>

        <div className="space-y-2">
          <Label>{t("cancellation")}</Label>
          <ToggleGroup
            type="single"
            value={cancellation}
            onValueChange={(v) => v && setCancellation(v)}
            className="grid grid-cols-3 gap-1"
          >
            <ToggleGroupItem value="flexible" className="cursor-pointer">
              {t("cancellationFlexible")}
            </ToggleGroupItem>
            <ToggleGroupItem value="moderate" className="cursor-pointer">
              {t("cancellationModerate")}
            </ToggleGroupItem>
            <ToggleGroupItem value="strict" className="cursor-pointer">
              {t("cancellationStrict")}
            </ToggleGroupItem>
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">
            {cancellation === "flexible" && t("cancellationFlexibleDesc")}
            {cancellation === "moderate" && t("cancellationModerateDesc")}
            {cancellation === "strict" && t("cancellationStrictDesc")}
          </p>
        </div>
      </section>

      <Separator />

      {/* Payment */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">{t("payment")}</h3>
        <ToggleGroup
          type="single"
          value={paymentMethod}
          onValueChange={(v) => v && setPaymentMethod(v)}
          className="grid grid-cols-2 gap-1"
        >
          <ToggleGroupItem value="full" className="cursor-pointer">
            {t("paymentFull")}
          </ToggleGroupItem>
          <ToggleGroupItem value="deposit" className="cursor-pointer">
            {t("paymentDeposit")}
          </ToggleGroupItem>
        </ToggleGroup>

        {paymentMethod === "deposit" && (
          <div className="max-w-xs space-y-2">
            <Label>{t("depositPercent")}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={depositPercent}
              onChange={(e) => setDepositPercent(e.target.value)}
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground">{t("stripeNote")}</p>
      </section>

      <div className="flex justify-end">
        <Button
          onClick={save}
          loading={isPending}
          icon={<Save className="size-4" />}
          className="cursor-pointer"
          size="lg"
        >
          {tl("save")}
        </Button>
      </div>
    </div>
  );
}
