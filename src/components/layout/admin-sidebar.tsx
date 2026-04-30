"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ListCheck, Settings, LogOut, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  // URL 경로 구조에 맞게 언어 코드([locale])를 유지하며 관리자 링크 구성
  // (임시로 하드코딩된 패스를 사용해도 구현 단계에선 무방함 - 추후 routing.ts 사용 가능)
  // 간단하게는 Link href 매칭 시 locale을 함께 고려합니다.

  const navItems = [
    { name: t("admin.overview"), href: "/admin", icon: LayoutDashboard },
    { name: t("admin.users"), href: "/admin/users", icon: Users },
    { name: t("admin.missions"), href: "/admin/missions", icon: ListCheck },
    { name: t("admin.settings"), href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          {t("admin.title")}
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          // 간이 활성화 상태 체크 (실제 앱에서는 locale 포함하여 정확히 체크)
          const isActive = pathname.includes(item.href);

          return (
            <Link
              key={item.name}
              href={`/ko${item.href}`} // 테스트를 위해 ko 경로 하드코딩 적용. 실제로는 next-intl/navigation Link 사용 권장
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("admin.backToApp")}
        </Link>
      </div>
    </aside>
  );
}
