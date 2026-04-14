"use client";

import { ImageIcon, Plus, Save, Trash2 } from "lucide-react";
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
  initialPhotos,
}: PhotosTabProps) {
  const t = useTranslations("Admin.locations");
  const [isPending, startTransition] = useTransition();

  const [coverPhoto, setCoverPhoto] = useState(initialCoverPhoto ?? "");
  const [photos, setPhotos] = useState<string[]>(() => {
    if (!initialPhotos) return [];
    try {
      return JSON.parse(initialPhotos);
    } catch {
      return [];
    }
  });
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const addPhoto = () => {
    if (!newPhotoUrl.trim() || photos.length >= 15) return;
    setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl("");
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = () => {
    startTransition(async () => {
      const result = await updateLocation(locationId, {
        coverPhoto: coverPhoto || null,
        photos: JSON.stringify(photos),
      });
      if (result.success) toast.success(t("updated"));
      else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-8">
      {/* Cover photo */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">{t("photos.cover")}</h3>
          <p className="text-xs text-muted-foreground">{t("photos.coverHint")}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-dashed border-border aspect-video bg-muted/30">
          {coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPhoto}
              alt="Cover"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageIcon className="size-10 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t("photos.photoUrlPlaceholder")}
            value={coverPhoto}
            onChange={(e) => setCoverPhoto(e.target.value)}
          />
        </div>
      </section>

      {/* Gallery */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">{t("photos.gallery")}</h3>
          <p className="text-xs text-muted-foreground">{t("photos.galleryHint")}</p>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((url, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 cursor-pointer"
                  aria-label={t("photos.removePhoto")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("photos.noPhotos")}</p>
        )}

        {photos.length < 15 && (
          <div className="flex gap-2">
            <Input
              placeholder={t("photos.photoUrlPlaceholder")}
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPhoto())}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPhoto}
              className="shrink-0 cursor-pointer"
              icon={<Plus className="size-3" />}
            >
              {t("photos.addPhoto")}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{t("photos.s3Note")}</p>
        <p className="text-xs text-muted-foreground">{t("photos.unitPhotosNote")}</p>
      </section>

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
