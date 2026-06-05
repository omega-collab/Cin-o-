"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Coffee,
  Play,
  StopCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useIntermittentStore } from "@/lib/store/useIntermittentStore";
import { useShiftPointageStore } from "@/lib/store/useShiftPointageStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import type { DepartmentSlug } from "@/lib/types";

function todayISO(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function nowHHMM(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Différence en minutes entre deux HH:MM. Gère le passage minuit en
// supposant que end > start sur la même journée (cas standard pause repas).
function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return ((eh ?? 0) * 60 + (em ?? 0)) - ((sh ?? 0) * 60 + (sm ?? 0));
}

function fmtDuration(mins: number): string {
  if (mins <= 0) return "0min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function ShiftPointageCard() {
  const router = useRouter();
  const hydrated = useHydrated();

  const user = useProjectStore((s) => s.user);
  const department = useUserStore((s) => s.department) as DepartmentSlug | null;
  const userRole = useUserStore((s) => s.role);
  const shoot = useShootStore((s) => s.shoot);

  const pointage = useShiftPointageStore((s) => s.pointage);
  const startLunch = useShiftPointageStore((s) => s.startLunch);
  const endLunch = useShiftPointageStore((s) => s.endLunch);
  const resetPointage = useShiftPointageStore((s) => s.reset);
  const ensureToday = useShiftPointageStore((s) => s.ensureToday);

  const addWorkDay = useIntermittentStore((s) => s.addWorkDay);
  const settings = useIntermittentStore((s) => s.settings);

  // Reset auto à minuit / si la date stockée n'est plus aujourd'hui
  useEffect(() => {
    ensureToday();
  }, [ensureToday]);

  // Tick pour rafraîchir l'affichage "il y a Xmin" toutes les 30s.
  // Évite que la durée affichée soit figée tant que le composant ne
  // re-render pas.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Gating : ne pas afficher la carte si conditions non remplies
  // (pas connecté, dept = production / direction, pas de FDS publiée).
  const isProd = department === "production" || department === "direction";
  const fdsReady = shoot.isPublished && shoot.projectTitle.trim() !== "";
  const visible = hydrated && !!user && !!department && !isProd && fdsReady;

  // Heure de convocation effective (dept-specific si présente, sinon générale)
  const callTime = useMemo(() => {
    if (!department) return shoot.callTime;
    const deptCT = shoot.deptCallTimes?.[department];
    return deptCT && deptCT.trim() !== "" ? deptCT : shoot.callTime;
  }, [department, shoot.callTime, shoot.deptCallTimes]);

  if (!visible) return null;

  const lunchStart = pointage?.lunchStart;
  const lunchEnd = pointage?.lunchEnd;
  const phase: "before-lunch" | "in-lunch" | "after-lunch" =
    !lunchStart ? "before-lunch" : !lunchEnd ? "in-lunch" : "after-lunch";

  // Durée de pause en cours / clôturée — pour l'affichage.
  const lunchDurationMins = (() => {
    if (!lunchStart) return 0;
    const end = lunchEnd ?? nowHHMM();
    return Math.max(0, minutesBetween(lunchStart, end));
  })();

  function handleStartLunch() {
    startLunch();
  }

  function handleEndLunch() {
    endLunch();
  }

  function handleEndOfDay() {
    const draft = {
      date: todayISO(),
      startTime: callTime || "08:00",
      endTime: nowHHMM(),
      lunchStart: lunchStart || undefined,
      lunchEnd: lunchEnd || undefined,
      convention: settings.convention,
      // On note le département + le rôle dans la note pour traçabilité.
      // (WorkDay n'a pas de champ "department" dédié — c'est OK, le
      // store intermittent est mono-utilisateur côté local.)
      notes: userRole ? userRole : undefined,
    };
    addWorkDay(draft);
    resetPointage();
    router.push("/heures");
  }

  return (
    <div className="glass-card rounded-app p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-cyan shrink-0" />
          <span className="text-sm font-semibold text-white truncate">
            Mon pointage du jour
          </span>
        </div>
        <span className="text-[10px] font-semibold text-muted uppercase tracking-widest shrink-0">
          Convoc. {callTime}
        </span>
      </div>

      {/* État coupure déjeuner */}
      {phase === "before-lunch" && (
        <p className="text-xs text-textSoft leading-snug">
          Journée commencée à <span className="font-mono font-semibold text-white">{callTime}</span>.
          Cliquez sur <span className="font-semibold text-cyan">Coupure déjeuner</span> quand vous partez en pause.
        </p>
      )}
      {phase === "in-lunch" && (
        <p className="text-xs text-warning leading-snug flex items-center gap-1.5">
          <Coffee className="w-3.5 h-3.5 shrink-0" />
          Coupure démarrée à <span className="font-mono font-semibold">{lunchStart}</span>
          <span className="text-muted">· en cours depuis {fmtDuration(lunchDurationMins)}</span>
        </p>
      )}
      {phase === "after-lunch" && (
        <p className="text-xs text-success leading-snug flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Reprise marquée à <span className="font-mono font-semibold">{lunchEnd}</span>
          <span className="text-muted">· durée {fmtDuration(lunchDurationMins)}</span>
        </p>
      )}

      {/* Boutons d'action — varient selon phase */}
      <div className="grid grid-cols-2 gap-2">
        {phase === "before-lunch" && (
          <>
            <button
              onClick={handleStartLunch}
              className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-warning/15 text-warning border border-warning/30 active:scale-[0.98] transition-transform min-h-[44px]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <Coffee className="w-4 h-4" />
              Coupure déjeuner
            </button>
          </>
        )}
        {phase === "in-lunch" && (
          <>
            <button
              onClick={handleEndLunch}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-success/15 text-success border border-success/30 active:scale-[0.98] transition-transform min-h-[44px]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <Play className="w-4 h-4" />
              Reprise
            </button>
            <button
              onClick={handleEndOfDay}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-white/5 text-muted border border-stroke active:scale-[0.98] transition-transform min-h-[44px]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <StopCircle className="w-4 h-4" />
              Fin de journée
            </button>
          </>
        )}
        {phase === "after-lunch" && (
          <>
            <button
              onClick={handleEndOfDay}
              className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-cyanSoft text-cyan border border-cyan/30 active:scale-[0.98] transition-transform min-h-[44px]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <StopCircle className="w-4 h-4" />
              Fin de journée
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </>
        )}
      </div>

      <p className="text-[10px] text-muted leading-snug">
        Au clic « Fin de journée », l&apos;heure est consolidée dans vos heures
        intermittentes (modifiable ensuite dans <span className="text-textSoft">Heures</span>).
      </p>
    </div>
  );
}
