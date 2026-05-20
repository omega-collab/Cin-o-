const TIMELINE: [string, string, string][] = [
  ["07:00", "Accueil équipe & Café", "Studio 3"],
  ["07:30", "Briefing régie", "Régie"],
  ["08:30", "Séq. 32 – Scène 6", "Plateau A"],
  ["10:45", "Séq. 32 – Scène 7", "Plateau A"],
  ["12:30", "Repas", "Cantine"],
  ["13:30", "Séq. 33 – Scène 1", "Plateau B"],
  ["16:30", "Débrief fin de journée", "Régie"],
];

const ACTIVE_INDEX = 2;

export function ScheduleList() {
  return (
    <div className="glass-card rounded-app p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          Déroulé de la journée
        </h3>
        <span className="text-sm text-cyan cursor-pointer">Voir tout</span>
      </div>

      {/* Table */}
      <div className="space-y-0">
        {TIMELINE.map((row, idx) => {
          const time = row[0] ?? "";
          const name = row[1] ?? "";
          const place = row[2] ?? "";
          const isActive = idx === ACTIVE_INDEX;

          return (
            <div
              key={idx}
              className={`grid items-center py-2 gap-2 ${
                idx < TIMELINE.length - 1
                  ? "border-b border-stroke"
                  : ""
              }`}
              style={{ gridTemplateColumns: "50px 1fr 72px" }}
            >
              {/* Time */}
              <span
                className={`font-mono text-xs tabular-nums ${
                  isActive
                    ? "text-cyan font-semibold"
                    : "text-muted"
                }`}
              >
                {time}
              </span>

              {/* Event name */}
              <span
                className={`text-sm truncate ${
                  isActive
                    ? "text-cyan font-semibold"
                    : "text-textSoft"
                }`}
              >
                {name}
              </span>

              {/* Place */}
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
