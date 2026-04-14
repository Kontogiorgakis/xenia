"use client";

import { ExternalLink, Grid3X3 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { parseJsonArray } from "@/lib/general/utils";
import { Link } from "@/lib/i18n/navigation";
import { XeniaAmenity } from "@/types/xenia";

interface FacilitiesPreviewProps {
  locationId: string;
  amenitiesJson: string | null;
}

export function FacilitiesPreview({
  locationId,
  amenitiesJson,
}: FacilitiesPreviewProps) {
  const t = useTranslations("Admin.guestbook.facilities");
  const tl = useTranslations("Admin.locations");
  const amenities = parseJsonArray<XeniaAmenity>(amenitiesJson);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Grid3X3 className="size-4" />
          {t("title")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {amenities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {amenities.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-border/40 bg-muted/30 p-3"
            >
              <p className="text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">
                {tl(`amenities.categories.${a.category}` as never)}
              </p>
              {a.hours && (
                <p className="text-xs text-muted-foreground">· {a.hours}</p>
              )}
              {a.notes && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  · {a.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Button
        asChild
        variant="outline"
        size="sm"
        icon={<ExternalLink className="size-3" />}
        className="cursor-pointer"
      >
        <Link href={`/admin/properties/${locationId}?tab=facilities`}>
          {t("editLink")}
        </Link>
      </Button>
    </div>
  );
}
