"use client";

import {
  AlertTriangle,
  Car,
  Heart,
  Phone,
  Pill,
  Plus,
  Trash2,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { createContact, deleteContact } from "@/server_actions/locations";
import { ContactCategory } from "@/types/xenia";

const CATEGORY_CONFIG: Record<ContactCategory, { icon: typeof Phone; color: string }> = {
  emergency: { icon: AlertTriangle, color: "text-red-500" },
  medical: { icon: Heart, color: "text-red-500" },
  transport: { icon: Car, color: "text-blue-500" },
  food: { icon: UtensilsCrossed, color: "text-amber-500" },
  services: { icon: Wrench, color: "text-gray-500" },
  pharmacy: { icon: Pill, color: "text-green-500" },
  other: { icon: Phone, color: "text-gray-500" },
};

const SUGGESTIONS = [
  { name: "Emergency (112)", category: "emergency" as ContactCategory, phone: "112" },
  { name: "Ambulance (166)", category: "medical" as ContactCategory, phone: "166" },
  { name: "Police (100)", category: "emergency" as ContactCategory, phone: "100" },
  { name: "Fire dept (199)", category: "emergency" as ContactCategory, phone: "199" },
  { name: "Local taxi", category: "transport" as ContactCategory, phone: "" },
  { name: "Nearest pharmacy", category: "pharmacy" as ContactCategory, phone: "" },
  { name: "Local doctor", category: "medical" as ContactCategory, phone: "" },
  { name: "Airport transfer", category: "transport" as ContactCategory, phone: "" },
  { name: "Food delivery", category: "food" as ContactCategory, phone: "" },
  { name: "Mini market", category: "food" as ContactCategory, phone: "" },
  { name: "Car rental", category: "transport" as ContactCategory, phone: "" },
  { name: "Tourist info", category: "other" as ContactCategory, phone: "" },
];

interface ContactsSectionProps {
  locationId: string;
  initialContacts: {
    id: string;
    category: string;
    name: string;
    phone: string;
    notes: string | null;
    icon: string | null;
    displayOrder: number;
  }[];
}

export function ContactsSection({ locationId, initialContacts }: ContactsSectionProps) {
  const t = useTranslations("Admin.locations.contacts");
  const [contacts, setContacts] = useState(initialContacts);
  const [isPending, startTransition] = useTransition();

  // Add contact form state
  const [category, setCategory] = useState<ContactCategory>("emergency");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  const prefillSuggestion = (suggestion: typeof SUGGESTIONS[0]) => {
    setCategory(suggestion.category);
    setName(suggestion.name);
    setPhone(suggestion.phone);
    setShowForm(true);
  };

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) return;

    startTransition(async () => {
      const result = await createContact(locationId, {
        category,
        name: name.trim(),
        phone: phone.trim(),
        notes: notes || undefined,
      });

      if (result.success && result.contact) {
        setContacts((prev) => [...prev, result.contact!]);
        setName("");
        setPhone("");
        setNotes("");
        setShowForm(false);
        toast.success(t("created"));
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteContact(id);
      if (result.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        toast.success(t("deleted"));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Existing contacts */}
      {contacts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((contact) => {
            const config = CATEGORY_CONFIG[contact.category as ContactCategory] ?? CATEGORY_CONFIG.other;
            const Icon = config.icon;
            return (
              <div key={contact.id} className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                <Icon className={`mt-0.5 size-5 shrink-0 ${config.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-lg font-semibold">{contact.phone}</p>
                  {contact.notes && (
                    <p className="text-xs text-muted-foreground">{contact.notes}</p>
                  )}
                  <Badge variant="outline" className="mt-1 text-xs">
                    {t(`categories.${contact.category as ContactCategory}`)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(contact.id)}
                  className="size-7 shrink-0 cursor-pointer"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noContacts")}</p>
      )}

      {/* Suggestions (show when few contacts) */}
      {contacts.length < 5 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t("suggestions")}</Label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.filter(
              (s) => !contacts.some((c) => c.name === s.name)
            ).slice(0, 8).map((s) => (
              <Button
                key={s.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => prefillSuggestion(s)}
                className="cursor-pointer"
                icon={<Plus className="size-3" />}
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Add contact form */}
      {showForm ? (
        <div className="max-w-xl space-y-3 rounded-lg bg-muted/30 p-4">
          <Label className="font-medium">{t("add")}</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("category")}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ContactCategory)}>
                <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_CONFIG) as ContactCategory[]).map((c) => (
                    <SelectItem key={c} value={c} className="cursor-pointer">{t(`categories.${c}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("phone")}</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+30 ..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("notes")}</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPlaceholder")} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAdd} loading={isPending} className="cursor-pointer" icon={<Plus className="size-3" />}>
              {t("add")}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="cursor-pointer">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)} className="cursor-pointer" icon={<Plus className="size-4" />}>
          {t("add")}
        </Button>
      )}
    </div>
  );
}
