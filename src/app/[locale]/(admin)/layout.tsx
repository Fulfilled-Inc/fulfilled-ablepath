import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 현재 사용자 세션 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // 비로그인 사용자는 로그인 페이지로 리다이렉트
    redirect("/ko/login");
  }

  const role = user.user_metadata?.role;
  const isAdmin = role === "ADMIN";

  // 보안 리다이렉트 (실제 활성화)
  if (!isAdmin) {
    // 관리자가 아니면 대시보드(메인)로 돌려보냄
    redirect("/ko");
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Admin Sidebar (Desktop only for now) */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="container p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
