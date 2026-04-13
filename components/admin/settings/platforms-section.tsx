"use client";

import { Check, Copy, Globe, Lock, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GUEST_BASE_URL } from "@/lib/admin/constants";

const PRO_BADGE = (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
    <Lock className="size-2.5" /> Pro
  </span>
);

export function PlatformsSection() {
  const t = useTranslations("Admin.settings.platforms");
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => () => { if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current); }, []);

  const directLink = `${GUEST_BASE_URL}/book/host`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(directLink);
    setCopied(true);
    toast.success("Link copied!");
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      name: "Booking.com",
      nameColor: "#003580",
      description: t("bookingDesc"),
      connected: false,
      locked: true,
    },
    {
      name: "Airbnb",
      nameColor: "#FF5A5F",
      description: t("airbnbDesc"),
      connected: false,
      locked: true,
    },
    {
      name: "WhatsApp Business",
      nameColor: "#25D366",
      icon: <MessageCircle className="size-5" style={{ color: "#25D366" }} />,
      description: t("whatsappDesc"),
      connected: false,
      locked: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {platforms.map((platform) => (
          <Card key={platform.name}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle
                  className="text-base"
                  style={{ color: platform.nameColor }}
                >
                  {platform.name}
                </CardTitle>
                {platform.locked && PRO_BADGE}
                <Badge variant="outline" className="text-muted-foreground">
                  {t("notConnected")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {platform.description}
              </p>
              <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                {t("connect")}
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Direct booking — always active */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="size-4" /> {t("directBooking")}
              </CardTitle>
              <Badge className="bg-green-600 text-white hover:bg-green-600">
                {t("active")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("directBookingDesc")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={directLink} readOnly className="min-w-0 text-xs" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                icon={copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                className="shrink-0 cursor-pointer"
              >
                {t("copyLink")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("directLinkHint")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade banner */}
      <Card className="bg-primary/5">
        <CardContent className="space-y-3 py-4">
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm">
              {t("upgradeBanner")}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => toast.info("Billing coming soon — you're on the free beta plan!")}
            className="w-full cursor-pointer sm:w-auto"
          >
            {t("upgradeCta")} — €59/mo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
