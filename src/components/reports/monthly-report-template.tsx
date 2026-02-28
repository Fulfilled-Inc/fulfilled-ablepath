"use client";

/**
 * AblePath — MonthlyReportTemplate (PDF 전용 컴포넌트)
 *
 * @react-pdf/renderer 기반 A4 전문 의료 문서 스타일
 * - 화이트 배경 + Soft Blue (#4A90D9) 포인트
 * - Helvetica (PDF 내장 폰트, 글로벌 가독성)
 * - PdfLabels 를 통해 locale 에 따라 텍스트 다국어 출력
 *
 * 섹션:
 *   1. ReportHeader   — 아이 정보 + 리포트 메타
 *   2. SummarySection  — 종합 수치 + 카테고리 카드 + Radar Chart
 *   3. DetailedMetrics — 영역별 데이터 테이블 + 인사이트 카드
 *   4. ExpertComment   — Gemini AI 전문가 제언
 */

import {
  Document,
  Page,
  View,
  Text,
  Svg,
  Polygon,
  Circle,
  Line as SvgLine,
  StyleSheet,
} from "@react-pdf/renderer";
import type {
  MonthlyReportData,
  PdfLabels,
  CategoryScores,
} from "./report-types";

// ─────────────────────────────────────────
// 컬러 팔레트
// ─────────────────────────────────────────

const C = {
  primary: "#4A90D9",
  primaryLight: "#EBF2FA",
  primaryMuted: "#7EB3E8",

  white: "#FFFFFF",
  bg: "#FAFBFD",
  text: "#1A202C",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  language: "#3B82F6",
  sensory: "#8B5CF6",
  cognitive: "#14B8A6",

  green: "#22C55E",
  amber: "#F59E0B",
  pink: "#EC4899",
} as const;

// ─────────────────────────────────────────
// StyleSheet
// ─────────────────────────────────────────

const s = StyleSheet.create({
  /* ── Page ── */
  page: {
    backgroundColor: C.white,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.text,
    lineHeight: 1.5,
  },
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: C.textLight },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
  },
  headerLeft: { flex: 1 },
  headerBrand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    color: C.textMuted,
    marginBottom: 12,
  },
  headerInfoRow: { flexDirection: "row", marginBottom: 3 },
  headerLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.textMuted,
    width: 70,
  },
  headerValue: { fontSize: 9, color: C.text },
  headerRight: { alignItems: "flex-end", paddingTop: 4 },
  headerMonthLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.text,
    marginBottom: 4,
  },
  headerDate: { fontSize: 8, color: C.textMuted },

  /* ── Section ── */
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.primaryLight,
  },

  /* ── Summary cards ── */
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  summaryCardValue: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
  },
  summaryCardLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.textMuted,
    marginTop: 2,
    textTransform: "uppercase",
  },

  /* ── Category cards ── */
  catRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  catCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  catEmoji: { fontSize: 16, marginBottom: 4 },
  catValue: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  catLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
    textTransform: "uppercase",
  },

  /* ── Radar ── */
  radarContainer: {
    alignItems: "center",
    marginBottom: 16,
    padding: 10,
    backgroundColor: C.bg,
    borderRadius: 8,
  },
  radarTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  radarLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  radarLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  radarLegendDot: { width: 6, height: 6, borderRadius: 3 },
  radarLegendText: { fontSize: 7, color: C.textMuted },

  /* ── Table ── */
  table: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.primary,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  tableRowAlt: { backgroundColor: C.bg },
  tableCell: { fontSize: 8, color: C.text },
  tableCellBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.text,
  },

  /* ── Progress bar ── */
  progressBar: {
    height: 6,
    backgroundColor: C.borderLight,
    borderRadius: 3,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: { height: 6, borderRadius: 3 },

  /* ── Insight row ── */
  insightRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  insightCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  insightEmoji: { fontSize: 12, marginBottom: 4 },
  insightTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  insightText: { fontSize: 8, color: C.textMuted, lineHeight: 1.5 },

  /* ── Expert comment ── */
  expertBox: {
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  expertLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  expertText: { fontSize: 9, color: C.text, lineHeight: 1.6 },

  suggestionBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#0EA5E9",
  },
  encouragementBox: {
    backgroundColor: "#FDF2F8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.pink,
  },

  /* ── Disclaimer ── */
  disclaimer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: C.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  disclaimerText: {
    fontSize: 7,
    color: C.textLight,
    textAlign: "center",
    lineHeight: 1.5,
  },
});

