/**
 * AblePath — 월간 PDF 리포트 데이터 타입 & Mock Data
 *
 * ── Architecture.md 규칙 ──
 * - Props 구조를 daily_logs (mission_logs + mood_logs) 연결 가능하게 설계
 * - 개인정보 보호: 아이 실명은 displayName 으로만 사용
 * - MonthlySummaryResponse (gemini.ts) 와 호환
 *
 * ── 다국어(locale) ──
 * PDF 내부 텍스트를 위한 PdfLabels 타입 정의 + 로케일별 라벨 팩토리
 */

import type { MonthlySummaryResponse } from "@/lib/gemini";

// ─────────────────────────────────────────
// 1. 공통 타입
// ─────────────────────────────────────────

export type Gender = "male" | "female" | "other";
export type CategoryKey = "language" | "sensory" | "cognitive";

export type ChildProfile = {
  displayName: string;       // 앱 표시용 이름 (실명 아님)
  ageLabel: string;          // "만 4세 2개월" / "4 years 2 months"
  gender: Gender;
  disabilityType: string;    // "Speech Delay" / "언어 지연"
};

/** 영역별 수치 */
export type CategoryScores = Record<CategoryKey, number>;

/** 영역별 상세 분석 */
export type CategoryDetail = {
  category: CategoryKey;
  label: string;             // 다국어 라벨 ("언어 발달" / "Language")
  missionCount: number;
  completionRate: number;    // 0–100
  topMission: string;
  insight: string;           // Gemini 분석 텍스트
};

/** 일별 미션 수행 로그 (향후 daily_logs 테이블에서 직접 매핑) */
export type DailyLog = {
  date: string;              // 'YYYY-MM-DD'
  language: number;
  sensory: number;
  cognitive: number;
};

// ─────────────────────────────────────────
// 2. PDF 리포트 전체 데이터 (Props)
// ─────────────────────────────────────────

export type MonthlyReportData = {
  /** 메타 */
  reportDate: string;        // 'YYYY-MM-DD'
  monthLabel: string;        // '2026년 2월' / 'February 2026'
  generatedAt: string;       // ISO timestamp

  /** 아이 프로필 */
  child: ChildProfile;

  /** 종합 수치 */
  totalMissions: number;
  totalDays: number;         // 활동한 날 수
  categoryCounts: CategoryScores;   // 영역별 미션 수
  categoryScores: CategoryScores;   // 영역별 점수 (0–100) → Radar

  /** 영역별 상세 */
  details: CategoryDetail[];

  /** 일별 로그 (차트용, optional) */
  dailyLogs?: DailyLog[];

  /** Gemini AI 성취 요약 */
  aiSummary: MonthlySummaryResponse;
};

// ─────────────────────────────────────────
// 3. PDF 내부 다국어 라벨 타입
// ─────────────────────────────────────────

export type PdfLabels = {
  brandName: string;
  reportTitle: string;
  childLabel: string;
  ageLabel: string;
  genderLabel: string;
  typeLabel: string;
  generatedLabel: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;

  summaryTitle: string;
  totalMissions: string;
  activeDays: string;
  avgPerDay: string;
  balanceScore: string;

  languageLabel: string;
  sensoryLabel: string;
  cognitiveLabel: string;

  detailTitle: string;
  colArea: string;
  colMissions: string;
  colScore: string;
  colCompletion: string;
  colTopMission: string;

  expertTitle: string;
  overviewLabel: string;
  nextSuggestionLabel: string;
  forParentsLabel: string;
  disclaimer: string;

  footerText: string;
  pageLabel: string;
};

// ─────────────────────────────────────────
// 4. 로케일별 라벨 팩토리
// ─────────────────────────────────────────

