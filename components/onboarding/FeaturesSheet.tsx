"use client";

import {
  Clapperboard,
  Timer,
  Scale,
  Package,
  Users,
  X,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Clapperboard,
    color: "#00E0D0",
    bg: "rgba(0,224,208,0.12)",
    title: "Feuille de service interactive",
    desc: "Importez ou saisissez votre feuille de service. Séquences, équipe, repas, météo, alertes — lisible en un coup d'œil sur le plateau.",
  },
  {
    Icon: Timer,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    title: "Suivi des heures",
    desc: "Enregistrez vos journées et obtenez le calcul automatique : heures de nuit, anticipées, journée continue — selon la convention SFACT ou CCPAP.",
  },
  {
    Icon: Scale,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    title: "Repères juridiques",
    desc: "FAQ interactive sur les droits des intermittents : seuil des 507h, allocations, majorations, formation AFDAS. Moteur de recherche intégré.",
  },
  {
    Icon: Package,
    color: "#fb923c",
    bg: "rgba(251,146,60,0.12)",
    title: "Gestion de stock & logistique",
    desc: "Suivez le matériel de chaque département en temps réel. Mouvements, niveaux de stock, historique complet et export CSV.",
  },
  {
    Icon: Users,
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    title: "Équipe synchronisée",
    desc: "Tous les membres du tournage voient la même information instantanément. Un projet, un code d'invitation, toute l'équipe connectée.",
  },
] as const;

interface FeaturesSheetProps {
  onClose?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  showClose?: boolean;
}

export function FeaturesSheet({
  onClose,
  onContinue,
  continueLabel = "Commencer",
  showClose = true,
}: FeaturesSheetProps) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#071018" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-6 pb-2 shrink-0">
        <div>
          <h2
            className="text-white font-bold leading-tight"
            style={{ fontSize: 22 }}
          >
            Tout-en-un pour le tournage
          </h2>
          <p className="text-sm mt-1" style={{ color: "#9FB3C8" }}>
            Cinq outils, une seule application.
          </p>
        </div>
        {showClose && onClose && (
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-white/10"
            style={{ color: "#9FB3C8", marginTop: 2 }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Feature list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {FEATURES.map(({ Icon, color, bg, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: bg }}
            >
              <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold leading-snug"
                style={{ color: "#F5F7FA", fontSize: 14 }}
              >
                {title}
              </p>
              <p
                className="mt-1 leading-relaxed"
                style={{ color: "#9FB3C8", fontSize: 12 }}
              >
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {onContinue && (
        <div className="px-5 pb-6 pt-3 shrink-0">
          <button
            onClick={onContinue}
            className="w-full font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{
              height: 52,
              borderRadius: 16,
              background: "#00E0D0",
              color: "#021414",
              fontSize: 15,
              boxShadow: "0 0 24px rgba(0,224,208,0.22)",
            }}
          >
            {continueLabel}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div style={{ height: "env(safe-area-inset-bottom, 8px)" }} />
    </div>
  );
}
