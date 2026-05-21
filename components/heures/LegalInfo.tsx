"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, AlertTriangle } from "lucide-react";

interface Section {
  title: string;
  icon: string;
  content: { q: string; a: string }[];
}

const SECTIONS: Section[] = [
  {
    title: "Conditions d'accès aux allocations",
    icon: "📋",
    content: [
      {
        q: "Combien d'heures faut-il pour ouvrir des droits ?",
        a: "507 heures de travail dans le spectacle sur les 12 derniers mois (10 mois pour les moins de 50 ans avant 2023). Ces heures doivent être déclarées sous les codes NAF du secteur (cinéma, audiovisuel, spectacle vivant).",
      },
      {
        q: "Quelle est la durée d'indemnisation ?",
        a: "Jusqu'à 243 jours (8 mois) d'allocations. Le calcul est basé sur votre Salaire Journalier de Référence (SJR) établi par Pôle Emploi à partir de vos salaires des 12 derniers mois.",
      },
      {
        q: "Puis-je travailler et être indemnisé en même temps ?",
        a: "Oui — c'est le principe de l'intermittent. Chaque heure travaillée déclarée ouvre de nouveaux droits et vient compléter les allocations. Le régime est dit « à droits rechargeables ».",
      },
    ],
  },
  {
    title: "Conventions collectives",
    icon: "📜",
    content: [
      {
        q: "Quelle convention pour le cinéma ?",
        a: "La Convention Collective Nationale des Techniciens de la Production Cinématographique (SFACT / IATSE). Elle définit les catégories, grilles de salaires, MG (minimum garanti), majorations. Disponible sur legifrance.gouv.fr.",
      },
      {
        q: "Quelle convention pour l'audiovisuel ?",
        a: "La Convention Collective de la Production Audiovisuelle (CCPAP) régit la télévision, les fictions TV, la publicité et le documentaire. Les majorations de nuit y sont plus importantes (50% vs 25% cinéma).",
      },
      {
        q: "Qu'est-ce que le MG (Minimum Garanti) ?",
        a: "Le Minimum Garanti est le plancher salarial par journée de tournage défini par convention. Votre cachet ou salaire journalier ne peut pas être inférieur à ce montant, quel que soit votre accord avec la production.",
      },
    ],
  },
  {
    title: "Formation & droits annexes",
    icon: "🎓",
    content: [
      {
        q: "Comment accéder à la formation via l'AFDAS ?",
        a: "L'AFDAS (Fonds d'Assurance Formation) est votre OPCO si vous êtes technicien du spectacle. Vous disposez d'un Compte Personnel de Formation (CPF) et pouvez demander des financements spécifiques aux intermittents en période de carence ou entre deux contrats.",
      },
      {
        q: "Qu'est-ce que le CASC (Congés Spectacles) ?",
        a: "La Caisse des Congés Spectacles gère vos droits à congés payés. Elle collecte les cotisations auprès des employeurs et vous verse les congés payés auxquels vous avez droit. Inscrivez-vous sur caissedescongésspectemens.fr.",
      },
      {
        q: "Qu'est-ce qu'AUDIENS ?",
        a: "AUDIENS est le groupe de protection sociale dédié aux secteurs de la communication, des médias et de la culture. Il gère votre prévoyance, complémentaire santé et retraite complémentaire en tant qu'intermittent.",
      },
    ],
  },
  {
    title: "Gestion pratique",
    icon: "💼",
    content: [
      {
        q: "Qu'est-ce que le GUSO ?",
        a: "Le Guichet Unique du Spectacle Occasionnel (GUSO) simplifie les démarches pour les employeurs occasionnels. Si votre employeur est une association ou structure non-professionnelle, il peut recourir au GUSO pour vous déclarer légalement.",
      },
      {
        q: "Dois-je avoir un agent ?",
        a: "Non, ce n'est pas obligatoire. De nombreux techniciens gèrent leur carrière directement. Un agent peut être utile pour négocier des cachets, mais prend une commission (généralement 10-15%).",
      },
      {
        q: "Comment gérer ma carence Pôle Emploi ?",
        a: "Un délai de carence s'applique à l'ouverture de droits si vous avez reçu des indemnités compensatrices de congés payés ou de préavis. Déclarez chaque fin de contrat dans les 12 jours à Pôle Emploi pour éviter de perdre des droits.",
      },
      {
        q: "Que faire si un employeur refuse de payer le MG ?",
        a: "Vous pouvez saisir le Conseil de Prud'hommes. Conservez tous vos bulletins de paie et contrats. Des syndicats comme la CGT Spectacle ou la CFDT Culture peuvent vous accompagner gratuitement.",
      },
    ],
  },
];

const LINKS = [
  { label: "Pôle Emploi — Intermittents", url: "https://www.pole-emploi.fr/spectacle-et-culture" },
  { label: "AFDAS — Formation", url: "https://www.afdas.com" },
  { label: "AUDIENS — Protection sociale", url: "https://www.audiens.org" },
  { label: "Caisse des Congés Spectacles", url: "https://www.congesspectemens.fr" },
  { label: "Légifrance — Conventions", url: "https://www.legifrance.gouv.fr" },
  { label: "GUSO — Guichet unique", url: "https://www.guso.fr" },
];

function InfoSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{section.icon}</span>
          <span className="text-sm font-semibold text-white">{section.title}</span>
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-muted shrink-0" />
          : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-stroke/50 pt-3">
          {section.content.map(({ q, a }) => (
            <div key={q}>
              <p className="text-sm font-semibold text-white mb-1">{q}</p>
              <p className="text-xs text-textSoft leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LegalInfo() {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-3 flex items-start gap-2 border border-orangeSoft/20">
        <AlertTriangle className="w-4 h-4 text-orangeSoft shrink-0 mt-0.5" />
        <p className="text-xs text-textSoft leading-relaxed">
          Ces informations sont indicatives et ne remplacent pas un conseil juridique personnalisé.
          En cas de litige, consultez un syndicat ou un avocat spécialisé en droit du travail.
        </p>
      </div>

      {SECTIONS.map((s) => (
        <InfoSection key={s.title} section={s} />
      ))}

      {/* Liens utiles */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Liens officiels</h3>
        <div className="space-y-1.5">
          {LINKS.map(({ label }) => (
            <div
              key={label}
              className="glass-card rounded-xl px-4 py-2.5 flex items-center justify-between"
            >
              <span className="text-sm text-textSoft">{label}</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted shrink-0" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted text-center pt-1">
          Recherchez ces organismes sur votre navigateur pour accéder aux sites officiels.
        </p>
      </div>
    </div>
  );
}
