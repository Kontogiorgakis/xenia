"use client";

import { Check, Copy, Download, Printer, QrCode as QrIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadQrAsPng } from "@/lib/general/qr-download";

interface ShareQrCardProps {
  url: string;
  propertyName: string;
}

export function ShareQrCard({ url, propertyName }: ShareQrCardProps) {
  const t = useTranslations("Admin.guestbook");
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [url, t]);

  const handleDownload = useCallback(() => {
    downloadQrAsPng(qrRef.current?.querySelector("svg") ?? null, propertyName);
  }, [propertyName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <QrIcon className="size-4" />
          {t("shareTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("guestPageUrl")}
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs">
              {url}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0 cursor-pointer"
              aria-label={t("copyLink")}
            >
              {copied ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div
            ref={qrRef}
            className="flex size-40 items-center justify-center rounded-xl border bg-white p-3"
          >
            <QRCode value={url} size={136} />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("qrInstructions")}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleDownload}
                icon={<Download className="size-4" />}
                className="cursor-pointer"
              >
                {t("downloadQr")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                icon={<Printer className="size-4" />}
                className="cursor-pointer"
              >
                {t("printQr")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
