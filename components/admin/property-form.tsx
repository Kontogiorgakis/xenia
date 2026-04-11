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
  };
}

export function PropertyForm({ initialData }: PropertyFormProps) {
  const t = useTranslations("Admin.properties");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

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
      const data = {
        name: name.trim(),
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        wifiName: wifiName || undefined,
        wifiPassword: wifiPassword || undefined,
        checkInTime: checkInTime || undefined,
        checkOutTime: checkOutTime || undefined,
        houseRules: houseRules || undefined,
        description: description || undefined,
        localTips: localTips || undefined,
        emergencyPhone: emergencyPhone || undefined,
      };

      const result = isEditing
        ? await updateProperty(initialData.id, data)
        : await createProperty(data);

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
      {/* Basic Info */}
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

      {/* Guest Info */}
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

      {/* Local Tips */}
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

      {/* Emergency Contacts */}
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
