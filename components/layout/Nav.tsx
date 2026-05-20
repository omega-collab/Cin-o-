"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Aujourd'hui", icon: "🏠" },
  { href: "/documents", label: "Documents", icon: "📄" },
  { href: "/departments", label: "Départements", icon: "🏗️" },
  { href: "/history", label: "Historique", icon: "📜" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-200 min-h-screen">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <span className="font-bold text-slate-900 text-lg">SetFlow</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Feuille de service</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <p className="text-xs text-slate-400">SetFlow v0.1 — Proto</p>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 flex z-50">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
              pathname === item.href
                ? "text-purple-700"
                : "text-slate-500"
            )}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="leading-none truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
