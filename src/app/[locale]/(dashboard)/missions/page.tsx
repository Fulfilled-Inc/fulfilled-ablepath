import { createClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { MissionList } from "@/components/missions/mission-list";
import { GenerateMissionsForm } from "@/components/missions/generate-missions-form";

export default async function MissionsPage() {
  const supabase = await createClient();
  const t = await getTranslations();
  const locale = await getLocale();

  // 현재 사용자의 첫 번째 아이 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: children } = await supabase
    .from("children")
    .select("id")
    .eq("parent_id", user?.id ?? "")
    .limit(1);

  const childId = children?.[0]?.id ?? null;

  // 활성 미션 가져오기 (카테고리별 1개씩 = 3개)
  const { data: rawMissions } = await supabase
    .from("missions")
    .select("*")
    .eq("is_active", true)
    .limit(9);

  // 카테고리별 1개씩 선택
  const categories = ["language", "sensory", "cognitive"] as const;
  const missions = categories
    .map((cat) => {
      const m = rawMissions?.find((m) => m.category === cat);
      if (!m) return null;
      return {
        id: m.id,
        category: m.category as "language" | "sensory" | "cognitive",
        title: (m.title as Record<string, string>)?.[locale] ?? (m.title as Record<string, string>)?.en ?? "",
        description: (m.description as Record<string, string>)?.[locale] ?? (m.description as Record<string, string>)?.en ?? "",
        instructions: (m.instructions as Record<string, string>)?.[locale] ?? (m.instructions as Record<string, string>)?.en ?? "",
      };
    })
    .filter(Boolean) as {
      id: string;
      category: "language" | "sensory" | "cognitive";
      title: string;
      description: string;
      instructions: string;
    }[];

  // 오늘 완료된 미션 ID 목록
  const today = new Date().toISOString().split("T")[0];
  const { data: logs } = childId
    ? await supabase
        .from("mission_logs")
        .select("mission_id")
        .eq("child_id", childId)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`)
    : { data: [] };

  const completedMissionIds = (logs ?? []).map((l) => l.mission_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("nav.missions")}</h1>
        <p className="mt-1 text-muted-foreground">
          Complete 3 missions today — one for each area of development.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min((completedMissionIds.length / 3) * 100, 100)}%`,
            }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {completedMissionIds.length}/3
        </span>
      </div>

      <MissionList
        missions={missions}
        childId={childId}
        completedMissionIds={completedMissionIds}
      />

      {/* ── AI 맞춤 미션 생성 ── */}
      <div className="mt-8 border-t border-border pt-8">
        <h2 className="mb-1 text-xl font-bold">{t("missions.aiSectionTitle")}</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          {t("missions.aiSectionDesc")}
        </p>
        <GenerateMissionsForm childId={childId} />
      </div>
    </div>
  );
}
