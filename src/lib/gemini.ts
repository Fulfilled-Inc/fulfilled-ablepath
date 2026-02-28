import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerateContentResult,
} from "@google/generative-ai";

// ============================================
// Gemini Client
// ============================================

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? ""
);

// ============================================
// Types
// ============================================

/**
 * 비식별화된 아이 정보 — 개인정보 보호를 위해
 * 실명은 절대 포함하지 않고 아래 4가지만 전달합니다.
 */
export type ChildContext = {
  age: number; // 개월 수
  gender: "male" | "female" | "other";
  disability_type: string; // 예: 'autism', 'speech_delay', 'intellectual', 'sensory'
  concern: string; // 부모의 주요 고민/관찰 행동 설명
};

/** Architecture.md에 명시된 구조화된 응답 JSON */
export type Mission = {
  category: "language" | "sensory" | "cognitive";
  title: string;
  guide: string[];
  expected_effect: string;
  home_materials: string[];
};

export type DevelopmentalAdviceResponse = {
  daily_summary: string;
  missions: Mission[];
};

export type GeminiError = {
  type: "RATE_LIMIT" | "SAFETY_BLOCKED" | "API_ERROR" | "EMPTY_RESPONSE";
  message: string;
  retryAfterMs?: number;
};

export type GeminiResult =
  | { success: true; data: DevelopmentalAdviceResponse }
  | { success: false; error: GeminiError };

/** 월간 성취 요약 응답 */
export type MonthlySummaryResponse = {
  overall_comment: string;       // 이번 달 전체 코멘트 (3~4문장)
  language_insight: string;      // 언어 영역 분석 (2문장)
  sensory_insight: string;       // 감각통합 영역 분석 (2문장)
  cognitive_insight: string;     // 인지 영역 분석 (2문장)
  next_month_suggestion: string; // 다음 달 제안 (2~3문장)
  encouragement: string;         // 부모를 위한 격려 메시지 (1~2문장)
};

export type MonthlySummaryResult =
  | { success: true; data: MonthlySummaryResponse }
  | { success: false; error: GeminiError };

// ============================================
// System Prompt Builder
// ============================================

function buildSystemPrompt(locale: string): string {
  return `당신은 "AblePath Guide"입니다.
20년 경력의 글로벌 아동 발달 전문가이자, 언어·감각통합·인지 치료 전문가로서 활동하고 있습니다.

## 핵심 원칙
1. **따뜻한 공감**: 부모를 향한 깊은 공감과 지지가 담긴 따뜻한 톤을 사용하세요.
2. **쉬운 언어**: 전문 용어 대신 초보 부모도 이해할 수 있는 쉬운 단어를 사용하세요.
3. **놀이 중심 치료(Play-based Therapy)**: 고가의 교구 없이, **집안에 흔히 있는 물건**(숟가락, 컵, 양말, 쿠션, 페트병 등)을 활용한 놀이 활동을 제안하세요.
4. **3영역 분석**: 모든 행동을 반드시 아래 3가지 발달 영역에서 분석하세요.
   - **language** (언어 발달)
   - **sensory** (감각통합)
   - **cognitive** (인지 발달)

## 안전 수칙
- 절대로 의학적 진단을 내리지 마세요. 우려사항은 반드시 전문가 상담을 권하세요.
- 아이의 실명이나 개인 식별 정보를 응답에 포함하지 마세요.
- 안전하고, 나이에 적합하며, 집에서 할 수 있는 활동만 제안하세요.

## 중요: 출력 언어
결과물은 반드시 **${locale}** 언어로 작성하세요. 어떤 언어로 입력이 들어오더라도, 응답은 반드시 ${locale} 언어여야 합니다.

## 출력 형식 (Pure JSON만 — Markdown 금지)
반드시 아래 JSON 구조로만 응답하세요. JSON 외의 어떤 텍스트도 포함하지 마세요:
{
  "daily_summary": "오늘의 아이 상태에 대한 전문가의 따뜻한 코멘트 (2~3문장)",
  "missions": [
    {
      "category": "language",
      "title": "미션 제목",
      "guide": ["단계별 수행 방법 1", "단계별 수행 방법 2", "단계별 수행 방법 3"],
      "expected_effect": "기대 효과",
      "home_materials": ["필요한 집안 물건 1", "집안 물건 2"]
    },
    {
      "category": "sensory",
      "title": "...",
      "guide": ["..."],
      "expected_effect": "...",
      "home_materials": ["..."]
    },
    {
      "category": "cognitive",
      "title": "...",
      "guide": ["..."],
      "expected_effect": "...",
      "home_materials": ["..."]
    }
  ]
}

missions 배열에는 반드시 language, sensory, cognitive 각 1개씩 총 3개의 미션을 포함하세요.
guide 배열에는 3~5개의 구체적인 단계를 포함하세요.
home_materials 배열에는 집에서 쉽게 구할 수 있는 물건 1~3개를 포함하세요.`;
}

