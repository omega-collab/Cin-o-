import { TODAY_SCHEDULE } from "@/lib/data/schedule";
import type { ScheduleSequence } from "@/lib/types";

export function ScheduleList() {
  // First item is treated as the current/active sequence
  const [active, ...rest] = TODAY_SCHEDULE;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#13141F", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <h3 className="text-sm font-semibold text-white tracking-tight">
          Programme du jour
        </h3>
      </div>

      {/* Timeline */}
      <div className="px-4 py-3">
        <div className="relative">
          {/* Vertical line — spans full height */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px"
            style={{ background: "#1C1D2B" }}
          />

          <div className="space-y-0">
            {active && (
              <TimelineItem
                sequence={active}
                isActive
                isLast={rest.length === 0}
              />
            )}
            {rest.map((seq, idx) => (
              <TimelineItem
                key={seq.id}
                sequence={seq}
                isActive={false}
                isLast={idx === rest.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  sequence,
  isActive,
  isLast,
}: {
  sequence: ScheduleSequence;
  isActive: boolean;
  isLast: boolean;
}) {
  // Determine INT / EXT from location prefix
  const locationTag = sequence.location.startsWith("Int.")
    ? "INT"
    : sequence.location.startsWith("Ext.")
    ? "EXT"
    : null;

  const cleanLocation = sequence.location
    .replace(/^(Int\.|Ext\.)\s*/, "")
    .trim();

  return (
    <div
      className="flex gap-4 py-3 relative"
      style={
        !isLast
          ? { borderBottom: "1px solid rgba(255,255,255,0.05)" }
          : undefined
      }
    >
      {/* Dot */}
      <div className="relative flex flex-col items-center shrink-0 pt-0.5">
        <div
          className="w-3.5 h-3.5 rounded-full z-10"
          style={{
            background: isActive ? "#00D4B4" : "#2A2B3D",
            boxShadow: isActive ? "0 0 8px rgba(0,212,180,0.5)" : "none",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          {/* Time */}
          <span
            className="font-mono text-sm font-semibold tabular-nums shrink-0"
            style={{ color: isActive ? "#00D4B4" : "#8B8CA8" }}
          >
            {sequence.time}
          </span>

          {/* EN COURS badge */}
          {isActive && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0"
              style={{ background: "rgba(0,212,180,0.15)", color: "#00D4B4" }}
            >
              En cours
            </span>
          )}
        </div>

        {/* Description */}
        <p
          className="mt-0.5 text-sm font-medium leading-snug"
          style={{ color: isActive ? "#FFFFFF" : "#C4C5D6" }}
        >
          {sequence.description}
        </p>

        {/* Location row */}
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          {locationTag && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider"
              style={{
                background: "#1C1D2B",
                color: locationTag === "INT" ? "#A78BFA" : "#60A5FA",
              }}
            >
              {locationTag}
            </span>
          )}
          <span className="text-xs" style={{ color: "#8B8CA8" }}>
            {cleanLocation}
          </span>
        </div>

        {/* Crew tags */}
        {sequence.crew.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {sequence.crew.map((c) => (
              <span
                key={c}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "#1C1D2B", color: "#8B8CA8" }}
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {sequence.notes && (
          <p
            className="mt-1 text-xs italic"
            style={{ color: "#F59E0B" }}
          >
            💡 {sequence.notes}
          </p>
        )}
      </div>
    </div>
  );
}
