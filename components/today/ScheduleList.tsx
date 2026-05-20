"use client";

import { useDailyStore } from "@/lib/store/useDailyStore";

const DEMO: [string, string, string][] = [
  ["07:00", "Accueil équipe & Café", "Studio 3"],
  ["07:30", "Briefing régie", "Régie"],
  ["08:30", "Séq. 32 – Scène 6", "Plateau A"],
  ["10:45", "Séq. 32 – Scène 7", "Plateau A"],
  ["12:30", "Repas", "Cantine"],
  ["13:30", "Séq. 33 – Scène 1", "Plateau B"],
  ["16:30", "Débrief fin de journée", "Régie"],
];

function activeIndex(rows: [string, string, string][]): number {
  const now = new Date().toTimeString().slice(0, 5);
  let last = 0;
  for (let i = 0; i < rows.length; i++) {
    const t = rows[i]?.[0] ?? "";
    if (t <= now) last = i;
  }
  return last;
}

export function ScheduleList() {
  const shoot = useDailyStore((s) => s.shoot);

  const rows: [string, string, string][] =
    shoot.isPublished && shoot.sequences.length > 0
      ? shoot.sequences.map((s) => [s.time, s.label, s.location])
      : DEMO;

  const active = activeIndex(rows);

  return (
    <div className="glass-card rounded-app p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          Déroulé de la journée
        </h3>
        {shoot.isPublished && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyanSoft text-cyan">
            En direct
          </span>
        )}
      </div>

      <div className="space-y-0">
        {rows.map((row, idx) => {
          const time = row[0] ?? "";
          const name = row[1] ?? "";
          const place = row[2] ?? "";
          const isActive = idx === active;

          return (
            <div
              key={idx}
              className={`grid items-center py-2 gap-2 ${
                idx < rows.length - 1 ? "border-b border-stroke" : ""
              }`}
              style={{ gridTemplateColumns: "50px 1fr 72px" }}
            >
              <span
                className={`font-mono text-xs tabular-nums ${
                  isActive ? "text-cyan font-semibold" : "text-muted"
                }`}
              >
                {time}
              </span>
              <span
                className={`text-sm truncate ${
                  isActive ? "text-cyan font-semibold" : "text-textSoft"
                }`}
              >
                {name}
              </span>
              <span className="text-xs text-muted text-right truncate">
                {place}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
