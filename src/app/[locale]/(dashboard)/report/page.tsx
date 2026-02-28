import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { WeeklyChart } from "@/components/report/weekly-chart";
import { MoodSummary } from "@/components/report/mood-summary";
import { CalendarDays, FileDown } from "lucide-react";
import Link from "next/link";

export default async function ReportPage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 첫 번째 아이
  const { data: children } = await supabase
    .from("children")
    .select("id, name")
    .eq("parent_id", user?.id ?? "")
    .limit(1);

  const child = children?.[0] ?? null;

  // 이번 주 월~일 날짜 범위 계산
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const weekStart = monday.toISOString();
  const weekEnd = sunday.toISOString();
  const weekStartDate = monday.toISOString().split("T")[0];
  const weekEndDate = sunday.toISOString().split("T")[0];

  // 이번 주 미션 로그
  const { data: missionLogs } = child
    ? await supabase
        .from("mission_logs")
        .select("completed_at, mission_id, missions(category)")
        .eq("child_id", child.id)
        .eq("status", "completed")
        .gte("completed_at", weekStart)
        .lte("completed_at", weekEnd)
    : { data: [] };

  // 요일별 카테고리별 집계
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = dayNames.map((day, i) => {
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + i);
    const dateStr = targetDate.toISOString().split("T")[0];

    const dayLogs = (missionLogs ?? []).filter((log) =>
      log.completed_at?.startsWith(dateStr)
    );

    return {
      day,
      language: dayLogs.filter(
        (l) => (l as any).missions?.category === "language"
      ).length,
      sensory: dayLogs.filter(
        (l) => (l as any).missions?.category === "sensory"
      ).length,
      cognitive: dayLogs.filter(
        (l) => (l as any).missions?.category === "cognitive"
      ).length,
    };
  });

  // 이번 주 무드 기록
  const { data: moodEntries } = child
    ? await supabase
        .from("mood_logs")
        .select("logged_date, mood")
        .eq("child_id", child.id)
        .gte("logged_date", weekStartDate)
        .lte("logged_date", weekEndDate)
        .order("logged_date", { ascending: true })
    : { data: [] };

  // 총 완료 수
  const totalCompleted = (missionLogs ?? []).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("nav.report")}</h1>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm">
              {monday.toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })}{" "}
              –{" "}
              {sunday.toLocaleDateString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <Link
          href="report/pdf"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-blue-600 hover:to-violet-600 hover:shadow-lg"
        >
          <FileDown className="h-4 w-4" />
          PDF
        </Link>
      </div>

      {!child ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium text-foreground">No child registered</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your child in Settings to start tracking progress.
          </p>
        </div>
      ) : (
        <>
          {/* Weekly Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Missions Completed"
              value={totalCompleted.toString()}
              sub="this week"
            />
            <StatCard
              label="Days Active"
              value={(moodEntries ?? []).length.toString()}
              sub="of 7 days"
            />
            <StatCard
              label="Completion Rate"
              value={`${Math.round((totalCompleted / 21) * 100)}%`}
              sub="21 possible"
            />
          </div>

          {/* Charts */}
          <WeeklyChart data={chartData} />
          <MoodSummary entries={moodEntries ?? []} />
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
