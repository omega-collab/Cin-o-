"use client";

import { useState } from "react";
import { Info, Sparkles, Check } from "lucide-react";
import { useIntermittentStore } from "@/lib/store/useIntermittentStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { ROLE_PRESETS, DEPT_SCALES } from "@/lib/data/salaryPresets";
import { DEFAULT_SETTINGS } from "@/lib/types/intermittent";
import type { DepartmentSlug } from "@/lib/types";

const INPUT = "w-full bg-white/5 border border-stroke rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan/40";

export function SalarySettings() {
  const { settings, updateSettings } = useIntermittentStore();
  const { role, department } = useUserStore();

  const [local, setLocal] = useState({
    tauxJournalier: String(settings.tauxJournalier),
    tauxHoraire: String(settings.tauxHoraire),
  });
  const [presetApplied, setPresetApplied] = useState(false);

  const preset = role ? ROLE_PRESETS[role] : null;
  const deptScales = department ? DEPT_SCALES[department as DepartmentSlug] : null;

  // Montrer la suggestion si un preset existe et que les valeurs sont encore par défaut
  const isDefaultValues =
    settings.tauxHoraire === DEFAULT_SETTINGS.tauxHoraire &&
    settings.tauxJournalier === DEFAULT_SETTINGS.tauxJournalier;
  const showPresetBanner = preset && !presetApplied;

  function applyPreset() {
    if (!preset) return;
    setLocal({
      tauxHoraire: String(preset.tauxHoraireSuggere),
      tauxJournalier: String(preset.mgJournalier),
    });
    updateSettings({
      tauxHoraire: preset.tauxHoraireSuggere,
      tauxJournalier: preset.mgJournalier,
    });
    setPresetApplied(true);
  }

  function save() {
    updateSettings({
      tauxHoraire: parseFloat(local.tauxHoraire.replace(",", ".")) || 0,
      tauxJournalier: parseFloat(local.tauxJournalier.replace(",", ".")) || 0,
    });
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

      {/* Suggestion basée sur le poste */}
      {showPresetBanner && (
        <div
          className="rounded-2xl p-4 flex items-start justify-between gap-3"
          style={{ background: "rgba(0,224,208,0.07)", border: "1px solid rgba(0,224,208,0.2)" }}
        >
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">
                Suggestion — {role}
              </p>
              <p className="text-xs text-muted mt-0.5">
                ≈ {preset.tauxHoraireMin}–{preset.tauxHoraireMax} €/h · MG {preset.mgJournalier} €/j
              </p>
              {preset.note && (
                <p className="text-[10px] text-muted mt-1 italic">{preset.note}</p>
              )}
            </div>
          </div>
          {presetApplied ? (
            <span className="flex items-center gap-1 text-xs text-cyan font-medium shrink-0">
              <Check className="w-3.5 h-3.5" /> Appliqué
            </span>
          ) : (
            <button
              onClick={applyPreset}
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan bg-cyanSoft active:scale-95 transition-transform"
            >
              Appliquer
            </button>
          )}
        </div>
      )}

      {/* Toggle affichage salaire */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Aperçu salaire brut</p>
          <p className="text-xs text-muted mt-0.5">Afficher les estimations dans l&apos;historique</p>
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
              type="text"
              inputMode="decimal"
              value={local.tauxHoraire}
              onChange={(e) => setLocal((p) => ({ ...p, tauxHoraire: e.target.value }))}
              className={INPUT}
            />
            {preset && (
              <p className="text-xs text-muted mt-1">
                Fourchette {role} : {preset.tauxHoraireMin}–{preset.tauxHoraireMax} €/h
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">MG journalier brut (€)</label>
            <input
              type="text"
              inputMode="decimal"
              value={local.tauxJournalier}
              onChange={(e) => setLocal((p) => ({ ...p, tauxJournalier: e.target.value }))}
              className={INPUT}
            />
            {preset && (
              <p className="text-xs text-muted mt-1">
                MG indicatif {role} : {preset.mgJournalier} €/j
              </p>
            )}
          </div>

          <button
            onClick={save}
            className="active-pill w-full py-3 rounded-2xl font-semibold text-sm"
          >
            Enregistrer les paramètres
          </button>
        </div>
      )}

      {/* Barèmes — filtrés par département si connu, sinon généraux */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          {deptScales ? `Barèmes ${department ? departmentLabel(department as DepartmentSlug) : ""} 2024` : "Barèmes indicatifs 2024"}
        </h3>
        <div className="glass-card rounded-2xl p-4 space-y-2 text-xs">
          {deptScales ? (
            <>
              {deptScales.map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className={row.label === role ? "text-cyan font-medium" : "text-muted"}>
                    {row.label}
                    {row.label === role && <span className="ml-1 text-[9px] uppercase tracking-widest opacity-70">· toi</span>}
                  </span>
                  <span className={`font-mono ${row.label === role ? "text-cyan" : "text-white"}`}>
                    {row.range}
                  </span>
                </div>
              ))}
              <div className="border-t border-stroke/50 pt-2 mt-1 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Majoration nuit cinéma</span>
                  <span className="text-cyan font-mono">+25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Journée continue</span>
                  <span className="text-orangeSoft font-mono">+15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Heure sup / anticipée</span>
                  <span className="text-cyan font-mono">+25%</span>
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function departmentLabel(slug: DepartmentSlug): string {
  const labels: Record<DepartmentSlug, string> = {
    camera: "Caméra",
    electro: "Électro",
    machino: "Machino",
    son: "Son",
    regie: "Régie",
    deco: "Déco",
    hmc: "HMC",
    production: "Production",
    cantine: "Cantine",
  };
  return labels[slug] ?? slug;
}
