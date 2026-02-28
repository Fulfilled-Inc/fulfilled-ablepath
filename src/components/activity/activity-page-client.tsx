"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Award,
  Baby,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  Lightbulb,
  MessageSquareHeart,
  Package,
  Sparkles,
  Stethoscope,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { deleteActivityLog } from "@/app/[locale]/(dashboard)/activity/actions";
import type {
  ProfileSummary,
  DateGroupedActivity,
  WeeklyCategoryCounts,
  ActivityLogEntry,
} from "@/app/[locale]/(dashboard)/activity/actions";
import type { Mission } from "@/lib/gemini";
import { MonthlyStatsSection } from "@/components/activity/monthly-stats-section";

// ═══════════════════════════════════════════
// 카테고리 메타
// ═══════════════════════════════════════════

const CATEGORY_META: Record<
  Mission["category"],
  { emoji: string; colorClass: string; bgClass: string; barColor: string }
> = {
  language: {
    emoji: "🗣️",
    colorClass: "text-sky-700",
    bgClass: "bg-sky-100",
    barColor: "bg-sky-400",
  },
  sensory: {
    emoji: "🎨",
    colorClass: "text-violet-700",
    bgClass: "bg-violet-100",
    barColor: "bg-violet-400",
  },
  cognitive: {
    emoji: "🧩",
    colorClass: "text-teal-700",
    bgClass: "bg-teal-100",
    barColor: "bg-teal-400",
  },
};

// ═══════════════════════════════════════════
// 프로필 요약 카드
// ═══════════════════════════════════════════

