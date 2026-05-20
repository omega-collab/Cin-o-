"use client";

import { MapPin, Clock3, Utensils, Film } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { useShootStore } from "@/lib/store/useShootStore";
import { DEPARTMENTS } from "@/lib/data/departments";
import { MOCK_SHOOT } from "@/lib/data/mockShoot";

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

export function Hero() {
  const department = useUserStore((s) => s.department);
  const role = useUserStore((s) => s.role);
  const shoot = useShootStore((s) => s.shoot);

  const dept = DEPARTMENTS.find((d) => d.slug === department);

  const demo = MOCK_SHOOT;
  const isLive = shoot.isPublished && !!shoot.projectTitle;

  const title = isLive
    ? `${shoot.projectTitle}${shoot.series ? ` – ${shoot.series}` : ""} – Jour ${shoot.shootingDay}`
    : `${demo.projectTitle} – Jour ${demo.shootingDay}`;

  const location = isLive ? shoot.location : demo.location;
  const callTime = isLive ? shoot.callTime : demo.callTime;
  const mealTime = isLive ? shoot.mealTime : demo.mealTime;

  const sequences = isLive ? shoot.sequences : demo.sequences;
  const nextSeq = sequences[0] ?? null;

  const seqTitle = nextSeq?.label ?? "–";
  const seqLocation = nextSeq?.location ?? "";
  const seqTime = nextSeq?.time ?? "–";

  return (
    <div className="space-y-3">
      {/* Dept badge + title */}
      <div>
        {dept && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg leading-none">{dept.icon}</span>
            <span className="text-xs font-semibold text-cyan uppercase tracking-widest">
              {dept.name}
            </span>
            {role && <span className="text-xs text-muted">· {role}</span>}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gradient leading-tight">{title}</h1>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className="text-sm text-textSoft">{location}</span>
        </div>
      </div>

      {/* Info pills */}
      <div className="grid grid-cols-2 gap-3">
        <InfoPill icon={<Clock3 className="w-4 h-4" />} label="Call Time" value={callTime} />
        <InfoPill icon={<Utensils className="w-4 h-4" />} label="Repas" value={mealTime} />
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
            {seqTime}
          </span>
        </div>

        <div>
          <p className="text-2xl font-bold text-white leading-tight">{seqTitle}</p>
          <p className="text-sm font-medium text-muted mt-0.5 uppercase tracking-wide">
            {seqLocation}
          </p>
        </div>

        {!isLive && (
          <p className="text-xs text-muted italic">
            Données démo — l'admin n'a pas encore publié la feuille du jour.
          </p>
        )}
      </div>
    </div>
  );
}
