"use client";

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
          return (
            <div
              key={row.id}
              className={`grid items-center py-2 gap-2 ${
                idx < rows.length - 1 ? "border-b border-stroke" : ""
              }`}
              style={{ gridTemplateColumns: "50px 1fr 72px" }}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
