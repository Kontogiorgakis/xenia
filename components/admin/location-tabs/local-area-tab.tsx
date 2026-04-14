"use client";

import {
  Hospital,
  Landmark,
  Pill,
  Plane,
  Save,
  ShoppingCart,
  TreePalm,
  Waves,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLocation } from "@/server_actions/locations";

interface LocalAreaTabProps {
  locationId: string;
  initialData: {
    nearestBeach: string | null;
    nearestSupermarket: string | null;
    nearestPharmacy: string | null;
    nearestHospital: string | null;
    nearestAtm: string | null;
    distanceAirport: string | null;
    distanceCenter: string | null;
  };
}

export function LocalAreaTab({ locationId, initialData }: LocalAreaTabProps) {
  const t = useTranslations("Admin.locations.localArea");
  const tl = useTranslations("Admin.locations");
  const [isPending, startTransition] = useTransition();

  const [beach, setBeach] = useState(initialData.nearestBeach ?? "");
  const [supermarket, setSupermarket] = useState(initialData.nearestSupermarket ?? "");
  const [pharmacy, setPharmacy] = useState(initialData.nearestPharmacy ?? "");
  const [hospital, setHospital] = useState(initialData.nearestHospital ?? "");
  const [atm, setAtm] = useState(initialData.nearestAtm ?? "");
  const [airport, setAirport] = useState(initialData.distanceAirport ?? "");
  const [center, setCenter] = useState(initialData.distanceCenter ?? "");

  const save = () => {
    startTransition(async () => {
      const result = await updateLocation(locationId, {
        nearestBeach: beach || null,
        nearestSupermarket: supermarket || null,
        nearestPharmacy: pharmacy || null,
        nearestHospital: hospital || null,
        nearestAtm: atm || null,
        distanceAirport: airport || null,
        distanceCenter: center || null,
      });
      if (result.success) toast.success(tl("updated"));
      else toast.error(result.error);
    });
  };

  const fields = [
    { icon: Waves, label: t("beach"), value: beach, set: setBeach },
    { icon: ShoppingCart, label: t("supermarket"), value: supermarket, set: setSupermarket },
    { icon: Pill, label: t("pharmacy"), value: pharmacy, set: setPharmacy },
    { icon: Hospital, label: t("hospital"), value: hospital, set: setHospital },
    { icon: Landmark, label: t("atm"), value: atm, set: setAtm },
    { icon: Plane, label: t("airport"), value: airport, set: setAirport },
    { icon: TreePalm, label: t("center"), value: center, set: setCenter },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.label} className="space-y-2">
            <Label>
              <field.icon className="inline size-3.5" /> {field.label}
            </Label>
            <Input
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={t("placeholder")}
            />
          </div>
        ))}
      </div>

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
