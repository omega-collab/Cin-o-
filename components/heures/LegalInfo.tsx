"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronDown, ChevronRight, ExternalLink, AlertTriangle, Search, X } from "lucide-react";

interface QA { q: string; a: string }
interface Section { title: string; icon: string; content: QA[] }

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
      {
        q: "Qu'est-ce que le SJR (Salaire Journalier de Référence) ?",
        a: "Le SJR est calculé par Pôle Emploi en divisant la totalité de vos salaires bruts des 12 derniers mois par le nombre de jours de la période. Il détermine le montant de votre allocation journalière (AJ).",
      },
      {
        q: "Que se passe-t-il si je n'atteins pas les 507 heures ?",
        a: "Vous perdez le bénéfice du régime spécifique des intermittents. Vous pouvez basculer sur le régime général de l'assurance chômage si vous totalisez 130 jours ou 910 heures travaillées sur 24 mois.",
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
      {
        q: "Comment sont catégorisés les techniciens ?",
        a: "Les conventions définissent des groupes de qualification (I à IV ou équivalents) selon les responsabilités. Chef de poste, 1er assistant, 2e assistant, technicien… Chaque groupe a un MG et un taux horaire plancher différent.",
      },
      {
        q: "Qu'est-ce qu'un cachet ?",
        a: "Un cachet est une rémunération forfaitaire journalière. Il est utilisé pour les artistes interprètes et certains techniciens. Il doit être au moins égal au MG conventionnel. La durée de travail du jour est présumée, sans décompte heure par heure.",
      },
    ],
  },
  {
    title: "Majorations & calcul des heures",
    icon: "⏱️",
    content: [
      {
        q: "Qu'est-ce que la journée continue ?",
        a: "Une journée sans pause repas d'au moins 30 minutes. Elle ouvre droit à une majoration de 15% du salaire journalier. En cinéma comme en audiovisuel, cette majoration est automatique si la pause n'est pas respectée.",
      },
      {
        q: "Quelles sont les heures de nuit ?",
        a: "Les heures réalisées entre 22h et 7h. Majoration de 25% en cinéma (SFACT), 50% en audiovisuel (CCPAP). Elles se cumulent avec les autres majorations (continue, supplémentaires).",
      },
      {
        q: "Qu'est-ce qu'une heure anticipée ?",
        a: "Heure réalisée avant 7h du matin. Majorée de 25% en général. Si le call time est avant 7h, les heures de prise de service jusqu'à 7h sont considérées anticipées.",
      },
      {
        q: "Combien d'heures supplémentaires peut-on faire ?",
        a: "Au-delà de 8 heures effectives travaillées, les heures sont majorées de 25%. Certaines conventions plafonnent le nombre d'heures supplémentaires par semaine (généralement 48h maximum). Au-delà, accord exprès requis.",
      },
      {
        q: "Comment sont décomptées les heures de tournage ?",
        a: "Le temps de travail effectif inclut le temps de présence sur le plateau, les préparations et rangements. La pause repas (≥ 30 min) n'est pas décomptée. Le transport entre deux décors dans la même journée est inclus.",
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
      {
        q: "Puis-je bénéficier du CPF en tant qu'intermittent ?",
        a: "Oui. Votre Compte Personnel de Formation est alimenté chaque année travaillée (500€/an, plafonné à 5 000€). L'AFDAS peut co-financer des formations métier au-delà du CPF. Consultez moncompteformation.gouv.fr.",
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
      {
        q: "Comment déclarer mon activité en fin de contrat ?",
        a: "Vous devez remettre à Pôle Emploi l'AEM (Attestation Employeur Mensuelle) que vous remet votre employeur à chaque fin de contrat. Cette attestation déclenche le rechargement ou l'ouverture de vos droits.",
      },
      {
        q: "Qu'est-ce que la présomption de salariat ?",
        a: "Tout artiste ou technicien exerçant pour une entreprise de spectacle est présumé salarié (article L7121-3 du Code du travail). La charge de la preuve de non-salariat repose sur l'employeur, pas sur vous.",
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
  { label: "Mon Compte Formation (CPF)", url: "https://www.moncompteformation.gouv.fr" },
];

// ── search helpers ────────────────────────────────────────────────────────────

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

interface SearchResult {
  sectionTitle: string;
  sectionIcon: string;
  q: string;
  a: string;
  score: number;
}

function searchQA(query: string): SearchResult[] {
  const terms = normalize(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];

  for (const section of SECTIONS) {
    for (const { q, a } of section.content) {
      const nq = normalize(q);
      const na = normalize(a);
      let score = 0;
      let anyMatch = false;

      for (const term of terms) {
        if (nq.includes(term)) { score += 3; anyMatch = true; }
        if (na.includes(term)) { score += 1; anyMatch = true; }
      }

      if (anyMatch) {
        results.push({ sectionTitle: section.title, sectionIcon: section.icon, q, a, score });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-cyan/25 text-cyan rounded px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

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

function ResultCard({ result, terms }: { result: SearchResult; terms: string[] }) {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{result.sectionIcon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          {result.sectionTitle}
        </span>
      </div>
      <p className="text-sm font-semibold text-white leading-snug">
        <Highlight text={result.q} terms={terms} />
      </p>
      <p className="text-xs text-textSoft leading-relaxed">
        <Highlight text={result.a} terms={terms} />
      </p>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "507 heures",
  "journée continue",
  "heure de nuit",
  "salaire minimum",
  "AFDAS formation",
  "carence Pôle Emploi",
];

export function LegalInfo() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const terms = useMemo(
    () =>
      normalize(query)
        .split(/\s+/)
        .filter((t) => t.length >= 2),
    [query]
  );

  const results = useMemo(() => (query.trim().length >= 2 ? searchQA(query) : []), [query]);
  const isSearching = query.trim().length >= 2;

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="glass-card rounded-2xl p-3 flex items-start gap-2 border border-orangeSoft/20">
        <AlertTriangle className="w-4 h-4 text-orangeSoft shrink-0 mt-0.5" />
        <p className="text-xs text-textSoft leading-relaxed">
          Ces informations sont indicatives et ne remplacent pas un conseil juridique personnalisé.
          En cas de litige, consultez un syndicat ou un avocat spécialisé en droit du travail.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez votre question juridique…"
          className="w-full bg-white/5 border border-stroke rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan/40"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-textSoft"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions rapides */}
      {!isSearching && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="glass-card px-3 py-1.5 rounded-full text-xs text-textSoft hover:text-cyan hover:border-cyan/30 border border-transparent transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Search results */}
      {isSearching && (
        <div className="space-y-3">
          <p className="text-xs text-muted">
            {results.length === 0
              ? "Aucun résultat — essayez d'autres mots-clés."
              : `${results.length} résultat${results.length > 1 ? "s" : ""} pour « ${query} »`}
          </p>
          {results.map((r) => (
            <ResultCard key={r.q} result={r} terms={terms} />
          ))}
        </div>
      )}

      {/* Full FAQ accordion — masqué pendant la recherche */}
      {!isSearching && (
        <>
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
        </>
      )}
    </div>
  );
}
