"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Mood } from "@/types";

type Props = {
  childId: string | null;
  todayMood: Mood | null;
};

const moods: { value: Mood; emoji: string }[] = [
  { value: "great", emoji: "😄" },
  { value: "good", emoji: "🙂" },
  { value: "neutral", emoji: "😐" },
  { value: "bad", emoji: "😟" },
  { value: "awful", emoji: "😢" },
];

export function MoodPicker({ childId, todayMood }: Props) {
  const t = useTranslations("mood");
  const [selected, setSelected] = useState<Mood | null>(todayMood);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(!!todayMood);
  const [note, setNote] = useState("");

  async function handleSave() {
    if (!childId || !selected || loading) return;
    setLoading(true);

    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("mood_logs").upsert(
      {
        child_id: childId,
        mood: selected,
        note: note || null,
        logged_date: today,
      },
      { onConflict: "child_id,logged_date" }
    );

    if (!error) {
      setSaved(true);
    }
    setLoading(false);
  }

  if (!childId) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-4xl mb-3">👶</p>
        <p className="font-medium text-foreground">No child registered yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Go to Settings to add your child&apos;s information first.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {saved ? (
        /* 저장 완료 상태 */
        <div className="text-center py-4">
          <p className="text-5xl mb-4">
            {moods.find((m) => m.value === selected)?.emoji}
          </p>
          <p className="text-lg font-semibold text-foreground">{t("recorded")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Feeling {t(selected!)} today
          </p>
          <button
            onClick={() => setSaved(false)}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Change mood
          </button>
        </div>
      ) : (
        /* 선택 UI */
        <div>
          <p className="mb-6 text-center text-lg font-medium text-foreground">
            How is your child feeling today?
          </p>

          {/* Emoji Grid */}
          <div className="flex justify-center gap-4 mb-6">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelected(mood.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                  selected === mood.value
                    ? "border-primary bg-primary/5 scale-110"
                    : "border-transparent hover:border-border hover:bg-muted"
                )}
              >
                <span className="text-4xl">{mood.emoji}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {t(mood.value)}
                </span>
              </button>
            ))}
          </div>

          {/* Optional Note */}
          {selected && (
            <div className="space-y-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Mood"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
