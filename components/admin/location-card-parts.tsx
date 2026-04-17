"use client";

import type { DragControls } from "framer-motion";
import { ExternalLink, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UnitStatus } from "@/lib/utils/unit-status";
import { STATUS_CONFIG } from "@/lib/utils/unit-status";

export function DragHandle({ dragControls }: { dragControls: DragControls }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => dragControls.start(e)}
      className="mt-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground active:cursor-grabbing"
      aria-label="Drag to reorder"
    >
      <GripVertical className="size-4" />
    </button>
  );
}

export function StatusPill({
  status,
  size = "md",
}: {
  status: UnitStatus;
  size?: "sm" | "md";
}) {
  const t = useTranslations("Admin.properties");
  const config = STATUS_CONFIG[status];
  const isLive =
    status === "occupied" ||
    status === "arriving_today" ||
    status === "departing_today" ||
    status === "back_to_back";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        config.bgColor,
        "border-white/50 dark:border-white/10"
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          size === "sm" ? "size-1.5" : "size-2",
          config.dotColor,
          isLive && "animate-pulse"
        )}
      />
      <span>{t(config.label)}</span>
    </span>
  );
}

export function BookingPageButton({ bookingToken }: { bookingToken: string }) {
  const t = useTranslations("Admin.locations");
  return (
    <Button asChild variant="outline" size="sm" className="cursor-pointer">
      <a
        href={`/book/${bookingToken}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink className="mr-1 size-3" /> {t("bookingPageLink")}
      </a>
    </Button>
  );
}