function ProfileCard({ profile }: { profile: ProfileSummary }) {
  const t = useTranslations("activity");

  return (
    <div className="rounded-2xl border-2 border-primary/15 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* 아바타 */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
          <Baby className="h-7 w-7 text-amber-600" />
        </div>

        {/* 정보 */}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-foreground">
            {profile.childName ?? t("unknownChild")}
          </h2>
          {profile.childDisabilityType && (
            <div className="mt-1 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-sm text-muted-foreground">
                {profile.childDisabilityType}
              </span>
            </div>
          )}
          {profile.displayName && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("parent")}: {profile.displayName}
            </p>
          )}
        </div>

        {/* 총 미션 수 */}
        <div className="flex flex-col items-center rounded-xl bg-white/70 px-4 py-2.5 shadow-sm">
          <Trophy className="mb-1 h-5 w-5 text-amber-500" />
          <span className="text-2xl font-black text-amber-600">
            {profile.totalMissionsCompleted}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {t("totalMissions")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// 주간 차트 (CSS 기반 Bar Chart)
// ═══════════════════════════════════════════

function WeeklyChart({ counts }: { counts: WeeklyCategoryCounts }) {
  const t = useTranslations("activity");
  const tm = useTranslations("missions");
  const categories = ["language", "sensory", "cognitive"] as const;
  const max = Math.max(counts.language, counts.sensory, counts.cognitive, 1);

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <Award className="h-4 w-4 text-primary" />
        {t("weeklyChart")}
      </h3>

      <div className="space-y-3">
        {categories.map((cat) => {
          const value = counts[cat];
          const meta = CATEGORY_META[cat];
          const pct = Math.round((value / max) * 100);

          return (
            <div key={cat} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{meta.emoji}</span>
                  <span className={cn("text-xs font-bold", meta.colorClass)}>
                    {tm(cat)}
                  </span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {value}{t("missionUnit")}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", meta.barColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        {t("weeklyChartDesc")}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════
// 미션 상세 모달
// ═══════════════════════════════════════════

function MissionDetailModal({
  entry,
  onClose,
}: {
  entry: ActivityLogEntry;
  onClose: () => void;
}) {
  const t = useTranslations("activity");
  const tm = useTranslations("missions");
  const locale = useLocale();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-border bg-background p-6 shadow-2xl">
        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 헤더 */}
        <div className="mb-4 pr-8">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(entry.created_at, locale)}
          </p>
          <h3 className="mt-1 text-lg font-bold text-foreground">{t("detailTitle")}</h3>
        </div>

        {/* 당시 고민 */}
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <MessageSquareHeart className="h-3.5 w-3.5" />
            {t("concernAtThat")}
          </p>
          <p className="text-sm leading-relaxed text-amber-900/80">
            {entry.question}
          </p>
        </div>

        {/* 전문가 코멘트 */}
        <div className="mb-5 rounded-xl border border-primary/15 bg-gradient-to-r from-sky-50 to-violet-50 px-4 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {tm("expertComment")}
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {entry.answer.daily_summary}
          </p>
        </div>

        {/* 미션 카드들 */}
        <div className="space-y-3">
          {entry.answer.missions?.map((mission, i) => {
            const meta = CATEGORY_META[mission.category];
            return (
              <MissionDetailCard key={i} mission={mission} meta={meta} />
            );
          })}
        </div>

        {/* 닫기 버튼 */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function MissionDetailCard({
  mission,
  meta,
}: {
  mission: Mission;
  meta: (typeof CATEGORY_META)[Mission["category"]];
}) {
  const [expanded, setExpanded] = useState(false);
  const tm = useTranslations("missions");

  return (
    <div className={cn("rounded-xl border-2 p-4", `border-${meta.colorClass.replace("text-", "")}/20`)}>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">{meta.emoji}</span>
        <span className={cn("text-xs font-bold uppercase tracking-wider", meta.colorClass)}>
          {tm(mission.category)}
        </span>
      </div>
      <h4 className="mb-2 text-sm font-bold text-foreground">{mission.title}</h4>

      {/* 기대 효과 */}
      <div className="mb-2 rounded-lg bg-muted/50 px-3 py-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Lightbulb className="h-3 w-3" />
          {tm("expectedEffect")}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-foreground">
          {mission.expected_effect}
        </p>
      </div>

      {/* 준비물 */}
      <div className="mb-2 flex flex-wrap gap-1">
        <Package className={cn("h-3 w-3 mt-0.5", meta.colorClass)} />
        {mission.home_materials.map((item, i) => (
          <span key={i} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", meta.bgClass, meta.colorClass)}>
            {item}
          </span>
        ))}
      </div>

      {/* 가이드 토글 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        {expanded ? (
          <>{tm("hideSteps")} <ChevronUp className="h-3 w-3" /></>
        ) : (
          <>{tm("showSteps")} <ChevronDown className="h-3 w-3" /></>
        )}
      </button>

      {expanded && (
        <ol className="mt-2 list-inside list-decimal space-y-1.5 rounded-lg bg-white/70 p-3 text-xs leading-relaxed text-foreground">
          {mission.guide.map((step, i) => (
            <li key={i} className="pl-1">{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// 삭제 확인 모달
// ═══════════════════════════════════════════

function DeleteConfirmModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const t = useTranslations("activity");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border-2 border-red-200 bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{t("deleteTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("deleteDesc")}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-xl border-2 border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
          >
            {isPending ? t("deleting") : t("confirmDelete")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// 타임라인 카드
// ═══════════════════════════════════════════

function TimelineEntryCard({
  entry,
  onViewDetail,
  onDelete,
}: {
  entry: ActivityLogEntry;
  onViewDetail: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("activity");
  const tm = useTranslations("missions");
  const locale = useLocale();

  const missionTitles = entry.answer.missions?.map((m) => m.title) ?? [];
  const categories = entry.answer.missions?.map((m) => m.category) ?? [];

  return (
    <div className="group relative rounded-xl border-2 border-border bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title={t("deleteRecord")}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* 시간 */}
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
        <Clock className="h-3 w-3" />
        {new Date(entry.created_at).toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {/* 당시 고민 (요약) */}
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-foreground">
        {entry.question}
      </p>

      {/* 미션 태그 */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {categories.map((cat, i) => {
          const meta = CATEGORY_META[cat];
          return (
            <span
              key={i}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                meta.bgClass,
                meta.colorClass
              )}
            >
              {meta.emoji} {missionTitles[i]?.slice(0, 20)}
              {(missionTitles[i]?.length ?? 0) > 20 ? "..." : ""}
            </span>
          );
        })}
      </div>

      {/* 상세 보기 */}
      <button
        onClick={onViewDetail}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
      >
        <Heart className="h-3 w-3" />
        {t("viewDetail")}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// 빈 상태
// ═══════════════════════════════════════════

function EmptyState() {
  const t = useTranslations("activity");

  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
        <Sparkles className="h-8 w-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{t("emptyTitle")}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {t("emptyDesc")}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════
// 메인: ActivityPageClient
// ═══════════════════════════════════════════

type Props = {
  profile: ProfileSummary;
  groups: DateGroupedActivity[];
  weeklyCounts: WeeklyCategoryCounts;
  childName: string;
};

export function ActivityPageClient({ profile, groups, weeklyCounts, childName }: Props) {
  const t = useTranslations("activity");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 모달 상태
  const [selectedEntry, setSelectedEntry] = useState<ActivityLogEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteActivityLog(deleteTarget);
      if (res.success) {
        setDeleteTarget(null);
        router.refresh(); // 서버 데이터 새로고침
      }
    });
  }

  const isEmpty = groups.length === 0;

  return (
    <>
      {/* 프로필 요약 + 주간 차트 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileCard profile={profile} />
        <WeeklyChart counts={weeklyCounts} />
      </div>

      {/* 월간 활동 통계 */}
      <div className="mt-6 border-t border-border pt-6">
        <MonthlyStatsSection childName={childName} />
      </div>

      {/* 타임라인 */}
      <div className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          {t("timeline")}
        </h2>

        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.date}>
                {/* 날짜 헤더 */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {formatDate(group.date, locale)}
                  </h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {group.entries.length}{t("recordCount")}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* 엔트리 목록 */}
                <div className="ml-4 space-y-3 border-l-2 border-primary/10 pl-6">
                  {group.entries.map((entry) => (
                    <div key={entry.id} className="relative">
                      {/* 타임라인 도트 */}
                      <div className="absolute -left-[31px] top-4 h-3 w-3 rounded-full border-2 border-primary/30 bg-background" />
                      <TimelineEntryCard
                        entry={entry}
                        onViewDetail={() => setSelectedEntry(entry)}
                        onDelete={() => setDeleteTarget(entry.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedEntry && (
        <MissionDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isPending}
        />
      )}
    </>
  );
}
