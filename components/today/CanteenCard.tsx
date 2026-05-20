"use client";

import { useCanteenStore } from "@/lib/store/useCanteenStore";
import { Card } from "@/components/ui/Card";
import { useHydrated } from "@/lib/hooks/useHydrated";

export function CanteenCard() {
  const hydrated = useHydrated();
  const menu = useCanteenStore((s) => s.menu);

  if (!hydrated) return null;

  return (
    <Card className="p-4">
      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        🍽️ Menu cantine du jour
      </h4>
      <div className="space-y-1.5 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-400 w-20 shrink-0">Entrée</span>
          <span className="text-slate-700">{menu.starter}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-20 shrink-0">Plat</span>
          <span className="text-slate-700">{menu.main}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-20 shrink-0">Dessert</span>
          <span className="text-slate-700">{menu.dessert}</span>
        </div>
        {menu.special && (
          <div className="mt-2 p-2 bg-green-50 rounded-lg text-green-700 text-xs">
            🌱 {menu.special}
          </div>
        )}
      </div>
    </Card>
  );
}
