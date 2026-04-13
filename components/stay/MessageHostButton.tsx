"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface MessageHostButtonProps {
  hostName: string | null;
  hostPhone: string | null;
  propertyName: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
}

function getFirstName(fullName: string | null): string {
  if (!fullName) return "";
  return fullName.split(" ")[0];
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function MessageHostButton({
  hostName,
  hostPhone,
  propertyName,
  guestName,
  checkIn,
  checkOut,
}: MessageHostButtonProps) {
  const t = useTranslations("Stay");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!hostPhone) return null;

  const firstName = getFirstName(hostName);
  const cleanPhone = hostPhone.replace(/[^\d+]/g, "").replace("+", "");
  const greeting = `Hi ${firstName || "there"}! I'm ${guestName || "a guest"} staying at ${propertyName} (${formatDate(checkIn)} - ${formatDate(checkOut)}). `;
  const href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-1/2 z-30 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-green-600 px-5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(22,163,74,0.35)] active:scale-95"
        >
          <MessageCircle className="size-4" strokeWidth={2.2} />
          {t("messageHost", { name: firstName || "host" })}
        </motion.a>
      )}
    </AnimatePresence>
  );
}
