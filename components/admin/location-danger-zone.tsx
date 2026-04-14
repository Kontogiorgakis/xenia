"use client";

import { Archive, Download, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "@/lib/i18n/navigation";
import { deleteLocation } from "@/server_actions/locations";
import {
  archiveLocation,
  exportLocationData,
  restoreLocation,
} from "@/server_actions/locations-extra";

interface LocationDangerZoneProps {
  locationId: string;
  locationName: string;
  unitCount: number;
  reservationCount: number;
  archivedAt: Date | null;
}

export function LocationDangerZone({
  locationId,
  locationName,
  unitCount,
  reservationCount,
  archivedAt,
}: LocationDangerZoneProps) {
  const t = useTranslations("Admin.locations");
  const tl = useTranslations("Admin.locations");
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [isPending, startTransition] = useTransition();
  const isArchived = !!archivedAt;

  const nameMatches = typedName === locationName;

  const handleDelete = () => {
    if (!nameMatches) return;
    startTransition(async () => {
      const result = await deleteLocation(locationId);
      if (result.success) {
        toast.success(t("deleted"));
        router.push("/admin/properties");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveLocation(locationId);
      if (result.success) {
        toast.success(tl("archive.archivedSuccess"));
        router.push("/admin/properties");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreLocation(locationId);
      if (result.success) {
        toast.success(tl("archive.restoredSuccess"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleExport = (format: "json" | "csv") => {
    startTransition(async () => {
      const result = await exportLocationData(locationId);
      if (!result.success || !result.data) {
        toast.error(result.error || "Export failed");
        return;
      }

      let blob: Blob;
      let filename: string;
      if (format === "json") {
        blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        filename = `${locationName.replace(/\s+/g, "-").toLowerCase()}.json`;
      } else {
        // CSV: flatten reservations into rows
        const rows: string[][] = [
          [
            "unit",
            "guest_name",
            "guest_email",
            "guest_phone",
            "check_in",
            "check_out",
            "number_of_guests",
            "source",
            "status",
          ],
        ];
        for (const unit of result.data.properties) {
          for (const r of unit.reservations) {
            rows.push([
              unit.name,
              r.guestName,
              r.guestEmail ?? "",
              r.guestPhone ?? "",
              new Date(r.checkIn).toISOString(),
              new Date(r.checkOut).toISOString(),
              String(r.numberOfGuests),
              r.source,
              r.status,
            ]);
          }
        }
        const csv = rows
          .map((row) =>
            row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");
        blob = new Blob([csv], { type: "text/csv" });
        filename = `${locationName.replace(/\s+/g, "-").toLowerCase()}-reservations.csv`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(tl("export.downloadStarted"));
    });
  };

  return (
    <>
      {/* Export section */}
      <section className="mt-12 rounded-2xl border border-border/40 bg-card p-6 shadow-xenia sm:p-8">
        <h3 className="text-base font-semibold">{tl("export.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tl("export.subtitle")}</p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            disabled={isPending}
            className="cursor-pointer"
            icon={<Download className="size-4" />}
          >
            {tl("export.downloadJson")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            disabled={isPending}
            className="cursor-pointer"
            icon={<Download className="size-4" />}
          >
            {tl("export.downloadCsv")}
          </Button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6 space-y-5 sm:p-8">
        <div>
          <h3 className="text-base font-semibold text-destructive">
            {t("dangerZone")}
          </h3>
        </div>

        {/* Archive / Restore */}
        {isArchived ? (
          <div className="flex flex-col gap-3 rounded-xl bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {tl("archive.archived")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {tl("archive.archivedHint", {
                  date: new Date(archivedAt).toLocaleDateString(),
                })}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleRestore}
              disabled={isPending}
              icon={<RotateCcw className="size-4" />}
              className="shrink-0 cursor-pointer border-green-600/50 text-green-700 hover:bg-green-50 hover:text-green-800 dark:text-green-400"
            >
              {tl("archive.restoreButton")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{tl("archive.title")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {tl("archive.hint")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleArchive}
              disabled={isPending}
              icon={<Archive className="size-4" />}
              className="shrink-0 cursor-pointer border-amber-600/50 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:text-amber-400"
            >
              {tl("archive.button")}
            </Button>
          </div>
        )}

        <Separator className="bg-destructive/20" />

        {/* Delete */}
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-destructive">
              {t("deleteProperty")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("dangerZoneHint", { count: unitCount })}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTypedName("");
              setDeleteOpen(true);
            }}
            icon={<Trash2 className="size-4" />}
            className="shrink-0 cursor-pointer border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {t("deleteProperty")}
          </Button>
        </div>
      </section>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm", { name: locationName, count: unitCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-3 text-xs">
              <p className="font-semibold text-destructive">
                This will permanently delete:
              </p>
              <ul className="mt-1 space-y-0.5 text-destructive/80">
                <li>• {unitCount} units</li>
                <li>• {reservationCount} reservations</li>
                <li>• All contacts and knowledge base entries</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                {t("deleteTypedConfirm")}{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">{locationName}</code>
              </Label>
              <Input
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={!nameMatches || isPending}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90 disabled:opacity-40"
            >
              {isPending ? t("deleting") : t("deletePermanently")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
