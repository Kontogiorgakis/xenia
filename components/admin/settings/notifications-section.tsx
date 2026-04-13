"use client";

import {
  Bell,
  CalendarCheck,
  AlertTriangle,
  Bot,
  LogOut,
  MessageSquare,
  Save,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateNotificationPreferences } from "@/server_actions/settings";

const NOTIFICATION_TYPES = [
  { key: "newReservation", icon: Bell, comingSoon: false },
  { key: "guestArriving", icon: CalendarCheck, comingSoon: false },
  { key: "guestMessage", icon: MessageSquare, comingSoon: false },
  { key: "issueReported", icon: AlertTriangle, comingSoon: false },
  { key: "checkoutReminder", icon: LogOut, comingSoon: false },
  { key: "aiCantAnswer", icon: Bot, comingSoon: false },
  { key: "reviewReceived", icon: Star, comingSoon: true },
] as const;

interface NotificationsSectionProps {
  initialPrefs: Record<string, { email: boolean; push: boolean }>;
}

export function NotificationsSection({ initialPrefs }: NotificationsSectionProps) {
  const t = useTranslations("Admin.settings.notifications");
  const [isPending, startTransition] = useTransition();

  const defaultPrefs: Record<string, { email: boolean; push: boolean }> = {};
  for (const type of NOTIFICATION_TYPES) {
    defaultPrefs[type.key] = initialPrefs[type.key] ?? {
      email: !type.comingSoon,
      push: false,
    };
  }

  const [prefs, setPrefs] = useState(defaultPrefs);

  const togglePref = (key: string, channel: "email" | "push") => {
    setPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateNotificationPreferences(prefs);
      if (result.success) {
        toast.success(t("saved"));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6 lg:max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-1">
        {NOTIFICATION_TYPES.map(({ key, icon: Icon, comingSoon }) => (
          <div
            key={key}
            className="rounded-lg px-3 py-3 hover:bg-muted/50"
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <Label className="text-sm font-medium">
                  {t(`types.${key}` as never)}
                  {comingSoon && (
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(`types.${key}Desc` as never)}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={prefs[key]?.email ?? false}
                      onCheckedChange={() => togglePref(key, "email")}
                      disabled={comingSoon}
                      className="cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">{t("email")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={prefs[key]?.push ?? false}
                      onCheckedChange={() => togglePref(key, "push")}
                      disabled={comingSoon}
                      className="cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">{t("push")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        loading={isPending}
        icon={<Save className="size-4" />}
        className="cursor-pointer"
      >
        {t("save")}
      </Button>
    </div>
  );
}
