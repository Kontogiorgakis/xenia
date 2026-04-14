"use client";

import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { updateLocation } from "@/server_actions/locations";

interface BrandingTabProps {
  locationId: string;
  initialData: {
    hostDisplayName: string | null;
    hostPhoto: string | null;
    hostBio: string | null;
    brandColor: string | null;
    name: string;
  };
}

export function BrandingTab({ locationId, initialData }: BrandingTabProps) {
  const t = useTranslations("Admin.locations.branding");
  const tl = useTranslations("Admin.locations");
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(initialData.hostDisplayName ?? "");
  const [hostPhoto, setHostPhoto] = useState(initialData.hostPhoto ?? "");
  const [bio, setBio] = useState(initialData.hostBio ?? "");
  const [brandColor, setBrandColor] = useState(initialData.brandColor ?? "#1B4D6E");

  const save = () => {
    startTransition(async () => {
      const result = await updateLocation(locationId, {
        hostDisplayName: displayName || null,
        hostPhoto: hostPhoto || null,
        hostBio: bio || null,
        brandColor: brandColor || null,
      });
      if (result.success) toast.success(tl("updated"));
      else toast.error(result.error);
    });
  };

  const initials = (displayName || "H")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Host profile */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">{t("hostProfile")}</h3>
          <p className="text-xs text-muted-foreground">{t("hostProfileHint")}</p>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {hostPhoto && <AvatarImage src={hostPhoto} />}
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Label>{t("hostPhoto")}</Label>
            <Input
              value={hostPhoto}
              onChange={(e) => setHostPhoto(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">{t("hostPhotoHint")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("displayName")}</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("displayNameHint")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("bio")}</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 300))}
            placeholder={t("bioPlaceholder")}
            rows={4}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("bioHint")}</span>
            <span>{bio.length}/300</span>
          </div>
        </div>
      </section>

      <Separator />

      {/* Brand color */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">{t("brandColor")}</h3>
          <p className="text-xs text-muted-foreground">{t("brandColorHint")}</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
          />
          <Input
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            placeholder="#1B4D6E"
            className="max-w-[140px] font-mono text-sm uppercase"
          />
        </div>
      </section>

      <Separator />

      {/* Preview */}
      <section className="space-y-3">
        <Label>{t("preview")}</Label>
        <div
          className="overflow-hidden rounded-xl"
          style={{
            background: `linear-gradient(160deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
          }}
        >
          <div className="px-6 py-8 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
              xenia
            </p>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.15em] opacity-60">
              {initialData.name}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Avatar className="size-10 ring-2 ring-white/20">
                {hostPhoto && <AvatarImage src={hostPhoto} />}
                <AvatarFallback className="bg-white/10 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-[22px] font-semibold">
                Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}.
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          onClick={save}
          loading={isPending}
          icon={<Save className="size-4" />}
          className="cursor-pointer"
          size="lg"
        >
          {tl("save")}
        </Button>
      </div>
    </div>
  );
}
