"use client";

import { MapPin, Clock3, Utensils, Film, Share2 } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { useShootStore } from "@/lib/store/useShootStore";
import { useProjectStore, getActiveProject } from "@/lib/store/useProjectStore";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DeptIcon } from "@/components/ui/DeptIcon";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

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
  const activeProject = useProjectStore(getActiveProject);

  const dept = DEPARTMENTS.find((d) => d.slug === department);
  const isLive = shoot.isPublished && !!shoot.projectTitle;

  // A1: find active sequence — null if no sequence has started yet
  const activeSeq = (() => {
    if (shoot.sequences.length === 0) return null;
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    if (timeToMinutes(shoot.sequences[0]!.time) > nowMin) return null;
    let last = shoot.sequences[0]!;
    for (const seq of shoot.sequences) {
      if (timeToMinutes(seq.time) <= nowMin) last = seq;
      else break;
    }
    return last;
  })();

  // Share the project invite link so a colleague can join
  async function handleShare() {
    if (!activeProject) return;
    const appUrl = typeof window !== "undefined" ? window.location.origin : "";
    try {
      await navigator.share({
        title: `Rejoindre ${activeProject.name} sur CinéO`,
        text: `Rejoins le projet "${activeProject.name}" sur CinéO.\n\nCode d'invitation : ${activeProject.invite_code}\n\nOuvre l'application et entre ce code pour rejoindre le projet.`,
        url: appUrl,
      });
    } catch {
      // user cancelled or API not available
    }
  }

  return (
    <div className="space-y-3">
      {/* Badge département */}
      {dept && (
        <div className="flex items-center gap-2">
          <span className="text-cyan"><DeptIcon slug={dept.slug} className="w-4 h-4" /></span>
          <span className="text-xs font-semibold text-cyan uppercase tracking-widest">
            {dept.name}
          </span>
          {role && <span className="text-xs text-muted">· {role}</span>}
        </div>
      )}

      {isLive ? (
        <>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-white leading-tight">
              {shoot.projectTitle}
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

          {"share" in navigator && activeProject && (
            <button
              onClick={() => void handleShare()}
              className="glass-card w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-muted active:opacity-70 transition-opacity"
              aria-label="Inviter un collègue sur ce projet"
            >
              <Share2 className="w-3.5 h-3.5" />
              Inviter un collègue
            </button>
          )}

          {/* A1: Séquence active selon l'heure courante */}
          {activeSeq && (
            <div className="glass-card-strong rounded-app p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan" />
                  <span className="text-xs font-semibold text-textSoft uppercase tracking-wider">
                    Séquence en cours
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyanSoft text-cyan">
                  {activeSeq.time}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-tight">{activeSeq.label}</p>
                <p className="text-sm font-medium text-muted mt-0.5 uppercase tracking-wide">
                  {activeSeq.location}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* État vide — aucune feuille publiée */
        <div className="glass-card-strong rounded-app p-6 text-center space-y-3">
          <Film className="w-10 h-10 text-muted mx-auto" />
          <div>
            <h1 className="text-xl font-bold text-white">Aucune feuille publiée</h1>
            <p className="text-sm text-muted mt-1">
              L'admin n'a pas encore chargé la feuille du jour.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
