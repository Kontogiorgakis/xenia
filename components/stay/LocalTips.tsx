"use client";

import { MapPin, Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { SectionTitle } from "./SectionTitle";

interface LocalTipsProps {
  tips: string;
  hostName: string | null;
  hostImage: string | null;
}

export function LocalTips({ tips, hostName, hostImage }: LocalTipsProps) {
  const t = useTranslations("Stay");
  const [expanded, setExpanded] = useState(false);

  if (!tips.trim()) return null;

  const shouldTruncate = tips.length > 400;
  const display = expanded || !shouldTruncate ? tips : tips.slice(0, 400) + "…";

  const initials = (hostName ?? "H")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section id="tips" className="mx-5 mt-10 scroll-mt-20">
      <div className="mx-auto max-w-md">
        <SectionTitle icon={MapPin} title={t("localSecrets")} />

        <div
          className="relative overflow-hidden rounded-2xl p-6 shadow-[0_4px_24px_rgba(101,49,0,0.06)]"
          style={{
            background:
              "linear-gradient(135deg, #fdf8f0 0%, #fefcf7 50%, #faf3e8 100%)",
          }}
        >
          <Quote
            className="absolute right-4 top-4 size-8 text-amber-200/60 dark:text-amber-900/40"
            strokeWidth={1}
          />

          {hostName && (
            <div className="mb-4 flex items-center gap-3">
              <Avatar className="size-10 ring-2 ring-white dark:ring-card">
                {hostImage && <AvatarImage src={hostImage} />}
                <AvatarFallback className="bg-amber-100 text-xs font-semibold text-amber-900">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[13px] font-semibold text-foreground">
                  {hostName}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-amber-700/70 dark:text-amber-500/70">
                  Your host
                </p>
              </div>
            </div>
          )}

          <p className="whitespace-pre-wrap text-[14px] leading-[1.75] text-foreground/90">
            {display}
          </p>

          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-3 cursor-pointer text-[12px] font-semibold text-amber-700 dark:text-amber-400"
            >
              {expanded ? t("readLess") : t("readMore")} →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