const labelsByLocale: Record<string, PdfLabels> = {
  ko: {
    brandName: "AblePath",
    reportTitle: "월간 발달 활동 리포트",
    childLabel: "아이",
    ageLabel: "나이",
    genderLabel: "성별",
    typeLabel: "발달 유형",
    generatedLabel: "생성일",
    genderMale: "남아",
    genderFemale: "여아",
    genderOther: "기타",

    summaryTitle: "📊  종합 요약",
    totalMissions: "총 미션",
    activeDays: "활동 일수",
    avgPerDay: "일 평균",
    balanceScore: "발달 균형 점수",

    languageLabel: "언어 발달",
    sensoryLabel: "감각통합",
    cognitiveLabel: "인지 발달",

    detailTitle: "📋  영역별 세부 지표",
    colArea: "영역",
    colMissions: "미션 수",
    colScore: "점수",
    colCompletion: "완료율",
    colTopMission: "최고 미션",

    expertTitle: "🤖  AI 전문가 성취 요약",
    overviewLabel: "이번 달 종합 분석",
    nextSuggestionLabel: "다음 달 제안",
    forParentsLabel: "보호자님에게",
    disclaimer:
      "이 리포트는 AI 기반 분석이며 의학적 진단을 대체하지 않습니다.\n전문적인 평가가 필요하시면 발달 전문가에게 상담하세요.",

    footerText: "AblePath · 월간 활동 리포트",
    pageLabel: "페이지",
  },

  en: {
    brandName: "AblePath",
    reportTitle: "Monthly Developmental Activity Report",
    childLabel: "Child",
    ageLabel: "Age",
    genderLabel: "Gender",
    typeLabel: "Type",
    generatedLabel: "Generated",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",

    summaryTitle: "📊  Summary Overview",
    totalMissions: "Total Missions",
    activeDays: "Active Days",
    avgPerDay: "Avg / Day",
    balanceScore: "Development Balance Score",

    languageLabel: "Language",
    sensoryLabel: "Sensory",
    cognitiveLabel: "Cognitive",

    detailTitle: "📋  Detailed Metrics by Area",
    colArea: "Area",
    colMissions: "Missions",
    colScore: "Score",
    colCompletion: "Completion",
    colTopMission: "Top Mission",

    expertTitle: "🤖  AI Expert Achievement Summary",
    overviewLabel: "Monthly Overview",
    nextSuggestionLabel: "Next Month Suggestion",
    forParentsLabel: "For Parents",
    disclaimer:
      "This report is generated by AI analysis and does not constitute a medical diagnosis.\nPlease consult a licensed developmental specialist for professional evaluation.",

    footerText: "AblePath · Monthly Activity Report",
    pageLabel: "Page",
  },

  ja: {
    brandName: "AblePath",
    reportTitle: "月間発達活動レポート",
    childLabel: "お子さま",
    ageLabel: "年齢",
    genderLabel: "性別",
    typeLabel: "発達タイプ",
    generatedLabel: "作成日",
    genderMale: "男の子",
    genderFemale: "女の子",
    genderOther: "その他",

    summaryTitle: "📊  総合サマリー",
    totalMissions: "総ミッション数",
    activeDays: "活動日数",
    avgPerDay: "1日平均",
    balanceScore: "発達バランススコア",

    languageLabel: "言語",
    sensoryLabel: "感覚統合",
    cognitiveLabel: "認知",

    detailTitle: "📋  分野別詳細指標",
    colArea: "分野",
    colMissions: "ミッション数",
    colScore: "スコア",
    colCompletion: "達成率",
    colTopMission: "トップミッション",

    expertTitle: "🤖  AI専門家達成サマリー",
    overviewLabel: "今月の総合分析",
    nextSuggestionLabel: "来月の提案",
    forParentsLabel: "保護者の方へ",
    disclaimer:
      "このレポートはAI分析に基づいており、医学的診断に代わるものではありません。\n専門的な評価が必要な場合は、発達専門家にご相談ください。",

    footerText: "AblePath · 月間活動レポート",
    pageLabel: "ページ",
  },

  zh: {
    brandName: "AblePath",
    reportTitle: "月度发展活动报告",
    childLabel: "儿童",
    ageLabel: "年龄",
    genderLabel: "性别",
    typeLabel: "发展类型",
    generatedLabel: "生成日期",
    genderMale: "男孩",
    genderFemale: "女孩",
    genderOther: "其他",

    summaryTitle: "📊  综合概述",
    totalMissions: "任务总数",
    activeDays: "活动天数",
    avgPerDay: "日均",
    balanceScore: "发展均衡评分",

    languageLabel: "语言",
    sensoryLabel: "感觉统合",
    cognitiveLabel: "认知",

    detailTitle: "📋  分领域详细指标",
    colArea: "领域",
    colMissions: "任务数",
    colScore: "评分",
    colCompletion: "完成率",
    colTopMission: "最佳任务",

    expertTitle: "🤖  AI专家成就总结",
    overviewLabel: "本月综合分析",
    nextSuggestionLabel: "下月建议",
    forParentsLabel: "致家长",
    disclaimer:
      "本报告基于AI分析生成，不构成医学诊断。\n如需专业评估，请咨询持证发展专家。",

    footerText: "AblePath · 月度活动报告",
    pageLabel: "页",
  },

  es: {
    brandName: "AblePath",
    reportTitle: "Informe Mensual de Actividades de Desarrollo",
    childLabel: "Niño/a",
    ageLabel: "Edad",
    genderLabel: "Género",
    typeLabel: "Tipo",
    generatedLabel: "Generado",
    genderMale: "Niño",
    genderFemale: "Niña",
    genderOther: "Otro",

    summaryTitle: "📊  Resumen General",
    totalMissions: "Misiones Totales",
    activeDays: "Días Activos",
    avgPerDay: "Prom / Día",
    balanceScore: "Puntuación de Equilibrio",

    languageLabel: "Lenguaje",
    sensoryLabel: "Sensorial",
    cognitiveLabel: "Cognitivo",

    detailTitle: "📋  Métricas Detalladas por Área",
    colArea: "Área",
    colMissions: "Misiones",
    colScore: "Puntuación",
    colCompletion: "Completado",
    colTopMission: "Mejor Misión",

    expertTitle: "🤖  Resumen de Logros del Experto IA",
    overviewLabel: "Análisis Mensual",
    nextSuggestionLabel: "Sugerencia para el Próximo Mes",
    forParentsLabel: "Para los Padres",
    disclaimer:
      "Este informe se genera mediante análisis de IA y no constituye un diagnóstico médico.\nPara una evaluación profesional, consulte a un especialista en desarrollo.",

    footerText: "AblePath · Informe de Actividad Mensual",
    pageLabel: "Página",
  },
};

