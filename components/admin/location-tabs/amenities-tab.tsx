"use client";

import { Plus, Save, Trash2 } from "lucide-react";
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
import { parseJsonArray } from "@/lib/general/utils";
import { updateLocation } from "@/server_actions/locations";
import { AmenityCategory, XeniaAmenity } from "@/types/xenia";

const AMENITY_CATEGORIES: AmenityCategory[] = [
  "pool",
  "parking",
  "garden",
  "bbq",
  "gym",
  "spa",
  "laundry",
  "reception",
  "restaurant",
  "other",
];

const QUICK_AMENITIES: { category: AmenityCategory; name: string }[] = [
  { category: "pool", name: "Swimming pool" },
  { category: "parking", name: "Parking area" },
  { category: "bbq", name: "BBQ area" },
  { category: "garden", name: "Garden" },
  { category: "gym", name: "Gym" },
  { category: "laundry", name: "Laundry" },
];

interface AmenitiesTabProps {
  locationId: string;
  initialAmenities: string | null;
}

export function AmenitiesTab({ locationId, initialAmenities }: AmenitiesTabProps) {
  const t = useTranslations("Admin.locations");
  const [isPending, startTransition] = useTransition();

  const [amenities, setAmenities] = useState<XeniaAmenity[]>(() =>
    parseJsonArray<XeniaAmenity>(initialAmenities)
  );
  const [newCategory, setNewCategory] = useState<AmenityCategory>("pool");
  const [newName, setNewName] = useState("");
  const [newHours, setNewHours] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const addAmenity = (category?: AmenityCategory, name?: string) => {
    const cat = category ?? newCategory;
    const n = name ?? newName;
    if (!n.trim()) return;
    setAmenities((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        category: cat,
        name: n.trim(),
        hours: newHours || undefined,
        notes: newNotes || undefined,
      },
    ]);
    setNewName("");
    setNewHours("");
    setNewNotes("");
  };

  const removeAmenity = (id: string) => {
    setAmenities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateLocation(locationId, {
        amenities: JSON.stringify(amenities),
      });
      if (result.success) {
        toast.success(t("updated"));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t("amenities.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("amenities.subtitle")}</p>
      </div>

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
              {t(`amenities.categories.${qa.category}`)}
            </Button>
          ))}
        </div>
      </div>

      {amenities.length > 0 && (
        <div className="space-y-2">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
            >
              <div>
                <span className="font-medium">{amenity.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {t(`amenities.categories.${amenity.category}`)}
                </span>
                {amenity.hours && (
                  <span className="ml-2 text-xs text-muted-foreground">· {amenity.hours}</span>
                )}
                {amenity.notes && (
                  <span className="ml-2 text-xs text-muted-foreground">· {amenity.notes}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAmenity(amenity.id)}
                className="size-7 cursor-pointer"
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {amenities.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("amenities.noAmenities")}</p>
      )}

      <Separator />
      <div className="space-y-3">
        <Label className="font-medium">{t("amenities.add")}</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t("amenities.category")}</Label>
            <Select
              value={newCategory}
              onValueChange={(v) => setNewCategory(v as AmenityCategory)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AMENITY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="cursor-pointer">
                    {t(`amenities.categories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t("amenities.name")}</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Swimming pool"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t("amenities.hours")}</Label>
            <Input
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
              placeholder={t("amenities.hoursPlaceholder")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t("amenities.notes")}</Label>
            <Input
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder={t("amenities.notesPlaceholder")}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addAmenity()}
          className="cursor-pointer"
          icon={<Plus className="size-3" />}
        >
          {t("amenities.add")}
        </Button>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={isPending}
          icon={<Save className="size-4" />}
          className="cursor-pointer"
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
