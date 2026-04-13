"use client";

import { Grid, Home, MapPin, Phone, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface NavigationPillsProps {
  hasAmenities: boolean;
  hasTips: boolean;
  hasContacts: boolean;
}

export function NavigationPills({
  hasAmenities,
  hasTips,
  hasContacts,
}: NavigationPillsProps) {
  const t = useTranslations("Stay");

  const pills = [
    { id: "guide", label: t("guide"), icon: Home, show: true, highlight: false },
    { id: "amenities", label: t("amenities"), icon: Grid, show: hasAmenities, highlight: false },
    { id: "tips", label: t("tips"), icon: MapPin, show: hasTips, highlight: false },
    { id: "contacts", label: t("contacts"), icon: Phone, show: hasContacts, highlight: false },
    { id: "ask-ai", label: t("askAi"), icon: Sparkles, show: true, highlight: true },
  ].filter((p) => p.show);

  return (
    <nav className="sticky top-0 z-20 mt-8 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pills.map((pill) => (
          <a
            key={pill.id}
            href={`#${pill.id}`}
            className={
              pill.highlight
                ? "flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-4 text-[12px] font-semibold text-amber-900 shadow-[0_2px_8px_rgba(251,191,36,0.15)] dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-200"
                : "flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-muted/70 px-4 text-[12px] font-semibold text-foreground/80 transition hover:bg-muted"
            }
          >
            <pill.icon className="size-3.5" strokeWidth={2} />
            {pill.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
