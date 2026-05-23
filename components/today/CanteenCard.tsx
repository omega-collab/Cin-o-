"use client";

import { Utensils, MapPin } from "lucide-react";
import { useCanteenStore } from "@/lib/store/useCanteenStore";
import { useShootStore } from "@/lib/store/useShootStore";
import { useHydrated } from "@/lib/hooks/useHydrated";

export function CanteenCard() {
  const hydrated = useHydrated();
  const menu = useCanteenStore((s) => s.menu);
  const shoot = useShootStore((s) => s.shoot);

  if (!hydrated) return null;

  const canteenLocation = shoot.isPublished
    ? (shoot.canteenLocation ?? menu.canteenLocation)
    : menu.canteenLocation;

  const shootingLocation = shoot.isPublished
    ? shoot.location
    : menu.shootingLocation;

  const todayISO = new Date().toISOString().split("T")[0];
  const menuIsToday = !menu.date || menu.date === todayISO;
  const hasMenu = menuIsToday && menu.main && menu.main.trim().length > 0;

  return (
    <div className="glass-card rounded-app p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Utensils className="w-4 h-4 text-muted" />
        <span className="text-sm font-semibold text-white">Cantine</span>
      </div>

      {/* Locations */}
      {(canteenLocation || shootingLocation) && (
        <div className="space-y-1.5">
          {shootingLocation && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted uppercase tracking-widest">Tournage</p>
                <p className="text-xs text-textSoft">{shootingLocation}</p>
              </div>
            </div>
          )}
          {canteenLocation && (
            <div className="flex items-start gap-2">
              <Utensils className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-muted uppercase tracking-widest">Cantine</p>
                <p className="text-xs text-cyan font-medium break-words">{canteenLocation}</p>
                {menu.mealTime && (
                  <p className="text-[10px] text-muted font-mono mt-0.5">
                    {menu.mealTime}{menu.mealEndTime ? ` — ${menu.mealEndTime}` : ""}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menu */}
      {hasMenu && (
        <div className="space-y-1 pt-1 border-t border-stroke">
          {menu.starter && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted w-14 shrink-0">Entrée</span>
              <span className="text-textSoft">{menu.starter}</span>
            </div>
          )}
          <div className="flex gap-2 text-xs">
            <span className="text-muted w-14 shrink-0">Plat</span>
            <span className="text-textSoft">{menu.main}</span>
          </div>
          {menu.dessert && (
            <div className="flex gap-2 text-xs">
              <span className="text-muted w-14 shrink-0">Dessert</span>
              <span className="text-textSoft">{menu.dessert}</span>
            </div>
          )}
          {menu.special && (
            <div className="flex gap-2 text-xs mt-1 pt-1 border-t border-stroke">
              <span className="text-muted w-14 shrink-0">Végé</span>
              <span className="text-textSoft">{menu.special}</span>
            </div>
          )}
        </div>
      )}

      {!hasMenu && (
        <p className="text-xs text-muted italic">Menu non renseigné.</p>
      )}
    </div>
  );
}
