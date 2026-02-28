import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/settings/profile-form";
import { ChildrenManager } from "@/components/settings/children-manager";
import type { Profile, Child } from "@/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const t = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 프로필 가져오기
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();

  // 아이 목록 가져오기
  const { data: childrenData } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user?.id ?? "")
    .order("created_at", { ascending: true });

  const profile = (profileData as Profile) ?? {
    id: user?.id ?? "",
    email: user?.email ?? "",
    display_name: null,
    avatar_url: null,
    locale: "en",
    timezone: "UTC",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("nav.settings")}</h1>

      {/* 프로필 설정 */}
      <ProfileForm profile={profile} />

      {/* 아이 정보 관리 */}
      <ChildrenManager
        children={(childrenData as Child[]) ?? []}
        parentId={user?.id ?? ""}
      />
    </div>
  );
}
