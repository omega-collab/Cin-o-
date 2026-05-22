"use client";

import { useMemo } from "react";
import { Bot, AlertCircle, AlertTriangle, Info, CheckCircle2, RefreshCw } from "lucide-react";
import { useExpenseStore } from "@/lib/store/useExpenseStore";
import type { ExpenseEntry } from "@/lib/types/expense";

interface FlaggedEntry { entry: ExpenseEntry; topSeverity: "error" | "warning" | "info" }

export function ExpenseBot() {
  const { entries, recheck } = useExpenseStore();

  const { errors, warnings, infos, clean, flagged } = useMemo(() => {
    let errors = 0, warnings = 0, infos = 0, clean = 0;
    const flagged: FlaggedEntry[] = [];

    for (const entry of entries) {
      if (entry.flags.length === 0) { clean++; continue; }
      let topSeverity: "error" | "warning" | "info" = "info";
      for (const f of entry.flags) {
        if (f.severity === "error") { errors++; topSeverity = "error"; }
        else if (f.severity === "warning") { warnings++; if (topSeverity !== "error") topSeverity = "warning"; }
        else { infos++; }
      }
      flagged.push({ entry, topSeverity });
    }
    return { errors, warnings, infos, clean, flagged };
  }, [entries]);

  const allClean = flagged.length === 0 && entries.length > 0;

  return (
    <div className="space-y-3">
      {/* Bannière état global */}
      <div className={`rounded-2xl p-4 flex items-start gap-3 ${
        errors > 0
          ? "bg-red-500/8 border border-red-500/25"
          : warnings > 0
          ? "bg-orange-500/8 border border-orange-500/25"
          : allClean
          ? "bg-emerald-500/8 border border-emerald-500/25"
          : "glass-card"
      }`}>
        <Bot className={`w-5 h-5 shrink-0 mt-0.5 ${
          errors > 0 ? "text-danger" : warnings > 0 ? "text-warning" : allClean ? "text-emerald-400" : "text-muted"
        }`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${errors > 0 ? "text-danger" : warnings > 0 ? "text-warning" : allClean ? "text-emerald-400" : "text-white"}`}>
            {entries.length === 0
              ? "Aucune dépense à vérifier"
              : allClean
              ? "Tout est en ordre"
              : errors > 0
              ? `${errors} erreur${errors > 1 ? "s" : ""} à corriger`
              : `${warnings} avertissement${warnings > 1 ? "s" : ""}`}
          </p>
          {entries.length > 0 && (
            <p className="text-xs text-muted mt-0.5">
              {clean} OK · {errors} erreur{errors > 1 ? "s" : ""} · {warnings} avertissement{warnings > 1 ? "s" : ""} · {infos} info{infos > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button onClick={recheck} className="text-muted hover:text-white transition-colors" title="Relancer la vérification">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Résumé compteurs */}
      {entries.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: CheckCircle2, label: "OK",       count: clean,    color: "text-emerald-400" },
            { icon: AlertCircle,  label: "Erreurs",  count: errors,   color: "text-danger"     },
            { icon: AlertTriangle,label: "Alertes",  count: warnings, color: "text-warning"  },
            { icon: Info,         label: "Infos",    count: infos,    color: "text-info"    },
          ].map(({ icon: Icon, label, count, color }) => (
            <div key={label} className="glass-card rounded-xl p-2.5 flex flex-col items-center gap-1">
              <Icon className={`w-4 h-4 ${count > 0 ? color : "text-muted"}`} />
              <span className={`text-base font-bold ${count > 0 ? "text-white" : "text-muted"}`}>{count}</span>
              <span className="text-[9px] text-muted uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Liste des dépenses flaggées */}
      {flagged.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Dépenses à vérifier</p>
          {flagged.map(({ entry, topSeverity }) => (
            <div key={entry.id} className={`glass-card rounded-xl p-3 space-y-1.5 border ${
              topSeverity === "error" ? "border-red-500/30" : topSeverity === "warning" ? "border-orange-500/30" : "border-blue-500/20"
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-white">{entry.description}</p>
                  <p className="text-[10px] text-muted">{entry.date} · {entry.amountTTC.toFixed(2)} € TTC</p>
                </div>
                <span className={`text-[10px] font-semibold uppercase ${
                  topSeverity === "error" ? "text-danger" : topSeverity === "warning" ? "text-warning" : "text-info"
                }`}>
                  {topSeverity === "error" ? "erreur" : topSeverity === "warning" ? "alerte" : "info"}
                </span>
              </div>
              <div className="space-y-0.5">
                {entry.flags.map((f, i) => (
                  <p key={i} className={`text-[10px] ${
                    f.severity === "error" ? "text-danger" : f.severity === "warning" ? "text-warning" : "text-info"
                  }`}>
                    · {f.message}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-center text-muted text-sm py-6">Ajoute des dépenses pour que le bot les vérifie.</p>
      )}
    </div>
  );
}
