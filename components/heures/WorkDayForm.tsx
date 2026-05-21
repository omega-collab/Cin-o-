"use client";

import { useState } from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { useIntermittentStore } from "@/lib/store/useIntermittentStore";
import { computeDay, fmtMinutes } from "@/lib/utils/intermittent";
import type { ConventionType } from "@/lib/types/intermittent";

const INPUT = "w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 font-mono";

const todayISO = () => new Date().toISOString().split("T")[0] as string;

export function WorkDayForm() {
  const { settings, addWorkDay, workDays, updateSettings } = useIntermittentStore();

  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");
  const [hasPause, setHasPause] = useState(true);
  const [convention, setConvention] = useState<ConventionType>(settings.convention);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const alreadyExists = workDays.some((d) => d.date === date);

  const preview = computeDay({
    id: "",
    date,
    startTime,
    endTime,
    lunchStart: hasPause ? lunchStart : undefined,
    lunchEnd: hasPause ? lunchEnd : undefined,
    convention,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addWorkDay({
      date,
      startTime,
      endTime,
      lunchStart: hasPause ? lunchStart : undefined,
      lunchEnd: hasPause ? lunchEnd : undefined,
      convention,
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setNotes("");
  }

  const pills = [
    preview.isJourneeContinue && { label: "Journée continue", color: "text-orangeSoft bg-orangeSoft/10" },
    preview.heuresAnticipees > 0 && { label: `${preview.heuresAnticipees.toFixed(1)}h anticipées`, color: "text-blueSoft bg-blueSoft/10" },
    preview.heuresDeNuit > 0 && { label: `${preview.heuresDeNuit.toFixed(1)}h de nuit`, color: "text-violetSoft bg-violetSoft/10" },
    preview.heuresSup > 0 && { label: `${preview.heuresSup.toFixed(1)}h sup.`, color: "text-cyan bg-cyanSoft" },
  ].filter(Boolean) as { label: string; color: string }[];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Convention */}
      <div className="grid grid-cols-2 gap-2">
        {(["cinema", "audiovisuel"] as ConventionType[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => { setConvention(c); updateSettings({ convention: c }); }}
            className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              convention === c
                ? "border-cyan bg-cyanSoft text-cyan"
                : "border-stroke bg-white/5 text-textSoft"
            }`}
          >
            {c === "cinema" ? "Cinéma (SFACT)" : "Audiovisuel (CCPAP)"}
          </button>
        ))}
      </div>

      {/* Date */}
      <div>
        <label className="text-xs text-muted block mb-1">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
        {alreadyExists && (
          <p className="text-xs text-orangeSoft mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Une entrée existe déjà pour ce jour.
          </p>
        )}
      </div>

      {/* Heures */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">Début</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Fin</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={INPUT} />
        </div>
      </div>

      {/* Pause déjeuner */}
      <div className="glass-card rounded-2xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Pause déjeuner</span>
          <button
            type="button"
            onClick={() => setHasPause(!hasPause)}
            className={`w-10 h-5 rounded-full transition-colors relative ${hasPause ? "bg-cyan" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${hasPause ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
        {hasPause && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted block mb-1">Début repas</label>
              <input type="time" value={lunchStart} onChange={(e) => setLunchStart(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Fin repas</label>
              <input type="time" value={lunchEnd} onChange={(e) => setLunchEnd(e.target.value)} className={INPUT} />
            </div>
          </div>
        )}
      </div>

      {/* Preview des heures calculées */}
      <div className="glass-card-strong rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan shrink-0" />
          <span className="text-xs font-semibold text-textSoft uppercase tracking-wider">Calcul automatique</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted text-xs">Durée nette</p>
            <p className="font-bold text-white text-lg">{fmtMinutes(preview.effectiveMinutes)}</p>
          </div>
          <div>
            <p className="text-muted text-xs">Heures sup.</p>
            <p className={`font-bold text-lg ${preview.heuresSup > 0 ? "text-cyan" : "text-muted"}`}>
              {preview.heuresSup > 0 ? `+${preview.heuresSup.toFixed(1)}h` : "—"}
            </p>
          </div>
        </div>
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pills.map((p) => (
              <span key={p.label} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.color}`}>
                {p.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-muted block mb-1">Note (optionnel)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Production, décor, remarque…"
          className={INPUT}
        />
      </div>

      <button
        type="submit"
        disabled={alreadyExists}
        className="active-pill w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saved ? <><Check className="w-4 h-4" /> Enregistré</> : alreadyExists ? "Journée déjà saisie" : "Enregistrer la journée"}
      </button>
    </form>
  );
}
