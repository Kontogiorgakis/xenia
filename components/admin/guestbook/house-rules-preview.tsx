"use client";

import {
  Check,
  ExternalLink,
  Heart,
  Info,
  LogIn,
  LogOut,
  Moon,
  ScrollText,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { parseJsonArray } from "@/lib/general/utils";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { XeniaRule } from "@/types/xenia";

type PolicyValue = string | null;

interface HouseRulesPreviewProps {
  locationId: string;
  data: {
    smokingPolicy: PolicyValue;
    petsPolicy: PolicyValue;
    partiesPolicy: PolicyValue;
    childrenPolicy: PolicyValue;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    checkInTime: string | null;
    checkOutTime: string | null;
    rulesJson: string | null;
  };
}

function PolicyRow({ label, value }: { label: string; value: PolicyValue }) {
  const t = useTranslations("Admin.guestbook.policies");
  let icon;
  let tone: string;
  let text: string;

  switch (value) {
    case "allowed":
      icon = <Check className="size-4" />;
      tone = "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400";
      text = t("allowed");
      break;
    case "welcome":
      icon = <Heart className="size-4" />;
      tone = "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400";
      text = t("welcome");
      break;
    case "outside":
      icon = <Info className="size-4" />;
      tone = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
      text = t("outside");
      break;
    case "small_only":
    case "allowed_with_notice":
    case "over_12":
      icon = <Info className="size-4" />;
      tone = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
      text = t("smallOnly");
      break;
    case "not_suitable":
    case "not_allowed":
    default:
      icon = <XCircle className="size-4" />;
      tone = "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400";
      text = t("notAllowed");
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      <span
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          tone
        )}
      >
        {icon}
        {text}
      </span>
    </div>
  );
}

export function HouseRulesPreview({ locationId, data }: HouseRulesPreviewProps) {
  const t = useTranslations("Admin.guestbook.rules");
  const tp = useTranslations("Admin.guestbook.policies");
  const rules = parseJsonArray<XeniaRule>(data.rulesJson);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <ScrollText className="size-4" />
          {t("title")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-2">
        <PolicyRow label={tp("smoking")} value={data.smokingPolicy} />
        <PolicyRow label={tp("pets")} value={data.petsPolicy} />
        <PolicyRow label={tp("parties")} value={data.partiesPolicy} />
        <PolicyRow label={tp("children")} value={data.childrenPolicy} />

        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Moon className="size-4 text-muted-foreground" />
            {tp("quietHours")}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {data.quietHoursStart ?? "23:00"} — {data.quietHoursEnd ?? "08:00"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <LogIn className="size-4 text-muted-foreground" />
            {tp("checkIn")}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {data.checkInTime ?? "15:00"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <LogOut className="size-4 text-muted-foreground" />
            {tp("checkOut")}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {data.checkOutTime ?? "11:00"}
          </span>
        </div>
      </div>

      {rules.length > 0 && (
        <div className="space-y-1 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("additional")}
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-sm">
            {rules.map((r) => (
              <li key={r.id}>{r.text}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        asChild
        variant="outline"
        size="sm"
        icon={<ExternalLink className="size-3" />}
        className="cursor-pointer"
      >
        <Link href={`/admin/properties/${locationId}?tab=houseRules`}>
          {t("editLink")}
        </Link>
      </Button>
    </div>
  );
}
