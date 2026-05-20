"use client";

import { TODAY_SCHEDULE } from "@/lib/data/schedule";
import { useEffect, useState } from "react";

export function Hero() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Call time = first sequence of the day
  const firstSeq = TODAY_SCHEDULE[0];
  const callTime = firstSeq?.time ?? "07:00";

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#13141F", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-white tracking-tight">
              🎬 BANDI — Jour 12
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-widest uppercase"
              style={{ background: "rgba(0,212,180,0.15)", color: "#00D4B4" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#00D4B4" }}
              />
              En tournage
            </span>
          </div>

          {/* Location */}
          <p
            className="mt-1.5 text-sm"
            style={{ color: "#8B8CA8" }}
          >
            📍 Plateaux des Lilas, Studio 3
          </p>
        </div>

        {/* Live clock */}
        {time && (
          <div
            className="font-mono text-3xl font-bold tabular-nums shrink-0 leading-none"
            style={{ color: "#FFFFFF" }}
          >
            {time}
          </div>
        )}
      </div>

      {/* Info pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <InfoPill icon="⏰" label="CALL TIME" value={callTime} />
        <InfoPill icon="🍽" label="REPAS" value="12:30" />
      </div>
    </div>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "#1C1D2B" }}
    >
      <span className="text-sm">{icon}</span>
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "#8B8CA8" }}
      >
        {label}
      </span>
      <span
        className="font-mono text-sm font-bold"
        style={{ color: "#00D4B4" }}
      >
        {value}
      </span>
    </div>
  );
}
