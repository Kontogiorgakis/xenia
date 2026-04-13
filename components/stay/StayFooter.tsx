"use client";

import { useTranslations } from "next-intl";

export function StayFooter() {
  const t = useTranslations("Stay");
  return (
    <footer className="mx-auto max-w-md px-5 py-14 text-center">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        <span className="size-1 rounded-full bg-primary/60" />
        {t("poweredBy")}
        <span className="size-1 rounded-full bg-primary/60" />
      </div>
    </footer>
  );
}
