"use client";
import { useState, useEffect } from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function LiveTimecode() {
  const [tc, setTc] = useState("--:--:--:--");

  useEffect(() => {
    function tick() {
      const now = new Date();
      const f = Math.floor(now.getMilliseconds() / (1000 / 24));
      setTc(
        `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}:${pad2(f)}`
      );
    }
    tick();
    const id = setInterval(tick, 41);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-end shrink-0">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted">TC 24</span>
      <span className="font-mono text-sm font-bold text-cyan tabular-nums leading-none">{tc}</span>
    </div>
  );
}
