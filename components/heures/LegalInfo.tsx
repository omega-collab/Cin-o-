"use client";

import { useState, useMemo, useRef } from "react";
import {
  ChevronDown, ChevronRight, ExternalLink, AlertTriangle,
  Search, X, BookOpen, Scale, Clock, Shield, Euro, Users,
} from "lucide-react";
import { useIntermittentStore } from "@/lib/store/useIntermittentStore";
import { searchLegal, getChunksByIdcc } from "@/lib/data/legal/legalSearch";
import type { LegalDocumentChunk } from "@/lib/data/legal/legalCorpus";
import type { LegalTag } from "@/lib/data/legal/legalTypes";

// ── tag sections ──────────────────────────────────────────────────────────────

interface TagSection {
  title: string;
  Icon: React.ElementType;
  tags: LegalTag[];
  description: string;
}

const TAG_SECTIONS: TagSection[] = [
  {
    title: "Contrats et statut",
    Icon: Scale,
    tags: ["cddu", "cdi", "cdd", "intermittent", "champ_application"],
    description: "CDDU, CDI, CDD, régime intermittent",
  },
  {
    title: "Temps de travail",
    Icon: Clock,
    tags: ["temps_travail", "heures_sup", "nuit", "repos"],
    description: "Durée, heures sup, nuit, repos",
  },
  {
    title: "Salaires et indemnités",
    Icon: Euro,
    tags: ["salaire", "grille_salaire", "indemnite", "repas", "transport"],
    description: "Minima, grilles, repas, déplacements",
  },
  {
    title: "Métiers caméra / image",
    Icon: BookOpen,
    tags: ["camera", "image", "classification"],
    description: "Chef op, cadreur, 1er/2e/3e assistant, vidéo-assist",
  },
  {
    title: "Prévention et droits",
    Icon: Shield,
    tags: ["vhss", "mineurs", "prevention", "conges", "formation", "prevoyance", "sante"],
    description: "VHSS, mineurs, congés, AUDIENS",
  },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const terms = normalize(query).split(/\s+/).filter((t) => t.length >= 2);
  if (terms.length === 0) return <>{text}</>;

  const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
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

function SourceBadge({ chunk }: { chunk: LegalDocumentChunk }) {
  const label = chunk.idcc === "2642" ? "IDCC 2642 — Audiovisuel" : "IDCC 3097 — Cinéma";
  const color = chunk.idcc === "2642"
    ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
    : "border-cyan/30 bg-cyanSoft text-cyan";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  );
}

// ── chunk card ────────────────────────────────────────────────────────────────

