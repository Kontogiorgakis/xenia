"use client";

import { Copy, Edit, MoreHorizontal, QrCode, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { deleteProperty, duplicateProperty } from "@/server_actions/properties";

interface PropertyActionsProps {
  propertyId: string;
  propertyName: string;
  compact?: boolean;
}

export function PropertyActions({
  propertyId,
  propertyName,
  compact = false,
}: PropertyActionsProps) {
  const t = useTranslations("Admin.properties");
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProperty(propertyId);
      if (result.success) {
        toast.success(t("deleted"));
        setConfirmOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  const openDuplicate = () => {
    setDuplicateName(`Copy of ${propertyName}`);
    setDuplicateOpen(true);
  };

  const handleDuplicate = () => {
    if (!duplicateName.trim()) return;
    startTransition(async () => {
      const result = await duplicateProperty(propertyId, duplicateName.trim());
      if (result.success && result.property) {
        toast.success(t("duplicateSuccess"));
        setDuplicateOpen(false);
        router.push(`/admin/units/${result.property.id}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={compact ? "size-7 cursor-pointer" : "ml-auto cursor-pointer"}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/admin/units/${propertyId}`}>
              <Edit className="mr-2 size-4" /> {t("editProperty")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/admin/units/${propertyId}/qr`}>
              <QrCode className="mr-2 size-4" /> {t("getQr")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openDuplicate} className="cursor-pointer">
            <Copy className="mr-2 size-4" /> {t("duplicate")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4 text-destructive" /> {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Duplicate dialog */}
      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("duplicate")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("duplicateName")}</Label>
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleDuplicate())}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDuplicateOpen(false)}
              className="cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={!duplicateName.trim() || isPending}
              loading={isPending}
              className="cursor-pointer"
            >
              {t("duplicate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm", { name: propertyName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
