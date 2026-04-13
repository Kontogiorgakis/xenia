import { Bath, BedDouble, Ruler, Users } from "lucide-react";

interface PropertySpecsProps {
  squareMeters: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  maxGuests: number | null;
}

export function PropertySpecs({
  squareMeters,
  bedrooms,
  bathrooms,
  maxGuests,
}: PropertySpecsProps) {
  const items: { icon: typeof Ruler; value: string }[] = [];
  if (squareMeters) items.push({ icon: Ruler, value: `${squareMeters}m²` });
  if (bedrooms != null) items.push({ icon: BedDouble, value: `${bedrooms} BR` });
  if (bathrooms != null) items.push({ icon: Bath, value: `${bathrooms} BA` });
  if (maxGuests) items.push({ icon: Users, value: `${maxGuests}` });

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <item.icon className="size-3" strokeWidth={2} />
          {item.value}
        </span>
      ))}
    </div>
  );
}
