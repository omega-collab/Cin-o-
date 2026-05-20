"use client";

import { MapPin, Clock3, Utensils, Film } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { useShootStore } from "@/lib/store/useShootStore";
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

export function Hero() {
  const department = useUserStore((s) => s.department);
  const role = useUserStore((s) => s.role);
  const shoot = useShootStore((s) => s.shoot);

  const dept = DEPARTMENTS.find((d) => d.slug === department);
  const isLive = shoot.isPublished && !!shoot.projectTitle;

  return (
    <div className="space-y-3">
      {/* Badge département */}
      {dept && (
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{dept.icon}</span>
          <span className="text-xs font-semibold text-cyan uppercase tracking-widest">
            {dept.name}
          </span>
          {role && <span className="text-xs text-muted">· {role}</span>}
        </div>
      )}

      {isLive ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gradient leading-tight">
              {shoot.projectTitle}
              {shoot.series ? ` – ${shoot.series}` : ""}
            </h1>
            <p className="text-sm text-cyan font-semibold mt-0.5">
              Jour {shoot.shootingDay}{shoot.totalDays ? `/${shoot.totalDays}` : ""}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="text-sm text-textSoft">{shoot.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoPill icon={<Clock3 className="w-4 h-4" />} label="Call Time" value={shoot.callTime} />
            <InfoPill icon={<Utensils className="w-4 h-4" />} label="Repas" value={shoot.mealTime} />
          </div>

          {/* Prochaine séquence */}
          {shoot.sequences.length > 0 && (() => {
            const next = shoot.sequences[0]!;
            return (
              <div className="glass-card-strong rounded-app p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-cyan" />
                    <span className="text-xs font-semibold text-textSoft uppercase tracking-wider">
                      Prochaine séquence
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyanSoft text-cyan">
                    {next.time}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-tight">{next.label}</p>
                  <p className="text-sm font-medium text-muted mt-0.5 uppercase tracking-wide">
                    {next.location}
                  </p>
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        /* État vide — aucune feuille publiée */
        <div className="glass-card-strong rounded-app p-6 text-center space-y-3">
          <Film className="w-10 h-10 text-muted mx-auto" />
          <div>
            <h1 className="text-xl font-bold text-gradient">Aucune feuille publiée</h1>
            <p className="text-sm text-muted mt-1">
              L'admin n'a pas encore chargé la feuille du jour.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
