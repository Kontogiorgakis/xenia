"use client";

import {
  Bell,
  Car,
  Dumbbell,
  Flame,
  Flower2,
  Grid,
  Sparkles,
  Star,
  UtensilsCrossed,
  Waves,
  WashingMachine,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionTitle } from "./SectionTitle";

interface Amenity {
  id: string;
  category: string;
  name: string;
  hours?: string;
  notes?: string;
}

interface AmenitiesGridProps {
  amenities: Amenity[];
}

const AMENITY_ICONS: Record<string, typeof Star> = {
  pool: Waves,
  parking: Car,
  bbq: Flame,
  garden: Flower2,
  gym: Dumbbell,
  spa: Sparkles,
  laundry: WashingMachine,
  reception: Bell,
  restaurant: UtensilsCrossed,
  other: Star,
};

export function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  const t = useTranslations("Stay");

  if (amenities.length === 0) return null;

  return (
    <section id="amenities" className="mx-5 mt-10 scroll-mt-20">
      <div className="mx-auto max-w-md">
        <SectionTitle icon={Grid} title={t("facilities")} />

        <div className="grid grid-cols-2 gap-3">
          {amenities.map((amenity) => {
            const Icon = AMENITY_ICONS[amenity.category] ?? Star;
            return (
              <div
                key={amenity.id}
                className="rounded-2xl bg-xenia-surface-low p-4 transition hover:bg-xenia-surface-variant"
              >
                <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-card">
                  <Icon
                    className="size-4 text-primary"
                    strokeWidth={2}
                  />
                </div>
                <p className="text-[14px] font-semibold leading-tight">
                  {amenity.name}
                </p>
                {amenity.hours && (
                  <p className="mt-1 text-[11px] font-semibold text-primary">
                    {amenity.hours}
                  </p>
                )}
                {amenity.notes && (
                  <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                    {amenity.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
