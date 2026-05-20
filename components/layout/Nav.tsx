"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// SVG icon components — inline paths, no external deps
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D4B4" : "#5A5B72"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconCalendar({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D4B4" : "#5A5B72"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconGrid({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D4B4" : "#5A5B72"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconClock({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D4B4" : "#5A5B72"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconMenu({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00D4B4" : "#5A5B72"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Aujourd'hui", Icon: IconHome },
  { href: "/calendrier", label: "Calendrier", Icon: IconCalendar },
  { href: "/departments", label: "Départements", Icon: IconGrid },
  { href: "/history", label: "Historique", Icon: IconClock },
  { href: "/admin", label: "Plus", Icon: IconMenu },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop sidebar — w-60 */}
      <aside
        className="hidden md:flex flex-col w-60 min-h-screen"
        style={{ background: "#0F1019", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Logo */}
        <div
          className="p-5 flex items-center gap-2.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="text-2xl leading-none">🎬</span>
          <div>
            <span className="font-bold text-white text-lg leading-none">CinéO</span>
            <p className="text-xs mt-0.5" style={{ color: "#5A5B72" }}>Feuille de service</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "text-[#00D4B4]"
                    : "hover:bg-[#1C1D2B]"
                )}
                style={
                  active
                    ? { background: "rgba(0,212,180,0.1)" }
                    : { color: "#5A5B72" }
                }
              >
                <Icon active={active} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="p-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-xs" style={{ color: "#5A5B72" }}>CinéO v0.1 — Proto</p>
        </div>
      </aside>

      {/* Mobile bottom bar — fixed, min 44px height */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden flex z-50"
        style={{
          background: "#0F1019",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
              style={{ minHeight: "56px", color: active ? "#00D4B4" : "#5A5B72" }}
            >
              <Icon active={active} />
              <span
                className="font-medium truncate"
                style={{ fontSize: "10px", lineHeight: "1" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
