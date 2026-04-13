import { getTranslations, setRequestLocale } from "next-intl/server";

import { SettingsClient } from "@/components/admin/settings/settings-client";
import { TypographyH3 } from "@/components/ui/typography";
import {
  getHostProfile,
  getNotificationPreferences,
} from "@/server_actions/settings";
import { BasePageProps } from "@/types/page-props";

const SettingsPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.settings");

  const [profileResult, prefsResult] = await Promise.all([
    getHostProfile(),
    getNotificationPreferences(),
  ]);

  const profile = profileResult.profile ?? {
    id: "",
    name: "",
    email: "",
    image: null,
    displayName: null,
    phone: null,
    bio: null,
    avatarUrl: null,
  };

  return (
    <div className="space-y-6">
      <TypographyH3>{t("title")}</TypographyH3>
      <SettingsClient
        profile={profile}
        notificationPrefs={prefsResult.prefs}
      />
    </div>
  );
};

export default SettingsPage;
