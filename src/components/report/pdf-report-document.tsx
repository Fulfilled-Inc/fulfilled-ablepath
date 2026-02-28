"use client";

/**
 * AblePath — 유료 플랜 PDF 리포트 (@react-pdf/renderer)
 *
 * A4 사이즈 기준, 전문 의료 문서 스타일
 * - 깨끗한 화이트 배경 + Soft Blue 포인트 컬러
 * - Helvetica 폰트 (글로벌 가독성, PDF 내장 폰트)
 * - 섹션: ReportHeader → SummaryChart (Radar) → DetailedMetrics → ExpertComment
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
  Font,
} from "@react-pdf/renderer";
import type { PdfReportData, CategoryScore } from "./report-data";

// ─────────────────────────────────────────
// 컬러 팔레트
// ─────────────────────────────────────────

const C = {
  // Primary — Soft Blue
  primary: "#4A90D9",
  primaryLight: "#EBF2FA",
  primaryMuted: "#7EB3E8",

  // Neutrals
  white: "#FFFFFF",
  bg: "#FAFBFD",
  text: "#1A202C",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  // Category Colors
  language: "#3B82F6",   // Blue
  sensory: "#8B5CF6",    // Violet
  cognitive: "#14B8A6",  // Teal

  // Accents
  green: "#22C55E",
  amber: "#F59E0B",
  pink: "#EC4899",
};

// ─────────────────────────────────────────
// 스타일시트
// ─────────────────────────────────────────

const s = StyleSheet.create({
  // ─ Page ─
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
  footerText: {
    fontSize: 7,
    color: C.textLight,
  },

  // ─ Header ─
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
  },
  headerLeft: {
    flex: 1,
  },
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
  headerInfoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  headerLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.textMuted,
    width: 70,
  },
  headerValue: {
    fontSize: 9,
    color: C.text,
  },
  headerRight: {
    alignItems: "flex-end",
    paddingTop: 4,
  },
  headerMonthLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.text,
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 8,
    color: C.textMuted,
  },

  // ─ Section ─
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.primaryLight,
  },

  // ─ Summary row ─
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
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

  // ─ Category summary cards ─
  catRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  catCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  catEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  catValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  catLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
    textTransform: "uppercase",
  },

  // ─ Radar chart area ─
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
  radarLegendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  radarLegendText: {
    fontSize: 7,
    color: C.textMuted,
  },

  // ─ Table ─
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
  tableRowAlt: {
    backgroundColor: C.bg,
  },
  tableCell: {
    fontSize: 8,
    color: C.text,
  },
  tableCellBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.text,
  },

  // ─ Progress bar ─
  progressBar: {
    height: 6,
    backgroundColor: C.borderLight,
    borderRadius: 3,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },

  // ─ Expert comment ─
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
  expertText: {
    fontSize: 9,
    color: C.text,
    lineHeight: 1.6,
  },

  // Insight row
  insightRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  insightCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  insightEmoji: {
    fontSize: 12,
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  insightText: {
    fontSize: 8,
    color: C.textMuted,
    lineHeight: 1.5,
  },

  // Suggestion + encouragement
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

  // Disclaimer
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
// Radar Chart (SVG 기반)
// ─────────────────────────────────────────

function RadarChart({ scores }: { scores: CategoryScore }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 55;
  const levels = 4;

  // 3개 꼭지점 (위, 우하, 좌하) — 삼각형 형태
  const angles = [-90, 150, 30]; // degree

  function toRad(deg: number) {
    return (deg * Math.PI) / 180;
  }

  function point(angleDeg: number, r: number) {
    const rad = toRad(angleDeg);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  // 격자 다각형 포인트
  function gridPolygon(level: number) {
    const r = (radius / levels) * (level + 1);
    return angles.map((a) => point(a, r)).map((p) => `${p.x},${p.y}`).join(" ");
  }

  // 데이터 다각형
  const values = [scores.language, scores.sensory, scores.cognitive];
  const dataPoints = angles.map((a, i) => {
    const r = (values[i] / 100) * radius;
    return point(a, r);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // 축 끝점
  const axisEnds = angles.map((a) => point(a, radius + 8));

  const labels = [
    { text: "Language", anchor: "middle" as const, dx: 0, dy: -8 },
    { text: "Sensory", anchor: "start" as const, dx: 6, dy: 4 },
    { text: "Cognitive", anchor: "end" as const, dx: -6, dy: 4 },
  ];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 격자 */}
      {Array.from({ length: levels }, (_, i) => (
        <Polygon
          key={`grid-${i}`}
          points={gridPolygon(i)}
          fill="none"
          stroke={C.border}
          strokeWidth={0.5}
        />
      ))}

      {/* 축 */}
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

      {/* 데이터 영역 */}
      <Polygon
        points={dataPolygon}
        fill={C.primary}
        fillOpacity={0.2}
        stroke={C.primary}
        strokeWidth={1.5}
      />

      {/* 데이터 점 */}
      {dataPoints.map((p, i) => (
        <Circle
          key={`dot-${i}`}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={[C.language, C.sensory, C.cognitive][i]}
        />
      ))}

      {/* 점수 라벨 */}
      {dataPoints.map((p, i) => {
        const ap = axisEnds[i];
        return (
          <Text
            key={`score-${i}`}
            x={ap.x + labels[i].dx}
            y={ap.y + labels[i].dy}
            style={{
              fontSize: 7,
              fontFamily: "Helvetica-Bold",
              fill: [C.language, C.sensory, C.cognitive][i],
            }}
          >
            {values[i]}
          </Text>
        );
      })}
    </Svg>
  );
}

