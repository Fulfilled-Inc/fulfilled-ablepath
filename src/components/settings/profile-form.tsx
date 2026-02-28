"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

type Props = {
  profile: Profile;
};

export function ProfileForm({ profile }: Props) {
  const t = useTranslations();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [locale, setLocale] = useState(profile.locale);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        locale,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{t("settings.profile")}</h2>

      <div className="space-y-4">
        {/* Email (읽기 전용) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            {t("auth.email")}
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
          />
        </div>

        {/* Display Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Language */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("settings.language")}
          </label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
          </select>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("common.save")}
          </button>
          {saved && (
            <span className="text-sm text-accent">✓ Saved successfully</span>
          )}
        </div>
      </div>
    </div>
  );
}
