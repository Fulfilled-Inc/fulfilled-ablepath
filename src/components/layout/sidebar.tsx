"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  BookOpen,
  SmilePlus,
  Brain,
  BarChart3,
  Settings,
  Heart,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/[locale]/(auth)/actions";

const navItems = [
  { href: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/missions", icon: BookOpen, labelKey: "nav.missions" },
  { href: "/mood", icon: SmilePlus, labelKey: "nav.mood" },
  { href: "/ai-guide", icon: Brain, labelKey: "nav.aiGuide" },
  { href: "/report", icon: BarChart3, labelKey: "nav.report" },
  { href: "/activity", icon: ClipboardList, labelKey: "nav.activity" },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();

  // pathname에서 locale 부분 제거하여 비교
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <Heart className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-foreground">
          {t("common.appName")}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathWithoutLocale === item.href ||
            (item.href !== "/" &&
              pathWithoutLocale.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          {t("auth.logout")}
        </button>
      </div>
    </aside>
  );
}