// ─────────────────────────────────────────
// Section Components
// ─────────────────────────────────────────

function ReportHeader({ data }: { data: PdfReportData }) {
  const genderLabel =
    data.child.gender === "male"
      ? "Male"
      : data.child.gender === "female"
        ? "Female"
        : "Other";

  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <Text style={s.headerBrand}>AblePath</Text>
        <Text style={s.headerSubtitle}>
          Developmental Activity Report
        </Text>

        <View style={s.headerInfoRow}>
          <Text style={s.headerLabel}>Child</Text>
          <Text style={s.headerValue}>{data.child.name}</Text>
        </View>
        <View style={s.headerInfoRow}>
          <Text style={s.headerLabel}>Age</Text>
          <Text style={s.headerValue}>{data.child.ageLabel}</Text>
        </View>
        <View style={s.headerInfoRow}>
          <Text style={s.headerLabel}>Gender</Text>
          <Text style={s.headerValue}>{genderLabel}</Text>
        </View>
        <View style={s.headerInfoRow}>
          <Text style={s.headerLabel}>Type</Text>
          <Text style={s.headerValue}>{data.child.disabilityType}</Text>
        </View>
      </View>

      <View style={s.headerRight}>
        <Text style={s.headerMonthLabel}>{data.monthLabel}</Text>
        <Text style={s.headerDate}>
          Generated: {new Date(data.generatedAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

function SummarySection({ data }: { data: PdfReportData }) {
  const catMeta = [
    { key: "language" as const, emoji: "🗣️", label: "Language", color: C.language },
    { key: "sensory" as const, emoji: "🎨", label: "Sensory", color: C.sensory },
    { key: "cognitive" as const, emoji: "🧩", label: "Cognitive", color: C.cognitive },
  ];

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>📊  Summary Overview</Text>

      {/* 총 미션 + 활동 일수 */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardValue}>{data.totalMissions}</Text>
          <Text style={s.summaryCardLabel}>Total Missions</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardValue}>{data.totalDays}</Text>
          <Text style={s.summaryCardLabel}>Active Days</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryCardValue}>
            {Math.round(data.totalMissions / Math.max(data.totalDays, 1) * 10) / 10}
          </Text>
          <Text style={s.summaryCardLabel}>Avg / Day</Text>
        </View>
      </View>

      {/* 카테고리별 */}
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
        <Text style={s.radarTitle}>Development Balance Score</Text>
        <RadarChart scores={data.categoryScores} />
        <View style={s.radarLegend}>
          {catMeta.map(({ label, color }) => (
            <View key={label} style={s.radarLegendItem}>
              <View style={[s.radarLegendDot, { backgroundColor: color }]} />
              <Text style={s.radarLegendText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function DetailedMetrics({ data }: { data: PdfReportData }) {
  const catColors = {
    language: C.language,
    sensory: C.sensory,
    cognitive: C.cognitive,
  };

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>📋  Detailed Metrics by Area</Text>

      {/* 테이블 */}
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { flex: 1.2 }]}>Area</Text>
          <Text style={[s.tableHeaderCell, { flex: 0.8, textAlign: "center" }]}>Missions</Text>
          <Text style={[s.tableHeaderCell, { flex: 0.8, textAlign: "center" }]}>Score</Text>
          <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: "center" }]}>Completion</Text>
          <Text style={[s.tableHeaderCell, { flex: 2 }]}>Top Mission</Text>
        </View>

        {data.details.map((detail, i) => {
          const color = catColors[detail.category];
          return (
            <View key={detail.category} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <View style={{ flex: 1.2, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: color }} />
                <Text style={s.tableCellBold}>{detail.label}</Text>
              </View>
              <Text style={[s.tableCell, { flex: 0.8, textAlign: "center" }]}>
                {detail.missionCount}
              </Text>
              <Text style={[s.tableCellBold, { flex: 0.8, textAlign: "center", color }]}>
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
                <Text style={{ fontSize: 6, color: C.textMuted, textAlign: "center", marginTop: 2 }}>
                  {detail.completionRate}%
                </Text>
              </View>
              <Text style={[s.tableCell, { flex: 2 }]}>{detail.topMission}</Text>
            </View>
          );
        })}
      </View>

      {/* 영역별 인사이트 */}
      <View style={s.insightRow}>
        {data.details.map((detail) => {
          const color = catColors[detail.category];
          const emojis = { language: "🗣️", sensory: "🎨", cognitive: "🧩" };

          return (
            <View key={detail.category} style={s.insightCard}>
              <Text style={s.insightEmoji}>{emojis[detail.category]}</Text>
              <Text style={[s.insightTitle, { color }]}>{detail.label}</Text>
              <Text style={s.insightText}>{detail.insight}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ExpertComment({ data }: { data: PdfReportData }) {
  const summary = data.aiSummary;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>🤖  AI Expert Achievement Summary</Text>

      {/* 전체 코멘트 */}
      <View style={s.expertBox}>
        <Text style={s.expertLabel}>Monthly Overview</Text>
        <Text style={s.expertText}>{summary.overall_comment}</Text>
      </View>

      {/* 다음 달 제안 */}
      <View style={s.suggestionBox}>
        <Text style={[s.expertLabel, { color: "#0EA5E9" }]}>
          Next Month Suggestion
        </Text>
        <Text style={s.expertText}>{summary.next_month_suggestion}</Text>
      </View>

      {/* 격려 메시지 */}
      <View style={s.encouragementBox}>
        <Text style={[s.expertLabel, { color: C.pink }]}>
          For Parents
        </Text>
        <Text style={s.expertText}>{summary.encouragement}</Text>
      </View>

      {/* 면책 조항 */}
      <View style={s.disclaimer}>
        <Text style={s.disclaimerText}>
          This report is generated by AI analysis based on activity data and does not constitute a medical diagnosis.
          {"\n"}
          For professional evaluation, please consult a licensed developmental specialist.
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// Main Document
// ─────────────────────────────────────────

export function AblePathReportDocument({ data }: { data: PdfReportData }) {
  return (
    <Document
      title={`AblePath Report - ${data.monthLabel}`}
      author="AblePath"
      subject="Monthly Developmental Activity Report"
    >
      {/* Page 1: Header + Summary + Radar */}
      <Page size="A4" style={s.page}>
        <ReportHeader data={data} />
        <SummarySection data={data} />
        <DetailedMetrics data={data} />

        {/* Footer */}
        <View style={s.pageFooter} fixed>
          <Text style={s.footerText}>AblePath · Monthly Activity Report</Text>
          <Text style={s.footerText}>{data.monthLabel}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Page 2: Expert Comment */}
      <Page size="A4" style={s.page}>
        <ExpertComment data={data} />

        {/* Footer */}
        <View style={s.pageFooter} fixed>
          <Text style={s.footerText}>AblePath · Monthly Activity Report</Text>
          <Text style={s.footerText}>{data.monthLabel}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
