"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateMonthlySummary,
  type DevelopmentalAdviceResponse,
  type MonthlySummaryResponse,
} from "@/lib/gemini";

// ============================================
// Types
// ============================================

export type ActivityLogEntry = {
  id: string;
  question: string; // concern 원문
  answer: DevelopmentalAdviceResponse; // 파싱된 JSON
  created_at: string;
  child_id: string | null;
};

/** 날짜별로 그룹화된 활동 기록 */
export type DateGroupedActivity = {
  date: string; // 'YYYY-MM-DD'
  entries: ActivityLogEntry[];
};

/** 프로필 요약 */
export type ProfileSummary = {
  displayName: string | null;
  childName: string | null;
  childDisabilityType: string | null;
  totalMissionsCompleted: number;
};

/** 주간 카테고리별 미션 카운트 */
export type WeeklyCategoryCounts = {
  language: number;
  sensory: number;
  cognitive: number;
};

/** 월간 통계 */
export type MonthlyStats = {
  month: string;             // 'YYYY-MM'
  monthLabel: string;        // 사람이 읽는 형태 '2026년 2월'
  categoryCounts: {
    language: number;
    sensory: number;
    cognitive: number;
  };
  totalMissions: number;
  totalDays: number;         // 해당 월에 활동이 있었던 고유 일 수
  dailyBreakdown: {          // 일별 미션 수 (차트용)
    date: string;            // 'YYYY-MM-DD'
    language: number;
    sensory: number;
    cognitive: number;
  }[];
  aiSummary: MonthlySummaryResponse | null;  // Gemini 성취 요약
};

// ============================================
// Server Action: 활동 기록 조회
// ============================================

