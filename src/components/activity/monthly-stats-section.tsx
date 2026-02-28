"use client";

import { useState, useTransition, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  BarChart3,
  Bot,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Lightbulb,
  Loader2,
  MessageSquareHeart,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMonthlyStats } from "@/app/[locale]/(dashboard)/activity/actions";
import type { MonthlyStats } from "@/app/[locale]/(dashboard)/activity/actions";

// ═══════════════════════════════════════════
// 카테고리 메타
// ═══════════════════════════════════════════

const CATEGORY_META = {
  language: {
    emoji: "🗣️",
    colorClass: "text-sky-700",
    bgClass: "bg-sky-100",
    barColor: "bg-sky-400",
    ringColor: "ring-sky-200",
  },
  sensory: {
    emoji: "🎨",
    colorClass: "text-violet-700",
    bgClass: "bg-violet-100",
    barColor: "bg-violet-400",
    ringColor: "ring-violet-200",
  },
  cognitive: {
    emoji: "🧩",
    colorClass: "text-teal-700",
    bgClass: "bg-teal-100",
    barColor: "bg-teal-400",
    ringColor: "ring-teal-200",
  },
} as const;

// ═══════════════════════════════════════════
// 스켈레톤 로딩
// ═══════════════════════════════════════════

function MonthlyStatsSkeleton() {
  const t = useTranslations("activity");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 px-6 py-8 text-center shadow-sm">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Bot className="h-8 w-8 animate-pulse text-amber-600" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-amber-800">
          {t("monthlyAnalyzing")}
        </h3>
        <p className="text-sm text-amber-700/80">{t("monthlyAnalyzingDesc")}</p>
        <div className="mx-auto mt-4 flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
      {/* 카드 스켈레톤 */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border-2 border-border bg-muted/30 p-4">
            <div className="mb-2 h-3 w-12 rounded-full bg-muted" />
            <div className="h-8 w-16 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// 일별 막대그래프 (CSS Bar Chart)
// ═══════════════════════════════════════════

function DailyBarChart({
  breakdown,
}: {
  breakdown: MonthlyStats["dailyBreakdown"];
}) {
  const t = useTranslations("activity");
  const tm = useTranslations("missions");

  if (breakdown.length === 0) return null;

  const maxPerDay = Math.max(
    ...breakdown.map((d) => d.language + d.sensory + d.cognitive),
    1
  );

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <BarChart3 className="h-4 w-4 text-primary" />
        {t("monthlyDailyChart")}
      </h4>

      {/* 범례 */}
      <div className="mb-3 flex flex-wrap gap-3">
        {(["language", "sensory", "cognitive"] as const).map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} className="flex items-center gap-1.5">
              <div className={cn("h-2.5 w-2.5 rounded-full", meta.barColor)} />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {tm(cat)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 막대 그래프 */}
      <div className="flex items-end gap-1 overflow-x-auto pb-1" style={{ minHeight: 120 }}>
        {breakdown.map((day) => {
          const total = day.language + day.sensory + day.cognitive;
          const pct = (total / maxPerDay) * 100;
          const dayNum = day.date.split("-")[2];

          return (
            <div key={day.date} className="flex min-w-[18px] flex-1 flex-col items-center gap-0.5">
              {/* 스택 바 */}
              <div
                className="flex w-full flex-col justify-end overflow-hidden rounded-t-md"
                style={{ height: `${Math.max(pct, 5)}px`, minHeight: 4 }}
              >
                {day.cognitive > 0 && (
                  <div
                    className="w-full bg-teal-400"
                    style={{ flex: day.cognitive }}
                  />
                )}
                {day.sensory > 0 && (
                  <div
                    className="w-full bg-violet-400"
                    style={{ flex: day.sensory }}
                  />
                )}
                {day.language > 0 && (
                  <div
                    className="w-full bg-sky-400"
                    style={{ flex: day.language }}
                  />
                )}
              </div>
              <span className="text-[8px] font-medium text-muted-foreground">
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// AI 성취 요약 카드
// ═══════════════════════════════════════════

function AiSummaryCard({ stats }: { stats: MonthlyStats }) {
  const t = useTranslations("activity");
  const tm = useTranslations("missions");
  const summary = stats.aiSummary;

  if (!summary) return null;

  const insights = [
    { key: "language" as const, field: summary.language_insight },
    { key: "sensory" as const, field: summary.sensory_insight },
    { key: "cognitive" as const, field: summary.cognitive_insight },
  ];

  return (
    <div className="space-y-4">
      {/* 전체 코멘트 */}
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-5 py-4 shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
          <Sparkles className="h-4 w-4" />
          {t("monthlyOverallComment")}
        </p>
        <p className="text-sm leading-relaxed text-amber-900/80">
          {summary.overall_comment}
        </p>
      </div>

      {/* 영역별 인사이트 */}
      <div className="grid gap-3 sm:grid-cols-3">
        {insights.map(({ key, field }) => {
          const meta = CATEGORY_META[key];
          return (
            <div
              key={key}
              className={cn(
                "rounded-xl border-2 p-4",
                `border-${key === "language" ? "sky" : key === "sensory" ? "violet" : "teal"}-200`,
                `bg-gradient-to-br from-${key === "language" ? "sky" : key === "sensory" ? "violet" : "teal"}-50/50 to-white`
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">{meta.emoji}</span>
                <span className={cn("text-xs font-bold", meta.colorClass)}>
                  {tm(key)}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/80">{field}</p>
            </div>
          );
        })}
      </div>

      {/* 다음 달 제안 + 격려 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-primary/15 bg-gradient-to-r from-sky-50 to-violet-50 p-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            {t("monthlyNextSuggestion")}
          </p>
          <p className="text-xs leading-relaxed text-foreground/80">
            {summary.next_month_suggestion}
          </p>
        </div>
        <div className="rounded-xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 p-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-pink-700">
            <MessageSquareHeart className="h-3.5 w-3.5" />
            {t("monthlyEncouragement")}
          </p>
          <p className="text-xs leading-relaxed text-pink-900/80">
            {summary.encouragement}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ReportView — PDF 출력 대비 컴포넌트
// ═══════════════════════════════════════════

function ReportView({
  stats,
  childName,
  onClose,
}: {
  stats: MonthlyStats;
  childName: string;
  onClose: () => void;
}) {
  const t = useTranslations("activity");
  const tm = useTranslations("missions");
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  const summary = stats.aiSummary;
  const total = stats.totalMissions;
  const categories = ["language", "sensory", "cognitive"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div
        ref={printRef}
        className="my-8 w-full max-w-2xl rounded-2xl border-2 border-border bg-white p-8 shadow-2xl print:my-0 print:max-w-none print:rounded-none print:border-0 print:shadow-none"
      >
        {/* 헤더 — 인쇄 시에도 보임 */}
        <div className="mb-6 border-b-2 border-primary/20 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground">
                📋 {t("reportTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.monthLabel} · {childName}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                {t("printPdf")}
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border-2 border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>

        {/* 통계 요약 박스 */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <p className="text-2xl font-black text-amber-600">{total}</p>
            <p className="text-[10px] font-semibold text-amber-700">
              {t("totalMissionsLabel")}
            </p>
          </div>
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat} className={cn("rounded-xl p-3 text-center", meta.bgClass)}>
                <p className={cn("text-2xl font-black", meta.colorClass)}>
                  {stats.categoryCounts[cat]}
                </p>
                <p className={cn("text-[10px] font-semibold", meta.colorClass)}>
                  {meta.emoji} {tm(cat)}
                </p>
              </div>
            );
          })}
        </div>

        {/* 활동 일수 */}
        <div className="mb-6 rounded-xl bg-muted/50 px-4 py-3 text-center">
          <span className="text-sm text-muted-foreground">
            {t("activeDays", { days: stats.totalDays })}
          </span>
        </div>

        {/* AI 성취 요약 */}
        {summary && (
          <div className="mb-6 space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("aiMonthlySummary")}
            </h3>

            {/* 전체 코멘트 */}
            <div className="rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-sm leading-relaxed text-amber-900/80">
                {summary.overall_comment}
              </p>
            </div>

            {/* 영역별 */}
            <div className="space-y-2">
              {([
                { key: "language", insight: summary.language_insight },
                { key: "sensory", insight: summary.sensory_insight },
                { key: "cognitive", insight: summary.cognitive_insight },
              ] as const).map(({ key, insight }) => {
                const meta = CATEGORY_META[key];
                return (
                  <div key={key} className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2">
                    <span className="mt-0.5 text-sm">{meta.emoji}</span>
                    <div>
                      <span className={cn("text-xs font-bold", meta.colorClass)}>
                        {tm(key)}
                      </span>
                      <p className="text-xs leading-relaxed text-foreground/80">
                        {insight}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 다음 달 제안 */}
            <div className="rounded-xl border border-primary/15 bg-sky-50/50 px-4 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-primary">
                <Lightbulb className="h-3.5 w-3.5" />
                {t("monthlyNextSuggestion")}
              </p>
              <p className="text-xs leading-relaxed text-foreground/80">
                {summary.next_month_suggestion}
              </p>
            </div>

            {/* 격려 */}
            <div className="rounded-xl bg-pink-50 px-4 py-3">
              <p className="text-xs leading-relaxed text-pink-900/80">
                💕 {summary.encouragement}
              </p>
            </div>
          </div>
        )}

        {/* 푸터 */}
        <div className="border-t border-border pt-3 text-center text-[10px] text-muted-foreground">
          AblePath · {t("reportFooter")}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// 월 선택기
// ═══════════════════════════════════════════

function MonthSelector({
  currentMonth,
  onChange,
}: {
  currentMonth: string;
  onChange: (month: string) => void;
}) {
  const locale = useLocale();

  const [year, month] = currentMonth.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  const label = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(date);

  function navigate(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    onChange(`${y}-${m}`);
  }

  // 미래 월 방지
  const now = new Date();
  const isCurrentOrFuture =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[140px] text-center text-sm font-bold text-foreground">
        <Calendar className="mb-0.5 mr-1.5 inline h-4 w-4 text-primary" />
        {label}
      </span>
      <button
        onClick={() => navigate(1)}
        disabled={isCurrentOrFuture}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// 메인: MonthlyStatsSection
// ═══════════════════════════════════════════

type Props = {
  childName: string;
};

export function MonthlyStatsSection({ childName }: Props) {
  const t = useTranslations("activity");
  const tm = useTranslations("missions");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  // 현재 월
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  // 데이터
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // 리포트 모달
  const [showReport, setShowReport] = useState(false);

  function loadStats(month: string) {
    setSelectedMonth(month);
    setError(null);
    setLoaded(false);
    startTransition(async () => {
      const res = await getMonthlyStats({ month, locale });
      if (res.success) {
        setStats(res.data);
        setLoaded(true);
      } else {
        setError(res.error);
      }
    });
  }

  // 첫 로드
  function handleInitialLoad() {
    loadStats(selectedMonth);
  }

  const categories = ["language", "sensory", "cognitive"] as const;

  return (
    <div className="space-y-4">
      {/* 섹션 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t("monthlyTitle")}
        </h2>
        <MonthSelector
          currentMonth={selectedMonth}
          onChange={(m) => loadStats(m)}
        />
      </div>

      {/* 아직 로드 안 됨 */}
      {!loaded && !isPending && !error && (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center">
          <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="mb-3 text-sm text-muted-foreground">
            {t("monthlyLoadPrompt")}
          </p>
          <button
            onClick={handleInitialLoad}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            {t("monthlyLoadButton")}
          </button>
        </div>
      )}

      {/* 로딩 */}
      {isPending && <MonthlyStatsSkeleton />}

      {/* 에러 */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 결과 */}
      {loaded && stats && !isPending && (
        <div className="space-y-4">
          {/* 카테고리 카운트 카드 */}
          <div className="grid gap-3 sm:grid-cols-3">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = stats.categoryCounts[cat];
              const pct =
                stats.totalMissions > 0
                  ? Math.round((count / stats.totalMissions) * 100)
                  : 0;

              return (
                <div
                  key={cat}
                  className={cn(
                    "rounded-xl border-2 p-4 transition-all",
                    `border-${cat === "language" ? "sky" : cat === "sensory" ? "violet" : "teal"}-200`,
                    meta.bgClass
                  )}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-lg">{meta.emoji}</span>
                    <span className={cn("text-xs font-bold uppercase tracking-wider", meta.colorClass)}>
                      {tm(cat)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn("text-3xl font-black", meta.colorClass)}>
                      {count}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("missionUnit")} ({pct}%)
                    </span>
                  </div>
                  {/* 미니 바 */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", meta.barColor)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 총 미션 + 활동 일수 */}
          <div className="flex items-center justify-center gap-6 rounded-xl bg-muted/30 px-4 py-3">
            <div className="text-center">
              <span className="text-2xl font-black text-foreground">
                {stats.totalMissions}
              </span>
              <p className="text-[10px] font-semibold text-muted-foreground">
                {t("totalMissionsLabel")}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <span className="text-2xl font-black text-foreground">
                {stats.totalDays}
              </span>
              <p className="text-[10px] font-semibold text-muted-foreground">
                {t("activeDaysLabel")}
              </p>
            </div>
          </div>

          {/* 일별 막대 차트 */}
          <DailyBarChart breakdown={stats.dailyBreakdown} />

          {/* AI 성취 요약 */}
          {stats.aiSummary && <AiSummaryCard stats={stats} />}

          {/* PDF 리포트 버튼 */}
          <div className="text-center">
            <button
              onClick={() => setShowReport(true)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary/5"
            >
              <Download className="h-4 w-4" />
              {t("viewReport")}
            </button>
          </div>
        </div>
      )}

      {/* 리포트 모달 */}
      {showReport && stats && (
        <ReportView
          stats={stats}
          childName={childName}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
