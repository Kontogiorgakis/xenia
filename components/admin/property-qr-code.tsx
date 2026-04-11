"use client";

import { Download, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import QRCode from "react-qr-code";
import { useCallback, useRef } from "react";

import { Button } from "@/components/ui/button";

interface PropertyQrCodeProps {
  url: string;
  propertyName: string;
}

export function PropertyQrCode({ url, propertyName }: PropertyQrCodeProps) {
  const t = useTranslations("Admin.qr");
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);

      const a = document.createElement("a");
      a.download = `${propertyName}-qr-code.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [propertyName]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

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
          onClick={handlePrint}
          icon={<Printer className="size-4" />}
          className="cursor-pointer"
        >
          {t("print")}
        </Button>
      </div>
    </div>
  );
}
