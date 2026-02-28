import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateDevelopmentalAdvice,
  type ChildContext,
} from "@/lib/gemini";
import { getAgeInMonths } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { concern, childId, locale = "en" } = body as {
      concern: string;
      childId?: string;
      locale?: string;
    };

    if (!concern?.trim()) {
      return NextResponse.json(
        { error: "Concern is required" },
        { status: 400 }
      );
    }

    // 아이 정보 조회 (비식별화 — 실명 제외, age/gender/disability_type만)
    let childContext: ChildContext = {
      age: 36, // 기본값 3세
      gender: "other",
      disability_type: "unknown",
      concern: concern.trim(),
    };

    if (childId) {
      const { data: child } = await supabase
        .from("children")
        .select("birth_date, gender, disability_type")
        .eq("id", childId)
        .eq("parent_id", user.id)
        .single();

      if (child) {
        childContext = {
          age: child.birth_date
            ? getAgeInMonths(child.birth_date)
            : 36,
          gender: child.gender ?? "other",
          disability_type: child.disability_type ?? "unknown",
          concern: concern.trim(),
        };
      }
    }

    // Gemini 조언 생성
    const result = await generateDevelopmentalAdvice(childContext, locale);

    if (!result.success) {
      const statusCode =
        result.error.type === "RATE_LIMIT"
          ? 429
          : result.error.type === "SAFETY_BLOCKED"
            ? 422
            : 500;

      return NextResponse.json(
        {
          error: result.error.message,
          errorType: result.error.type,
          retryAfterMs: result.error.retryAfterMs,
        },
        { status: statusCode }
      );
    }

    // 채팅 기록 저장 (구조화된 JSON을 문자열로 저장)
    await supabase.from("ai_chat_logs").insert({
      parent_id: user.id,
      child_id: childId ?? null,
      question: concern,
      answer: JSON.stringify(result.data),
    });

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("[AI Guide API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