/** locale에 해당하는 PDF 라벨 반환 (fallback: en) */
export function getPdfLabels(locale: string): PdfLabels {
  return labelsByLocale[locale] ?? labelsByLocale.en;
}

// ─────────────────────────────────────────
// 5. Mock Data (미리보기 확인용)
// ─────────────────────────────────────────

export const MOCK_REPORT_DATA: MonthlyReportData = {
  reportDate: "2026-02-28",
  monthLabel: "2026년 2월",
  generatedAt: new Date().toISOString(),

  child: {
    displayName: "하윤",
    ageLabel: "만 4세 2개월",
    gender: "female",
    disabilityType: "언어 지연 (Speech Delay)",
  },

  totalMissions: 42,
  totalDays: 18,

  categoryCounts: { language: 16, sensory: 14, cognitive: 12 },
  categoryScores: { language: 78, sensory: 65, cognitive: 72 },

  details: [
    {
      category: "language",
      label: "언어 발달",
      missionCount: 16,
      completionRate: 88,
      topMission: "동물 소리 따라하기 놀이",
      insight:
        "이번 달 언어 영역에서 눈에 띄는 발전이 있었습니다. 특히 2음절 단어의 모방이 자연스러워졌고, 자발적인 요구 표현 빈도가 이전 달 대비 30% 증가했습니다.",
    },
    {
      category: "sensory",
      label: "감각통합",
      missionCount: 14,
      completionRate: 75,
      topMission: "촉감 탐색 상자 놀이",
      insight:
        "감각 탐색 활동에 대한 거부감이 줄어들고 있습니다. 물 놀이, 모래 놀이 등 다양한 촉감 자극에 대한 수용 시간이 평균 5분에서 12분으로 늘었습니다.",
    },
    {
      category: "cognitive",
      label: "인지 발달",
      missionCount: 12,
      completionRate: 82,
      topMission: "색깔 분류 컵 놀이",
      insight:
        "색깔과 모양 분류 능력이 향상되었습니다. 3가지 색상의 구별이 안정적이며, 간단한 패턴 인식(ABAB)을 시도하기 시작했습니다.",
    },
  ],

  dailyLogs: [
    { date: "2026-02-03", language: 1, sensory: 1, cognitive: 0 },
    { date: "2026-02-04", language: 1, sensory: 0, cognitive: 1 },
    { date: "2026-02-05", language: 0, sensory: 1, cognitive: 1 },
    { date: "2026-02-06", language: 1, sensory: 1, cognitive: 1 },
    { date: "2026-02-07", language: 1, sensory: 0, cognitive: 0 },
    { date: "2026-02-10", language: 1, sensory: 1, cognitive: 1 },
    { date: "2026-02-11", language: 1, sensory: 1, cognitive: 0 },
    { date: "2026-02-12", language: 0, sensory: 1, cognitive: 1 },
    { date: "2026-02-13", language: 1, sensory: 0, cognitive: 1 },
    { date: "2026-02-14", language: 1, sensory: 1, cognitive: 0 },
    { date: "2026-02-17", language: 1, sensory: 1, cognitive: 1 },
    { date: "2026-02-18", language: 1, sensory: 0, cognitive: 1 },
    { date: "2026-02-19", language: 0, sensory: 1, cognitive: 1 },
    { date: "2026-02-20", language: 1, sensory: 1, cognitive: 0 },
    { date: "2026-02-21", language: 1, sensory: 1, cognitive: 1 },
    { date: "2026-02-24", language: 1, sensory: 1, cognitive: 1 },
    { date: "2026-02-25", language: 1, sensory: 0, cognitive: 1 },
    { date: "2026-02-26", language: 1, sensory: 1, cognitive: 0 },
  ],

  aiSummary: {
    overall_comment:
      "하윤이가 이번 달 정말 많은 노력을 기울였어요! 총 18일간 42개의 미션을 수행하며 3개 영역 모두에서 고른 발전을 보였습니다. 특히 언어 영역에서의 자발적 표현 증가는 매우 긍정적인 신호입니다.",
    language_insight:
      "언어 영역에서 2음절 단어 모방이 자연스러워지고 있습니다. 동물 소리 놀이를 통해 자발적 발화가 증가했으며, 이는 또래 수준의 언어 발달에 한 걸음 더 가까워지고 있다는 의미입니다.",
    sensory_insight:
      "감각 자극에 대한 방어적 반응이 점차 줄어들고 있습니다. 촉감 놀이 참여 시간이 2배 이상 늘어난 것은 감각 조절 능력이 향상되고 있음을 보여줍니다.",
    cognitive_insight:
      "색상 분류와 패턴 인식에서 진전을 보이고 있습니다. 특히 3가지 색상 구별이 안정화된 것은 인지 발달의 중요한 이정표입니다.",
    next_month_suggestion:
      "다음 달에는 언어 영역의 성장 모멘텀을 유지하면서, 감각통합 미션의 참여도를 높이는 데 초점을 맞추면 좋겠습니다. 물감 놀이나 점토 활동처럼 촉각과 시각을 동시에 자극하는 복합 감각 미션을 추천합니다.",
    encouragement:
      "보호자님의 꾸준한 노력이 하윤이의 발달에 큰 힘이 되고 있습니다. 매일 조금씩, 아이와 함께하는 그 시간 자체가 가장 훌륭한 치료입니다. 💕",
  },
};
