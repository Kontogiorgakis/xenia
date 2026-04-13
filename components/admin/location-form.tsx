"use client";

import {
  Building2,
  Clock,
  Globe,
  Key,
  MapPin,
  ParkingCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GUEST_BASE_URL } from "@/lib/admin/constants";
import { generateSlug } from "@/lib/general/slug";
import { useRouter } from "@/lib/i18n/navigation";
import { createLocation, updateLocation } from "@/server_actions/locations";
import { XeniaAmenity, XeniaRule, AmenityCategory } from "@/types/xenia";

import { ContactsSection } from "./contacts-section";

const AMENITY_CATEGORIES: AmenityCategory[] = [
  "pool", "parking", "garden", "bbq", "gym", "spa", "laundry", "reception", "restaurant", "other",
];

const QUICK_AMENITIES: { category: AmenityCategory; name: string }[] = [
  { category: "pool", name: "Swimming pool" },
  { category: "parking", name: "Parking area" },
  { category: "bbq", name: "BBQ area" },
  { category: "garden", name: "Garden" },
  { category: "gym", name: "Gym" },
  { category: "laundry", name: "Laundry" },
];

const QUICK_RULES = [
  "No smoking",
  "No parties",
  "No pets",
  "Quiet after 23:00",
];

interface LocationFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    city: string | null;
    country: string;
    amenities: string | null;
    rules: string | null;
    gateCode: string | null;
    parkingInfo: string | null;
    buildingAccess: string | null;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    contacts: { id: string; category: string; name: string; phone: string; notes: string | null; icon: string | null; displayOrder: number }[];
  };
}

