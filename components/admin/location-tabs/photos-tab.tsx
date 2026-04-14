"use client";

import { ImageIcon, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLocation } from "@/server_actions/locations";

interface PhotosTabProps {
  locationId: string;
  initialCoverPhoto: string | null;
  initialPhotos: string | null;
}

export function PhotosTab({
  locationId,
  initialCoverPhoto,
}: PhotosTabProps) {
  const t = useTranslations("Admin.locations");
  const [isPending, startTransition] = useTransition();
  const [coverPhoto, setCoverPhoto] = useState(initialCoverPhoto ?? "");

  const save = () => {
    startTransition(async () => {
      const result = await updateLocation(locationId, {
        coverPhoto: coverPhoto || null,
      });
      if (result.success) toast.success(t("updated"));
      else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t("photos.cover")}</h3>
        <p className="text-sm text-muted-foreground">{t("photos.coverHint")}</p>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/30">
        {coverPhoto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPhoto}
              alt="Cover"
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => setCoverPhoto("")}
              className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              aria-label={t("photos.removePhoto")}
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-12" />
            <p className="text-xs">{t("photos.noPhotos")}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          {t("photos.photoUrlPlaceholder")}
        </Label>
        <Input
          placeholder="https://..."
          value={coverPhoto}
          onChange={(e) => setCoverPhoto(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t("photos.s3Note")}</p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={save}
          loading={isPending}
          icon={<Save className="size-4" />}
          className="cursor-pointer"
          size="lg"
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
