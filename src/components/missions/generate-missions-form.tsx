"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  Check,
  SkipForward,
  MessageSquareHeart,
  Lightbulb,
  Package,
  ArrowRight,
  ArrowLeft,
  Baby,
  Heart,
  PenLine,
  User,
  Stethoscope,
} from "lucide-react";
import { generateDailyMissions } from "@/app/[locale]/(dashboard)/missions/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { DevelopmentalAdviceResponse, Mission } from "@/lib/gemini";

// ═══════════════════════════════════════════
// 카테고리 메타 — 따뜻한 파스텔톤
// ═══════════════════════════════════════════

const CATEGORY_META: Record<
  Mission["category"],
  {
    emoji: string;
    label: string;
    colorClass: string;
    borderClass: string;
    bgClass: string;
    bgGradient: string;
    iconBg: string;
    checkBg: string;
    checkHover: string;
  }
> = {
  language: {
    emoji: "🗣️",
    label: "language",
    colorClass: "text-sky-700",
    borderClass: "border-sky-200",
    bgClass: "bg-sky-50",
    bgGradient: "from-sky-50 via-blue-50 to-indigo-50",
    iconBg: "bg-sky-100",
    checkBg: "bg-sky-500 hover:bg-sky-600",
    checkHover: "hover:bg-sky-100",
  },
  sensory: {
    emoji: "🎨",
    label: "sensory",
    colorClass: "text-violet-700",
    borderClass: "border-violet-200",
    bgClass: "bg-violet-50",
    bgGradient: "from-violet-50 via-purple-50 to-fuchsia-50",
    iconBg: "bg-violet-100",
    checkBg: "bg-violet-500 hover:bg-violet-600",
    checkHover: "hover:bg-violet-100",
  },
  cognitive: {
    emoji: "🧩",
    label: "cognitive",
    colorClass: "text-teal-700",
    borderClass: "border-teal-200",
    bgClass: "bg-teal-50",
    bgGradient: "from-teal-50 via-emerald-50 to-cyan-50",
    iconBg: "bg-teal-100",
    checkBg: "bg-teal-500 hover:bg-teal-600",
    checkHover: "hover:bg-teal-100",
  },
};

// ═══════════════════════════════════════════
// Skeleton UI — 분석 중 로딩 애니메이션
// ═══════════════════════════════════════════

function MissionCardSkeleton({ index }: { index: number }) {
  const delays = ["", "delay-150", "delay-300"];
  const colors = [
    "border-sky-100 bg-sky-50/50",
    "border-violet-100 bg-violet-50/50",
    "border-teal-100 bg-teal-50/50",
  ];
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border-2 p-5",
        delays[index],
        colors[index]
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-white/60" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 rounded-full bg-white/80" />
          <div className="h-4 w-3/4 rounded-full bg-white/80" />
        </div>
      </div>
      <div className="mb-3 space-y-2 rounded-xl bg-white/50 p-3">
        <div className="h-3 w-20 rounded-full bg-white/80" />
        <div className="h-3 w-full rounded-full bg-white/80" />
      </div>
      <div className="mb-3 flex gap-2">
        <div className="h-6 w-14 rounded-full bg-white/60" />
        <div className="h-6 w-18 rounded-full bg-white/60" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-xl bg-white/60" />
        <div className="h-10 w-24 rounded-xl bg-white/60" />
      </div>
    </div>
  );
}

