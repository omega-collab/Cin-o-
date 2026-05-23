"use client";

import { useState } from "react";
import { MapPin, Film, Share2, Cloud, Clock, Info, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { useShootStore } from "@/lib/store/useShootStore";
import { useProjectStore, getActiveProject } from "@/lib/store/useProjectStore";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DeptIcon } from "@/components/ui/DeptIcon";
import { LiveTimecode } from "@/components/today/LiveTimecode";
import { CallTimeBlock } from "@/components/today/CallTimeBlock";
import { MealAlarmBlock } from "@/components/today/MealAlarmBlock";
import { SequenceSheet } from "@/components/today/SequenceSheet";
import type { DepartmentSlug } from "@/lib/types";
import type { DeptNote } from "@/lib/types/shoot";

const DEPT_KEYWORDS: Record<string, string[]> = {
  camera: ["caméra", "camera", "image"],
  electro: ["électro", "electro", "électricité"],
  machino: ["machino", "machinerie"],
  son: ["son"],
  regie: ["régie", "regie", "production"],
  deco: ["déco", "deco", "décoration"],
  hmc: ["hmc", "maquillage", "coiffure", "costume"],
  cantine: ["cantine"],
  direction: ["direction", "réal", "real"],
  production: [],
};

function matchesDept(note: DeptNote, slug: string | null): boolean {
  if (!slug || slug === "production") return true;
  const dept = note.department?.toLowerCase() ?? "";
  if (dept === "tous" || dept === "all") return true;
  return (DEPT_KEYWORDS[slug] ?? []).some((k) => dept.includes(k));
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function Hero() {
  const department = useUserStore((s) => s.department) as DepartmentSlug | null;
  const role = useUserStore((s) => s.role);
  const shoot = useShootStore((s) => s.shoot);
  const activeProject = useProjectStore(getActiveProject);
  const [seqOpen, setSeqOpen] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [notesFilter, setNotesFilter] = useState<string>("mine");

  function toggleNote(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const dept = DEPARTMENTS.find((d) => d.slug === department);
  const isLive = shoot.isPublished && !!shoot.projectTitle;

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
      {/* Dept badge + Live Timecode */}
      <div className="flex items-center justify-between">
        {dept ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(0,224,208,0.08)", border: "1px solid rgba(0,224,208,0.18)" }}>
            <DeptIcon slug={dept.slug} className="w-3.5 h-3.5" style={{ color: "#00E0D0" }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00E0D0" }}>
              {dept.name}
            </span>
            {role && <span className="text-[10px]" style={{ color: "#6b7a8d" }}>· {role}</span>}
          </span>
        ) : <div />}
        <LiveTimecode />
      </div>

      {isLive ? (
        <>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-white leading-tight">
              {shoot.projectTitle}
            </h1>
            {shoot.series && (
              <p className="text-xs text-muted mt-0.5">{shoot.series}</p>
            )}
            <p className="text-sm text-cyan font-semibold mt-0.5">
              Jour {shoot.shootingDay}{shoot.totalDays ? `/${shoot.totalDays}` : ""}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="text-sm text-textSoft">{shoot.location}</span>
              {shoot.weather && (
                <span className="flex items-center gap-1 text-xs text-textSoft bg-white/8 px-2 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3 shrink-0" />
                  {shoot.weather}
                </span>
              )}
            </div>
            {shoot.wrapTime && (
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3 h-3 text-muted shrink-0" />
                <span className="text-xs text-muted">Fin prévue <span className="text-textSoft font-semibold">{shoot.wrapTime}</span></span>
              </div>
            )}
          </div>

          {/* Call Time + Repas (enhanced) */}
          <div className="grid grid-cols-2 gap-3">
            <CallTimeBlock
              callTime={shoot.callTime}
              patTime={shoot.patTime}
              deptCallTimes={shoot.deptCallTimes}
              department={department}
            />
            <MealAlarmBlock mealTime={shoot.mealTime} />
          </div>

          {/* Notes FDS du département — accordion + filtre */}
          {(() => {
            if (shoot.deptNotes.length === 0) return null;
            const visibleNotes = notesFilter === "mine"
              ? shoot.deptNotes.filter((n) => matchesDept(n, department))
              : shoot.deptNotes.filter((n) => matchesDept(n, notesFilter));
            const deptsWithNotes = DEPARTMENTS.filter((d) =>
              shoot.deptNotes.some((n) => matchesDept(n, d.slug))
            );
            return (
              <div className="glass-card rounded-app overflow-hidden">
                <div className="px-3 pt-2.5 pb-1">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted mb-2">
                    Notes FDS · {visibleNotes.length}
                  </p>
                  {/* Filter chips — scrollable */}
                  <div className="overflow-x-auto -mx-3 px-3">
                    <div className="flex gap-1.5 flex-nowrap pb-1.5">
                      <button
                        onClick={() => setNotesFilter("mine")}
                        className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                          notesFilter === "mine" ? "bg-cyanSoft text-cyan" : "bg-white/5 text-muted"
                        }`}
                      >
                        Ma section
                      </button>
                      {deptsWithNotes.map((d) => (
                        <button
                          key={d.slug}
                          onClick={() => setNotesFilter(d.slug)}
                          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            notesFilter === d.slug ? "bg-cyanSoft text-cyan" : "bg-white/5 text-muted"
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-stroke/30">
                  {visibleNotes.length === 0 && (
                    <p className="px-3 py-3 text-xs text-muted">Aucune note pour votre section.</p>
                  )}
                  {visibleNotes.map((n) => {
                    const isOpen = expandedNotes.has(n.id);
                    const PriorityIcon = n.priority === "critical"
                      ? <AlertCircle size={12} className="text-danger shrink-0 mt-0.5" />
                      : n.priority === "warning"
                      ? <AlertTriangle size={12} className="text-warning shrink-0 mt-0.5" />
                      : <Info size={12} className="text-info shrink-0 mt-0.5" />;
                    return (
                      <button
                        key={n.id}
                        onClick={() => toggleNote(n.id)}
                        className="w-full text-left px-3 py-2.5 flex items-start gap-2 active:bg-white/5 transition-colors"
                      >
                        {PriorityIcon}
                        <div className="flex-1 min-w-0">
                          {n.department && (
                            <span className="text-[10px] font-semibold text-muted uppercase tracking-wide mr-1">
                              {n.department} —
                            </span>
                          )}
                          <span className={`text-xs text-textSoft leading-snug ${isOpen ? "" : "line-clamp-1"}`}>
                            {n.content}
                          </span>
                        </div>
                        {isOpen
                          ? <ChevronUp size={12} className="text-muted shrink-0 mt-0.5" />
                          : <ChevronDown size={12} className="text-muted shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

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

          {/* Active sequence — clickable to expand details */}
          {activeSeq && (
            <div className="space-y-2">
              <button
                onClick={() => setSeqOpen((o) => !o)}
                className="w-full text-left rounded-app p-4 space-y-3 active:opacity-80 transition-opacity"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "inset 0 1px 0 rgba(0,224,208,0.10), 0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
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
                <p className="text-[10px] text-cyan font-semibold">
                  {seqOpen ? "Masquer les détails ▲" : "Voir les détails ▼"}
                </p>
              </button>

              {seqOpen && (
                <SequenceSheet seq={activeSeq} onClose={() => setSeqOpen(false)} />
              )}
            </div>
          )}
        </>
      ) : (
        /* État vide — aucune feuille publiée */
        <div className="rounded-app p-8 text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
          <div className="relative flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Film className="w-8 h-8" style={{ color: "#3a4a5c" }} />
            </div>
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#3a4a5c" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
          <h1 className="text-lg font-bold text-white">Aucune feuille publiée</h1>
          <p className="text-sm mt-1.5" style={{ color: "#6b7a8d" }}>
            La feuille de service n&apos;est pas encore disponible.
          </p>
          {dept && (
            <p className="text-[11px] mt-3" style={{ color: "#3a4a5c" }}>
              En attente pour <span style={{ color: "#00E0D0" }}>{dept.name}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
