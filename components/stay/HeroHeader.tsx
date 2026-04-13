"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface HeroHeaderProps {
  propertyName: string;
  city: string | null;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
}

function getFirstName(fullName: string): string {
  if (!fullName || fullName === "Guest") return "";
  return fullName.split(" ")[0];
}

function formatShort(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function HeroHeader({
  propertyName,
  city,
  guestName,
  checkIn,
  checkOut,
  numberOfGuests,
}: HeroHeaderProps) {
  const t = useTranslations("Stay");
  const firstName = getFirstName(guestName);
  const greeting = firstName ? `${t("welcome")}, ${firstName}` : t("welcome");
  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(160deg, #0a2e4f 0%, #1B4D6E 45%, #2d6280 100%)",
      }}
    >
      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(255,220,197,0.5) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-48 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(100,200,240,0.6) 0%, transparent 70%)",
        }}
      />

      <div className="relative px-7 pb-20 pt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
          xenia
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-12"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] opacity-60">
            {propertyName}
            {city && <span className="ml-2">· {city}</span>}
          </p>

          <h1
            className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-tight"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            {greeting}
            <span className="opacity-60">.</span>
          </h1>

          <div className="mt-6 flex items-center gap-3 text-[13px]">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider opacity-50">
                Arrive
              </span>
              <span className="font-medium">{formatShort(checkIn)}</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider opacity-50">
                Depart
              </span>
              <span className="font-medium">{formatShort(checkOut)}</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider opacity-50">
                Stay
              </span>
              <span className="font-medium">
                {nights} {nights === 1 ? "night" : "nights"} · {numberOfGuests}{" "}
                {numberOfGuests === 1 ? "guest" : "guests"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Soft bottom curve */}
      <div
        className="absolute inset-x-0 bottom-0 h-10 bg-background"
        style={{ clipPath: "ellipse(120% 100% at 50% 100%)" }}
      />
    </motion.header>
  );
}
