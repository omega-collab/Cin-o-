"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { useIntermittentStore } from "@/lib/store/useIntermittentStore";

const INPUT = "w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40";

export function SalarySettings() {
  const { settings, updateSettings } = useIntermittentStore();
  const [local, setLocal] = useState({
    tauxJournalier: settings.tauxJournalier,
    tauxHoraire: settings.tauxHoraire,
  });

  function save() {
    updateSettings({ ...local });
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blueSoft shrink-0 mt-0.5" />
        <p className="text-xs text-textSoft leading-relaxed">
          Les montants sont indicatifs et varient selon votre catégorie, votre ancienneté et les accords de production.
          Consultez votre convention collective et votre fiche de paie pour les taux exacts.
        </p>
      </div>

      {/* Toggle affichage salaire */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Aperçu salaire brut</p>
          <p className="text-xs text-muted mt-0.5">Afficher les estimations dans l'historique</p>
        </div>
        <button
          onClick={() => updateSettings({ showSalaryPreview: !settings.showSalaryPreview })}
          className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${settings.showSalaryPreview ? "bg-cyan" : "bg-white/10"}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showSalaryPreview ? "left-7" : "left-1"}`} />
        </button>
      </div>

      {settings.showSalaryPreview && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1">Taux horaire brut (€)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={local.tauxHoraire}
              onChange={(e) => setLocal((p) => ({ ...p, tauxHoraire: Number(e.target.value) }))}
              className={INPUT}
            />
            <p className="text-xs text-muted mt-1">
              Minimum convention cinéma 2024 : environ 21–42 €/h selon catégorie.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">MG journalier brut (€)</label>
            <input
              type="number"
              step="5"
              min="0"
              value={local.tauxJournalier}
              onChange={(e) => setLocal((p) => ({ ...p, tauxJournalier: Number(e.target.value) }))}
              className={INPUT}
            />
            <p className="text-xs text-muted mt-1">
              Minimum garanti (MG) : référence plancher par journée de tournage.
            </p>
          </div>

          <button
            onClick={save}
            className="active-pill w-full py-3 rounded-2xl font-semibold text-sm"
          >
            Enregistrer les paramètres
          </button>
        </div>
      )}

      {/* Barèmes indicatifs */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Barèmes indicatifs 2024</h3>
        <div className="glass-card rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">SMIG horaire brut</span>
            <span className="text-white font-mono">11,65 €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Chef électricien (cinéma)</span>
            <span className="text-white font-mono">≈ 35–55 €/h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Technicien (audiovisuel)</span>
            <span className="text-white font-mono">≈ 21–38 €/h</span>
          </div>
          <div className="flex justify-between border-t border-stroke/50 pt-2 mt-1">
            <span className="text-muted">Majoration nuit cinéma</span>
            <span className="text-cyan font-mono">+25%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Majoration nuit audiovisuel</span>
            <span className="text-cyan font-mono">+50%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Journée continue</span>
            <span className="text-orangeSoft font-mono">+15%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Heure anticipée / sup</span>
            <span className="text-cyan font-mono">+25%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
