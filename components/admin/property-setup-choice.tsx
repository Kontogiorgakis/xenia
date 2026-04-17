"use client";

import { ArrowRight, Building2, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/lib/i18n/navigation";

export function PropertySetupChoice() {
  const t = useTranslations("Admin.propertySetup");
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Single apartment card */}
        <button
          type="button"
          onClick={() => router.push("/admin/properties/setup/single")}
          className="group cursor-pointer rounded-2xl border border-border/40 bg-card p-6 text-left shadow-xenia transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xenia-md sm:p-8"
        >
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
            <Home className="size-7" />
          </div>

          <h2 className="text-lg font-semibold">{t("single.title")}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t("single.description")}
          </p>

          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground/80">
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground/40">·</span>
              {t("single.bullet1")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground/40">·</span>
              {t("single.bullet2")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground/40">·</span>
              {t("single.bullet3")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground/40">·</span>
              {t("single.bullet4")}
            </li>
          </ul>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
            {t("single.cta")}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </button>

        {/* Multi apartment card */}
        <button
          type="button"
          onClick={() => router.push("/admin/properties/new")}
          className="group cursor-pointer rounded-2xl border border-border/40 bg-card p-6 text-left shadow-xenia transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xenia-md sm:p-8"
        >
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
            <Building2 className="size-7" />
          </div>

          <h2 className="text-lg font-semibold">{t("multi.title")}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t("multi.description")}
          </p>

          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground/80">
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground/40">·</span>
              {t("multi.bullet1")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground/40">·</span>
              {t("multi.bullet2")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground/40">·</span>
              {t("multi.bullet3")}
            </li>
          </ul>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
            {t("multi.cta")}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t("hint")}
      </p>
    </div>
  );
}
