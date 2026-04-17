"use client";

import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Clock,
  DoorOpen,
  Globe,
  Key,
  MapPin,
  Ruler,
  Users,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/lib/i18n/navigation";
import { createSingleUnitProperty } from "@/server_actions/locations";

const CHECK_IN_METHODS = ["personal", "lockbox", "smartlock", "reception"] as const;

export function SinglePropertyForm() {
  const t = useTranslations("Admin.propertySetup.singleForm");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Basic info
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Greece");

  // Check-in details
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [checkInMethod, setCheckInMethod] = useState("");
  const [entryInstructions, setEntryInstructions] = useState("");

  // WiFi
  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Apartment details
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");
  const [beds, setBeds] = useState<number | "">("");
  const [maxGuests, setMaxGuests] = useState<number | "">("");
  const [squareMeters, setSquareMeters] = useState<number | "">("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    startTransition(async () => {
      const result = await createSingleUnitProperty({
        name: name.trim(),
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        checkInMethod: checkInMethod || undefined,
        buildingAccess: entryInstructions || undefined,
        checkInTime,
        checkOutTime,
        wifiName: wifiName || undefined,
        wifiPassword: wifiPassword || undefined,
        bedrooms: bedrooms || undefined,
        bathrooms: bathrooms || undefined,
        beds: beds || undefined,
        maxGuests: maxGuests || undefined,
        squareMeters: squareMeters || undefined,
      });

      if (result.success) {
        toast.success(t("created"));
        router.push("/admin/properties");
      } else {
        toast.error(result.error);
      }
    });
  };

  const numChange = (setter: (v: number | "") => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setter(val === "" ? "" : parseInt(val, 10) || "");
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Section 1 — Basic info */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8">
        <h3 className="text-lg font-semibold">{t("basicInfo")}</h3>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {t("nameHint")}
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              <Building2 className="inline size-3.5" /> {t("name")} *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>
              <MapPin className="inline size-3.5" /> {t("address")}
            </Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("addressPlaceholder")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("city")}</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>
                <Globe className="inline size-3.5" /> {t("country")}
              </Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 — Check-in details */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8">
        <h3 className="text-lg font-semibold">{t("checkInDetails")}</h3>

        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                <Clock className="inline size-3.5" /> {t("checkInTime")}
              </Label>
              <Input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                <Clock className="inline size-3.5" /> {t("checkOutTime")}
              </Label>
              <Input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>
              <DoorOpen className="inline size-3.5" /> {t("checkInMethod")}
            </Label>
            <RadioGroup value={checkInMethod} onValueChange={setCheckInMethod}>
              {CHECK_IN_METHODS.map((method) => (
                <div key={method} className="flex items-center gap-3">
                  <RadioGroupItem value={method} id={`method-${method}`} className="cursor-pointer" />
                  <Label htmlFor={`method-${method}`} className="cursor-pointer font-normal">
                    {t(`method${method.charAt(0).toUpperCase() + method.slice(1)}` as never)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>{t("entryInstructions")}</Label>
            <Textarea
              value={entryInstructions}
              onChange={(e) => setEntryInstructions(e.target.value)}
              placeholder={t("entryPlaceholder")}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Section 3 — WiFi */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8">
        <h3 className="text-lg font-semibold">{t("wifi")}</h3>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {t("wifiHint")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              <Wifi className="inline size-3.5" /> {t("wifiName")}
            </Label>
            <Input
              value={wifiName}
              onChange={(e) => setWifiName(e.target.value)}
              placeholder={t("wifiNamePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>
              <Key className="inline size-3.5" /> {t("wifiPassword")}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 — Apartment details */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8">
        <h3 className="text-lg font-semibold">{t("apartmentDetails")}</h3>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>
                <BedDouble className="inline size-3.5" /> {t("bedrooms")}
              </Label>
              <Input
                type="number"
                min={0}
                value={bedrooms}
                onChange={numChange(setBedrooms)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                <Bath className="inline size-3.5" /> {t("bathrooms")}
              </Label>
              <Input
                type="number"
                min={0}
                value={bathrooms}
                onChange={numChange(setBathrooms)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("beds")}</Label>
              <Input
                type="number"
                min={0}
                value={beds}
                onChange={numChange(setBeds)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                <Users className="inline size-3.5" /> {t("maxGuests")}
              </Label>
              <Input
                type="number"
                min={1}
                value={maxGuests}
                onChange={numChange(setMaxGuests)}
              />
            </div>
          </div>
          <div className="max-w-[200px] space-y-2">
            <Label>
              <Ruler className="inline size-3.5" /> {t("size")}
            </Label>
            <Input
              type="number"
              min={0}
              value={squareMeters}
              onChange={numChange(setSquareMeters)}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        loading={isPending}
        className="w-full cursor-pointer"
        size="lg"
        disabled={!name.trim()}
      >
        {t("submit")}
        <ArrowRight className="ml-1 size-4" />
      </Button>
    </div>
  );
}