// ─────────────────────────────────────────
// Radar Chart (SVG)
// ─────────────────────────────────────────

function RadarChart({
  scores,
  labels,
}: {
  scores: CategoryScores;
  labels: PdfLabels;
}) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 55;
  const levels = 4;
  const angles = [-90, 150, 30]; // top, bottom-right, bottom-left

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const point = (angleDeg: number, r: number) => ({
    x: cx + r * Math.cos(toRad(angleDeg)),
    y: cy + r * Math.sin(toRad(angleDeg)),
  });

  const gridPolygon = (level: number) => {
    const r = (radius / levels) * (level + 1);
    return angles
      .map((a) => point(a, r))
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  };

  const values = [scores.language, scores.sensory, scores.cognitive];
  const dataPoints = angles.map((a, i) =>
    point(a, (values[i] / 100) * radius)
  );
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const axisEnds = angles.map((a) => point(a, radius + 8));

  const labelMeta = [
    { text: labels.languageLabel, dx: 0, dy: -8 },
    { text: labels.sensoryLabel, dx: 6, dy: 4 },
    { text: labels.cognitiveLabel, dx: -6, dy: 4 },
  ];
  const colors = [C.language, C.sensory, C.cognitive];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {Array.from({ length: levels }, (_, i) => (
        <Polygon
          key={`grid-${i}`}
          points={gridPolygon(i)}
          fill="none"
          stroke={C.border}
          strokeWidth={0.5}
        />
      ))}

      {/* Axes */}
      {angles.map((a, i) => {
        const end = point(a, radius);
        return (
          <SvgLine
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke={C.border}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon */}
      <Polygon
        points={dataPolygon}
        fill={C.primary}
        fillOpacity={0.2}
        stroke={C.primary}
        strokeWidth={1.5}
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <Circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3} fill={colors[i]} />
      ))}

      {/* Score labels */}
      {dataPoints.map((_, i) => {
        const ap = axisEnds[i];
        return (
          <Text
            key={`score-${i}`}
            x={ap.x + labelMeta[i].dx}
            y={ap.y + labelMeta[i].dy}
            style={{
              fontSize: 7,
              fontFamily: "Helvetica-Bold",
              fill: colors[i],
            }}
          >
            {String(values[i])}
          </Text>
        );
      })}
    </Svg>
  );
}

// ─────────────────────────────────────────
// Section: Header
// ─────────────────────────────────────────

