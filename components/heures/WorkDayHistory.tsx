"use client";

import { useMemo, useState } from "react";
import { Trash2, ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
import { useIntermittentStore } from "@/lib/store/useIntermittentStore";
import { computeDay, estimateSalary, fmtMinutes, frDate, isoWeek } from "@/lib/utils/intermittent";

type GroupBy = "day" | "week" | "month";

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>{label}</span>
  );
}

function DayRow({ day, onDelete, showSalary, tauxHoraire }: {
  day: ReturnType<typeof useIntermittentStore.getState>["workDays"][0];
  onDelete: (id: string) => void;
  showSalary: boolean;
  tauxHoraire: number;
}) {
  const computed = computeDay(day);
  const salary = showSalary ? estimateSalary(computed, tauxHoraire, day.convention) : 0;

  return (
    <div className="glass-card rounded-2xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white capitalize">{frDate(day.date)}</p>
            <span className="text-[10px] text-muted">
              {day.convention === "cinema" ? "Cinéma" : "Audio"}
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {day.startTime} → {day.endTime}
            {day.lunchStart && day.lunchEnd
              ? ` · repas ${day.lunchStart}–${day.lunchEnd}`
              : " · journée continue"}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <Badge
              label={fmtMinutes(computed.effectiveMinutes)}
              color="text-white bg-white/10"
            />
            {computed.heuresSup > 0 && (
              <Badge label={`+${computed.heuresSup.toFixed(1)}h sup`} color="text-cyan bg-cyanSoft" />
            )}
            {computed.isJourneeContinue && (
              <Badge label="Continue" color="text-orangeSoft bg-orangeSoft/10" />
            )}
            {computed.heuresDeNuit > 0 && (
              <Badge label={`${computed.heuresDeNuit.toFixed(1)}h nuit`} color="text-violetSoft bg-violetSoft/10" />
            )}
            {computed.heuresAnticipees > 0 && (
              <Badge label={`${computed.heuresAnticipees.toFixed(1)}h antic.`} color="text-blueSoft bg-blueSoft/10" />
            )}
          </div>
          {day.notes && <p className="text-xs text-muted italic mt-1">{day.notes}</p>}
        </div>
        <div className="flex items-start gap-2 shrink-0">
          {showSalary && salary > 0 && (
            <span className="text-sm font-bold text-cyan">{salary.toFixed(0)} €</span>
          )}
          <button
            onClick={() => onDelete(day.id)}
            className="text-muted hover:text-redSoft transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryBar({ totalMinutes, totalSalary, count, showSalary }: {
  totalMinutes: number;
  totalSalary: number;
  count: number;
  showSalary: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span className="font-semibold text-cyan">{fmtMinutes(totalMinutes)}</span>
      <span>·</span>
      <span>{count} jour{count > 1 ? "s" : ""}</span>
      {showSalary && totalSalary > 0 && (
        <>
          <span>·</span>
          <span className="font-semibold text-cyan">≈ {totalSalary.toFixed(0)} € brut</span>
        </>
      )}
    </div>
  );
}

export function WorkDayHistory() {
  const { workDays, settings, deleteWorkDay } = useIntermittentStore();
  const [groupBy, setGroupBy] = useState<GroupBy>("week");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    if (workDays.length === 0) return [];

    const map = new Map<string, { days: typeof workDays; label: string }>();

    for (const day of workDays) {
      const d = new Date(day.date + "T12:00:00");
      let key: string;
      let label: string;

      if (groupBy === "day") {
        key = day.date;
        label = frDate(day.date);
      } else if (groupBy === "week") {
        const w = isoWeek(d);
        const y = d.getFullYear();
        key = `${y}-W${String(w).padStart(2, "0")}`;
        label = `Semaine ${w} — ${y}`;
      } else {
        key = day.date.slice(0, 7);
        label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      }

      if (!map.has(key)) map.set(key, { days: [], label });
      map.get(key)!.days.push(day);
    }

    return Array.from(map.entries())
      .map(([key, { days, label }]) => ({ key, label, days }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [workDays, groupBy]);

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  if (workDays.length === 0) {
    return (
      <div className="glass-card rounded-app p-8 text-center space-y-2">
        <TrendingUp className="w-8 h-8 text-muted mx-auto" />
        <p className="text-sm text-muted">Aucune journée enregistrée.</p>
        <p className="text-xs text-muted">Utilisez l'onglet Saisie pour commencer.</p>
      </div>
    );
  }

  // Global totals
  const totalMin = workDays.reduce((acc, d) => acc + computeDay(d).effectiveMinutes, 0);
  const totalSalary = workDays.reduce(
    (acc, d) => acc + estimateSalary(computeDay(d), settings.tauxHoraire, d.convention),
    0
  );

  return (
    <div className="space-y-4">
      {/* Totaux globaux */}
      <div className="glass-card-strong rounded-app p-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-muted">Total heures</p>
          <p className="text-lg font-bold text-cyan">{fmtMinutes(totalMin)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Jours</p>
          <p className="text-lg font-bold text-white">{workDays.length}</p>
        </div>
        {settings.showSalaryPreview && (
          <div>
            <p className="text-xs text-muted">≈ Brut total</p>
            <p className="text-lg font-bold text-cyan">{totalSalary.toFixed(0)} €</p>
          </div>
        )}
      </div>

      {/* Group selector */}
      <div className="flex gap-2">
        {(["day", "week", "month"] as GroupBy[]).map((g) => {
          const labels = { day: "Jour", week: "Semaine", month: "Mois" };
          return (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                groupBy === g ? "active-pill" : "glass-card text-muted"
              }`}
            >
              {labels[g]}
            </button>
          );
        })}
      </div>

      {/* Groups */}
      <div className="space-y-3">
        {groups.map(({ key, label, days }) => {
          const isOpen = openGroups.has(key) || groupBy === "day";
          const groupMin = days.reduce((a, d) => a + computeDay(d).effectiveMinutes, 0);
          const groupSalary = days.reduce(
            (a, d) => a + estimateSalary(computeDay(d), settings.tauxHoraire, d.convention),
            0
          );

          return (
            <div key={key} className="glass-card rounded-2xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => groupBy !== "day" && toggleGroup(key)}
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white capitalize">{label}</p>
                  <SummaryBar
                    totalMinutes={groupMin}
                    totalSalary={groupSalary}
                    count={days.length}
                    showSalary={settings.showSalaryPreview}
                  />
                </div>
                {groupBy !== "day" && (
                  isOpen
                    ? <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-3 pb-3 space-y-2 border-t border-stroke/50 pt-3">
                  {days.map((day) => (
                    <DayRow
                      key={day.id}
                      day={day}
                      onDelete={deleteWorkDay}
                      showSalary={settings.showSalaryPreview}
                      tauxHoraire={settings.tauxHoraire}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
