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
          href="/missions"
        />
        <QuickStatCard
          icon={<SmilePlus className="h-6 w-6 text-accent" />}
          label={t("dashboard.moodToday")}
          value={todayMood ? getMoodEmoji(todayMood.mood) : "—"}
          href="/mood"
        />
        <QuickStatCard
          icon={<Brain className="h-6 w-6 text-primary" />}
          label={t("nav.aiGuide")}
          value="Ask a question"
          href="/ai-guide"
        />
      </section>

      {/* Secure Therapist Report (안심 리포트 위젯) */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <BookOpen className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              {t("secureReport.title")}
            </h2>
            <Link
              href="/secure-reports" // 나중에 안심 리포트만 모아보는 페이지로 연결
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
            >
              {t("secureReport.viewAll")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* 가상의 최근 일지 데이터 (MOCK) */}
          <div className="bg-white dark:bg-card rounded-xl p-5 shadow-sm border border-indigo-50 dark:border-indigo-900/40">
             <div className="flex items-start justify-between mb-3 border-b border-border pb-3">
               <div>
                 <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                   {t("secureReport.newBadge")}
                 </span>
                 <h3 className="font-semibold text-foreground">발음 교정 및 언어 촉진 치료 3회차</h3>
                 <p className="text-xs text-muted-foreground mt-1">2026. 04. 30 · 김민지 선생님 (언어치료사)</p>
               </div>
             </div>
             
             <div>
               <p className="text-sm font-medium text-muted-foreground mb-1">{t("secureReport.observation")}</p>
               <p className="text-sm text-foreground leading-relaxed">
                 하윤이가 오늘 거울을 보면서 입 모양을 따라하는 연습을 아주 훌륭하게 해냈습니다. 처음에는 낯설어했지만 10분 정도 지나자 스스로 입을 크게 벌리며 소리를 내려고 노력하는 모습이 기특했어요. 집에서도 식사 시간에 입을 크게 벌리는 놀이를 함께 해주시면 더 좋을 것 같습니다.
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* Today's Missions Preview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("dashboard.todayMissions")}</h2>
          <Link
            href="/missions"
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
