"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Lock, LockOpen } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import { useAccessStore } from "@/lib/store/useAccessStore";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DEPT_ICONS } from "@/lib/data/departmentIcons";
import type { DepartmentSlug } from "@/lib/types";

export function AdminCodesPanel() {
  const codesEnabled = useShootStore((s) => s.shoot.codesEnabled);
  const deptCodes = useShootStore((s) => s.shoot.deptCodes);
  const setCodesEnabled = useShootStore((s) => s.setCodesEnabled);
  const setDeptCodes = useShootStore((s) => s.setDeptCodes);
  const lockAll = useAccessStore((s) => s.lockAll);

  const [localCodes, setLocalCodes] = useState<Partial<Record<DepartmentSlug, string>>>(
    () => ({ ...deptCodes })
  );
  const [showCodes, setShowCodes] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleToggle() {
    const next = !codesEnabled;
    setCodesEnabled(next);
    if (!next) lockAll(); // réinitialise les accès quand les codes sont désactivés
  }

  function handleSave() {
    const cleaned = Object.fromEntries(
      Object.entries(localCodes).filter(([, v]) => v.trim() !== "")
    ) as Partial<Record<DepartmentSlug, string>>;
    setDeptCodes(cleaned);
    lockAll(); // force une nouvelle vérification des codes
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const hasChanges =
    JSON.stringify(localCodes) !== JSON.stringify(deptCodes ?? {});

  return (
    <div className="space-y-4">
      {/* Toggle global */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${codesEnabled ? "bg-cyan/10" : "bg-white/5"}`}>
          {codesEnabled
            ? <Lock className="w-5 h-5 text-cyan" />
            : <LockOpen className="w-5 h-5 text-muted" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Protection par code</p>
          <p className="text-xs text-muted mt-0.5">
            {codesEnabled ? "Les départements configurés exigent un code d'accès." : "Accès libre à tous les départements."}
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${codesEnabled ? "bg-cyan" : "bg-white/10"}`}
          aria-label={codesEnabled ? "Désactiver les codes" : "Activer les codes"}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${codesEnabled ? "left-6" : "left-1"}`} />
        </button>
      </div>

      {/* Liste des codes par département */}
      {codesEnabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Codes par département
            </p>
            <button
              onClick={() => setShowCodes((v) => !v)}
              className="text-muted hover:text-white transition-colors"
              title={showCodes ? "Masquer" : "Afficher"}
            >
              {showCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            Laissez vide pour un accès libre sur ce département.
          </p>

          <div className="space-y-2">
            {DEPARTMENTS.map((dept) => {
              const Icon = DEPT_ICONS[dept.slug as keyof typeof DEPT_ICONS];
              const val = localCodes[dept.slug as DepartmentSlug] ?? "";
              return (
                <div key={dept.slug} className="glass-card rounded-2xl px-3 py-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
                    {Icon && <Icon className="w-4 h-4 text-cyan" />}
                  </div>
                  <span className="text-sm text-white flex-1 min-w-0 truncate">{dept.name}</span>
                  <input
                    type={showCodes ? "text" : "password"}
                    value={val}
                    onChange={(e) =>
                      setLocalCodes((prev) => ({
                        ...prev,
                        [dept.slug as DepartmentSlug]: e.target.value,
                      }))
                    }
                    placeholder="Aucun code"
                    maxLength={8}
                    autoComplete="new-password"
                    className="w-28 bg-white/5 border border-stroke rounded-xl px-3 py-1.5 text-sm text-white font-mono text-center focus:outline-none focus:ring-1 focus:ring-cyan/40 placeholder:text-muted/50"
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={!hasChanges && !saved}
            className="active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saved
              ? <><Check className="w-4 h-4" /> Codes enregistrés</>
              : "Enregistrer les codes"}
          </button>

          {saved && (
            <p className="text-[11px] text-muted text-center">
              Les membres devront ressaisir leur code à la prochaine ouverture.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
