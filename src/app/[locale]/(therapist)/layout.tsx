import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TherapistSidebar } from "@/components/layout/therapist-sidebar";

export default async function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/ko/login");
  }

  // user 메타데이터 역할(role) 확인 (THERAPIST 권한)
  const role = user.user_metadata?.role;
  const isTherapist = role === "THERAPIST" || role === "ADMIN"; // Admin도 볼 수 있음

  // 보안 리다이렉트
  if (!isTherapist) {
    redirect("/ko");
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Therapist Sidebar (Desktop only for now) */}
      <TherapistSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="container p-8 max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}