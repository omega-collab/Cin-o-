"use client";

import { useState } from "react";
import { CheckCircle2, Radio, AlertTriangle, MapPin, Clock3, Utensils, Film, History } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";

export function AdminPublishPanel({ onDone }: { onDone: () => void }) {
  const { shoot, publish, unpublish, resetToMock } = useShootStore();
  const [confirmed, setConfirmed] = useState(false);

  function handlePublish() {
    publish();
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onDone();
    }, 1500);
  }

  const hasContent = shoot.projectTitle && shoot.sequences.length > 0;

  return (
    <div className="space-y-4">
      {/* Preview card */}
      <div className="glass-card-strong rounded-app p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan" />
          <span className="text-xs font-semibold text-textSoft uppercase tracking-wider">Aperçu de la feuille</span>
        </div>

        {hasContent ? (
          <>
            <div>
              <h3 className="text-lg font-bold text-white">{shoot.projectTitle}</h3>
              {shoot.series && <p className="text-xs text-muted">{shoot.series}</p>}
              <p className="text-sm text-cyan font-semibold mt-1">
                Jour {shoot.shootingDay}{shoot.totalDays ? `/${shoot.totalDays}` : ""} — {shoot.date}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 glass-card rounded-xl p-2.5">
                <Clock3 className="w-3.5 h-3.5 text-muted" />
                <div>
                  <p className="text-muted">Call</p>
                  <p className="text-cyan font-mono font-bold">{shoot.callTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 glass-card rounded-xl p-2.5">
                <Utensils className="w-3.5 h-3.5 text-muted" />
                <div>
                  <p className="text-muted">Repas</p>
                  <p className="text-cyan font-mono font-bold">{shoot.mealTime}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
              <p className="text-sm text-textSoft">{shoot.location}</p>
            </div>

            <div>
              <p className="text-xs text-muted mb-2">{shoot.sequences.length} séquence(s) · {shoot.cast.length} comédien(s) · {shoot.alerts.length} alerte(s)</p>
              <div className="space-y-1">
                {shoot.sequences.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex gap-2 items-center text-xs">
                    <span className="font-mono text-cyan w-10 shrink-0">{s.time}</span>
                    <span className="text-textSoft truncate">{s.label}</span>
                  </div>
                ))}
                {shoot.sequences.length > 3 && (
                  <p className="text-xs text-muted pl-12">+{shoot.sequences.length - 3} autres…</p>
                )}
              </div>
            </div>

            {shoot.alerts.filter((a) => a.severity === "critical").length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-danger/10 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
                <p className="text-xs text-danger">
                  {shoot.alerts.filter((a) => a.severity === "critical").length} alerte(s) critique(s)
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted text-sm italic">Aucun contenu à publier.</p>
            <p className="text-xs text-muted mt-1">Importez et configurez une feuille d'abord.</p>
          </div>
        )}
      </div>

      {/* Current status */}
      <div className="glass-card rounded-app p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${shoot.isPublished ? "text-cyan" : "text-muted"}`} />
          <span className="text-sm text-white">
            {shoot.isPublished ? "Feuille en ligne" : "Feuille hors ligne"}
          </span>
        </div>
        {shoot.isPublished && (
          <button
            onClick={() => { unpublish(); onDone(); }}
            className="text-xs text-muted glass-card px-3 py-1.5 rounded-full"
          >
            Dépublier
          </button>
        )}
      </div>

      {/* Audit log preview */}
      {shoot.auditLog.length > 0 && (
        <div className="glass-card rounded-app p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-textSoft uppercase tracking-wider">Journal des modifications</span>
          </div>
          <div className="space-y-1.5">
            {[...shoot.auditLog].reverse().slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 text-xs">
                <span className="text-muted font-mono shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-textSoft">{entry.action}</span>
                {entry.details && <span className="text-muted truncate">· {entry.details}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {!shoot.isPublished && (
          <button
            onClick={handlePublish}
            disabled={!hasContent || confirmed}
            className={`active-pill w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-30 transition-opacity ${confirmed ? "opacity-60" : ""}`}
          >
            {confirmed ? (
              <><CheckCircle2 className="w-4 h-4" /> Publié !</>
            ) : (
              <><Radio className="w-4 h-4" /> Publier la feuille du jour</>
            )}
          </button>
        )}

        <button
          onClick={resetToMock}
          className="glass-card border-stroke text-muted w-full py-2.5 rounded-2xl text-sm font-medium"
        >
          Charger les données démo (J34)
        </button>
      </div>
    </div>
  );
}
