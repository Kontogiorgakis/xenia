"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { ConvertToReservationSheet } from "@/components/admin/inbox/convert-to-reservation-sheet";
import { ManualInquirySheet } from "@/components/admin/inbox/manual-inquiry-sheet";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GUEST_BASE_URL } from "@/lib/admin/constants";
import { copyToClipboard } from "@/lib/general/clipboard";
import { getInitials } from "@/lib/general/utils";
import { cn } from "@/lib/utils";
import {
  deleteInquiry,
  getInboxCounts,
  getInquiries,
  type InquiryStatus,
  markInquiryAsRead,
  replyToInquiry,
  updateInquiryStatus,
} from "@/server_actions/inquiries";

type Inquiry = Awaited<ReturnType<typeof getInquiries>>["inquiries"][number];
type Counts = Awaited<ReturnType<typeof getInboxCounts>>["counts"];
type TabKey = "all" | "booking" | "question" | "converted" | "closed";

interface LocationLite {
  id: string;
  name: string;
  baseNightlyRate: number | null;
  cleaningFee: number | null;
  cityTax: number | null;
  properties: { id: string; name: string }[];
}

interface InboxClientProps {
  locale: string;
  initialInquiries: Inquiry[];
  initialCounts: Counts;
  locations: LocationLite[];
}

