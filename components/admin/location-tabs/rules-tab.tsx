"use client";

import {
  Clock,
  Key,
  ParkingCircle,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { parseJsonArray } from "@/lib/general/utils";
import { syncWifiToUnits, updateLocation } from "@/server_actions/locations";
import { XeniaRule } from "@/types/xenia";

import { PoliciesSection } from "./policies-section";

const QUICK_RULES = ["No smoking", "No parties", "No pets", "Quiet after 23:00"];

interface RulesTabProps {
  locationId: string;
  initialData: {
    rules: string | null;
    checkInTime: string | null;
    checkOutTime: string | null;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    gateCode: string | null;
    parkingInfo: string | null;
    buildingAccess: string | null;
    wifiName: string | null;
    wifiPassword: string | null;
    emergencyPhone: string | null;
    localTips: string | null;
    smokingPolicy: string | null;
    petsPolicy: string | null;
    partiesPolicy: string | null;
    childrenPolicy: string | null;
    maxGuests: number | null;
  };
}

export function RulesTab({ locationId, initialData }: RulesTabProps) {
  const t = useTranslations("Admin.locations");
  const [isPending, startTransition] = useTransition();

  const [rules, setRules] = useState<XeniaRule[]>(() =>
    parseJsonArray<XeniaRule>(initialData.rules)
  );
  const [newRuleText, setNewRuleText] = useState("");

  const [checkInTime, setCheckInTime] = useState(initialData.checkInTime ?? "15:00");
  const [checkOutTime, setCheckOutTime] = useState(initialData.checkOutTime ?? "11:00");
  const [quietStart, setQuietStart] = useState(initialData.quietHoursStart ?? "23:00");
  const [quietEnd, setQuietEnd] = useState(initialData.quietHoursEnd ?? "08:00");
  const [gateCode, setGateCode] = useState(initialData.gateCode ?? "");
  const [parkingInfo, setParkingInfo] = useState(initialData.parkingInfo ?? "");
  const [buildingAccess, setBuildingAccess] = useState(initialData.buildingAccess ?? "");
  const [wifiName, setWifiName] = useState(initialData.wifiName ?? "");
  const [wifiPassword, setWifiPassword] = useState(initialData.wifiPassword ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState(initialData.emergencyPhone ?? "");
  const [localTips, setLocalTips] = useState(initialData.localTips ?? "");

  const addRule = (text?: string) => {
    const ruleText = text ?? newRuleText;
    if (!ruleText.trim()) return;
    setRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), category: "general", text: ruleText.trim() },
    ]);
    setNewRuleText("");
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateLocation(locationId, {
        rules: JSON.stringify(rules),
        checkInTime: checkInTime || undefined,
        checkOutTime: checkOutTime || undefined,
        quietHoursStart: quietStart || undefined,
        quietHoursEnd: quietEnd || undefined,
        gateCode: gateCode || undefined,
        parkingInfo: parkingInfo || undefined,
        buildingAccess: buildingAccess || undefined,
        wifiName: wifiName || null,
        wifiPassword: wifiPassword || null,
        emergencyPhone: emergencyPhone || undefined,
        localTips: localTips || undefined,
      });
      if (result.success) {
        toast.success(t("updated"));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{t("rules.title")}</h3>

      <PoliciesSection
        locationId={locationId}
        initialData={{
          smokingPolicy: initialData.smokingPolicy,
          petsPolicy: initialData.petsPolicy,
          partiesPolicy: initialData.partiesPolicy,
          childrenPolicy: initialData.childrenPolicy,
          maxGuests: initialData.maxGuests,
        }}
      />

      <Separator />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>
            <Clock className="inline size-3.5" /> {t("rules.checkInOut")}
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t("rules.checkInTime")}
              </Label>
              <Input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t("rules.checkOutTime")}
              </Label>
              <Input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>
            <Clock className="inline size-3.5" /> {t("rules.quietHours")}
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("rules.quietStart")}</Label>
              <Input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("rules.quietEnd")}</Label>
              <Input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="font-medium">{t("rules.access")}</Label>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              <Key className="inline size-3.5" /> {t("rules.gateCode")}
            </Label>
            <Input value={gateCode} onChange={(e) => setGateCode(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              <ParkingCircle className="inline size-3.5" /> {t("rules.parkingInfo")}
            </Label>
            <Input value={parkingInfo} onChange={(e) => setParkingInfo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              {t("rules.buildingAccess")}
            </Label>
            <Textarea
              value={buildingAccess}
              onChange={(e) => setBuildingAccess(e.target.value)}
              placeholder={t("rules.buildingAccessPlaceholder")}
              rows={3}
            />
          </div>
          {/* WiFi */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              <Wifi className="inline size-3.5" /> {t("rules.wifiName")}
            </Label>
            <Input
              value={wifiName}
              onChange={(e) => setWifiName(e.target.value)}
              placeholder="MyNetwork-5G"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              <Key className="inline size-3.5" /> {t("rules.wifiPassword")}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? t("rules.hide") : t("rules.show")}
              </button>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            icon={<RefreshCw className="size-3" />}
            onClick={() => {
              startTransition(async () => {
                // Save WiFi first, then sync
                await updateLocation(locationId, {
                  wifiName: wifiName || null,
                  wifiPassword: wifiPassword || null,
                });
                const result = await syncWifiToUnits(locationId);
                if (result.success) toast.success(t("rules.syncWifiSuccess"));
                else toast.error(result.error);
              });
            }}
            loading={isPending}
            disabled={!wifiName && !wifiPassword}
          >
            {t("rules.syncWifi")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("rules.syncWifiHint")}</p>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              <Phone className="inline size-3.5" /> {t("rules.emergencyPhone")}
            </Label>
            <Input
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+30 ..."
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="font-medium">
            <Sparkles className="inline size-3.5" /> {t("rules.localTips")}
          </Label>
          <p className="text-xs text-muted-foreground">{t("rules.localTipsHint")}</p>
          <Textarea
            value={localTips}
            onChange={(e) => setLocalTips(e.target.value)}
            placeholder={t("rules.localTipsPlaceholder")}
            rows={6}
          />
          <p className="text-right text-xs text-muted-foreground">
            {localTips.length} characters
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="font-medium">{t("rules.houseRules")}</Label>

          <div className="flex flex-wrap gap-2">
            {QUICK_RULES.map((rule) => (
              <Button
                key={rule}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addRule(rule)}
                className="cursor-pointer"
                icon={<Plus className="size-3" />}
              >
                {rule}
              </Button>
            ))}
          </div>

          {rules.length > 0 && (
            <div className="space-y-1">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2"
                >
                  <span className="text-sm">{rule.text}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRule(rule.id)}
                    className="size-7 cursor-pointer"
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {rules.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("rules.noRules")}</p>
          )}

          <div className="flex gap-2">
            <Input
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              placeholder={t("rules.rulePlaceholder")}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addRule())
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addRule()}
              className="shrink-0 cursor-pointer"
              icon={<Plus className="size-3" />}
            >
              {t("rules.addRule")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={isPending}
          icon={<Save className="size-4" />}
          className="cursor-pointer"
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
