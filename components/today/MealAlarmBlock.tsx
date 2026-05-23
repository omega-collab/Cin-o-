"use client";
import { useState, useEffect, useRef } from "react";
import { Utensils, Bell, BellOff, Plus, Minus, AlarmCheck } from "lucide-react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function fmtCountdown(min: number) {
  if (min <= 0) return "00:00";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${pad2(m)}` : `${m} min`;
}

function fmtSeconds(s: number) {
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

function playBeep(ctx: AudioContext, delay = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.7);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + 0.7);
}

export function MealAlarmBlock({ mealTime }: { mealTime: string }) {
  const [nowMin, setNowMin] = useState(0);
  const [duration, setDuration] = useState(50);
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [fired, setFired] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function tick() {
      const n = new Date();
      setNowMin(n.getHours() * 60 + n.getMinutes());
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setFired(true);
          setActive(false);
          const ctx = audioRef.current;
          if (ctx) {
            playBeep(ctx, 0);
            playBeep(ctx, 0.6);
            playBeep(ctx, 1.2);
          }
          if ("vibrate" in navigator) {
            navigator.vibrate([300, 200, 300, 200, 300]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  function start() {
    if (!audioRef.current) audioRef.current = new AudioContext();
    setRemaining(duration * 60);
    setActive(true);
    setFired(false);
  }

  function stop() {
    setActive(false);
    setFired(false);
  }

  const toMeal = timeToMin(mealTime) - nowMin;

  return (
    <div className="glass-card rounded-app px-3 py-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            Repas
          </span>
        </div>
        <span className="font-mono text-sm font-bold text-cyan">{mealTime}</span>
      </div>

      {toMeal > 0 && nowMin > 0 && (
        <p className="text-[10px] text-textSoft">
          Dans{" "}
          <span className="font-mono font-semibold text-warning">{fmtCountdown(toMeal)}</span>
        </p>
      )}
      {toMeal <= 0 && toMeal > -60 && nowMin > 0 && (
        <p className="text-[10px] font-semibold text-success">Pause repas en cours</p>
      )}

      {fired ? (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-warning/10 border border-warning/30">
          <AlarmCheck className="w-3.5 h-3.5 text-warning shrink-0" />
          <p className="flex-1 text-[11px] font-semibold text-warning">Reprise bientôt !</p>
          <button
            onClick={stop}
            className="text-warning text-[10px] font-semibold px-1.5 py-0.5 rounded bg-warning/20"
          >
            OK
          </button>
        </div>
      ) : active ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[9px] text-muted uppercase tracking-widest">Reprise dans</p>
            <p className="font-mono text-base font-bold text-cyan tabular-nums">
              {fmtSeconds(remaining)}
            </p>
          </div>
          <button onClick={stop} className="p-1.5 rounded-lg bg-white/5 text-muted">
            <BellOff className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setDuration((d) => Math.max(10, d - 5))}
              className="w-6 h-6 rounded-lg bg-white/5 text-muted flex items-center justify-center"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="font-mono text-xs text-textSoft w-8 text-center tabular-nums">
              {duration}m
            </span>
            <button
              onClick={() => setDuration((d) => Math.min(90, d + 5))}
              className="w-6 h-6 rounded-lg bg-white/5 text-muted flex items-center justify-center"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
          <button
            onClick={start}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyanSoft text-cyan text-[11px] font-semibold"
          >
            <Bell className="w-3 h-3" /> Alarme repas
          </button>
        </div>
      )}
    </div>
  );
}
