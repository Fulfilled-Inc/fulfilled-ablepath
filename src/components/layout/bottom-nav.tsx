"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  BookOpen,
  SmilePlus,
  Brain,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { href: "/dashboard/missions", icon: BookOpen, labelKey: "nav.missions" },
  { href: "/dashboard/mood", icon: SmilePlus, labelKey: "nav.mood" },
  { href: "/dashboard/ai-guide", icon: Brain, labelKey: "nav.aiGuide" },
  { href: "/dashboard/activity", icon: ClipboardList, labelKey: "nav.activity" },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();

  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathWithoutLocale === item.href ||
            (item.href !== "/dashboard" &&
              pathWithoutLocale.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
