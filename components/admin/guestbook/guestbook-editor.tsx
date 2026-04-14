"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ContactsSection } from "@/components/admin/contacts-section";
import { FacilitiesPreview } from "@/components/admin/guestbook/facilities-preview";
import { HouseRulesPreview } from "@/components/admin/guestbook/house-rules-preview";
import { ShareQrCard } from "@/components/admin/guestbook/share-qr-card";
import { BrandingTab } from "@/components/admin/location-tabs/branding-tab";
import { KnowledgeBaseTab } from "@/components/admin/location-tabs/knowledge-base-tab";
import { LocalAreaTab } from "@/components/admin/location-tabs/local-area-tab";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GUEST_BASE_URL } from "@/lib/admin/constants";
import { scrollAdminShellTop } from "@/lib/general/utils";
import { cn } from "@/lib/utils";
import { getGuestbookData } from "@/server_actions/guestbook";

type GuestbookData = NonNullable<
  Awaited<ReturnType<typeof getGuestbookData>>["data"]
>;

interface GuestbookEditorProps {
  propertyOptions: { id: string; name: string }[];
  initialData: GuestbookData;
}

const SECTIONS = [
  "welcome",
  "localArea",
  "facilities",
  "houseRules",
  "contacts",
  "knowledge",
  "share",
] as const;
type Section = (typeof SECTIONS)[number];

export function GuestbookEditor({
  propertyOptions,
  initialData,
}: GuestbookEditorProps) {
  const t = useTranslations("Admin.guestbook");
  const [data, setData] = useState(initialData);
  const [switching, startSwitching] = useTransition();
  const [activeSection, setActiveSection] = useState<Section>("welcome");

  const handlePropertySwitch = (newId: string) => {
    if (newId === data.location.id) return;
    startSwitching(async () => {
      const result = await getGuestbookData(newId);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.error ?? "Failed to load");
      }
    });
  };

  const { location, host } = data;
  const guestUrl = `${GUEST_BASE_URL}/${location.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-xs">
          <Label className="text-xs text-muted-foreground">
            {t("selectProperty")}
          </Label>
          <Select value={location.id} onValueChange={handlePropertySwitch}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {propertyOptions.map((p) => (
                <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          asChild
          icon={<ExternalLink className="size-4" />}
          className="cursor-pointer"
        >
          <a href={guestUrl} target="_blank" rel="noopener noreferrer">
            {t("openPreview")}
          </a>
        </Button>
      </div>

      {switching ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div key={location.id} className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => {
                  setActiveSection(section);
                  scrollAdminShellTop();
                }}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors",
                  activeSection === section
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {t(`panels.${section}`)}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8">
              {activeSection === "welcome" && (
                <BrandingTab
                  locationId={location.id}
                  initialData={{
                    hostDisplayName: location.hostDisplayName ?? host.displayName ?? null,
                    hostPhoto: location.hostPhoto ?? host.avatarUrl ?? null,
                    hostBio: location.hostBio ?? host.bio ?? null,
                    brandColor: location.brandColor,
                    name: location.name,
                  }}
                />
              )}

              {activeSection === "localArea" && (
                <LocalAreaTab
                  locationId={location.id}
                  initialData={{
                    nearestBeach: location.nearestBeach,
                    nearestSupermarket: location.nearestSupermarket,
                    nearestPharmacy: location.nearestPharmacy,
                    nearestHospital: location.nearestHospital,
                    nearestAtm: location.nearestAtm,
                    distanceAirport: location.distanceAirport,
                    distanceCenter: location.distanceCenter,
                  }}
                />
              )}

              {activeSection === "facilities" && (
                <FacilitiesPreview
                  locationId={location.id}
                  amenitiesJson={location.amenities}
                />
              )}

              {activeSection === "houseRules" && (
                <HouseRulesPreview
                  locationId={location.id}
                  data={{
                    smokingPolicy: location.smokingPolicy,
                    petsPolicy: location.petsPolicy,
                    partiesPolicy: location.partiesPolicy,
                    childrenPolicy: location.childrenPolicy,
                    quietHoursStart: location.quietHoursStart,
                    quietHoursEnd: location.quietHoursEnd,
                    checkInTime: location.checkInTime,
                    checkOutTime: location.checkOutTime,
                    rulesJson: location.rules,
                  }}
                />
              )}

              {activeSection === "contacts" && (
                <ContactsSection
                  locationId={location.id}
                  initialContacts={location.contacts}
                />
              )}

              {activeSection === "knowledge" && (
                <KnowledgeBaseTab
                  locationId={location.id}
                  initialEntries={location.knowledgeEntries}
                  initialUnanswered={location.unansweredQuestions}
                />
              )}

              {activeSection === "share" && (
                <ShareQrCard url={guestUrl} propertyName={location.name} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
