"use client";

import { Download, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef } from "react";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import { downloadQrAsPng } from "@/lib/general/qr-download";

interface PropertyQrCodeProps {
  url: string;
  propertyName: string;
}

export function PropertyQrCode({ url, propertyName }: PropertyQrCodeProps) {
  const t = useTranslations("Admin.qr");
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    downloadQrAsPng(qrRef.current?.querySelector("svg") ?? null, propertyName);
  }, [propertyName]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        ref={qrRef}
        className="rounded-xl border bg-white p-8"
      >
        <QRCode value={url} size={256} />
      </div>

      <p className="text-center text-sm text-muted-foreground break-all">
        {url}
      </p>

      <p className="max-w-md text-center text-sm text-muted-foreground">
        {t("instructions")}
      </p>

      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          icon={<Download className="size-4" />}
          className="cursor-pointer"
        >
          {t("download")}
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          icon={<Printer className="size-4" />}
          className="cursor-pointer"
        >
          {t("print")}
        </Button>
      </div>
    </div>
  );
}
