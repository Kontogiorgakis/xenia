"use client";

import { Star } from "lucide-react";

import { AMENITY_ICONS } from "@/lib/general/amenity-icons";
import { parseJsonArray } from "@/lib/general/utils";
import { type XeniaAmenity } from "@/types/xenia";

interface AmenityPillsProps {
  amenitiesJson: string | null;
}

export function AmenityPills({ amenitiesJson }: AmenityPillsProps) {
  const amenities = parseJsonArray<XeniaAmenity>(amenitiesJson);
  if (amenities.length === 0) return null;

  const visible = amenities.slice(0, 5);
  const remaining = amenities.length - visible.length;

  return (
    <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto">
      {visible.map((a) => {
        const Icon = AMENITY_ICONS[a.category] ?? Star;
        return (
          <span
            key={a.id}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            <Icon className="size-3" strokeWidth={2} />
            {a.name}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
          +{remaining}
        </span>
      )}
    </div>
  );
}
