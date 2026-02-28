"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";

export function Header() {
  const t = useTranslations();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold">{t("common.appName")}</span>
      </div>
    </header>
  );
}