export function LocationForm({ initialData }: LocationFormProps) {
  const t = useTranslations("Admin.locations");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "Greece");
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  const [amenities, setAmenities] = useState<XeniaAmenity[]>(() => {
    if (!initialData?.amenities) return [];
    try {
      return JSON.parse(initialData.amenities);
    } catch (e) {
      console.error("Failed to parse amenities JSON:", e);
      return [];
    }
  });
  const [newAmenityCategory, setNewAmenityCategory] = useState<AmenityCategory>("pool");
  const [newAmenityName, setNewAmenityName] = useState("");
  const [newAmenityHours, setNewAmenityHours] = useState("");
  const [newAmenityNotes, setNewAmenityNotes] = useState("");

  const [rules, setRules] = useState<XeniaRule[]>(() => {
    if (!initialData?.rules) return [];
    try {
      return JSON.parse(initialData.rules);
    } catch (e) {
      console.error("Failed to parse rules JSON:", e);
      return [];
    }
  });
  const [newRuleText, setNewRuleText] = useState("");

  const [gateCode, setGateCode] = useState(initialData?.gateCode ?? "");
  const [parkingInfo, setParkingInfo] = useState(initialData?.parkingInfo ?? "");
  const [buildingAccess, setBuildingAccess] = useState(initialData?.buildingAccess ?? "");
  const [quietStart, setQuietStart] = useState(initialData?.quietHoursStart ?? "23:00");
  const [quietEnd, setQuietEnd] = useState(initialData?.quietHoursEnd ?? "08:00");

  const handleNameBlur = () => {
    if (!isEditing && name) setSlug(generateSlug(name));
  };

  const addAmenity = (category?: AmenityCategory, amenityName?: string) => {
    const cat = category ?? newAmenityCategory;
    const n = amenityName ?? newAmenityName;
    if (!n.trim()) return;
    setAmenities((prev) => [
      ...prev,
      { id: crypto.randomUUID(), category: cat, name: n.trim(), hours: newAmenityHours || undefined, notes: newAmenityNotes || undefined },
    ]);
    setNewAmenityName("");
    setNewAmenityHours("");
    setNewAmenityNotes("");
  };

  const removeAmenity = (id: string) => {
    setAmenities((prev) => prev.filter((a) => a.id !== id));
  };

  const addRule = (text?: string) => {
    const ruleText = text ?? newRuleText;
    if (!ruleText.trim()) return;
    setRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), category: "general", text: ruleText.trim() },
    ]);
    setNewRuleText("");
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    startTransition(async () => {
      const data = {
        name: name.trim(),
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        amenities: JSON.stringify(amenities),
        rules: JSON.stringify(rules),
        gateCode: gateCode || undefined,
        parkingInfo: parkingInfo || undefined,
        buildingAccess: buildingAccess || undefined,
        quietHoursStart: quietStart || undefined,
        quietHoursEnd: quietEnd || undefined,
      };

      const result = isEditing
        ? await updateLocation(initialData.id, data)
        : await createLocation(data);

      if (result.success) {
        toast.success(isEditing ? t("updated") : t("created"));
        router.push("/admin/properties");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="basic" className="cursor-pointer">{t("tabs.basic")}</TabsTrigger>
        <TabsTrigger value="amenities" className="cursor-pointer">{t("tabs.amenities")}</TabsTrigger>
        <TabsTrigger value="rules" className="cursor-pointer">{t("tabs.rules")}</TabsTrigger>
        {isEditing && (
          <TabsTrigger value="contacts" className="cursor-pointer">{t("tabs.contacts")}</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="basic" className="space-y-6">
        <div className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label><Building2 className="inline size-3.5" /> {t("basic.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameBlur} placeholder={t("basic.namePlaceholder")} required />
          </div>
          <div className="space-y-2">
            <Label><MapPin className="inline size-3.5" /> {t("basic.address")}</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("basic.city")}</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label><Globe className="inline size-3.5" /> {t("basic.country")}</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>
          {slug && (
            <p className="text-sm text-muted-foreground">
              {t("basic.guestUrl")}: <code className="rounded bg-muted px-1 py-0.5">{GUEST_BASE_URL}/{slug}</code>
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="amenities" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">{t("amenities.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("amenities.subtitle")}</p>
        </div>

        {/* Quick add */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t("amenities.quickAdd")}</Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMENITIES.map((qa) => (
              <Button
                key={qa.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAmenity(qa.category, qa.name)}
                className="cursor-pointer"
                icon={<Plus className="size-3" />}
              >
                {t(`amenities.categories.${qa.category}` as never)}
              </Button>
            ))}
          </div>
        </div>

        {/* Existing amenities */}
        {amenities.length > 0 && (
          <div className="space-y-2">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div>
                  <span className="font-medium">{amenity.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {t(`amenities.categories.${amenity.category}` as never)}
                  </span>
                  {amenity.hours && <span className="ml-2 text-xs text-muted-foreground">· {amenity.hours}</span>}
                  {amenity.notes && <span className="ml-2 text-xs text-muted-foreground">· {amenity.notes}</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAmenity(amenity.id)} className="size-7 cursor-pointer">
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {amenities.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("amenities.noAmenities")}</p>
        )}

        {/* Add amenity form */}
        <Separator />
        <div className="max-w-xl space-y-3">
          <Label className="font-medium">{t("amenities.add")}</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("amenities.category")}</Label>
              <Select value={newAmenityCategory} onValueChange={(v) => setNewAmenityCategory(v as AmenityCategory)}>
                <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AMENITY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="cursor-pointer">{t(`amenities.categories.${c}` as never)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("amenities.name")}</Label>
              <Input value={newAmenityName} onChange={(e) => setNewAmenityName(e.target.value)} placeholder="e.g. Swimming pool" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("amenities.hours")}</Label>
              <Input value={newAmenityHours} onChange={(e) => setNewAmenityHours(e.target.value)} placeholder={t("amenities.hoursPlaceholder")} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("amenities.notes")}</Label>
              <Input value={newAmenityNotes} onChange={(e) => setNewAmenityNotes(e.target.value)} placeholder={t("amenities.notesPlaceholder")} />
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => addAmenity()} className="cursor-pointer" icon={<Plus className="size-3" />}>
            {t("amenities.add")}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="rules" className="space-y-6">
        <h3 className="text-lg font-semibold">{t("rules.title")}</h3>

        <div className="max-w-xl space-y-6">
          {/* Quiet hours */}
          <div className="space-y-2">
            <Label><Clock className="inline size-3.5" /> {t("rules.quietHours")}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("rules.quietStart")}</Label>
                <Input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("rules.quietEnd")}</Label>
                <Input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Access info */}
          <div className="space-y-4">
            <Label className="font-medium">{t("rules.access")}</Label>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground"><Key className="inline size-3.5" /> {t("rules.gateCode")}</Label>
              <Input value={gateCode} onChange={(e) => setGateCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground"><ParkingCircle className="inline size-3.5" /> {t("rules.parkingInfo")}</Label>
              <Input value={parkingInfo} onChange={(e) => setParkingInfo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t("rules.buildingAccess")}</Label>
              <Textarea value={buildingAccess} onChange={(e) => setBuildingAccess(e.target.value)} placeholder={t("rules.buildingAccessPlaceholder")} rows={3} />
            </div>
          </div>

          <Separator />

          {/* House rules */}
          <div className="space-y-3">
            <Label className="font-medium">{t("rules.houseRules")}</Label>

            {/* Quick add rules */}
            <div className="flex flex-wrap gap-2">
              {QUICK_RULES.map((rule) => (
                <Button key={rule} type="button" variant="outline" size="sm" onClick={() => addRule(rule)} className="cursor-pointer" icon={<Plus className="size-3" />}>
                  {rule}
                </Button>
              ))}
            </div>

            {/* Existing rules */}
            {rules.length > 0 && (
              <div className="space-y-1">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
                    <span className="text-sm">{rule.text}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)} className="size-7 cursor-pointer">
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {rules.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("rules.noRules")}</p>
            )}

            {/* Add rule */}
            <div className="flex gap-2">
              <Input value={newRuleText} onChange={(e) => setNewRuleText(e.target.value)} placeholder={t("rules.rulePlaceholder")} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())} />
              <Button type="button" variant="outline" size="sm" onClick={() => addRule()} className="shrink-0 cursor-pointer" icon={<Plus className="size-3" />}>
                {t("rules.addRule")}
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {isEditing && (
        <TabsContent value="contacts">
          <ContactsSection locationId={initialData.id} initialContacts={initialData.contacts} />
        </TabsContent>
      )}

      <Button
        onClick={handleSubmit}
        loading={isPending}
        icon={<Save className="size-4" />}
        className="cursor-pointer"
      >
        {isPending ? t("saving") : t("save")}
      </Button>
    </Tabs>
  );
}
