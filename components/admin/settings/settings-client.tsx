"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ProfileSection } from "./profile-section";
import { PlatformsSection } from "./platforms-section";
import { NotificationsSection } from "./notifications-section";
import { BillingSection } from "./billing-section";
import { cn } from "@/lib/utils";

const SECTIONS = ["profile", "platforms", "notifications", "billing"] as const;
type Section = (typeof SECTIONS)[number];

interface SettingsClientProps {
  profile: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    displayName: string | null;
    phone: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
  notificationPrefs: Record<string, { email: boolean; push: boolean }>;
}

export function SettingsClient({ profile, notificationPrefs }: SettingsClientProps) {
  const t = useTranslations("Admin.settings");
  const [activeSection, setActiveSection] = useState<Section>("profile");

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left nav */}
      <nav className="flex gap-1 overflow-x-auto lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-visible">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors",
              activeSection === section
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t(`sections.${section}`)}
          </button>
        ))}
      </nav>

      {/* Right content */}
      <div className="min-w-0 flex-1 overflow-hidden">
        {activeSection === "profile" && <ProfileSection profile={profile} />}
        {activeSection === "platforms" && <PlatformsSection />}
        {activeSection === "notifications" && (
          <NotificationsSection initialPrefs={notificationPrefs} />
        )}
        {activeSection === "billing" && <BillingSection />}
      </div>
    </div>
  );
}
