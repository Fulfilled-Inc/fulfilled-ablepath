"use client";

import { useTranslations } from "next-intl";
import { Users, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function TherapistDashboardPage() {
  const t = useTranslations();

  // 테스트를 위한 정적 MOCK 데이터 (이후 Supabase 연동)
  const connectedChildren = [
    { id: "1", name: "김하윤", age: "만 4세", parent: "이서연(어머니)", lastSession: "2026-04-28" },
    { id: "2", name: "박지우", age: "만 5세", parent: "박준호(아버지)", lastSession: "2026-04-29" },
    { id: "3", name: "최우진", age: "만 3세", parent: "김지민(어머니)", lastSession: "2026-04-30" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("therapist.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            담당하고 있는 아이들의 현황을 확인하고 일지를 꼼꼼히 기록하세요.
          </p>
        </div>
        <Link 
          href="/ko/therapist/logs/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + {t("therapist.writeNewPrompt")}
        </Link>
      </header>

      {/* 요약 통계 */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("therapist.myChildren")}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">12명</p>
          </div>
          <div className="rounded-full bg-blue-50 p-3 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">이번 주 세션</p>
            <p className="mt-2 text-3xl font-bold text-foreground">24회</p>
          </div>
          <div className="rounded-full bg-green-50 p-3 text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">작성 대기 일지</p>
            <p className="mt-2 text-3xl font-bold text-destructive">2건</p>
          </div>
          <div className="rounded-full bg-orange-50 p-3 text-orange-600">
            <FileText className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 담당 아동 리스트 */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">담당 아동 빠른 현황</h2>
        </div>
        <div className="divide-y divide-border">
          {connectedChildren.map((child) => (
             <div key={child.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-full">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{child.name} <span className="text-xs text-muted-foreground font-normal ml-1">({child.age})</span></p>
                    <p className="text-sm text-muted-foreground mt-0.5">보호자: {child.parent} · 최근 세션: {child.lastSession}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm border border-border px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors font-medium">
                     기록 보기
                  </button>
                  <Link 
                    href={`/ko/therapist/logs/new?childId=${child.id}`}
                    className="text-sm bg-secondary text-foreground px-3 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                   >
                     일지 작성
                  </Link>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}