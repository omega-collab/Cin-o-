"use client";

import { useState } from "react";
import { ChevronDown, Users, FileText } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";

function activeIndex(rows: { time: string }[]): number {
  const now = new Date().toTimeString().slice(0, 5);
  let last = 0;
  for (let i = 0; i < rows.length; i++) {
    const t = rows[i]?.time ?? "";
    if (t <= now) last = i;
  }
  return last;
}

export function ScheduleList() {
  const shoot = useShootStore((s) => s.shoot);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!shoot.isPublished || shoot.sequences.length === 0) return null;

  const rows = shoot.sequences;
  const active = activeIndex(rows);

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
          const hasDetail = (row.notes && row.notes.trim().length > 0) || (row.cast && row.cast.length > 0);

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
                ) : (
                  <span />
                )}
              </button>

              {isExpanded && hasDetail && (
                <div className="pb-3 space-y-2.5 pl-1">
                  {row.cast && row.cast.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Users size={12} className="text-muted shrink-0 mt-0.5" />
                      <p className="text-xs text-textSoft leading-relaxed">
                        {row.cast.join(" · ")}
                      </p>
                    </div>
                  )}
                  {row.notes && row.notes.trim().length > 0 && (
                    <div className="flex items-start gap-2">
                      <FileText size={12} className="text-muted shrink-0 mt-0.5" />
                      <p className="text-xs text-textSoft leading-relaxed whitespace-pre-line">
                        {row.notes}
                      </p>
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