export async function getActivityHistory(): Promise<{
  success: true;
  profile: ProfileSummary;
  groups: DateGroupedActivity[];
  weeklyCounts: WeeklyCategoryCounts;
} | {
  success: false;
  error: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // ── 1. 프로필 & 아이 정보 ──
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const { data: children } = await supabase
      .from("children")
      .select("name, disability_type")
      .eq("parent_id", user.id)
      .limit(1);

    const child = children?.[0] ?? null;

    // ── 2. AI 채팅 로그 (최신순) ──
    const { data: logs, error: logsError } = await supabase
      .from("ai_chat_logs")
      .select("id, question, answer, created_at, child_id")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (logsError) {
      return { success: false, error: logsError.message };
    }

    // ── 3. 날짜별 그룹화 ──
    const entries: ActivityLogEntry[] = (logs ?? [])
      .map((log) => {
        let parsed: DevelopmentalAdviceResponse;
        try {
          parsed = JSON.parse(log.answer);
          // [AI Mission completed/skipped] 접두사가 있는 로그는 미션 완료 로그이므로 필터링
          if (log.question.startsWith("[AI Mission")) return null;
        } catch {
          return null; // 파싱 실패하면 제외
        }
        return {
          id: log.id,
          question: log.question,
          answer: parsed,
          created_at: log.created_at,
          child_id: log.child_id,
        };
      })
      .filter(Boolean) as ActivityLogEntry[];

    const groupMap = new Map<string, ActivityLogEntry[]>();
    for (const entry of entries) {
      const date = entry.created_at.split("T")[0];
      if (!groupMap.has(date)) groupMap.set(date, []);
      groupMap.get(date)!.push(entry);
    }

    const groups: DateGroupedActivity[] = Array.from(groupMap.entries()).map(
      ([date, entries]) => ({ date, entries })
    );

    // ── 4. 총 완료 미션 수 (ai_chat_logs 기반 — 미션 수 추정) ──
    // 각 로그의 missions 배열 길이 합산
    let totalMissionsCompleted = 0;
    for (const entry of entries) {
      totalMissionsCompleted += entry.answer.missions?.length ?? 0;
    }

    // ── 5. 최근 7일 카테고리별 미션 카운트 ──
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const weeklyCounts: WeeklyCategoryCounts = {
      language: 0,
      sensory: 0,
      cognitive: 0,
    };

    for (const entry of entries) {
      if (entry.created_at >= sevenDaysAgoStr) {
        for (const mission of entry.answer.missions ?? []) {
          if (mission.category in weeklyCounts) {
            weeklyCounts[mission.category as keyof WeeklyCategoryCounts]++;
          }
        }
      }
    }

    return {
      success: true,
      profile: {
        displayName: profile?.display_name ?? null,
        childName: child?.name ?? null,
        childDisabilityType: child?.disability_type ?? null,
        totalMissionsCompleted,
      },
      groups,
      weeklyCounts,
    };
  } catch (error) {
    console.error("[getActivityHistory] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

// ============================================
// Server Action: 기록 삭제
// ============================================

export async function deleteActivityLog(
  logId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // RLS가 있지만 추가 방어: parent_id 확인 후 삭제
    const { error } = await supabase
      .from("ai_chat_logs")
      .delete()
      .eq("id", logId)
      .eq("parent_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteActivityLog] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

// ============================================
// Server Action: 월간 통계 조회 + Gemini 성취 요약
// ============================================

export async function getMonthlyStats(input: {
  /** 'YYYY-MM' 형식 */
  month: string;
  locale: string;
}): Promise<
  | { success: true; data: MonthlyStats }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // ── 1. 해당 월 범위 계산 ──
    const [yearStr, monthStr] = input.month.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // 해당 월 마지막 날

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // ── 2. 아이 정보 ──
    const { data: children } = await supabase
      .from("children")
      .select("name, birth_date, disability_type")
      .eq("parent_id", user.id)
      .limit(1);

    const child = children?.[0] ?? null;

    // ── 3. 해당 월 ai_chat_logs 조회 ──
    const { data: logs, error: logsError } = await supabase
      .from("ai_chat_logs")
      .select("question, answer, created_at")
      .eq("parent_id", user.id)
      .gte("created_at", startISO)
      .lte("created_at", endISO)
      .order("created_at", { ascending: true });

    if (logsError) {
      return { success: false, error: logsError.message };
    }

    // ── 4. 파싱 & 카테고리별 합산 ──
    const categoryCounts = { language: 0, sensory: 0, cognitive: 0 };
    const dailyMap = new Map<string, { language: number; sensory: number; cognitive: number }>();

    for (const log of logs ?? []) {
      // 미션 완료/건너뛰기 로그는 제외
      if (log.question.startsWith("[AI Mission")) continue;

      let parsed: DevelopmentalAdviceResponse;
      try {
        parsed = JSON.parse(log.answer);
      } catch {
        continue;
      }

      const date = log.created_at.split("T")[0];

      if (!dailyMap.has(date)) {
        dailyMap.set(date, { language: 0, sensory: 0, cognitive: 0 });
      }
      const day = dailyMap.get(date)!;

      for (const mission of parsed.missions ?? []) {
        const cat = mission.category as keyof typeof categoryCounts;
        if (cat in categoryCounts) {
          categoryCounts[cat]++;
          day[cat]++;
        }
      }
    }

    const totalMissions =
      categoryCounts.language + categoryCounts.sensory + categoryCounts.cognitive;
    const totalDays = dailyMap.size;

    // 일별 데이터 (날짜 오름차순)
    const dailyBreakdown = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    // ── 5. 월 라벨 생성 ──
    const monthLabel = new Intl.DateTimeFormat(input.locale, {
      year: "numeric",
      month: "long",
    }).format(startDate);

    // ── 6. Gemini 성취 요약 생성 ──
    let aiSummary: MonthlySummaryResponse | null = null;

    if (totalMissions > 0) {
      // 아이 나이 계산
      let childAge: string | undefined;
      if (child?.birth_date) {
        const birth = new Date(child.birth_date);
        const ageMonths =
          (startDate.getFullYear() - birth.getFullYear()) * 12 +
          (startDate.getMonth() - birth.getMonth());
        const ageYears = Math.floor(ageMonths / 12);
        const remainMonths = ageMonths % 12;
        childAge = `${ageYears}세 ${remainMonths}개월`;
      }

      const summaryResult = await generateMonthlySummary(
        {
          language: categoryCounts.language,
          sensory: categoryCounts.sensory,
          cognitive: categoryCounts.cognitive,
          totalDays,
          childAge,
          disabilityType: child?.disability_type ?? undefined,
          monthLabel,
        },
        input.locale
      );

      if (summaryResult.success) {
        aiSummary = summaryResult.data;
      }
    }

    return {
      success: true,
      data: {
        month: input.month,
        monthLabel,
        categoryCounts,
        totalMissions,
        totalDays,
        dailyBreakdown,
        aiSummary,
      },
    };
  } catch (error) {
    console.error("[getMonthlyStats] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
