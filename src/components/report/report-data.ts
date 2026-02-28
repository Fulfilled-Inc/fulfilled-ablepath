/**
 * AblePath — 유료 플랜 PDF 리포트 데이터 타입 + Mock 데이터
 *
 * MonthlyStats / MonthlySummaryResponse와 호환되면서도
 * PDF 문서에 특화된 추가 필드를 담습니다.
 */

import type { MonthlySummaryResponse } from "@/lib/gemini";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type ChildInfo = {
  name: string;
  ageLabel: string;       // "만 4세 2개월"
  gender: "male" | "female" | "other";
  disabilityType: string;
};

export type CategoryScore = {
  language: number;   // 0~100
  sensory: number;
  cognitive: number;
};

export type CategoryDetail = {
  category: "language" | "sensory" | "cognitive";
  label: string;
  missionCount: number;
  completionRate: number; // 0~100
  topMission: string;
  insight: string;
};

export type PdfReportData = {
  /** 리포트 메타 */
  reportDate: string;      // '2026-02-28'
  monthLabel: string;      // '2026년 2월'
  generatedAt: string;     // ISO timestamp

  /** 아이 정보 */
  child: ChildInfo;

  /** 종합 요약 */
  totalMissions: number;
  totalDays: number;
  categoryCounts: CategoryScore;          // 미션 수
  categoryScores: CategoryScore;          // 점수(0~100) — Radar Chart 용

  /** 영역별 상세 */
  details: CategoryDetail[];

  /** AI 성취 요약 (Gemini) */
  aiSummary: MonthlySummaryResponse;
};

// ─────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────

export const MOCK_REPORT_DATA: PdfReportData = {
  reportDate: "2026-02-28",
  monthLabel: "2026년 2월",
  generatedAt: new Date().toISOString(),

  child: {
    name: "하윤",
    ageLabel: "만 4세 2개월",
    gender: "female",
    disabilityType: "언어 지연 (Speech Delay)",
  },

  totalMissions: 42,
  totalDays: 18,

  categoryCounts: {
    language: 16,
    sensory: 14,
    cognitive: 12,
  },

  categoryScores: {
    language: 78,
    sensory: 65,
    cognitive: 72,
  },

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

  aiSummary: {
    overall_comment:
      "하윤이가 이번 달 정말 많은 노력을 기울였어요! 총 18일간 42개의 미션을 수행하며 3개 영역 모두에서 고른 발전을 보였습니다. 특히 언어 영역에서의 자발적 표현 증가는 매우 긍정적인 신호입니다. 놀이를 통한 학습이 아이에게 잘 맞는 것 같아요.",
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
