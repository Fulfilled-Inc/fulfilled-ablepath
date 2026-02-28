"use client";

/**
 * AblePath — ReportGenerator (미리보기 + PDF 다운로드)
 *
 * ── Architecture.md 규칙 ──
 * - CSR 컴포넌트 (@react-pdf/renderer 는 SSR 불가)
 * - dynamic import (ssr: false) 로 PDF 관련 모듈 로드
 * - next-intl useTranslations 로 UI 텍스트 다국어 처리
 * - PdfLabels 로 PDF 내부 텍스트 다국어 처리 (locale → labels)
 *
 * ── 구성 ──
 * - 미리보기 영역: 종합 통계 카드 + 영역별 점수 카드 + Gemini 전문가 요약
 * - 다운로드 버튼: PDFDownloadLink → {Child}_{Month}.pdf
 * - PDFViewer 토글: 실제 PDF A4 인라인 미리보기
 */

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import {
  Download,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  MessageCircle,
  Lightbulb,
  Heart,
} from "lucide-react";
import Link from "next/link";
import type { MonthlyReportData, PdfLabels } from "./report-types";
import { getPdfLabels } from "./report-types";

// ── dynamic imports (SSR 비활성) ──

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const MonthlyReportTemplate = dynamic(
  () =>
    import("./monthly-report-template").then((mod) => ({
      default: mod.MonthlyReportTemplate,
    })),
  { ssr: false }
);

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────

export function ReportGenerator({ data }: { data: MonthlyReportData }) {
  const t = useTranslations("pdfReport");
  const locale = useLocale();
  const [showViewer, setShowViewer] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const labels: PdfLabels = useMemo(() => getPdfLabels(locale), [locale]);

  // 파일명 생성: Leo_Progress_2026_02.pdf
  const fileName = useMemo(() => {
    const name = data.child.displayName.replace(/\s+/g, "_");
    const month = data.reportDate.slice(0, 7).replace("-", "_");
    return `${name}_Progress_${month}.pdf`;
  }, [data.child.displayName, data.reportDate]);

  // 카테고리 메타
  const catMeta = [
    {
      key: "language" as const,
      emoji: "🗣️",
      label: labels.languageLabel,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    {
      key: "sensory" as const,
      emoji: "🎨",
      label: labels.sensoryLabel,
      color: "from-violet-500 to-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/20",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-200 dark:border-violet-800",
    },
    {
      key: "cognitive" as const,
      emoji: "🧩",
      label: labels.cognitiveLabel,
      color: "from-teal-500 to-teal-600",
      bg: "bg-teal-50 dark:bg-teal-950/20",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-200 dark:border-teal-800",
    },
  ];

  const avg =
    Math.round(
      (data.totalMissions / Math.max(data.totalDays, 1)) * 10
    ) / 10;

  return (
    <div className="space-y-6">
      {/* ── Back + Header ── */}
      <div>
        <Link
          href="../report"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToReport")}
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            {t("premiumBadge")}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* ── Mock Notice ── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          ⚠️ {t("mockNotice")}
        </p>
      </div>

      {/* ── Child Info + Period ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<Target className="h-5 w-5 text-blue-500" />}
          label={t("childInfo")}
          title={data.child.displayName}
          sub={`${data.child.ageLabel} · ${data.child.disabilityType}`}
        />
        <InfoCard
          icon={<Calendar className="h-5 w-5 text-violet-500" />}
          label={t("period")}
          title={data.monthLabel}
          sub={`${data.totalMissions} ${labels.totalMissions.toLowerCase()} · ${data.totalDays} ${labels.activeDays.toLowerCase()}`}
        />
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-3">
        {mounted ? (
          <PDFDownloadLink
            document={
              <MonthlyReportTemplate data={data} labels={labels} />
            }
            fileName={fileName}
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-wait"
              >
                <Download className="h-4 w-4" />
                {loading ? t("downloading") : t("download")}
              </button>
            )}
          </PDFDownloadLink>
        ) : (
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md opacity-50"
          >
            <Download className="h-4 w-4" />
            {t("downloading")}
          </button>
        )}

        <button
          onClick={() => setShowViewer((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent"
        >
          {showViewer ? (
            <>
              <EyeOff className="h-4 w-4" />
              {t("hidePreview")}
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              {t("preview")}
            </>
          )}
        </button>
      </div>

      {/* ── PDF Viewer (inline) ── */}
      {showViewer && mounted && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
          <div className="flex items-center justify-between bg-muted/30 px-4 py-2 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">
              {t("preview")} — A4
            </p>
            <p className="text-xs text-muted-foreground">{fileName}</p>
          </div>
          <PDFViewer
            style={{ width: "100%", height: "80vh", border: "none" }}
          >
            <MonthlyReportTemplate data={data} labels={labels} />
          </PDFViewer>
        </div>
      )}

      {/* ── 미리보기: 종합 통계 카드 ── */}
      <section>
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          {labels.summaryTitle}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            value={data.totalMissions.toString()}
            label={labels.totalMissions}
            icon={<Target className="h-5 w-5" />}
            accent="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            value={data.totalDays.toString()}
            label={labels.activeDays}
            icon={<Calendar className="h-5 w-5" />}
            accent="text-violet-600 dark:text-violet-400"
          />
          <StatCard
            value={avg.toString()}
            label={labels.avgPerDay}
            icon={<TrendingUp className="h-5 w-5" />}
            accent="text-teal-600 dark:text-teal-400"
          />
        </div>
      </section>

      {/* ── 미리보기: 영역별 점수 카드 ── */}
      <section>
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-violet-500" />
          {labels.balanceScore}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {catMeta.map((cat) => {
            const score = data.categoryScores[cat.key];
            const count = data.categoryCounts[cat.key];
            const detail = data.details.find(
              (d) => d.category === cat.key
            );

            return (
              <div
                key={cat.key}
                className={`rounded-2xl border ${cat.border} ${cat.bg} p-5 shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className={`text-sm font-bold ${cat.text}`}>
                    {cat.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-3xl font-bold ${cat.text}`}>
                    {score}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>

                <div className="mb-2 h-2 w-full rounded-full bg-white/60 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {count} {labels.colMissions.toLowerCase()}
                  </span>
                  <span>{detail?.completionRate ?? 0}%</span>
                </div>

                {detail && (
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {detail.insight}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 미리보기: Gemini 전문가 제언 ── */}
      <section>
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-pink-500" />
          {labels.expertTitle}
        </h2>

        <div className="space-y-4">
          {/* Overall */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-800 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400">
                {labels.overviewLabel}
              </h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {data.aiSummary.overall_comment}
            </p>
          </div>

          {/* Next suggestion */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-800 dark:bg-sky-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-sky-500" />
              <h3 className="text-sm font-bold text-sky-700 dark:text-sky-400">
                {labels.nextSuggestionLabel}
              </h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {data.aiSummary.next_month_suggestion}
            </p>
          </div>

          {/* Encouragement */}
          <div className="rounded-2xl border border-pink-200 bg-pink-50/50 p-5 dark:border-pink-800 dark:bg-pink-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <h3 className="text-sm font-bold text-pink-700 dark:text-pink-400">
                {labels.forParentsLabel}
              </h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {data.aiSummary.encouragement}
            </p>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground whitespace-pre-line">
          {labels.disclaimer}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function InfoCard({
  icon,
  label,
  title,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="text-lg font-bold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
  accent,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm text-center">
      <div className={`mx-auto mb-2 ${accent}`}>{icon}</div>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
