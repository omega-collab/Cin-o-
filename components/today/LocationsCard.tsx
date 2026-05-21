"use client";

import { MapPin, Navigation2, Map } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import { useHydrated } from "@/lib/hooks/useHydrated";

interface LocationEntry {
  label: string;
  address: string;
}

function mapsUrl(address: string) {
  return `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
}

function wazeUrl(address: string) {
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}

export function LocationsCard() {
  const hydrated = useHydrated();
  const shoot = useShootStore((s) => s.shoot);

  if (!hydrated || !shoot.isPublished) return null;

  const entries: LocationEntry[] = [
    shoot.location ? { label: "Décor principal", address: shoot.location } : null,
    shoot.logeLocation ? { label: "Loges / HMC", address: shoot.logeLocation } : null,
    shoot.canteenLocation ? { label: "Cantine", address: shoot.canteenLocation } : null,
  ].filter((e): e is LocationEntry => e !== null);

  if (entries.length === 0) return null;

  return (
    <div className="glass-card rounded-app p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-cyan" />
        <span className="text-sm font-semibold text-white">Localisations</span>
      </div>

      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div
            key={entry.label}
            className={`flex items-center justify-between gap-3 ${
              i < entries.length - 1 ? "pb-3 border-b border-stroke/50" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-0.5">
                {entry.label}
              </p>
              <p className="text-xs text-textSoft leading-snug line-clamp-2">
                {entry.address}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={mapsUrl(entry.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-white/8 text-textSoft active:scale-95 transition-transform"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <Map className="w-3 h-3" />
                Maps
              </a>
              <a
                href={wazeUrl(entry.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-cyan bg-cyanSoft active:scale-95 transition-transform"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <Navigation2 className="w-3 h-3" />
                Waze
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
