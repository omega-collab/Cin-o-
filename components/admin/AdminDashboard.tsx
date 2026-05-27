"use client";

import { useState } from "react";
import Link from "next/link";
import { Radio, FileText, Users, AlertTriangle, MapPin, Calendar, RotateCcw, UtensilsCrossed, Copy, Check, ExternalLink } from "lucide-react";
import { useShootStore } from "@/lib/store/useShootStore";
import { useCanteenStore } from "@/lib/store/useCanteenStore";

export function AdminDashboard({ onTab }: { onTab: (t: string) => void }) {
  const { shoot, publish, unpublish, resetFull } = useShootStore();
  const menu = useCanteenStore((s) => s.menu);
  const resetMenu = useCanteenStore((s) => s.resetMenu);
  const [confirmReset, setConfirmReset] = useState(false);
  const [canteenLinkCopied, setCanteenLinkCopied] = useState(false);

  function copyCanteenLink() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/cantine`;
    void navigator.clipboard.writeText(url);
    setCanteenLinkCopied(true);
    setTimeout(() => setCanteenLinkCopied(false), 2000);
  }

  const isReady = shoot.extractionStatus === "done" || shoot.sequences.length > 0;

  function handleReset() {
    resetFull();
    resetMenu();
    setConfirmReset(false);
  }

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="glass-card-strong rounded-app p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">
              {shoot.projectTitle || "Aucune feuille chargée"}
            </h3>
            {shoot.series && <p className="text-xs text-muted mt-0.5">{shoot.series}</p>}
          </div>
          {shoot.projectTitle && (
            <button
              onClick={shoot.isPublished ? unpublish : publish}
              disabled={!isReady && !shoot.isPublished}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-30 ${
                shoot.isPublished ? "bg-cyanSoft text-cyan" : "glass-card text-muted"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {shoot.isPublished ? "En ligne" : "Hors ligne"}
            </button>
          )}
        </div>

        {shoot.projectTitle ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="glass-card rounded-xl p-2.5">
              <p className="text-muted mb-0.5">Jour de tournage</p>
              <p className="text-white font-semibold">J{shoot.shootingDay}{shoot.totalDays ? `/${shoot.totalDays}` : ""}</p>
            </div>
            <div className="glass-card rounded-xl p-2.5">
              <p className="text-muted mb-0.5">Call Time</p>
              <p className="text-cyan font-semibold font-mono">{shoot.callTime}</p>
            </div>
            <div className="glass-card rounded-xl p-2.5 col-span-2">
              <p className="text-muted mb-0.5">Lieu</p>
              <p className="text-white font-medium break-words">{shoot.location}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted italic">
            Importez vos documents pour commencer.
          </p>
        )}
      </div>

      {/* Stats */}
      {shoot.projectTitle && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: FileText, label: "Séquences", value: shoot.sequences.length, tab: "review" },
            { icon: Users, label: "Comédiens", value: shoot.cast.length, tab: "review" },
            { icon: AlertTriangle, label: "Alertes", value: shoot.alerts.length, tab: "review" },
            { icon: MapPin, label: "Lieux", value: shoot.places.length, tab: "review" },
          ].map(({ icon: Icon, label, value, tab }) => (
            <button
              key={label}
              onClick={() => onTab(tab)}
              className="glass-card rounded-app p-3 text-left"
            >
              <Icon className="w-4 h-4 text-muted mb-2" />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Cantine — lien partageable + accès direct */}
      <div className="glass-card rounded-app p-4 space-y-3">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-cyan" />
          <span className="text-xs font-semibold text-textSoft uppercase tracking-widest">Cantine</span>
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          Le menu du jour est rempli par le staff cantine via le lien ci-dessous.
          Copie-le pour le partager (SMS, WhatsApp&hellip;), ou clique pour y accéder
          directement.
        </p>
        <div className="flex gap-2">
          <Link
            href="/cantine"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold active-pill"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ouvrir la cantine
          </Link>
          <button
            onClick={copyCanteenLink}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold glass-card text-textSoft"
            aria-label="Copier le lien de la cantine"
          >
            {canteenLinkCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                Copié
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier
              </>
            )}
          </button>
        </div>
        {(menu.starter || menu.main || menu.dessert) && (
          <div className="border-t border-stroke/40 pt-3 space-y-1">
            <p className="text-[10px] text-muted uppercase tracking-widest">Menu du jour</p>
            {menu.starter && <p className="text-xs text-textSoft truncate">Entrée : {menu.starter}</p>}
            {menu.main && <p className="text-xs text-textSoft truncate">Plat : {menu.main}</p>}
            {menu.dessert && <p className="text-xs text-textSoft truncate">Dessert : {menu.dessert}</p>}
          </div>
        )}
      </div>

      {/* Prochains jours */}
      {shoot.nextDays.length > 0 && (
        <div className="glass-card rounded-app p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-textSoft uppercase tracking-widest">Prochains jours</span>
          </div>
          <div className="space-y-2">
            {shoot.nextDays.map((d) => (
              <div key={d.date} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">J{d.shootingDay}</p>
                  {d.location && <p className="text-xs text-muted truncate max-w-[180px]">{d.location}</p>}
                </div>
                {d.callTime && <span className="font-mono text-xs text-cyan">{d.callTime}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => onTab("upload")}
          className="active-pill w-full py-3 rounded-2xl font-semibold text-sm"
        >
          Importer des documents
        </button>
        {shoot.projectTitle && !shoot.isPublished && (
          <button
            onClick={() => onTab("publish")}
            className="glass-card border-stroke text-textSoft w-full py-3 rounded-2xl text-sm font-medium"
          >
            Vérifier et publier
          </button>
        )}

        {/* Nouveau projet / reset */}
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-xs text-muted glass-card"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nouveau projet (tout effacer)
          </button>
        ) : (
          <div className="glass-card rounded-app p-4 space-y-3">
            <p className="text-sm text-white text-center font-medium">
              Supprimer toutes les données ?
            </p>
            <p className="text-xs text-muted text-center">
              La feuille, les séquences, le menu cantine — tout sera remis à zéro.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 rounded-xl glass-card text-sm text-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-xl bg-danger/20 text-danger border border-danger/30 text-sm font-semibold"
              >
                Tout effacer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
