"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  CalendarDays,
  Users,
  History,
  MoreHorizontal,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Aujourd'hui", Icon: Home },
  { href: "/calendrier", label: "Calendrier", Icon: CalendarDays },
  { href: "/departments", label: "Départements", Icon: Users },
  { href: "/history", label: "Historique", Icon: History },
  { href: "/admin", label: "Plus", Icon: MoreHorizontal },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen glass-card rounded-none border-r border-stroke/50">
        <div className="p-5 flex items-center gap-2.5 border-b border-stroke/50">
          <span className="text-2xl leading-none">🎬</span>
          <div>
            <span className="font-bold text-white text-lg leading-none">CinéO</span>
            <p className="text-xs mt-0.5 text-muted">Feuille de service</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "text-cyan bg-cyanSoft"
                    : "text-muted hover:text-textSoft hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stroke/50">
          <p className="text-xs text-muted">CinéO v0.1 — Proto</p>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden z-50 glass-card rounded-none border-t border-stroke/50"
        style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        <div className="grid grid-cols-5 h-[60px]">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1"
                style={{ color: active ? "#00E0D0" : "#8E9AAF" }}
              >
                <Icon className="w-5 h-5" />
                <span
                  className="font-medium truncate"
                  style={{ fontSize: "10px", lineHeight: "1" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </nav>
    </>
  );
}