function ReportHeader({
  data,
  labels,
}: {
  data: MonthlyReportData;
  labels: PdfLabels;
}) {
  const genderText =
    data.child.gender === "male"
      ? labels.genderMale
      : data.child.gender === "female"
        ? labels.genderFemale
        : labels.genderOther;

  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <Text style={s.headerBrand}>{labels.brandName}</Text>
        <Text style={s.headerSubtitle}>{labels.reportTitle}</Text>

        <View style={s.headerInfoRow}>
          <Text style={s.headerLabel}>{labels.childLabel}</Text>
          <Text style={s.headerValue}>{data.child.displayName}</Text>
        </View>
        <View style={s.headerInfoRow}>
          <Text style={s.headerLabel}>{labels.ageLabel}</Text>
          <Text style={s.headerValue}>{data.child.ageLabel}</Text>
        </View>
        <View style={s.headerInfoRow}>
          <Text style={s.headerLabel}>{labels.genderLabel}</Text>
          <Text style={s.headerValue}>{genderText}</Text>
        </View>
        <View style={s.headerInfoRow}>
          <Text style={s.headerLabel}>{labels.typeLabel}</Text>
          <Text style={s.headerValue}>{data.child.disabilityType}</Text>
        </View>
      </View>

      <View style={s.headerRight}>
        <Text style={s.headerMonthLabel}>{data.monthLabel}</Text>
        <Text style={s.headerDate}>
          {labels.generatedLabel}:{" "}
          {new Date(data.generatedAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// Section: Summary + Radar
// ─────────────────────────────────────────

function SummarySection({
  data,
  labels,
}: {
  data: MonthlyReportData;
  labels: PdfLabels;
}) {
  const catMeta = [
    { key: "language" as const, emoji: "🗣️", label: labels.languageLabel, color: C.language },
    { key: "sensory" as const, emoji: "🎨", label: labels.sensoryLabel, color: C.sensory },
    { key: "cognitive" as const, emoji: "🧩", label: labels.cognitiveLabel, color: C.cognitive },
  ];

  const avg =
    Math.round(
      (data.totalMissions / Math.max(data.totalDays, 1)) * 10
    ) / 10;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{labels.summaryTitle}</Text>

      {/* Summary numbers */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardValue}>{data.totalMissions}</Text>
          <Text style={s.summaryCardLabel}>{labels.totalMissions}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardValue}>{data.totalDays}</Text>
          <Text style={s.summaryCardLabel}>{labels.activeDays}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardValue}>{avg}</Text>
          <Text style={s.summaryCardLabel}>{labels.avgPerDay}</Text>
        </View>
      </View>

      {/* Category cards */}
      <View style={s.catRow}>
        {catMeta.map(({ key, emoji, label, color }) => (
          <View
            key={key}
            style={[
              s.catCard,
              { borderColor: color, backgroundColor: `${color}10` },
            ]}
          >
            <Text style={s.catEmoji}>{emoji}</Text>
            <Text style={[s.catValue, { color }]}>
              {data.categoryCounts[key]}
            </Text>
            <Text style={[s.catLabel, { color }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Radar Chart */}
      <View style={s.radarContainer}>
        <Text style={s.radarTitle}>{labels.balanceScore}</Text>
        <RadarChart scores={data.categoryScores} labels={labels} />
        <View style={s.radarLegend}>
          {catMeta.map(({ label, color }) => (
            <View key={label} style={s.radarLegendItem}>
              <View
                style={[s.radarLegendDot, { backgroundColor: color }]}
              />
              <Text style={s.radarLegendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// Section: Detailed Metrics
// ─────────────────────────────────────────

function DetailedMetrics({
  data,
  labels,
}: {
  data: MonthlyReportData;
  labels: PdfLabels;
}) {
  const catColors: Record<string, string> = {
    language: C.language,
    sensory: C.sensory,
    cognitive: C.cognitive,
  };
  const catEmojis: Record<string, string> = {
    language: "🗣️",
    sensory: "🎨",
    cognitive: "🧩",
  };

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{labels.detailTitle}</Text>

      {/* Table */}
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { flex: 1.2 }]}>
            {labels.colArea}
          </Text>
          <Text
            style={[
              s.tableHeaderCell,
              { flex: 0.8, textAlign: "center" },
            ]}
          >
            {labels.colMissions}
          </Text>
          <Text
            style={[
              s.tableHeaderCell,
              { flex: 0.8, textAlign: "center" },
            ]}
          >
            {labels.colScore}
          </Text>
          <Text
            style={[
              s.tableHeaderCell,
              { flex: 1.2, textAlign: "center" },
            ]}
          >
            {labels.colCompletion}
          </Text>
          <Text style={[s.tableHeaderCell, { flex: 2 }]}>
            {labels.colTopMission}
          </Text>
        </View>

        {data.details.map((detail, i) => {
          const color = catColors[detail.category];
          return (
            <View
              key={detail.category}
              style={[
                s.tableRow,
                i % 2 === 1 ? s.tableRowAlt : {},
              ]}
            >
              <View
                style={{
                  flex: 1.2,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: 4,
                    height: 16,
                    borderRadius: 2,
                    backgroundColor: color,
                  }}
                />
                <Text style={s.tableCellBold}>{detail.label}</Text>
              </View>
              <Text
                style={[
                  s.tableCell,
                  { flex: 0.8, textAlign: "center" },
                ]}
              >
                {detail.missionCount}
              </Text>
              <Text
                style={[
                  s.tableCellBold,
                  { flex: 0.8, textAlign: "center", color },
                ]}
              >
                {data.categoryScores[detail.category]}
              </Text>
              <View style={{ flex: 1.2, paddingHorizontal: 4 }}>
                <View style={s.progressBar}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${detail.completionRate}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 6,
                    color: C.textMuted,
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  {detail.completionRate}%
                </Text>
              </View>
              <Text style={[s.tableCell, { flex: 2 }]}>
                {detail.topMission}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Insight cards */}
      <View style={s.insightRow}>
        {data.details.map((detail) => {
          const color = catColors[detail.category];
          const emoji = catEmojis[detail.category];
          return (
            <View key={detail.category} style={s.insightCard}>
              <Text style={s.insightEmoji}>{emoji}</Text>
              <Text style={[s.insightTitle, { color }]}>
                {detail.label}
              </Text>
              <Text style={s.insightText}>{detail.insight}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// Section: Expert Comment (Gemini)
// ─────────────────────────────────────────

function ExpertComment({
  data,
  labels,
}: {
  data: MonthlyReportData;
  labels: PdfLabels;
}) {
  const summary = data.aiSummary;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{labels.expertTitle}</Text>

      {/* Overall */}
      <View style={s.expertBox}>
        <Text style={s.expertLabel}>{labels.overviewLabel}</Text>
        <Text style={s.expertText}>{summary.overall_comment}</Text>
      </View>

      {/* Next month suggestion */}
      <View style={s.suggestionBox}>
        <Text style={[s.expertLabel, { color: "#0EA5E9" }]}>
          {labels.nextSuggestionLabel}
        </Text>
        <Text style={s.expertText}>{summary.next_month_suggestion}</Text>
      </View>

      {/* Encouragement */}
      <View style={s.encouragementBox}>
        <Text style={[s.expertLabel, { color: C.pink }]}>
          {labels.forParentsLabel}
        </Text>
        <Text style={s.expertText}>{summary.encouragement}</Text>
      </View>

      {/* Disclaimer */}
      <View style={s.disclaimer}>
        <Text style={s.disclaimerText}>{labels.disclaimer}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// Main Document (export)
// ─────────────────────────────────────────

export function MonthlyReportTemplate({
  data,
  labels,
}: {
  data: MonthlyReportData;
  labels: PdfLabels;
}) {
  return (
    <Document
      title={`${labels.brandName} - ${data.monthLabel}`}
      author={labels.brandName}
      subject={labels.reportTitle}
    >
      {/* Page 1: Header + Summary + Detailed Metrics */}
      <Page size="A4" style={s.page}>
        <ReportHeader data={data} labels={labels} />
        <SummarySection data={data} labels={labels} />
        <DetailedMetrics data={data} labels={labels} />

        <View style={s.pageFooter} fixed>
          <Text style={s.footerText}>{labels.footerText}</Text>
          <Text style={s.footerText}>{data.monthLabel}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `${labels.pageLabel} ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Page 2: Expert Comment */}
      <Page size="A4" style={s.page}>
        <ExpertComment data={data} labels={labels} />

        <View style={s.pageFooter} fixed>
          <Text style={s.footerText}>{labels.footerText}</Text>
          <Text style={s.footerText}>{data.monthLabel}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `${labels.pageLabel} ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
