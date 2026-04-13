"use client";

import { Camera, Save, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateHostProfile } from "@/server_actions/settings";

interface ProfileSectionProps {
  profile: {
    name: string | null;
    email: string;
    image: string | null;
    displayName: string | null;
    phone: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const t = useTranslations("Admin.settings.profile");
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(profile.name ?? "");
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");

  const initials = (profile.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateHostProfile({
        name: name || undefined,
        displayName: displayName || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
      });
      if (result.success) {
        toast.success(t("saved"));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 lg:max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage src={profile.avatarUrl ?? profile.image ?? undefined} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <Button type="button" variant="outline" size="sm" disabled className="cursor-pointer" icon={<Camera className="size-4" />}>
          {t("changePhoto")}
        </Button>
      </div>

      {/* Name fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>
            <User className="inline size-3.5" /> {t("fullName")}
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("displayName")}</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={name.split(" ")[0] || ""}
          />
          <p className="text-xs text-muted-foreground">{t("displayNameHint")}</p>
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <Label>{t("email")}</Label>
        <Input value={profile.email} readOnly className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{t("emailHint")}</p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label>{t("phone")}</Label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+30 6900000000"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label>{t("bio")}</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 300))}
          placeholder={t("bioPlaceholder")}
          rows={4}
        />
        <div className="flex justify-between">
          <p className="text-xs text-muted-foreground">{t("bioHint")}</p>
          <p className="text-xs text-muted-foreground">{bio.length}/300</p>
        </div>
      </div>

      <Button
        type="submit"
        loading={isPending}
        icon={<Save className="size-4" />}
        className="cursor-pointer"
      >
        {t("save")}
      </Button>
    </form>
  );
}