function AnalyzingScreen({ childName }: { childName: string }) {
  const t = useTranslations("missions");

  return (
    <div className="space-y-6">
      {/* 분석 중 메시지 */}
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 px-6 py-8 text-center shadow-sm">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Bot className="h-8 w-8 animate-pulse text-amber-600" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-amber-800">
          {t("analyzingTitle")}
        </h3>
        <p className="text-sm leading-relaxed text-amber-700/80">
          {t("analyzingDesc", { name: childName })}
        </p>
        <div className="mx-auto mt-5 flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* 스켈레톤 카드 */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <MissionCardSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// AI 미션 카드 — 파스텔 그라데이션 + 완료 체크
// ═══════════════════════════════════════════

function AiMissionCard({
  mission,
  childId,
}: {
  mission: Mission;
  childId?: string;
}) {
  const t = useTranslations("missions");
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<"idle" | "completed" | "skipped">(
    "idle"
  );
  const [saving, setSaving] = useState(false);
  const meta = CATEGORY_META[mission.category];

  async function handleAction(actionStatus: "completed" | "skipped") {
    if (saving) return;
    setSaving(true);

    try {
      if (childId) {
        const supabase = createClient();
        await supabase.from("ai_chat_logs").insert({
          parent_id: (await supabase.auth.getUser()).data.user?.id,
          child_id: childId,
          question: `[AI Mission ${actionStatus}] ${mission.category}: ${mission.title}`,
          answer: JSON.stringify(mission),
        });
      }
      setStatus(actionStatus);
    } catch {
      setStatus(actionStatus); // UX 우선
    } finally {
      setSaving(false);
    }
  }

  const isFinished = status !== "idle";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300",
        isFinished
          ? status === "completed"
            ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
            : "border-gray-200 bg-gray-50 opacity-60"
          : `${meta.borderClass} bg-gradient-to-br ${meta.bgGradient}`
      )}
    >
      {status === "completed" && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
          <Check className="h-3.5 w-3.5" />
          {t("completed")}
        </div>
      )}
      {status === "skipped" && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white">
          <SkipForward className="h-3.5 w-3.5" />
          {t("skipped")}
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-xl", isFinished ? "bg-gray-100" : meta.iconBg)}>
          {meta.emoji}
        </div>
        <div>
          <p className={cn("text-xs font-bold uppercase tracking-wider", isFinished ? "text-muted-foreground" : meta.colorClass)}>
            {t(meta.label)}
          </p>
          <h3 className={cn("text-base font-bold leading-tight", isFinished ? "text-muted-foreground" : "text-foreground")}>
            {mission.title}
          </h3>
        </div>
      </div>

      {/* 기대 효과 */}
      <div className={cn("mb-4 rounded-xl px-4 py-3", isFinished ? "bg-white/60" : "bg-white/70")}>
        <p className={cn("mb-1 flex items-center gap-1.5 text-xs font-bold", isFinished ? "text-muted-foreground" : meta.colorClass)}>
          <Lightbulb className="h-3.5 w-3.5" />
          {t("expectedEffect")}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{mission.expected_effect}</p>
      </div>

      {/* 준비물 */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Package className={cn("h-3.5 w-3.5", isFinished ? "text-muted-foreground" : meta.colorClass)} />
        {mission.home_materials.map((item, i) => (
          <span key={i} className={cn("rounded-full px-2.5 py-1 text-xs font-medium", isFinished ? "bg-gray-100 text-muted-foreground" : `${meta.bgClass} ${meta.colorClass}`)}>
            {item}
          </span>
        ))}
      </div>

      {/* 가이드 토글 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn("mb-2 flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors", isFinished ? "border-gray-200 text-muted-foreground hover:bg-gray-100" : `${meta.borderClass} ${meta.colorClass} ${meta.checkHover}`)}
      >
        {expanded ? <>{t("hideSteps")} <ChevronUp className="h-4 w-4" /></> : <>{t("showSteps")} <ChevronDown className="h-4 w-4" /></>}
      </button>

      {expanded && (
        <ol className="mb-4 list-inside list-decimal space-y-2.5 rounded-xl bg-white/70 p-4 text-sm leading-relaxed text-foreground">
          {mission.guide.map((step, i) => (
            <li key={i} className="pl-1">{step}</li>
          ))}
        </ol>
      )}

      {/* 완료/건너뛰기 */}
      {!isFinished && (
        <div className="flex gap-2">
          <button onClick={() => handleAction("completed")} disabled={saving} className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition-all disabled:opacity-50", meta.checkBg)}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" />{t("markDone")}</>}
          </button>
          <button onClick={() => handleAction("skipped")} disabled={saving} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50">
            <SkipForward className="h-4 w-4" />{t("skip")}
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// 결과 대시보드
// ═══════════════════════════════════════════

function AdviceDashboard({
  data,
  childId,
  childName,
  onReset,
}: {
  data: DevelopmentalAdviceResponse;
  childId?: string;
  childName: string;
  onReset: () => void;
}) {
  const t = useTranslations("missions");

  return (
    <div className="space-y-5">
      {/* 전문가 코멘트 */}
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-5 py-4 shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
          <MessageSquareHeart className="h-4 w-4" />
          {t("expertCommentFor", { name: childName })}
        </p>
        <p className="text-sm leading-relaxed text-amber-900/80">
          {data.daily_summary}
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {data.missions.map((mission, i) => (
          <AiMissionCard key={i} mission={mission} childId={childId} />
        ))}
      </div>

      {/* 다시 생성 버튼 */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          <Sparkles className="h-4 w-4" />
          {t("regenerate")}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// 스텝 인디케이터
// ═══════════════════════════════════════════

const STEP_ICONS = [Baby, Stethoscope, PenLine] as const;

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const t = useTranslations("missions");
  const stepKeys = ["stepBasicInfo", "stepDisability", "stepConcern"] as const;

  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const Icon = STEP_ICONS[i];
        const isActive = i === currentStep;
        const isDone = i < currentStep;

        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : isDone
                      ? "border-green-400 bg-green-50 text-green-600"
                      : "border-border bg-muted text-muted-foreground"
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isActive
                    ? "text-primary"
                    : isDone
                      ? "text-green-600"
                      : "text-muted-foreground"
                )}
              >
                {t(stepKeys[i])}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  "mb-5 h-0.5 w-8 rounded-full transition-colors",
                  i < currentStep ? "bg-green-400" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════
// 장애 유형 옵션
// ═══════════════════════════════════════════

const DISABILITY_TYPES = [
  "speech_delay",
  "autism_spectrum",
  "adhd",
  "developmental_delay",
  "other",
] as const;

type DisabilityType = (typeof DISABILITY_TYPES)[number];

// ═══════════════════════════════════════════
// 메인 컴포넌트: Multi-step Form + 결과
// ═══════════════════════════════════════════

type Props = {
  childId: string | null;
};

export function GenerateMissionsForm({ childId }: Props) {
  const t = useTranslations("missions");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  // ── 스텝 상태 ──
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 3;

  // ── Step 1: 기본 정보 ──
  const [displayName, setDisplayName] = useState("");
  const [ageYears, setAgeYears] = useState<number | "">(3);
  const [gender, setGender] = useState<"male" | "female" | "other">("other");

  // ── Step 2: 장애 유형 ──
  const [disabilityType, setDisabilityType] = useState<DisabilityType>("speech_delay");

  // ── Step 3: 고민 ──
  const [concern, setConcern] = useState("");

  // ── 결과 ──
  const [result, setResult] = useState<DevelopmentalAdviceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── 유효성 검증 ──
  function isStep1Valid() {
    return displayName.trim().length > 0 && ageYears !== "" && Number(ageYears) >= 0;
  }

  function isStep3Valid() {
    return concern.trim().length >= 5;
  }

  // ── 제출 ──
  function handleSubmit() {
    if (!isStep3Valid()) return;

    setError(null);
    setResult(null);

    startTransition(async () => {
      const res = await generateDailyMissions({
        childId: childId ?? undefined,
        concern: concern.trim(),
        locale,
        overrideChild: {
          displayName: displayName.trim(),
          ageYears: Number(ageYears),
          gender,
          disabilityType,
        },
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error);
        setResult(null);
      }
    });
  }

  // ── 리셋 ──
  function handleReset() {
    setStep(0);
    setConcern("");
    setResult(null);
    setError(null);
  }

  // ── 로딩 중 ──
  if (isPending) {
    return <AnalyzingScreen childName={displayName || "아이"} />;
  }

  // ── 결과 화면 ──
  if (result) {
    return (
      <AdviceDashboard
        data={result}
        childId={childId ?? undefined}
        childName={displayName || "아이"}
        onReset={handleReset}
      />
    );
  }

  // ── Multi-step Form ──
  return (
    <div className="rounded-2xl border-2 border-primary/15 bg-gradient-to-br from-sky-50/50 via-amber-50/30 to-violet-50/50 p-6 shadow-sm">
      <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

      {/* ═══ STEP 1: 기본 정보 ═══ */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
              <Baby className="h-7 w-7 text-sky-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t("step1Title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("step1Desc")}</p>
          </div>

          {/* 이름 */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <User className="h-3.5 w-3.5 text-sky-600" />
              {t("childDisplayName")}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("childDisplayNamePlaceholder")}
              className="w-full rounded-xl border-2 border-sky-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
          </div>

          {/* 나이 & 성별 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                {t("childAge")}
              </label>
              <select
                value={ageYears}
                onChange={(e) => setAgeYears(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-sky-200 bg-white px-4 py-3 text-sm transition-all focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
              >
                {Array.from({ length: 13 }, (_, i) => (
                  <option key={i} value={i}>
                    {t("ageOption", { age: i })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                {t("childGender")}
              </label>
              <div className="flex gap-2">
                {(["male", "female", "other"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      "flex-1 rounded-xl border-2 py-3 text-center text-xs font-semibold transition-all",
                      gender === g
                        ? "border-sky-400 bg-sky-50 text-sky-700 shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:border-sky-200"
                    )}
                  >
                    {t(`gender_${g}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={() => setStep(1)}
            disabled={!isStep1Valid()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-600 disabled:opacity-40"
          >
            {t("nextStep")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ═══ STEP 2: 장애/발달 유형 ═══ */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
              <Stethoscope className="h-7 w-7 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t("step2Title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("step2Desc")}</p>
          </div>

          {/* 장애 유형 선택 카드 */}
          <div className="space-y-2">
            {DISABILITY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDisabilityType(type)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all",
                  disabilityType === type
                    ? "border-violet-400 bg-violet-50 shadow-sm"
                    : "border-border bg-white hover:border-violet-200 hover:bg-violet-50/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-sm",
                    disabilityType === type
                      ? "bg-violet-200 text-violet-700"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {disabilityType === type ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      disabilityType === type
                        ? "text-violet-700"
                        : "text-foreground"
                    )}
                  >
                    {t(`disability_${type}`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`disability_${type}_desc`)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* 네비게이션 */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-border px-5 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("prevStep")}
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-violet-600"
            >
              {t("nextStep")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: 현재 고민 ═══ */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <PenLine className="h-7 w-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t("step3Title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("step3Desc")}</p>
          </div>

          {/* 입력 요약 */}
          <div className="flex flex-wrap gap-2 rounded-xl bg-white/70 px-4 py-3">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              👶 {displayName}
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              🎂 {t("ageOption", { age: Number(ageYears) })}
            </span>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              🩺 {t(`disability_${disabilityType}`)}
            </span>
          </div>

          {/* 고민 텍스트 */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MessageSquareHeart className="h-3.5 w-3.5 text-amber-600" />
              {t("concernLabel")}
            </label>
            <textarea
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              placeholder={t("concernPlaceholder")}
              rows={4}
              className="w-full resize-none rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-sm leading-relaxed transition-all placeholder:text-muted-foreground focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {concern.length > 0 && concern.length < 5
                ? t("concernMinLength")
                : ""}
            </p>
          </div>

          {/* 에러 */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* 네비게이션 */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-border px-5 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("prevStep")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isStep3Valid() || isPending}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              {t("generateMissions")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
