import {
  Bell,
  Car,
  Dumbbell,
  Flame,
  Flower2,
  Sparkles,
  Star,
  UtensilsCrossed,
  Waves,
  WashingMachine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const AMENITY_ICONS: Record<string, LucideIcon> = {
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
