"use client";

import { useCanteenStore } from "@/lib/store/useCanteenStore";
import { useHydrated } from "@/lib/hooks/useHydrated";

export function CanteenCard() {
  const hydrated = useHydrated();
  const menu = useCanteenStore((s) => s.menu);

  if (!hydrated) return null;

  const vegOption = menu.special?.replace(/^Option végétarienne\s*:\s*/i, "").trim();

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#13141F", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        🍽️ Menu du jour
      </h4>

      {/* Menu items */}
      <div className="space-y-2.5">
        <MenuItem label="Entrée" value={menu.starter} />
        <MenuItem label="Plat" value={menu.main} />
        <MenuItem label="Dessert" value={menu.dessert} />
      </div>

      {/* Vegetarian option */}
      {vegOption && (
        <div
          className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl"
          style={{ background: "#1C1D2B" }}
        >
          {/* Green dot */}
          <span
            className="mt-1 w-2 h-2 rounded-full shrink-0"
            style={{ background: "#4ADE80" }}
          />
          <p className="text-[13px] leading-snug" style={{ color: "#C4C5D6" }}>
            {vegOption}
          </p>
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="text-[11px] font-semibold uppercase tracking-wider w-14 shrink-0 pt-0.5"
        style={{ color: "#8B8CA8" }}
      >
        {label}
      </span>
      <span className="text-sm text-white leading-snug">{value}</span>
    </div>
  );
}
