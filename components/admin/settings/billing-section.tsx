"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "starter",
    price: "€29",
    features: [
      "1 property",
      "Guest personal page",
      "AI chat",
      "House guide",
      "QR code",
      "Manual reservations",
    ],
    recommended: false,
  },
  {
    key: "pro",
    price: "€59",
    features: [
      "Up to 5 properties",
      "Everything in Starter",
      "Booking.com sync",
      "Airbnb sync",
      "WhatsApp inbox",
      "Guest CRM",
      "Automated review nudge",
      "Daily AI trip content",
    ],
    recommended: true,
  },
  {
    key: "agency",
    price: "€99",
    features: [
      "Unlimited properties",
      "Everything in Pro",
      "Multi-user access",
      "Custom branding",
      "Priority support",
    ],
    recommended: false,
  },
];

export function BillingSection() {
  const t = useTranslations("Admin.settings.billing");
  const [betaDismissed, setBetaDismissed] = useState(false);
  useEffect(() => {
    setBetaDismissed(localStorage.getItem("xenia-beta-dismissed") === "true");
  }, []);

  const dismissBeta = () => {
    setBetaDismissed(true);
    localStorage.setItem("xenia-beta-dismissed", "true");
  };

  const handleUpgrade = () => {
    toast.info(t("plans.comingSoon"));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
      </div>

      {/* Beta notice */}
      {!betaDismissed && (
        <div className="flex items-start justify-between rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
          <p className="text-sm text-green-800 dark:text-green-300">
            {t("betaNotice")}
          </p>
          <button
            onClick={dismissBeta}
            className="ml-4 shrink-0 cursor-pointer text-green-600 hover:text-green-800 dark:text-green-400"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Current plan */}
      <Card className="bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("plans.starter")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              €0 / {t("plans.perMonth")} during beta
            </p>
          </div>
          <Badge>{t("plans.current")}</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {PLANS[0].features.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="size-3.5 text-green-600" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.key}
            className={cn(
              plan.recommended && "ring-2 ring-primary"
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t(`plans.${plan.key}` as never)}</CardTitle>
                {plan.recommended && (
                  <Badge className="bg-primary text-primary-foreground">
                    {t("plans.recommended")}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}{t("plans.perMonth")}
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-3.5 shrink-0 text-green-600" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button
                variant={plan.recommended ? "default" : "outline"}
                className="w-full cursor-pointer"
                onClick={handleUpgrade}
              >
                {plan.key === "starter"
                  ? t("plans.current")
                  : t("plans.upgrade")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing history */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("invoices.title")}</h3>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("invoices.empty")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
