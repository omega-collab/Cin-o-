"use client";

import { MapPin, Clock3, Utensils, Film } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { DEPARTMENTS } from "@/lib/data/departments";

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-app flex items-center gap-2 px-3 py-2.5">
      <span className="text-muted">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="font-mono text-sm font-bold text-cyan">{value}</span>
    </div>
  );
}

const TAGS = ["Caméra A", "25mm", "Steadicam", "2 3/8"];

export function Hero() {
  const department = useUserStore((s) => s.department);
  const role = useUserStore((s) => s.role);

  const dept = DEPARTMENTS.find((d) => d.slug === department);

  return (
    <div className="space-y-3">
      {/* Department badge + title */}
      <div>
        {dept && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg leading-none">{dept.icon}</span>
            <span className="text-xs font-semibold text-cyan uppercase tracking-widest">
              {dept.name}
            </span>
            {role && (
              <span className="text-xs text-muted">· {role}</span>
            )}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gradient leading-tight">
          BANDI – Jour 12
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className="text-sm text-textSoft">
            Plateaux des Lilas, Studio 3
          </span>
        </div>
      </div>

      {/* Info pills */}
      <div className="grid grid-cols-2 gap-3">
        <InfoPill
          icon={<Clock3 className="w-4 h-4" />}
          label="Call Time"
          value="07:00"
        />
        <InfoPill
          icon={<Utensils className="w-4 h-4" />}
          label="Repas"
          value="12:30"
        />
      </div>

      {/* Prochaine séquence */}
      <div className="glass-card-strong rounded-app p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan" />
            <span className="text-xs font-semibold text-textSoft uppercase tracking-wider">
              Prochaine séquence
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyanSoft text-cyan">
            Dans 45 min
          </span>
        </div>

        <div>
          <p className="text-2xl font-bold text-white leading-tight">
            Séq. 32 – Scène 6
          </p>
          <p className="text-sm font-medium text-muted mt-0.5 uppercase tracking-wide">
            INT. APPARTEMENT – SALON – NUIT
          </p>
        </div>

        <p className="text-sm text-textSoft leading-relaxed">
          Confrontation entre Amara et sa mère. Lumière naturelle simulée,
          ambiance intime. Priorité au jeu d'acteur.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-textSoft border border-stroke"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