function nightCount(checkIn: Date | null, checkOut: Date | null): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function formatDate(d: Date | string | null, locale: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function InboxClient({
  locale,
  initialInquiries,
  initialCounts,
  locations,
}: InboxClientProps) {
  const t = useTranslations("Admin.inbox");
  const format = useFormatter();
  const relativeTime = (d: Date | string) => format.relativeTime(new Date(d));

  const [inquiries, setInquiries] = useState(initialInquiries);
  const [counts, setCounts] = useState(initialCounts);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialInquiries[0]?.id ?? null
  );
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const [manualOpen, setManualOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const refreshCounts = async () => {
    const r = await getInboxCounts();
    if (r.success) setCounts(r.counts);
  };

  const refreshInquiries = async () => {
    const r = await getInquiries();
    if (r.success) {
      setInquiries(r.inquiries);
      return r.inquiries;
    }
    return inquiries;
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      if (activeTab === "all" && i.status === "closed") return false;
      if (activeTab === "booking") {
        if (i.type !== "booking") return false;
        if (i.status === "converted" || i.status === "closed") return false;
      }
      if (activeTab === "question") {
        if (i.type !== "question") return false;
        if (i.status === "closed") return false;
      }
      if (activeTab === "converted" && i.status !== "converted") return false;
      if (activeTab === "closed" && i.status !== "closed") return false;

      if (propertyFilter !== "all" && i.locationId !== propertyFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          i.guestName.toLowerCase().includes(q) ||
          i.guestEmail.toLowerCase().includes(q) ||
          (i.message ?? "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [inquiries, activeTab, propertyFilter, search]);

  const selected = filteredInquiries.find((i) => i.id === selectedId) ?? null;

  const selectInquiry = (id: string) => {
    setSelectedId(id);
    setReply("");
    const target = inquiries.find((i) => i.id === id);
    if (target?.status === "new") {
      startTransition(async () => {
        await markInquiryAsRead(id);
        setInquiries((prev) =>
          prev.map((x) => (x.id === id ? { ...x, status: "read" } : x))
        );
        refreshCounts();
      });
    }
  };

  const handleStatusChange = (id: string, status: InquiryStatus) => {
    startTransition(async () => {
      const r = await updateInquiryStatus(id, status);
      if (r.success) {
        setInquiries((prev) =>
          prev.map((x) => (x.id === id ? { ...x, status } : x))
        );
        refreshCounts();
        toast.success(t(`status.${status}`));
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const r = await deleteInquiry(id);
      if (r.success) {
        setInquiries((prev) => prev.filter((x) => x.id !== id));
        if (selectedId === id) setSelectedId(null);
        setConfirmDeleteId(null);
        refreshCounts();
        toast.success(t("detail.deleted"));
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  };

  const handleSendReply = () => {
    if (!selected || !reply.trim()) return;
    startTransition(async () => {
      const r = await replyToInquiry(selected.id, reply.trim());
      if (r.success) {
        setInquiries((prev) =>
          prev.map((x) =>
            x.id === selected.id
              ? { ...x, hostReply: reply.trim(), repliedAt: new Date(), status: "replied" }
              : x
          )
        );
        setReply("");
        refreshCounts();
        toast.success(t("detail.replySaved"));
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  };

  const copyGuestDetails = () => {
    if (!selected) return;
    const lines = [
      selected.guestName,
      selected.guestEmail,
      selected.guestPhone,
      selected.guestNationality,
    ].filter(Boolean);
    copyToClipboard(lines.join("\n"), t("detail.copied"));
  };

  const onInquiryCreated = async () => {
    const list = await refreshInquiries();
    refreshCounts();
    if (list[0]) setSelectedId(list[0].id);
  };

  const onConverted = (newSelected?: Inquiry | null) => {
    refreshInquiries();
    refreshCounts();
    if (newSelected) setSelectedId(newSelected.id);
  };

  const tabs: { key: TabKey; count: number }[] = [
    { key: "all", count: counts.total },
    { key: "booking", count: counts.booking },
    { key: "question", count: counts.question },
    { key: "converted", count: counts.converted },
    { key: "closed", count: counts.closed },
  ];

  return (
    <>
      <div className="flex h-[calc(100dvh-8rem)] flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
            {counts.unread > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                {counts.unread > 9 ? "9+" : counts.unread}
              </span>
            )}
          </div>
          <Button
            onClick={() => setManualOpen(true)}
            icon={<Plus className="size-4" />}
            className="cursor-pointer"
          >
            {t("newInquiry")}
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xenia lg:flex-row">
          <div
            className={cn(
              "flex min-h-0 flex-col border-border/40 lg:w-[380px] lg:shrink-0 lg:border-r",
              selected && "hidden lg:flex"
            )}
          >
            <div className="space-y-3 p-4">
              <div className="-mx-1 flex items-center gap-4 border-b border-border/40 px-1">
                {tabs.map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "relative cursor-pointer whitespace-nowrap py-2 text-xs font-medium transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {t(`tabs.${tab.key}`)}
                        {tab.count > 0 && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {tab.count}
                          </span>
                        )}
                      </span>
                      {active && (
                        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("search")}
                  className="pl-8"
                />
              </div>

              {locations.length > 1 && (
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      {t("allProperties")}
                    </SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="cursor-pointer">
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <ScrollArea className="min-h-0 flex-1 border-t border-border/40">
              {filteredInquiries.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                  <MessageSquare className="size-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium">{t(`empty.${activeTab}`)}</p>
                  {activeTab === "all" && (
                    <p className="text-xs text-muted-foreground">
                      {t("empty.allHint")}
                    </p>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {filteredInquiries.map((inquiry) => {
                    const isBooking = inquiry.type === "booking";
                    const isSelected = inquiry.id === selectedId;
                    const isNew = inquiry.status === "new";
                    return (
                      <li key={inquiry.id}>
                        <button
                          onClick={() => selectInquiry(inquiry.id)}
                          className={cn(
                            "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/50",
                            isSelected && "bg-muted/70"
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                              isBooking ? "bg-primary" : "bg-amber-500"
                            )}
                          >
                            {getInitials(inquiry.guestName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={cn(
                                  "truncate text-sm",
                                  isNew ? "font-semibold" : "font-medium"
                                )}
                              >
                                {inquiry.guestName}
                              </p>
                              <span className="shrink-0 text-[10px] text-muted-foreground">
                                {relativeTime(inquiry.createdAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {isBooking ? (
                                <>
                                  <CalendarDays className="mr-1 inline size-3" />
                                  {inquiry.checkIn &&
                                    new Date(inquiry.checkIn).toLocaleDateString(locale, {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  {" — "}
                                  {inquiry.checkOut &&
                                    new Date(inquiry.checkOut).toLocaleDateString(locale, {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                </>
                              ) : (
                                <>
                                  <MessageCircle className="mr-1 inline size-3" />
                                  {t("types.question")}
                                </>
                              )}
                            </p>
                            {inquiry.message && (
                              <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                                {inquiry.message}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-2">
                              {locations.length > 1 && (
                                <span className="truncate text-[10px] text-muted-foreground">
                                  {inquiry.location.name}
                                </span>
                              )}
                              {isNew && (
                                <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-green-700 dark:text-green-400">
                                  {t("status.new")}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </div>

          <div
            className={cn(
              "relative flex min-h-0 flex-1 flex-col",
              !selected && "hidden lg:flex"
            )}
          >
            {selected ? (
              <>
                <div className="border-b border-border/40 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedId(null)}
                        className="shrink-0 cursor-pointer lg:hidden"
                        aria-label="Back"
                      >
                        <ArrowLeft className="size-4" />
                      </Button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase",
                              selected.type === "booking"
                                ? "bg-primary/15 text-primary"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            )}
                          >
                            {t(`types.${selected.type}`)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t(`status.${selected.status}`)}
                          </span>
                        </div>
                        <h2 className="mt-1.5 text-2xl font-semibold">{selected.guestName}</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {selected.guestEmail}
                          {selected.guestPhone && ` · ${selected.guestPhone}`}
                          {selected.guestNationality && ` · ${selected.guestNationality}`}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("detail.received")} {relativeTime(selected.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1">
                      {selected.guestPhone && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          icon={<MessageCircle className="size-3.5" />}
                          className="cursor-pointer"
                        >
                          <a
                            href={`https://wa.me/${selected.guestPhone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t("detail.whatsapp")}
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyGuestDetails}
                        icon={<Copy className="size-3.5" />}
                        className="cursor-pointer"
                      >
                        {t("detail.copyDetails")}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                          >
                            {t("detail.markAs")}
                            <ChevronDown className="ml-1 size-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(["new", "read", "replied", "closed"] as const).map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => handleStatusChange(selected.id, s)}
                              className="cursor-pointer"
                            >
                              {t(`status.${s}`)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            aria-label="More"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {selected.type === "booking" &&
                            selected.status !== "converted" && (
                              <DropdownMenuItem
                                onClick={() => setConvertOpen(true)}
                                className="cursor-pointer"
                              >
                                {t("detail.convertButton")}
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setConfirmDeleteId(selected.id)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-3.5" />
                            {t("detail.deleteInquiry")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                </div>

                <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:block!">
                  <div className="space-y-6 p-5 pb-32">
                  {selected.type === "booking" ? (
                    <BookingDetail
                      inquiry={selected}
                      locale={locale}
                      locations={locations}
                    />
                  ) : (
                    selected.message && (
                      <section>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          {t("detail.message")}
                        </h3>
                        <div className="whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/30 p-4 text-base leading-relaxed">
                          {selected.message}
                        </div>
                      </section>
                    )
                  )}

                  {selected.specialRequests && (
                    <section>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("detail.specialRequests")}
                      </h3>
                      <div className="whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/30 p-4 text-base leading-relaxed">
                        {selected.specialRequests}
                      </div>
                    </section>
                  )}

                  {selected.status === "converted" && selected.reservation && (
                    <section className="rounded-xl border border-green-500/30 bg-green-50 p-5 dark:bg-green-950/20">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                        ✅ {t("detail.converted")}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("detail.guestPage")}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 font-mono text-xs dark:bg-neutral-900">
                          {GUEST_BASE_URL}/{selected.reservation.guestToken}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(
                              `${GUEST_BASE_URL}/${selected.reservation!.guestToken}`,
                              t("detail.copied")
                            )
                          }
                          className="shrink-0 cursor-pointer"
                          aria-label="Copy"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="shrink-0 cursor-pointer"
                          aria-label="Open"
                        >
                          <a
                            href={`${GUEST_BASE_URL}/${selected.reservation.guestToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    </section>
                  )}

                  {selected.type === "booking" && selected.status !== "converted" && (
                    <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                      <p className="text-sm font-semibold">✅ {t("detail.convertTitle")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("detail.convertHint")}
                      </p>
                      <Button
                        onClick={() => setConvertOpen(true)}
                        className="mt-3 cursor-pointer"
                        size="sm"
                      >
                        {t("detail.convertButton")}
                      </Button>
                    </section>
                  )}

                  {selected.hostReply && (
                    <section>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("detail.yourReply")}
                      </h3>
                      <div className="whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/30 p-4 text-base leading-relaxed">
                        {selected.hostReply}
                      </div>
                      {selected.repliedAt && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {t("detail.sent")} {relativeTime(selected.repliedAt)}
                        </p>
                      )}
                    </section>
                  )}
                  </div>
                </ScrollArea>

                {selected.status !== "converted" && selected.status !== "closed" && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-5">
                    <div className="pointer-events-auto w-full max-w-2xl">
                      <div className="group relative flex items-end gap-2 rounded-3xl border border-border/60 bg-card/95 p-2 pl-5 shadow-2xl backdrop-blur-xl transition-colors focus-within:border-primary/60">
                        <Textarea
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                          rows={1}
                          placeholder={t("detail.replyPlaceholder")}
                          className="max-h-40 min-h-[40px] flex-1 resize-none border-0 bg-transparent p-0 py-2 text-base shadow-none focus-visible:ring-0"
                        />
                        <Button
                          onClick={handleSendReply}
                          disabled={!reply.trim() || isPending}
                          size="icon"
                          className="size-9 shrink-0 cursor-pointer rounded-full"
                          aria-label={t("detail.sendReply")}
                        >
                          {isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Send className="size-4" />
                          )}
                        </Button>
                      </div>
                      <p className="mt-2 text-center text-[11px] text-muted-foreground">
                        {t("detail.replyNote")}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                <MessageSquare className="size-12 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("detail.selectHint")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ManualInquirySheet
        open={manualOpen}
        onOpenChange={setManualOpen}
        locations={locations}
        onCreated={onInquiryCreated}
      />

      {selected && selected.type === "booking" && (
        <ConvertToReservationSheet
          open={convertOpen}
          onOpenChange={setConvertOpen}
          inquiry={selected}
          locations={locations}
          onConverted={() => {
            onConverted(null);
            setConvertOpen(false);
          }}
        />
      )}

      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => !o && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("detail.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("detail.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {t("detail.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmDeleteId) handleDelete(confirmDeleteId);
              }}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
            >
              {t("detail.deleteInquiry")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function BookingDetail({
  inquiry,
  locale,
  locations,
}: {
  inquiry: Inquiry;
  locale: string;
  locations: LocationLite[];
}) {
  const t = useTranslations("Admin.inbox");
  const nights = nightCount(inquiry.checkIn, inquiry.checkOut);
  const location = locations.find((l) => l.id === inquiry.locationId);

  const rate = location?.baseNightlyRate ?? null;
  const cleaning = location?.cleaningFee ?? 0;
  const cityTaxPerPersonNight = location?.cityTax ?? 0;
  const guests = inquiry.numberOfGuests ?? 1;
  const stayTotal = rate != null ? rate * nights : null;
  const cityTaxTotal = cityTaxPerPersonNight * guests * nights;
  const estimatedTotal =
    stayTotal != null ? stayTotal + cleaning + cityTaxTotal : null;

  const unitLabel =
    inquiry.unit?.name ?? t("detail.anyAvailable");

  return (
    <>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("detail.stayDetails")}
        </h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-base">
          <dt className="text-muted-foreground">{t("detail.property")}</dt>
          <dd className="font-medium">{inquiry.location.name}</dd>
          <dt className="text-muted-foreground">{t("detail.checkIn")}</dt>
          <dd className="font-medium">{formatDate(inquiry.checkIn, locale)}</dd>
          <dt className="text-muted-foreground">{t("detail.checkOut")}</dt>
          <dd className="font-medium">{formatDate(inquiry.checkOut, locale)}</dd>
          <dt className="text-muted-foreground">{t("detail.duration")}</dt>
          <dd className="font-medium">
            {nights} {t("detail.nights")}
          </dd>
          <dt className="text-muted-foreground">{t("detail.guests")}</dt>
          <dd className="font-medium">{guests}</dd>
          <dt className="text-muted-foreground">{t("detail.unitRequested")}</dt>
          <dd className="font-medium">{unitLabel}</dd>
        </dl>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("detail.priceEstimate")}
        </h3>
        {stayTotal == null ? (
          <p className="rounded-lg border border-dashed border-border/60 p-4 text-base text-muted-foreground">
            {t("detail.pricingNotConfigured")}
          </p>
        ) : (
          <div className="rounded-lg border border-border/40 bg-muted/30 p-5">
            <dl className="space-y-2 text-base">
              <div className="flex justify-between">
                <dt>
                  {nights} × €{rate}
                </dt>
                <dd className="font-medium">€{stayTotal.toFixed(2)}</dd>
              </div>
              {cleaning > 0 && (
                <div className="flex justify-between">
                  <dt>{t("detail.cleaningFee")}</dt>
                  <dd className="font-medium">€{cleaning.toFixed(2)}</dd>
                </div>
              )}
              {cityTaxTotal > 0 && (
                <div className="flex justify-between">
                  <dt>{t("detail.cityTax")}</dt>
                  <dd className="font-medium">€{cityTaxTotal.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border/40 pt-2 text-lg font-semibold">
                <dt>{t("detail.estimatedTotal")}</dt>
                <dd>€{estimatedTotal!.toFixed(2)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("detail.estimateNote")}
            </p>
          </div>
        )}
      </section>

      {inquiry.message && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("detail.message")}
          </h3>
          <div className="whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/30 p-4 text-base leading-relaxed">
            {inquiry.message}
          </div>
        </section>
      )}
    </>
  );
}
