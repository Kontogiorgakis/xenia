"use client";

import {
  ArrowRight,
  Building2,
  Globe,
  Info,
  MapPin,
  Save,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GUEST_BASE_URL } from "@/lib/admin/constants";
import type { Location } from "@/lib/db";
import { generateSlug } from "@/lib/general/slug";
import { scrollAdminShellTop } from "@/lib/general/utils";
import { useRouter } from "@/lib/i18n/navigation";
import { createLocation, updateLocation } from "@/server_actions/locations";

import { AmenitiesTab } from "./location-tabs/amenities-tab";
import { BookingSettingsTab } from "./location-tabs/booking-settings-tab";
import { PhotosTab } from "./location-tabs/photos-tab";
import { RulesTab } from "./location-tabs/rules-tab";
import { WizardSteps } from "./wizard-steps";

const TAB_KEYS = ["basic", "photos", "facilities", "houseRules", "bookingSettings"] as const;
type TabKey = (typeof TAB_KEYS)[number];

interface LocationFormProps {
  initialData?: Location;
}

export function LocationForm({ initialData }: LocationFormProps) {
  const t = useTranslations("Admin.locations");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "basic";
    const q = new URLSearchParams(window.location.search).get("tab");
    return (TAB_KEYS as readonly string[]).includes(q ?? "") ? (q as TabKey) : "basic";
  });

  const [name, setName] = useState(initialData?.name ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "Greece");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  const handleNameBlur = () => {
    if (!isEditing && name) setSlug(generateSlug(name));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    startTransition(async () => {
      const data = {
        name: name.trim(),
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        description: description.trim() || null,
      };

      if (isEditing) {
        const result = await updateLocation(initialData.id, data);
        if (result.success) {
          toast.success(t("updated"));
          router.push("/admin/properties");
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createLocation(data);
        if (result.success && result.location) {
          toast.success(t("created"));
          router.push(`/admin/units/new?propertyId=${result.location.id}&firstUnit=1`);
        } else {
          toast.error(result.error);
        }
      }
    });
  };

  // Create mode: simplified single-tab flow (basic info only, redirect to unit after)
  if (!isEditing) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <WizardSteps
          currentStep={1}
          steps={[
            { number: 1, title: t("wizard.step1Title"), description: t("wizard.step1Desc") },
            { number: 2, title: t("wizard.step2Title"), description: t("wizard.step2Desc") },
          ]}
        />

        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8">
          <h3 className="text-lg font-semibold">{t("wizard.propertyBasics")}</h3>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            {t("wizard.propertyBasicsHint")}
          </p>

          <div className="mb-6 flex items-start gap-3 rounded-lg bg-primary/5 p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">{t("wizard.singleUnitNote")}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                <Building2 className="inline size-3.5" /> {t("basic.name")}
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                placeholder={t("basic.namePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                <MapPin className="inline size-3.5" /> {t("basic.address")}
              </Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("basic.city")}</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>
                  <Globe className="inline size-3.5" /> {t("basic.country")}
                </Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
            {slug && (
              <p className="text-sm text-muted-foreground">
                {t("basic.guestUrl")}:{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  {GUEST_BASE_URL}/{slug}
                </code>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            onClick={handleSubmit}
            loading={isPending}
            className="cursor-pointer"
            size="lg"
          >
            {isPending ? t("saving") : t("nextAddUnit")}
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      orientation="vertical"
      onValueChange={(v) => {
        setActiveTab(v as TabKey);
        scrollAdminShellTop();
      }}
      className="flex flex-col gap-6 lg:flex-row lg:items-start"
    >
      <TabsList className="flex h-auto gap-1 overflow-x-auto bg-transparent p-0 lg:sticky lg:top-6 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible">
        {TAB_KEYS.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="cursor-pointer justify-start whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground lg:w-full"
          >
            {t(`tabs.${tab}` as never)}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="min-w-0 flex-1 space-y-6">
        <TabsContent
          value="basic"
          className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                <Building2 className="inline size-3.5" /> {t("basic.name")}
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                placeholder={t("basic.namePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                <MapPin className="inline size-3.5" /> {t("basic.address")}
              </Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("basic.city")}</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>
                  <Globe className="inline size-3.5" /> {t("basic.country")}
                </Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("basic.description")}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("basic.descriptionPlaceholder")}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {t("basic.descriptionHint")}
              </p>
            </div>
            {slug && (
              <p className="text-sm text-muted-foreground">
                {t("basic.guestUrl")}:{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  {GUEST_BASE_URL}/{slug}
                </code>
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="photos"
          className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8"
        >
          {initialData && (
            <PhotosTab
              locationId={initialData.id}
              initialCoverPhoto={initialData.coverPhoto}
              initialPhotos={initialData.photos}
            />
          )}
        </TabsContent>

        <TabsContent
          value="facilities"
          className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8"
        >
          {initialData && (
            <AmenitiesTab
              locationId={initialData.id}
              initialAmenities={initialData.amenities}
            />
          )}
        </TabsContent>

        <TabsContent
          value="houseRules"
          className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8"
        >
          {initialData && (
            <RulesTab
              locationId={initialData.id}
              initialData={{
                rules: initialData.rules,
                checkInTime: initialData.checkInTime,
                checkOutTime: initialData.checkOutTime,
                quietHoursStart: initialData.quietHoursStart,
                quietHoursEnd: initialData.quietHoursEnd,
                gateCode: initialData.gateCode,
                parkingInfo: initialData.parkingInfo,
                buildingAccess: initialData.buildingAccess,
                emergencyPhone: initialData.emergencyPhone,
                localTips: initialData.localTips,
                smokingPolicy: initialData.smokingPolicy,
                petsPolicy: initialData.petsPolicy,
                partiesPolicy: initialData.partiesPolicy,
                childrenPolicy: initialData.childrenPolicy,
                maxGuests: initialData.maxGuests,
              }}
            />
          )}
        </TabsContent>

        <TabsContent
          value="bookingSettings"
          className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8"
        >
          {initialData && (
            <BookingSettingsTab
              locationId={initialData.id}
              initialData={{
                baseNightlyRate: initialData.baseNightlyRate,
                cleaningFee: initialData.cleaningFee,
                cityTax: initialData.cityTax,
                securityDeposit: initialData.securityDeposit,
                minStayDefault: initialData.minStayDefault,
                minStayPeak: initialData.minStayPeak,
                peakSeasonStart: initialData.peakSeasonStart,
                peakSeasonEnd: initialData.peakSeasonEnd,
                instantBook: initialData.instantBook,
                cancellationPolicy: initialData.cancellationPolicy,
                advanceNotice: initialData.advanceNotice,
                bookingWindow: initialData.bookingWindow,
                paymentMethod: initialData.paymentMethod,
                depositPercent: initialData.depositPercent,
              }}
            />
          )}
        </TabsContent>

        {activeTab === "basic" && (
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              loading={isPending}
              icon={<Save className="size-4" />}
              className="cursor-pointer"
              size="lg"
            >
              {isPending ? t("saving") : t("save")}
            </Button>
          </div>
        )}
      </div>
    </Tabs>
  );
}
