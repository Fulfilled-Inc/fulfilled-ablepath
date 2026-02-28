import { getTranslations } from "next-intl/server";
import { getActivityHistory } from "./actions";
import { ActivityPageClient } from "@/components/activity/activity-page-client";

export default async function ActivityPage() {
  const t = await getTranslations("activity");
  const result = await getActivityHistory();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <ActivityPageClient
        profile={result.profile}
        groups={result.groups}
        weeklyCounts={result.weeklyCounts}
        childName={result.profile.childName ?? t("unknownChild")}
      />
    </div>
  );
}
