"use client";
import { useState, useEffect } from "react";
import { Clock3 } from "lucide-react";
import type { DepartmentSlug } from "@/lib/types";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function fmtElapsed(min: number) {
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  return h > 0 ? `${h}h${pad2(m)}` : `${m}min`;
}

interface Props {
  callTime: string;
  patTime?: string;
  deptCallTimes?: Partial<Record<DepartmentSlug, string>>;
  department: DepartmentSlug | null;
}

export function CallTimeBlock({ callTime, patTime, deptCallTimes, department }: Props) {
  const [nowMin, setNowMin] = useState(0);
  const deptTime = (department && deptCallTimes?.[department]) ?? callTime;

  useEffect(() => {
    function tick() {
      const n = new Date();
      setNowMin(n.getHours() * 60 + n.getMinutes());
    }
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  const diff = nowMin - timeToMin(deptTime);

  return (
    <div className="glass-card rounded-app px-3 py-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Clock3 className="w-3.5 h-3.5 text-muted shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Call Time
        </span>
      </div>
      <p className="font-mono text-sm font-bold text-cyan">{deptTime}</p>
      {patTime && (
        <p className="text-[10px] text-textSoft">
          PAT{" "}
          <span className="font-mono font-semibold text-white">{patTime}</span>
        </p>
      )}
      {nowMin > 0 && (
        <p
          className={`text-[10px] font-mono font-semibold ${
            diff >= 0 ? "text-cyan" : "text-warning"
          }`}
        >
          {diff >= 0 ? `Actif depuis ${fmtElapsed(diff)}` : `Dans ${fmtElapsed(diff)}`}
        </p>
      )}
    </div>
  );
}
