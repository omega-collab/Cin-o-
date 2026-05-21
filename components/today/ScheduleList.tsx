"use client";

import { useState } from "react";
import { ChevronDown, Users, FileText, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import { useUserStore } from "@/lib/store/useUserStore";
import type { DeptNote } from "@/lib/types/shoot";

// Maps department slug → keywords to match deptNotes.department
const DEPT_KEYWORDS: Record<string, string[]> = {
  camera:     ["caméra", "camera", "image"],
  electro:    ["électro", "electro", "électricité", "electricite"],
  machino:    ["machino", "machinerie"],
  son:        ["son"],
  regie:      ["régie", "regie", "production", "régi"],
  deco:       ["déco", "deco", "décoration", "decoration"],
  hmc:        ["hmc", "maquillage", "coiffure", "costume", "habill"],
  cantine:    ["cantine"],
  production: [], // admin — sees all
};

function matchesDept(note: DeptNote, slug: string | null): boolean {
  if (!slug || slug === "production") return true;
  const keywords = DEPT_KEYWORDS[slug] ?? [];
  const dept = note.department?.toLowerCase() ?? "";
  if (dept === "tous" || dept === "all") return true;
  return keywords.some((k) => dept.includes(k));
}

function activeIndex(rows: { time: string }[]): number {
  const now = new Date().toTimeString().slice(0, 5);
  let last = 0;
  for (let i = 0; i < rows.length; i++) {
    const t = rows[i]?.time ?? "";
    if (t <= now) last = i;
  }
  return last;
}

function SeverityIcon({ s }: { s: DeptNote["priority"] }) {
  if (s === "critical") return <AlertCircle size={11} className="text-redSoft shrink-0 mt-0.5" />;
  if (s === "warning")  return <AlertTriangle size={11} className="text-orangeSoft shrink-0 mt-0.5" />;
  return <Info size={11} className="text-blueSoft shrink-0 mt-0.5" />;
}

export function ScheduleList() {
  const shoot = useShootStore((s) => s.shoot);
  const department = useUserStore((s) => s.department);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!shoot.isPublished) return null;

  if (shoot.sequences.length === 0) {
    return (
      <div className="glass-card rounded-app p-4 text-center space-y-1">
        <p className="text-sm text-textSoft">Aucune séquence programmée</p>
        <p className="text-xs text-muted">L&apos;admin n&apos;a pas encore ajouté de séquences pour cette journée.</p>
      </div>
    );
  }

  const isAdmin = department === "production";
  const rows = shoot.sequences;
  const active = activeIndex(rows);

  // Filter deptNotes relevant to the current user
  const myDeptNotes = shoot.deptNotes.filter((n) => matchesDept(n, department));

  return (
    <div className="glass-card rounded-app p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Déroulé de la journée</h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyanSoft text-cyan">
          En direct
        </span>
      </div>

      <div className="space-y-0">
        {rows.map((row, idx) => {
          const isActive = idx === active;
          const isExpanded = expandedId === row.id;
          const hasCast = (row.cast?.length ?? 0) > 0;
          const hasNotes = (row.notes?.trim().length ?? 0) > 0;
          const hasDetail = hasCast || hasNotes || myDeptNotes.length > 0;

          return (
            <div
              key={row.id}
              className={idx < rows.length - 1 ? "border-b border-stroke" : ""}
            >
              <button
                onClick={() => hasDetail ? setExpandedId(isExpanded ? null : row.id) : undefined}
                className={`w-full grid items-center py-2.5 gap-2 text-left ${hasDetail ? "cursor-pointer" : "cursor-default"}`}
                style={{ gridTemplateColumns: "50px 1fr 72px 16px" }}
              >
                <span className={`font-mono text-xs tabular-nums ${isActive ? "text-cyan font-semibold" : "text-muted"}`}>
                  {row.time}
                </span>
                <span className={`text-sm truncate ${isActive ? "text-cyan font-semibold" : "text-textSoft"}`}>
                  {row.label}
                </span>
                <span className="text-xs text-muted text-right truncate">
                  {row.location}
                </span>
                {hasDetail ? (
                  <ChevronDown
                    size={14}
                    className={`text-muted shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                ) : <span />}
              </button>

              {isExpanded && (
                <div className="pb-3 space-y-3 pl-1">
                  {/* Cast */}
                  {hasCast && (
                    <div className="flex items-start gap-2">
                      <Users size={12} className="text-muted shrink-0 mt-0.5" />
                      <p className="text-xs text-textSoft leading-relaxed">
                        {row.cast!.join(" · ")}
                      </p>
                    </div>
                  )}

                  {/* Jour à Jour / script */}
                  {hasNotes && (
                    <div className="flex items-start gap-2">
                      <FileText size={12} className="text-cyan shrink-0 mt-0.5" />
                      <p className="text-xs text-textSoft leading-relaxed whitespace-pre-line">
                        {row.notes}
                      </p>
                    </div>
                  )}

                  {/* Department-specific notes */}
                  {myDeptNotes.length > 0 && (
                    <div className="space-y-1.5 pt-0.5">
                      {isAdmin && (
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                          Notes départements
                        </p>
                      )}
                      {myDeptNotes.map((n) => (
                        <div key={n.id} className="flex items-start gap-1.5">
                          <SeverityIcon s={n.priority} />
                          <div>
                            {isAdmin && n.department && (
                              <span className="text-[10px] font-semibold text-muted uppercase mr-1">
                                {n.department} —
                              </span>
                            )}
                            <span className="text-xs text-textSoft">{n.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
