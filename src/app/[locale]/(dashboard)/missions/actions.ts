"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateDevelopmentalAdvice,
  type ChildContext,
  type DevelopmentalAdviceResponse,
  type GeminiError,
} from "@/lib/gemini";
import { getAgeInMonths } from "@/lib/utils";

// ============================================
// Types
// ============================================

export type GenerateMissionsInput = {
  childId?: string;
  concern: string;
  locale: string;
  /** DB 대신 폼에서 직접 입력한 아이 정보 (childId 없을 때 사용) */
  overrideChild?: {
    displayName: string; // 앱 표시용 (Gemini에 전달하지 않음)
    ageYears: number;    // 만 나이
    gender: "male" | "female" | "other";
    disabilityType: string;
  };
};

export type GenerateMissionsResult =
  | { success: true; data: DevelopmentalAdviceResponse }
  | { success: false; error: string; errorType?: GeminiError["type"] };

// ============================================
// Server Action: 오늘의 맞춤 미션 생성
// ============================================

/**
 * 사용자가 입력한 아이 정보(나이, 장애 유형, 현재 고민)를 바탕으로
 * Gemini '특수교육 전문가'에게 3영역(언어/감통/인지) 맞춤 미션을 생성합니다.
 *
 * - 비식별화: 실명 제외, {age, gender, disability_type, concern}만 전달
 * - 다국어: locale에 따라 응답 언어 자동 설정
 * - 구조화된 JSON: responseMimeType + JSON.parse + 검증
 */
export async function generateDailyMissions(
  input: GenerateMissionsInput
): Promise<GenerateMissionsResult> {
  try {
    // ── 1. 인증 확인 ──
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    // ── 2. 입력 검증 ──
    if (!input.concern.trim()) {
      return {
        success: false,
        error: "Please describe your child's current concern.",
      };
    }

    if (!input.childId && !input.overrideChild) {
      return {
        success: false,
        error: "Please provide child information.",
      };
    }

    // ── 3. ChildContext 조립 ──
    let childContext: ChildContext;

    if (input.overrideChild) {
      // 폼에서 직접 입력한 아이 정보 사용 (DB 조회 불필요)
      childContext = {
        age: input.overrideChild.ageYears * 12,
        gender: input.overrideChild.gender,
        disability_type: input.overrideChild.disabilityType,
        concern: input.concern.trim(),
      };
    } else {
      // 기존 방식: DB에서 아이 정보 조회 (비식별화)
      const { data: child, error: childError } = await supabase
        .from("children")
        .select("birth_date, gender, disability_type")
        .eq("id", input.childId!)
        .eq("parent_id", user.id)
        .single();

      if (childError || !child) {
        return {
          success: false,
          error: "Child not found. Please check your settings.",
        };
      }

      childContext = {
        age: child.birth_date ? getAgeInMonths(child.birth_date) : 36,
        gender: child.gender ?? "other",
        disability_type: child.disability_type ?? "unknown",
        concern: input.concern.trim(),
      };
    }

    // ── 4. Gemini 호출 (특수교육 전문가 페르소나) ──
    const result = await generateDevelopmentalAdvice(
      childContext,
      input.locale || "en"
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
        errorType: result.error.type,
      };
    }

    // ── 5. AI 채팅 로그 저장 ──
    await supabase.from("ai_chat_logs").insert({
      parent_id: user.id,
      child_id: input.childId ?? null,
      question: input.concern,
      answer: JSON.stringify(result.data),
    });

    // ── 6. 구조화된 JSON 객체 리턴 ──
    return { success: true, data: result.data };
  } catch (error) {
    console.error("[generateDailyMissions] Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
