import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { BookOpen, SmilePlus, Brain, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getTranslations();

  // 사용자 프로필 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user?.id ?? "")
    .single();

  const displayName =
    profile?.display_name ?? user?.email?.split("@")[0] ?? "Parent";

  // 오늘 미션 로그 수
  const today = new Date().toISOString().split("T")[0];
  const { count: completedToday } = await supabase
    .from("mission_logs")
    .select("*", { count: "exact", head: true })
    .gte("completed_at", `${today}T00:00:00`)
    .lte("completed_at", `${today}T23:59:59`);

  // 오늘 기분 기록 여부
  const { data: todayMood } = await supabase
    .from("mood_logs")
    .select("mood")
    .eq("logged_date", today)
    .maybeSingle();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <h1 className="text-2xl font-bold text-foreground">
          {t("dashboard.welcome", { name: displayName })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening today.
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <QuickStatCard
          icon={<BookOpen className="h-6 w-6 text-primary" />}
          label={t("dashboard.todayMissions")}
          value={`${completedToday ?? 0} / 3`}
          href="/dashboard/missions"
        />
        <QuickStatCard
          icon={<SmilePlus className="h-6 w-6 text-accent" />}
          label={t("dashboard.moodToday")}
          value={todayMood ? getMoodEmoji(todayMood.mood) : "—"}
          href="/dashboard/mood"
        />
        <QuickStatCard
          icon={<Brain className="h-6 w-6 text-primary" />}
          label={t("nav.aiGuide")}
          value="Ask a question"
          href="/dashboard/ai-guide"
        />
      </section>

      {/* Today's Missions Preview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("dashboard.todayMissions")}</h2>
          <Link
            href="/dashboard/missions"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MissionPreviewCard
            emoji="🗣️"
            category={t("missions.language")}
            title="Practice naming 5 objects"
            color="bg-orange-50 border-orange-200"
          />
          <MissionPreviewCard
            emoji="🎨"
            category={t("missions.sensory")}
            title="Play with textured materials"
            color="bg-green-50 border-green-200"
          />
          <MissionPreviewCard
            emoji="🧩"
            category={t("missions.cognitive")}
            title="Sort shapes by color"
            color="bg-blue-50 border-blue-200"
          />
        </div>
      </section>
    </div>
  );
}

function QuickStatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="rounded-xl bg-muted p-3">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-card-foreground">{value}</p>
      </div>
    </Link>
  );
}

function MissionPreviewCard({
  emoji,
  category,
  title,
  color,
}: {
  emoji: string;
  category: string;
  title: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${color}`}
    >
      <div className="mb-2 text-2xl">{emoji}</div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {category}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
    </div>
  );
}

function getMoodEmoji(mood: string): string {
  const map: Record<string, string> = {
    great: "😄",
    good: "🙂",
    neutral: "😐",
    bad: "😟",
    awful: "😢",
  };
  return map[mood] ?? "—";
}
