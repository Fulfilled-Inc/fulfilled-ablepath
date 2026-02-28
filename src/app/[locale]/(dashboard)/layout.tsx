import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";

type Props = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: Props) {
  // 인증 확인 — 미인증 시 로그인으로 리다이렉트
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      {/* 데스크톱 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 모바일 헤더 */}
        <Header />

        {/* 스크롤 영역 */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</div>
        </main>

        {/* 모바일 하단 네비게이션 */}
        <BottomNav />
      </div>
    </div>
  );
}
