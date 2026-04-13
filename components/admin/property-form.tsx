"use client";

import {
  Building2,
  Globe,
  Key,
  MapPin,
  Phone,
  Save,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GUEST_BASE_URL } from "@/lib/admin/constants";
import { generateSlug } from "@/lib/general/slug";
import { useRouter } from "@/lib/i18n/navigation";
import { createProperty, updateProperty } from "@/server_actions/properties";

type LocationInfo = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string;
};

interface PropertyFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    city: string | null;
    country: string;
    wifiName: string | null;
    wifiPassword: string | null;
    checkInTime: string | null;
    checkOutTime: string | null;
    houseRules: string | null;
    description: string | null;
    localTips: string | null;
    emergencyPhone: string | null;
    squareMeters: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    beds: number | null;
    maxGuests: number | null;
    locationId: string | null;
    location?: LocationInfo | null;
  };
  // For create mode — when adding a property inside a location
  assignToLocation?: LocationInfo;
}

export function PropertyForm({ initialData, assignToLocation }: PropertyFormProps) {
  const t = useTranslations("Admin.properties");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const inheritedFromLocation = !!initialData?.locationId || !!assignToLocation;
  const location = initialData?.location ?? assignToLocation ?? null;

  const [name, setName] = useState(initialData?.name ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "Greece");
  const [wifiName, setWifiName] = useState(initialData?.wifiName ?? "");
  const [wifiPassword, setWifiPassword] = useState(
    initialData?.wifiPassword ?? ""
  );
  const [checkInTime, setCheckInTime] = useState(
    initialData?.checkInTime ?? "15:00"
  );
  const [checkOutTime, setCheckOutTime] = useState(
    initialData?.checkOutTime ?? "11:00"
  );
  const [houseRules, setHouseRules] = useState(initialData?.houseRules ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [localTips, setLocalTips] = useState(initialData?.localTips ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(
    initialData?.emergencyPhone ?? ""
  );
  const [squareMeters, setSquareMeters] = useState<string>(
    initialData?.squareMeters != null ? String(initialData.squareMeters) : ""
  );
  const [bedrooms, setBedrooms] = useState<string>(
    initialData?.bedrooms != null ? String(initialData.bedrooms) : ""
  );
  const [bathrooms, setBathrooms] = useState<string>(
    initialData?.bathrooms != null ? String(initialData.bathrooms) : ""
  );
  const [beds, setBeds] = useState<string>(
    initialData?.beds != null ? String(initialData.beds) : ""
  );
  const [maxGuests, setMaxGuests] = useState<string>(
    initialData?.maxGuests != null ? String(initialData.maxGuests) : ""
  );
  const [showPassword, setShowPassword] = useState(false);
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  const handleNameBlur = () => {
    if (!isEditing && name) {
      setSlug(generateSlug(name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const toNum = (s: string) => {
        const n = parseInt(s, 10);
        return Number.isFinite(n) ? n : undefined;
      };
      const data = {
        name: name.trim(),
        address: inheritedFromLocation ? undefined : address || undefined,
        city: inheritedFromLocation ? undefined : city || undefined,
        country: inheritedFromLocation ? undefined : country || undefined,
        wifiName: wifiName || undefined,
        wifiPassword: wifiPassword || undefined,
        checkInTime: inheritedFromLocation ? undefined : checkInTime || undefined,
        checkOutTime: inheritedFromLocation ? undefined : checkOutTime || undefined,
        houseRules: houseRules || undefined,
        description: description || undefined,
        localTips: inheritedFromLocation ? undefined : localTips || undefined,
        emergencyPhone: inheritedFromLocation ? undefined : emergencyPhone || undefined,
        squareMeters: toNum(squareMeters),
        bedrooms: toNum(bedrooms),
        bathrooms: toNum(bathrooms),
        beds: toNum(beds),
        maxGuests: toNum(maxGuests),
      };

      const result = isEditing
        ? await updateProperty(initialData.id, data)
        : await createProperty({
            ...data,
            locationId: assignToLocation?.id,
          });

      if (result.success) {
        toast.success(isEditing ? t("updated") : t("created"));
        router.push("/admin/properties");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              <Building2 className="inline size-3.5" /> {t("name")}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              required
            />
          </div>
          {inheritedFromLocation ? (
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">
                  {location?.address || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[location?.city, location?.country].filter(Boolean).join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("inheritedFromLocation", { name: location?.name ?? "" })}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>
                  <MapPin className="inline size-3.5" /> {t("address")}
                </Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          {slug && (
            <div className="text-sm text-muted-foreground">
              {t("guestUrl")}:{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                {GUEST_BASE_URL}/{slug}
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("guestInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("wifiDetails")}</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  <Wifi className="inline size-3.5" /> {t("wifiName")}
                </Label>
                <Input
                  value={wifiName}
                  onChange={(e) => setWifiName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {!inheritedFromLocation && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("checkInTime")}</Label>
                <Input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("checkOutTime")}</Label>
                <Input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("houseRules")}</Label>
            <Textarea
              value={houseRules}
              onChange={(e) => setHouseRules(e.target.value)}
              placeholder={t("houseRulesPlaceholder")}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("apartmentDetails")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("apartmentDetailsHint")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("squareMeters")}</Label>
              <Input
                type="number"
                min={0}
                value={squareMeters}
                onChange={(e) => setSquareMeters(e.target.value)}
                placeholder="75"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("maxGuests")}</Label>
              <Input
                type="number"
                min={1}
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                placeholder="4"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("bedrooms")}</Label>
              <Input
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="2"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("bathrooms")}</Label>
              <Input
                type="number"
                min={0}
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("beds")}</Label>
              <Input
                type="number"
                min={0}
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                placeholder="2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!inheritedFromLocation && (
        <Card>
          <CardHeader>
            <CardTitle>{t("localTips")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("localTipsHint")}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              value={localTips}
              onChange={(e) => setLocalTips(e.target.value)}
              placeholder={t("localTipsPlaceholder")}
              rows={6}
            />
            <p className="text-right text-xs text-muted-foreground">
              {localTips.length} characters
            </p>
          </CardContent>
        </Card>
      )}

      {!inheritedFromLocation && (
        <Card>
          <CardHeader>
            <CardTitle>{t("emergencyContacts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>
                <Phone className="inline size-3.5" /> {t("emergencyPhone")}
              </Label>
              <Input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

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
