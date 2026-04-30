"use client";

import { useTranslations } from "next-intl";
import { Users, Activity, Target } from "lucide-react";

export default function AdminDashboardPage() {
  const t = useTranslations();

  // 임시 데이터 (나중에 Supabase에서 fetch)
  const stats = [
    { title: t("admin.totalUsers"), value: "1,248", icon: Users, change: "+12%" },
    { title: t("admin.totalMissions"), value: "8,590", icon: Target, change: "+5%" },
    { title: t("admin.recentActivity"), value: "320", icon: Activity, change: "-2%" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("admin.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          시스템 현황과 주요 지표를 모니터링합니다.
        </p>
      </header>

      {/* 요약 통계 카드 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-green-600">
              <span>{stat.change}</span>
              <span className="ml-2 text-muted-foreground">지난달 대비</span>
            </div>
          </div>
        ))}
      </div>

      {/* 추가 공간: 사용자 목록이나 차트를 넣을 영역 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-80 flex flex-col justify-center items-center">
          <p className="text-muted-foreground">여기에 최근 가입자 목록 표를 추가하세요.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-80 flex flex-col justify-center items-center">
          <p className="text-muted-foreground">여기에 미션 생성 증감 차트를 추가하세요.</p>
        </div>
      </div>
    </div>
  );
}
