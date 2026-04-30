"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function TherapistSidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  const navItems = [
    { name: t("therapist.title"), href: "/therapist", icon: LayoutDashboard },
    { name: t("therapist.myChildren"), href: "/therapist/children", icon: Users },
    { name: t("therapist.writeLog"), href: "/therapist/logs", icon: FileText },
    { name: t("admin.settings"), href: "/therapist/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          {t("therapist.title")}
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);

          return (
            <Link
              key={item.name}
              href={`/ko${item.href}`} // 테스트를 위한 하드코딩
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
          {t("therapist.backToApp")}
        </Link>
      </div>
    </aside>
  );
}