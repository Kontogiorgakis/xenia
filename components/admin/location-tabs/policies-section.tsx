"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { updateLocation } from "@/server_actions/locations";

interface PoliciesSectionProps {
  locationId: string;
  initialData: {
    smokingPolicy: string | null;
    petsPolicy: string | null;
    partiesPolicy: string | null;
    childrenPolicy: string | null;
    maxGuests: number | null;
  };
}

export function PoliciesSection({ locationId, initialData }: PoliciesSectionProps) {
  const t = useTranslations("Admin.locations.policies");
  const tl = useTranslations("Admin.locations");
  const [isPending, startTransition] = useTransition();

  const [smoking, setSmoking] = useState(initialData.smokingPolicy ?? "not_allowed");
  const [pets, setPets] = useState(initialData.petsPolicy ?? "not_allowed");
  const [parties, setParties] = useState(initialData.partiesPolicy ?? "not_allowed");
  const [children, setChildren] = useState(initialData.childrenPolicy ?? "welcome");
  const [maxGuests, setMaxGuests] = useState<string>(
    initialData.maxGuests != null ? String(initialData.maxGuests) : ""
  );

  const save = () => {
    startTransition(async () => {
      const result = await updateLocation(locationId, {
        smokingPolicy: smoking,
        petsPolicy: pets,
        partiesPolicy: parties,
        childrenPolicy: children,
        maxGuests: maxGuests ? parseInt(maxGuests, 10) : null,
      });
      if (result.success) toast.success(tl("updated"));
      else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <PolicyRow
          label={t("smoking")}
          value={smoking}
          onChange={setSmoking}
          options={[
            { value: "not_allowed", label: t("smoking_not_allowed") },
            { value: "outside", label: t("smoking_outside") },
            { value: "allowed", label: t("smoking_allowed") },
          ]}
        />
        <PolicyRow
          label={t("pets")}
          value={pets}
          onChange={setPets}
          options={[
            { value: "not_allowed", label: t("pets_not_allowed") },
            { value: "small_only", label: t("pets_small_only") },
            { value: "allowed", label: t("pets_allowed") },
          ]}
        />
        <PolicyRow
          label={t("parties")}
          value={parties}
          onChange={setParties}
          options={[
            { value: "not_allowed", label: t("parties_not_allowed") },
            { value: "allowed_with_notice", label: t("parties_allowed_with_notice") },
            { value: "allowed", label: t("parties_allowed") },
          ]}
        />
        <PolicyRow
          label={t("children")}
          value={children}
          onChange={setChildren}
          options={[
            { value: "welcome", label: t("children_welcome") },
            { value: "not_suitable", label: t("children_not_suitable") },
            { value: "over_12", label: t("children_over_12") },
          ]}
        />
      </div>

      <div className="max-w-xs space-y-2">
        <Label>{t("maxGuests")}</Label>
        <Input
          type="number"
          min={0}
          value={maxGuests}
          onChange={(e) => setMaxGuests(e.target.value)}
          placeholder={t("maxGuestsHint")}
        />
      </div>

      <Button
        onClick={save}
        loading={isPending}
        size="sm"
        variant="outline"
        className="cursor-pointer"
      >
        {tl("save")}
      </Button>
    </div>
  );
}

function PolicyRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v)}
        className="grid grid-cols-3 gap-1"
      >
        {options.map((opt) => (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className="cursor-pointer text-[11px]"
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