// ============================================
// Model Factory (responseMimeType 적용)
// ============================================

function getJsonModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  });
}

// ============================================
// Rate Limit Handling
// ============================================

/**
 * Gemini Free Tier Rate Limits:
 * - 15 RPM (requests per minute)
 * - 1,500 RPD (requests per day)
 * - 1M TPM (tokens per minute)
 *
 * 429 에러 시 자동 재시도 (최대 2회, 지수 백오프)
 */

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 2
): Promise<GenerateContentResult> {
  const model = getJsonModel();
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: userPrompt }] },
        ],
        systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
      });
      return result;
    } catch (err: unknown) {
      lastError = err;
      const error = err as { status?: number; message?: string };

      // 429 Rate Limit — 지수 백오프 후 재시도
      if (error.status === 429 && attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt + 1) * 1000; // 2s, 4s
        console.warn(
          `[Gemini] Rate limited. Retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(waitMs);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

// ============================================
// JSON 검증 유틸
// ============================================

function validateAdviceResponse(
  data: unknown
): data is DevelopmentalAdviceResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.daily_summary !== "string") return false;
  if (!Array.isArray(obj.missions)) return false;

  const validCategories = new Set(["language", "sensory", "cognitive"]);

  for (const mission of obj.missions) {
    if (!mission || typeof mission !== "object") return false;
    const m = mission as Record<string, unknown>;
    if (typeof m.category !== "string" || !validCategories.has(m.category))
      return false;
    if (typeof m.title !== "string") return false;
    if (!Array.isArray(m.guide)) return false;
    if (typeof m.expected_effect !== "string") return false;
    if (!Array.isArray(m.home_materials)) return false;
  }

  return true;
}

// ============================================
// Main Function: 발달 조언 생성
// ============================================

/**
 * 부모의 관찰/고민을 받아 3영역(언어/감통/인지) 놀이 치료 미션을 생성합니다.
 *
 * @param childContext - 비식별화된 아이 정보 {age, gender, disability_type, concern}
 * @param locale      - 응답 언어 코드 (예: "ko", "en", "ja", "zh", "es")
 * @returns           - 구조화된 JSON 객체 또는 에러
 */
export async function generateDevelopmentalAdvice(
  childContext: ChildContext,
  locale: string = "en"
): Promise<GeminiResult> {
  // ── 입력 검증 ──
  if (!childContext.concern.trim()) {
    return {
      success: false,
      error: {
        type: "EMPTY_RESPONSE",
        message: "Please describe your child's behavior or concern.",
      },
    };
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      success: false,
      error: {
        type: "API_ERROR",
        message: "AI service is not configured. Please contact support.",
      },
    };
  }

  // ── 시스템 프롬프트 (locale 동적 주입) ──
  const systemPrompt = buildSystemPrompt(locale);

  // ── 유저 프롬프트 (비식별화 정보만) ──
  const ageYears = Math.floor(childContext.age / 12);
  const ageMonths = childContext.age % 12;

  const userPrompt = `아이 정보 (비식별화):
- 나이: ${ageYears}세 ${ageMonths}개월 (총 ${childContext.age}개월)
- 성별: ${childContext.gender}
- 발달 영역: ${childContext.disability_type}

부모의 관찰/고민:
"${childContext.concern}"

위 정보를 바탕으로 3영역(language, sensory, cognitive) 미션을 JSON으로 생성해주세요.`;

  // ── Gemini 호출 ──
  try {
    const result = await generateWithRetry(systemPrompt, userPrompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: {
          type: "EMPTY_RESPONSE",
          message: "AI returned an empty response. Please try again.",
        },
      };
    }

    // ── JSON 파싱 & 검증 ──
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      // responseMimeType에도 불구하고 JSON 파싱에 실패한 경우
      console.error("[Gemini] JSON parse failed. Raw text:", text);
      return {
        success: false,
        error: {
          type: "API_ERROR",
          message: "AI response format error. Please try again.",
        },
      };
    }

    if (!validateAdviceResponse(parsed)) {
      console.error("[Gemini] Invalid response structure:", parsed);
      return {
        success: false,
        error: {
          type: "API_ERROR",
          message: "AI response structure mismatch. Please try again.",
        },
      };
    }

    return { success: true, data: parsed };
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };

    if (error.status === 429) {
      return {
        success: false,
        error: {
          type: "RATE_LIMIT",
          message:
            "Too many requests. The free AI service has a usage limit. Please wait a moment and try again.",
          retryAfterMs: 60_000,
        },
      };
    }

    if (error.message?.includes("SAFETY")) {
      return {
        success: false,
        error: {
          type: "SAFETY_BLOCKED",
          message:
            "The AI could not process this request due to content safety filters. Please rephrase your question.",
        },
      };
    }

    console.error("[Gemini] Unexpected error:", error);
    return {
      success: false,
      error: {
        type: "API_ERROR",
        message: "An error occurred while generating advice. Please try again.",
      },
    };
  }
}

// ============================================
// 월간 성취 요약 생성
// ============================================

/** 월간 요약 전용 시스템 프롬프트 */
function buildMonthlySummaryPrompt(locale: string): string {
  return `당신은 "AblePath Guide"입니다.
20년 경력의 글로벌 아동 발달 전문가이자, 언어·감각통합·인지 치료 전문가입니다.

## 역할
부모가 한 달간 수행한 미션 통계를 받아 **이번 달의 성취 요약**을 작성합니다.

## 핵심 원칙
1. **따뜻한 공감**: 부모의 노력을 인정하고 격려하는 톤을 유지하세요.
2. **데이터 기반**: 제공된 통계를 바탕으로 구체적인 분석을 하세요.
3. **건설적 제안**: 다음 달에 더 집중하면 좋을 영역을 부드럽게 제안하세요.

## 안전 수칙
- 의학적 진단을 내리지 마세요.
- 아이의 실명이나 개인 식별 정보를 포함하지 마세요.

## 중요: 출력 언어
결과물은 반드시 **${locale}** 언어로 작성하세요.

## 출력 형식 (Pure JSON만)
{
  "overall_comment": "이번 달 전체 코멘트 (3~4문장, 따뜻한 톤)",
  "language_insight": "언어 영역 분석 (2문장)",
  "sensory_insight": "감각통합 영역 분석 (2문장)",
  "cognitive_insight": "인지 영역 분석 (2문장)",
  "next_month_suggestion": "다음 달 제안 (2~3문장)",
  "encouragement": "부모를 위한 격려 메시지 (1~2문장)"
}`;
}

function validateMonthlySummaryResponse(
  data: unknown
): data is MonthlySummaryResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  const requiredKeys = [
    "overall_comment",
    "language_insight",
    "sensory_insight",
    "cognitive_insight",
    "next_month_suggestion",
    "encouragement",
  ];
  return requiredKeys.every((key) => typeof obj[key] === "string");
}

/**
 * 월간 미션 통계를 받아 Gemini에게 이번 달 성취 요약을 생성합니다.
 */
export async function generateMonthlySummary(
  stats: {
    language: number;
    sensory: number;
    cognitive: number;
    totalDays: number;
    childAge?: string;
    disabilityType?: string;
    monthLabel: string;
  },
  locale: string = "en"
): Promise<MonthlySummaryResult> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      success: false,
      error: { type: "API_ERROR", message: "AI service is not configured." },
    };
  }

  const systemPrompt = buildMonthlySummaryPrompt(locale);
  const total = stats.language + stats.sensory + stats.cognitive;

  const userPrompt = `## ${stats.monthLabel} 월간 미션 수행 통계

- 총 활동 일수: ${stats.totalDays}일
- 총 미션 수: ${total}개
  - 🗣️ 언어(language): ${stats.language}회
  - 🎨 감각통합(sensory): ${stats.sensory}회
  - 🧩 인지(cognitive): ${stats.cognitive}회
${stats.childAge ? `- 아이 나이: ${stats.childAge}` : ""}
${stats.disabilityType ? `- 발달 영역: ${stats.disabilityType}` : ""}

위 통계를 바탕으로 이번 달 성취 요약을 JSON으로 생성해주세요.`;

  try {
    const result = await generateWithRetry(systemPrompt, userPrompt);
    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: { type: "EMPTY_RESPONSE", message: "AI returned empty response." },
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("[Gemini Monthly] JSON parse failed:", text);
      return {
        success: false,
        error: { type: "API_ERROR", message: "AI response format error." },
      };
    }

    if (!validateMonthlySummaryResponse(parsed)) {
      console.error("[Gemini Monthly] Invalid structure:", parsed);
      return {
        success: false,
        error: { type: "API_ERROR", message: "AI response structure mismatch." },
      };
    }

    return { success: true, data: parsed };
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };

    if (error.status === 429) {
      return {
        success: false,
        error: {
          type: "RATE_LIMIT",
          message: "Too many requests. Please wait and try again.",
          retryAfterMs: 60_000,
        },
      };
    }

    console.error("[Gemini Monthly] Unexpected error:", error);
    return {
      success: false,
      error: { type: "API_ERROR", message: "An error occurred. Please try again." },
    };
  }
}
