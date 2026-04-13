"use client";

import {
  AlertTriangle,
  Car,
  Heart,
  MessageCircle,
  Phone,
  Pill,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { SectionTitle } from "./SectionTitle";

interface Contact {
  id: string;
  category: string;
  name: string;
  phone: string;
  notes: string | null;
}

interface ContactsListProps {
  contacts: Contact[];
}

const CATEGORY_CONFIG: Record<
  string,
  {
    icon: typeof Phone;
    iconBg: string;
    iconColor: string;
    emphasis: boolean;
  }
> = {
  emergency: {
    icon: AlertTriangle,
    iconBg: "bg-red-100 dark:bg-red-950/40",
    iconColor: "text-red-600 dark:text-red-400",
    emphasis: true,
  },
  medical: {
    icon: Heart,
    iconBg: "bg-red-100 dark:bg-red-950/40",
    iconColor: "text-red-600 dark:text-red-400",
    emphasis: true,
  },
  transport: {
    icon: Car,
    iconBg: "bg-blue-100 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    emphasis: false,
  },
  food: {
    icon: UtensilsCrossed,
    iconBg: "bg-amber-100 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    emphasis: false,
  },
  services: {
    icon: Wrench,
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    emphasis: false,
  },
  pharmacy: {
    icon: Pill,
    iconBg: "bg-green-100 dark:bg-green-950/40",
    iconColor: "text-green-600 dark:text-green-400",
    emphasis: false,
  },
  other: {
    icon: Phone,
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    emphasis: false,
  },
};

const CATEGORY_ORDER = [
  "emergency",
  "medical",
  "transport",
  "pharmacy",
  "food",
  "services",
  "other",
];

function getWhatsAppLink(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, "");
  return `https://wa.me/${clean.replace("+", "")}`;
}

export function ContactsList({ contacts }: ContactsListProps) {
  const t = useTranslations("Stay");

  if (contacts.length === 0) return null;

  const grouped: Record<string, Contact[]> = {};
  for (const contact of contacts) {
    const cat = CATEGORY_CONFIG[contact.category] ? contact.category : "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(contact);
  }

  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped[c]);

  return (
    <section id="contacts" className="mx-5 mt-10 scroll-mt-20">
      <div className="mx-auto max-w-md">
        <SectionTitle icon={Phone} title={t("importantContacts")} />

        <div className="space-y-6">
          {orderedCategories.map((category) => {
            const config = CATEGORY_CONFIG[category];
            return (
              <div key={category}>
                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {t(`contactCategories.${category}` as never)}
                </p>
                <div className="space-y-2">
                  {grouped[category].map((contact) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={contact.id}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl p-3.5 transition",
                          config.emphasis
                            ? "bg-red-50/80 dark:bg-red-950/15"
                            : "bg-xenia-surface-low"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-full",
                            config.iconBg
                          )}
                        >
                          <Icon
                            className={cn("size-4", config.iconColor)}
                            strokeWidth={2}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold leading-tight">
                            {contact.name}
                          </p>
                          {contact.notes && (
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {contact.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex h-9 min-w-11 items-center justify-center rounded-full bg-green-600 px-3.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(22,163,74,0.25)] transition active:scale-95"
                          >
                            {t("call")}
                          </a>
                          <a
                            href={getWhatsAppLink(contact.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex size-9 items-center justify-center rounded-full bg-white text-green-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition active:scale-95 dark:bg-card"
                          >
                            <MessageCircle className="size-4" strokeWidth={2} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
