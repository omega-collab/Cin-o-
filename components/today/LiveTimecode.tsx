"use client";
import { useEffect, useRef } from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function LiveTimecode() {
  // Write the timecode directly to a DOM ref via requestAnimationFrame
  // instead of triggering a React render 24 times per second. The component
  // sits at the top of the home screen and was a measurable battery drain
  // on mid-range Android phones.
  const ref = useRef<HTMLSpanElement>(null);
  const lastValue = useRef("");

  useEffect(() => {
    let raf = 0;
    function tick() {
      const now = new Date();
      const f = Math.floor(now.getMilliseconds() / (1000 / 24));
      const value = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}:${pad2(f)}`;
      if (ref.current && value !== lastValue.current) {
        ref.current.textContent = value;
        lastValue.current = value;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col items-end shrink-0">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted">TC 24</span>
      <span ref={ref} className="font-mono text-sm font-bold text-cyan tabular-nums leading-none">--:--:--:--</span>
    </div>
  );
}
