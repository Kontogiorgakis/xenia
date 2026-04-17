"use client";

import type { DragControls } from "framer-motion";
import { ExternalLink, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

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
