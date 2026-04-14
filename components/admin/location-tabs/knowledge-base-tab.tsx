"use client";

import {
  Bed,
  Bus,
  Lightbulb,
  MapPin,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Utensils,
  Waves,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createKnowledgeEntry,
  deleteKnowledgeEntry,
  resolveUnansweredQuestion,
} from "@/server_actions/locations-extra";

type Category =
  | "appliances"
  | "local"
  | "transport"
  | "restaurants"
  | "experiences"
  | "beach"
  | "other";

const CATEGORY_ICONS: Record<Category, typeof Lightbulb> = {
  appliances: Bed,
  local: MapPin,
  transport: Bus,
  restaurants: Utensils,
  experiences: Star,
  beach: Waves,
  other: Lightbulb,
};

const CATEGORIES: Category[] = [
  "appliances",
  "local",
  "transport",
  "restaurants",
  "experiences",
  "beach",
  "other",
];

const SUGGESTIONS: { question: string; category: Category }[] = [
  { question: "How does the AC work?", category: "appliances" },
  { question: "Where should we eat tonight?", category: "restaurants" },
  { question: "Best beach nearby?", category: "beach" },
  { question: "How do I get a taxi?", category: "transport" },
  { question: "Where is the nearest ATM?", category: "local" },
  { question: "Is there a supermarket nearby?", category: "local" },
  { question: "What time does the pool open?", category: "local" },
  { question: "How do I use the washing machine?", category: "appliances" },
  { question: "Where can I rent a car?", category: "transport" },
  { question: "What's the best sunset spot?", category: "experiences" },
];

interface KnowledgeEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  timesAsked: number;
}

interface UnansweredQuestion {
  id: string;
  question: string;
  askedCount: number;
}

interface KnowledgeBaseTabProps {
  locationId: string;
  initialEntries: KnowledgeEntry[];
  initialUnanswered: UnansweredQuestion[];
}

export function KnowledgeBaseTab({
  locationId,
  initialEntries,
  initialUnanswered,
}: KnowledgeBaseTabProps) {
  const t = useTranslations("Admin.locations.knowledgeBase");
  const [entries, setEntries] = useState(initialEntries);
  const [unanswered, setUnanswered] = useState(initialUnanswered);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [isPending, startTransition] = useTransition();

  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState<Category>("local");
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");

  const filteredEntries =
    filter === "all" ? entries : entries.filter((e) => e.category === filter);

  const openFormWith = (question: string, category: Category) => {
    setFormQuestion(question);
    setFormCategory(category);
    setFormAnswer("");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formQuestion.trim() || !formAnswer.trim()) return;
    startTransition(async () => {
      const result = await createKnowledgeEntry(locationId, {
        category: formCategory,
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
      });
      if (result.success && result.entry) {
        setEntries((prev) => [result.entry!, ...prev]);
        setShowForm(false);
        setFormQuestion("");
        setFormAnswer("");
        toast.success(t("created"));
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteKnowledgeEntry(id);
      if (result.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast.success(t("deleted"));
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDismissUnanswered = (id: string) => {
    startTransition(async () => {
      const result = await resolveUnansweredQuestion(id);
      if (result.success) {
        setUnanswered((prev) => prev.filter((q) => q.id !== id));
      }
    });
  };

  const handleAnswerUnanswered = (q: UnansweredQuestion) => {
    openFormWith(q.question, "local");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Unanswered questions */}
      {unanswered.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
              {t("unansweredTitle")}
            </p>
          </div>
          <p className="mb-3 text-xs text-amber-800 dark:text-amber-400">
            {t("unansweredHint", { count: unanswered.length })}
          </p>
          <div className="space-y-2">
            {unanswered.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-2 rounded-lg bg-white p-3 dark:bg-card"
              >
                <p className="min-w-0 flex-1 truncate text-sm">{q.question}</p>
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
                  ×{q.askedCount}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 cursor-pointer"
                  onClick={() => handleAnswerUnanswered(q)}
                >
                  {t("addAnswer")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 cursor-pointer"
                  onClick={() => handleDismissUnanswered(q.id)}
                >
                  {t("dismiss")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter pills */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            {t("all")}
          </FilterPill>
          {CATEGORIES.map((cat) => {
            const count = entries.filter((e) => e.category === cat).length;
            if (count === 0) return null;
            return (
              <FilterPill
                key={cat}
                active={filter === cat}
                onClick={() => setFilter(cat)}
              >
                {t(`categories.${cat}`)} ({count})
              </FilterPill>
            );
          })}
        </div>
      )}

      {/* Entries list */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const Icon = CATEGORY_ICONS[entry.category as Category] ?? Lightbulb;
            return (
              <div key={entry.id} className="rounded-xl bg-muted/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {t(`categories.${entry.category}` as never)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.timesAsked > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {t("askedTimes", { count: entry.timesAsked })}
                      </span>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 cursor-pointer"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-semibold">Q: {entry.question}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  A: {entry.answer}
                </p>
              </div>
            );
          })}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl bg-muted/30 p-6 text-center">
          <p className="text-sm font-semibold">{t("empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("emptyHint")}</p>
        </div>
      ) : null}

      {/* Add entry form */}
      {showForm ? (
        <div className="space-y-3 rounded-xl bg-muted/30 p-4">
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            <Select
              value={formCategory}
              onValueChange={(v) => setFormCategory(v as Category)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="cursor-pointer">
                    {t(`categories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("question")}</Label>
            <Input
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              placeholder={t("questionPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("answer")}</Label>
            <Textarea
              value={formAnswer}
              onChange={(e) => setFormAnswer(e.target.value)}
              placeholder={t("answerPlaceholder")}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              loading={isPending}
              className="cursor-pointer"
              icon={<Plus className="size-3" />}
            >
              {t("save")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="cursor-pointer"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setShowForm(true);
            setFormQuestion("");
            setFormAnswer("");
          }}
          className="cursor-pointer"
          icon={<Plus className="size-3" />}
        >
          {t("addEntry")}
        </Button>
      )}

      {/* Quick-start suggestions */}
      {entries.length === 0 && !showForm && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t("suggestions")}</Label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Button
                key={s.question}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openFormWith(s.question, s.category)}
                className="cursor-pointer"
                icon={<Plus className="size-3" />}
              >
                {s.question}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  );
}
