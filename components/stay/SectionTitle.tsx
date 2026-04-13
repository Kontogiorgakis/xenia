"use client";

import { LucideIcon } from "lucide-react";

interface SectionTitleProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function SectionTitle({ icon: Icon, title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
          <Icon className="size-3.5 text-primary" strokeWidth={2.2} />
        </div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
