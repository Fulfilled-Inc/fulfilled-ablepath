import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { MoodPicker } from "@/components/mood/mood-picker";
import { MoodCalendar } from "@/components/mood/mood-calendar";
import type { Mood } from "@/types";

export default async function MoodPage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 첫 번째 아이 가져오기
  const { data: children } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", user?.id ?? "")
    .limit(1);

  const child = children?.[0] ?? null;

  // 오늘 기분 기록 확인
  const today = new Date().toISOString().split("T")[0];
  const { data: todayMoodData } = child
    ? await supabase
        .from("mood_logs")
        .select("mood")
        .eq("child_id", child.id)
        .eq("logged_date", today)
        .maybeSingle()
    : { data: null };

  // 최근 30일 기분 기록
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: moodEntries } = child
    ? await supabase
        .from("mood_logs")
        .select("logged_date, mood")
        .eq("child_id", child.id)
        .gte("logged_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("logged_date", { ascending: true })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("nav.mood")}</h1>
        <p className="mt-1 text-muted-foreground">
          {child
            ? `Track how ${child.name} is feeling each day.`
            : "Record your child's daily mood."}
        </p>
      </div>

      {/* Today's Mood Picker */}
      <MoodPicker
        childId={child?.id ?? null}
        todayMood={(todayMoodData?.mood as Mood) ?? null}
      />

      {/* Mood History Calendar */}
      {child && <MoodCalendar entries={moodEntries ?? []} />}
    </div>
  );
}