function ChunkCard({ chunk, query }: { chunk: LegalDocumentChunk; query: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasArticle = chunk.article || chunk.section;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        className="w-full text-left p-4 space-y-2"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white leading-snug flex-1">
            <Highlight text={chunk.title} query={query} />
          </p>
          {expanded
            ? <ChevronDown className="w-4 h-4 text-muted shrink-0 mt-0.5" />
            : <ChevronRight className="w-4 h-4 text-muted shrink-0 mt-0.5" />}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge chunk={chunk} />
          {hasArticle && (
            <span className="text-[10px] text-muted">{chunk.article ?? chunk.section}</span>
          )}
          {chunk.effectiveDate && (
            <span className="text-[10px] text-muted">
              En vigueur : {chunk.effectiveDate.slice(0, 7).replace("-", "/")}
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-stroke/40 pt-3 space-y-3">
          <p className="text-xs text-textSoft leading-relaxed">
            <Highlight text={chunk.chunkText} query={query} />
          </p>

          {chunk.salaryData && chunk.salaryData.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                Données salariales
              </p>
              {chunk.salaryData.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-xs text-textSoft">{s.jobTitle}</span>
                  <span className="text-sm font-bold text-cyan">
                    {s.amountGross.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    <span className="text-[10px] text-muted font-normal ml-1">
                      /{s.period.replace("_", " ")}
                    </span>
                  </span>
                </div>
              ))}
              {chunk.salaryData[0]?.notes && (
                <p className="text-[10px] text-muted leading-relaxed">{chunk.salaryData[0].notes}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap gap-1">
              {chunk.legalTags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-muted border border-stroke/40"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted">
              <ExternalLink className="w-3 h-3" />
              <span>Légifrance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── tag section accordion ─────────────────────────────────────────────────────

function TagSectionAccordion({
  section,
  idcc,
}: {
  section: TagSection;
  idcc: "2642" | "3097";
}) {
  const [open, setOpen] = useState(false);
  const chunks = useMemo(
    () =>
      getChunksByIdcc(idcc).filter((c) =>
        section.tags.some((t) => c.legalTags.includes(t))
      ),
    [idcc, section.tags]
  );

  if (chunks.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <section.Icon className="w-4 h-4 text-muted shrink-0" />
          <div className="text-left min-w-0">
            <span className="text-sm font-semibold text-white">{section.title}</span>
            <p className="text-[10px] text-muted truncate">{section.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted">{chunks.length}</span>
          {open
            ? <ChevronDown className="w-4 h-4 text-muted" />
            : <ChevronRight className="w-4 h-4 text-muted" />}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-stroke/40 pt-2">
          {chunks.map((c) => (
            <ChunkCard key={c.id} chunk={c} query="" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── suggestions ───────────────────────────────────────────────────────────────

const SUGGESTIONS_2642 = [
  "majoration nuit audiovisuel",
  "CDDU catégorie B",
  "plancher salarial 2025",
  "assistant caméra",
  "indemnité repas",
  "VHSS harcèlement",
];

const SUGGESTIONS_3097 = [
  "majoration nuit cinéma",
  "Titre II salaires",
  "cadreur OPV",
  "1er assistant caméra",
  "repas casse-croûte 2026",
  "classifications 2026",
];

// ── main ──────────────────────────────────────────────────────────────────────

const LINKS = [
  { label: "Pôle Emploi — Intermittents",       url: "https://www.francetravail.fr/spectacle/spectacle--intermittents.html" },
  { label: "AFDAS — Formation",                  url: "https://www.afdas.com" },
  { label: "AUDIENS — Protection sociale",       url: "https://www.audiens.org" },
  { label: "Caisse des Congés Spectacles",       url: "https://www.conges-spectacles.fr" },
  { label: "Légifrance — Conventions",           url: "https://www.legifrance.gouv.fr/conv_coll/" },
  { label: "GUSO — Guichet unique",              url: "https://www.guso.fr" },
  { label: "Mon Compte Formation (CPF)",         url: "https://www.moncompteformation.gouv.fr" },
];

export function LegalInfo() {
  const { settings, updateSettings } = useIntermittentStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const idcc = settings.convention === "cinema" ? "3097" : "2642";
  const suggestions = settings.convention === "cinema" ? SUGGESTIONS_3097 : SUGGESTIONS_2642;

  const results = useMemo(
    () => (query.trim().length >= 2 ? searchLegal(query, { idcc, limit: 8 }) : []),
    [query, idcc]
  );

  const isSearching = query.trim().length >= 2;

  return (
    <div className="space-y-4">
      {/* Convention switcher */}
      <div className="grid grid-cols-2 gap-2">
        {(["cinema", "audiovisuel"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => updateSettings({ convention: c })}
            className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              settings.convention === c
                ? "border-cyan bg-cyanSoft text-cyan"
                : "border-stroke bg-white/5 text-textSoft"
            }`}
          >
            {c === "cinema" ? "Cinéma (SFACT)" : "Audiovisuel (CCPAP)"}
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-2xl p-3 flex items-start gap-2 border border-warning/20">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-textSoft leading-relaxed">
          Informations indicatives — source Légifrance. Ne remplace pas un conseil juridique.
          En cas de litige, consultez un syndicat ou un avocat spécialisé.
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

      {/* Suggestions */}
      {!isSearching && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
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
              ? "Aucun résultat — essayez d'autres termes."
              : `${results.length} résultat${results.length > 1 ? "s" : ""} pour « ${query} »`}
          </p>
          {results.map((r) => (
            <ChunkCard key={r.chunk.id} chunk={r.chunk} query={query} />
          ))}
        </div>
      )}

      {/* Browsable sections — hidden during search */}
      {!isSearching && (
        <>
          {TAG_SECTIONS.map((s) => (
            <TagSectionAccordion key={s.title} section={s} idcc={idcc} />
          ))}

          {/* Liens officiels */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Sources officielles
            </h3>
            <div className="space-y-1.5">
              {LINKS.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl px-4 py-2.5 flex items-center justify-between min-h-[44px] transition-opacity hover:opacity-80"
                >
                  <span className="text-sm text-textSoft">{label}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan shrink-0" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted text-center pt-1">
              Liens officiels — s&apos;ouvrent dans un nouvel onglet.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
