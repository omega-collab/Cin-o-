import type { LegalSector } from "./legalSources";

// ── Document chunk ────────────────────────────────────────────────────────────

export interface LegalDocumentChunk {
  id: string;
  sourceId: string;
  idcc: "2642" | "3097" | "commun";
  sector: LegalSector;
  title: string;
  article?: string;
  section?: string;
  subsection?: string;
  chunkText: string;
  plainText: string;
  keywords: string[];
  legalTags: LegalTag[];
  jobTitles?: string[];
  salaryData?: SalaryData[];
  sourceUrl: string;
  effectiveDate?: string;
  extensionStatus?: "etendu" | "non_etendu" | "en_vigueur" | "abroge" | "inconnu";
  lastCheckedAt: string;
}

export interface SalaryData {
  jobTitle: string;
  sector: LegalSector;
  idcc: "2642" | "3097";
  amountGross: number;
  currency: "EUR";
  period:
    | "hour"
    | "day_7h"
    | "day_8h"
    | "week_35h"
    | "week_39h"
    | "month_35h"
    | "month_39h"
    | "cachet"
    | "indemnite";
  effectiveDate?: string;
  notes?: string;
}

// ── Legal tags ────────────────────────────────────────────────────────────────

export type LegalTag =
  | "salaire"
  | "classification"
  | "camera"
  | "image"
  | "son"
  | "lumiere"
  | "regie"
  | "hmc"
  | "decor"
  | "montage"
  | "cddu"
  | "cdi"
  | "cdd"
  | "temps_travail"
  | "heures_sup"
  | "repos"
  | "nuit"
  | "repas"
  | "transport"
  | "deplacement"
  | "vhss"
  | "mineurs"
  | "prevention"
  | "champ_application"
  | "dom"
  | "fiction"
  | "flux"
  | "documentaire"
  | "captation"
  | "cinema"
  | "audiovisuel"
  | "publicite"
  | "animation"
  | "conges"
  | "formation"
  | "prevoyance"
  | "sante"
  | "intermittent"
  | "grille_salaire"
  | "indemnite";

// ── Synonyms ──────────────────────────────────────────────────────────────────

export const LEGAL_SYNONYMS: Record<string, string[]> = {
  // Caméra
  "troisième assistant caméra": [
    "3e assistant caméra", "3ème assistant caméra", "assistant caméra adjoint",
    "assistant opv adjoint", "assistant opérateur adjoint",
  ],
  "assistant opv adjoint": [
    "3e assistant caméra", "3ème assistant caméra", "deuxième assistant caméra",
    "assistant caméra adjoint",
  ],
  "assistant caméra": [
    "assistant opérateur", "assistant opv", "assistant opérateur cinéma",
    "assistant caméra audiovisuel", "premier assistant caméra", "deuxième assistant caméra",
  ],
  "premier assistant caméra": [
    "1er assistant caméra", "1er assistant opérateur", "premier assistant opérateur",
    "1er assistant opv", "first ac",
  ],
  "deuxième assistant caméra": [
    "2e assistant caméra", "2ème assistant caméra", "2e assistant opérateur",
    "deuxième assistant opérateur", "second ac", "clapper loader",
  ],
  "chef opérateur": [
    "directeur de la photographie", "dop", "chef op",
    "opérateur de prises de vues", "director of photography", "dp",
  ],
  "opérateur de prises de vues": [
    "opv", "cadreur", "camera operator", "chef opérateur",
  ],
  "cadreur": [
    "opérateur de prises de vues", "opv", "camera operator",
  ],
  "vidéo assist": [
    "technicien retour image", "retour image", "assistant vidéo",
    "video assist", "dit adjacent",
  ],
  "technicien retour image": [
    "vidéo assist", "retour image", "assistant vidéo", "video assist",
  ],
  // Salaire
  "salaire": [
    "minimum conventionnel", "minima", "rémunération", "salaire brut",
    "grille salaire", "cachet", "salaire minimum",
  ],
  "salaire minimum": [
    "minimum garanti", "mg", "minimum conventionnel", "minima",
    "plancher salarial",
  ],
  // Repas
  "repas": [
    "indemnité repas", "casse-croûte", "défraiement repas",
    "panier repas", "indemnité de repas",
  ],
  "casse-croûte": [
    "indemnité casse-croûte", "panier casse-croûte",
  ],
  // Contrats
  "contrat intermittent": [
    "cddu", "contrat à durée déterminée d'usage",
    "contrat d'usage", "intermittent du spectacle",
  ],
  "cddu": [
    "contrat à durée déterminée d'usage", "contrat d'usage",
    "intermittent", "cdd usage",
  ],
  // Temps de travail
  "heures supplémentaires": [
    "heures sup", "heure sup", "majoration heures",
    "dépassement horaire",
  ],
  "travail de nuit": [
    "heure de nuit", "majoration nuit", "nuit",
  ],
  // Conventions
  "sfact": [
    "iatse", "convention cinéma", "idcc 3097",
  ],
  "ccpap": [
    "convention audiovisuelle", "idcc 2642",
  ],
};

// ── Tag helpers ───────────────────────────────────────────────────────────────

export function expandQuery(query: string): string[] {
  const normalized = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const terms = new Set<string>([normalized]);

  for (const [canonical, synonyms] of Object.entries(LEGAL_SYNONYMS)) {
    const normCanonical = canonical.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (normalized.includes(normCanonical)) {
      synonyms.forEach((s) => terms.add(s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")));
    }
    for (const syn of synonyms) {
      const normSyn = syn.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (normalized.includes(normSyn)) {
        terms.add(normCanonical);
        synonyms.forEach((s) => terms.add(s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")));
      }
    }
  }

  return Array.from(terms);
}
