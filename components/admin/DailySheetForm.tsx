"use client";

import { useState } from "react";
import { Plus, Trash2, Radio } from "lucide-react";
import { useDailyStore } from "@/lib/store/useDailyStore";
import type { DailySequence } from "@/lib/types";

const INPUT_CLS =
  "bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40 w-full placeholder:text-muted";

export function DailySheetForm() {
  const { shoot, update, setSequences, publish, unpublish } = useDailyStore();

  const [seqs, setSeqs] = useState<DailySequence[]>(shoot.sequences);
  const [saved, setSaved] = useState(false);

  function addRow() {
    setSeqs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), time: "", label: "", location: "" },
    ]);
  }

  function removeRow(id: string) {
    setSeqs((prev) => prev.filter((s) => s.id !== id));
  }

  function patchRow(id: string, key: keyof DailySequence, value: string) {
    setSeqs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  }

  function handleSave() {
    setSequences(seqs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="glass-card rounded-app p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gradient">Feuille du jour</h3>
        <button
          onClick={shoot.isPublished ? unpublish : publish}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
            shoot.isPublished
              ? "bg-cyanSoft text-cyan"
              : "glass-card text-muted"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          {shoot.isPublished ? "En ligne" : "Hors ligne"}
        </button>
      </div>

      {/* Infos générales */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">Titre du projet</label>
          <input
            value={shoot.projectTitle}
            onChange={(e) => update({ projectTitle: e.target.value })}
            placeholder="Ex : BANDI"
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Jour J</label>
          <input
            type="number"
            min={1}
            value={shoot.shootingDay}
            onChange={(e) => update({ shootingDay: Number(e.target.value) })}
            className={INPUT_CLS}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted block mb-1">Lieu du tournage</label>
        <input
          value={shoot.location}
          onChange={(e) => update({ location: e.target.value })}
          placeholder="Ex : Plateaux des Lilas, Studio 3"
          className={INPUT_CLS}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">Call Time</label>
          <input
            type="time"
            value={shoot.callTime}
            onChange={(e) => update({ callTime: e.target.value })}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Heure repas</label>
          <input
            type="time"
            value={shoot.mealTime}
            onChange={(e) => update({ mealTime: e.target.value })}
            className={INPUT_CLS}
          />
        </div>
      </div>

      {/* Séquences */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted uppercase tracking-widest">
            Déroulé
          </label>
          <button
            onClick={addRow}
            className="flex items-center gap-1 text-xs text-cyan"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>

        <div className="space-y-2">
          {seqs.map((seq) => (
            <div key={seq.id} className="flex gap-2 items-center">
              <input
                value={seq.time}
                onChange={(e) => patchRow(seq.id, "time", e.target.value)}
                placeholder="08:30"
                className="bg-white/5 border border-stroke rounded-xl px-2 py-2 text-xs text-white w-16 focus:outline-none focus:ring-1 focus:ring-cyan/40 font-mono"
              />
              <input
                value={seq.label}
                onChange={(e) => patchRow(seq.id, "label", e.target.value)}
                placeholder="Séq. 32 – Scène 6"
                className="bg-white/5 border border-stroke rounded-xl px-2 py-2 text-xs text-white flex-1 focus:outline-none focus:ring-1 focus:ring-cyan/40"
              />
              <input
                value={seq.location}
                onChange={(e) => patchRow(seq.id, "location", e.target.value)}
                placeholder="INT. SALON"
                className="bg-white/5 border border-stroke rounded-xl px-2 py-2 text-xs text-white flex-1 focus:outline-none focus:ring-1 focus:ring-cyan/40"
              />
              <button
                onClick={() => removeRow(seq.id)}
                className="text-muted hover:text-redSoft shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {seqs.length === 0 && (
            <p className="text-xs text-muted italic py-2 text-center">
              Aucune séquence — clique sur Ajouter
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`active-pill w-full py-2.5 rounded-2xl font-semibold text-sm transition-opacity ${saved ? "opacity-60" : ""}`}
      >
        {saved ? "Sauvegardé ✓" : "Sauvegarder"}
      </button>
    </div>
  );
}
