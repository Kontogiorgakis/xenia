"use client";

import { motion } from "framer-motion";
import { Check, Copy, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface WifiCardProps {
  name: string | null;
  password: string | null;
}

export function WifiCard({ name, password }: WifiCardProps) {
  const t = useTranslations("Stay");
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  if (!name && !password) return null;

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mx-5 mt-6">
      <div
        className="mx-auto max-w-md overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, #e6f4ea 0%, #f2f9f4 100%)",
        }}
      >
        <div className="p-5 dark:bg-green-950/20">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-white/80 dark:bg-card">
              <Wifi
                className="size-4 text-green-700 dark:text-green-400"
                strokeWidth={2}
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-green-800 dark:text-green-400">
              {t("wifi")}
            </span>
          </div>

          {name && (
            <p className="mb-1 text-[11px] uppercase tracking-wider text-green-900/60 dark:text-green-400/60">
              Network
            </p>
          )}
          {name && (
            <p className="text-[16px] font-semibold text-green-950 dark:text-foreground">
              {name}
            </p>
          )}

          {password && (
            <motion.button
              type="button"
              onClick={handleCopy}
              whileTap={{ scale: 0.97 }}
              className="mt-4 flex w-full items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-left transition hover:bg-white dark:bg-card dark:hover:bg-card/80"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-green-900/60 dark:text-green-400/60">
                  Password
                </p>
                <p className="truncate font-mono text-[16px] font-semibold tracking-wide text-green-950 dark:text-foreground">
                  {password}
                </p>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-1 text-[11px] font-semibold text-green-700 dark:text-green-400">
                {copied ? (
                  <>
                    <Check className="size-3.5" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    {t("tapToCopy")}
                  </>
                )}
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
