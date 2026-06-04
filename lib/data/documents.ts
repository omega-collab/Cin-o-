export type DocCategory = "planning" | "scenario" | "administration" | "templates";

export interface DocRestriction {
  code: string;
  expiresAt?: string; // ISO date — omis = accès illimité après déverrouillage
}

export interface DocEntry {
  id: string;
  label: string;
  filename: string;             // nom exact dans /public/matrices/
  category: DocCategory;
  description: string;
  type: "pdf" | "xls" | "doc" | "docx";
  dateDoc?: string;             // date lisible (affichage uniquement)
  restricted?: DocRestriction;
}

export const DOCUMENTS: DocEntry[] = [
  // ── Planning ─────────────────────────────────────────────────────────────
  {
    id: "board-v2",
    label: "Board — Tableau de répartition v2.1",
    filename: "Board V2.1.pdf",
    category: "planning",
    description: "Tableau de répartition des séquences — Tropiques Criminels Saison 8",
    type: "pdf",
  },
  {
    id: "depouil-general",
    label: "Dépouillement général v2.1",
    filename: "Dép. Général PDT V2.1.pdf",
    category: "planning",
    description: "Dépouillement complet du scénario Saison 8",
    type: "pdf",
  },
  {
    id: "pdt-1p",
    label: "Plan de tournage S8 v2.1 — 1 page",
    filename: "PDT 2.1 TCS8 (1p).pdf",
    category: "planning",
    description: "Plan de tournage Saison 8, vue condensée (1 page)",
    type: "pdf",
  },
  {
    id: "pdt-4p",
    label: "Plan de tournage S8 v2.1 — 4 pages",
    filename: "PDT 2.1 TCS8 (4p).pdf",
    category: "planning",
    description: "Plan de tournage Saison 8, vue détaillée (4 pages)",
    type: "pdf",
  },

  // ── Scénarios / Continuités ───────────────────────────────────────────────
  {
    id: "cdv-s08e01",
    label: "S08 E01 — Continuité Définitive",
    filename: "TC S08 E01 CDV Def 200526.pdf",
    category: "scenario",
    description: "Continuité dialoguée-visuelle épisode 1 — version définitive",
    type: "pdf",
    dateDoc: "20/05/2026",
  },
  {
    id: "cdv-s08e02",
    label: "S08 E02 — Continuité Définitive",
    filename: "TC S08 E02 CDV Def 200526.pdf",
    category: "scenario",
    description: "Continuité dialoguée-visuelle épisode 2 — version définitive",
    type: "pdf",
    dateDoc: "20/05/2026",
  },
  {
    id: "cdv-s08e03",
    label: "S08 E03 — Continuité v5",
    filename: "TC8 EP03 CDV5 19.05.26.pdf",
    category: "scenario",
    description: "Continuité dialoguée-visuelle épisode 3 — version 5",
    type: "pdf",
    dateDoc: "19/05/2026",
  },
  {
    id: "cdv-s08e04",
    label: "S08 E04 — Continuité v4",
    filename: "TC8 EP04 CDV4 19.05.26.pdf",
    category: "scenario",
    description: "Continuité dialoguée-visuelle épisode 4 — version 4",
    type: "pdf",
    dateDoc: "19/05/2026",
  },

  // ── Administration ────────────────────────────────────────────────────────
  {
    id: "note-admin",
    label: "Note de l'Administration",
    filename: "NOTE de l'ADMINISTRATION.pdf",
    category: "administration",
    description: "Informations et instructions de l'Administration de production",
    type: "pdf",
  },
  {
    id: "matrice-frais",
    label: "Matrice notes de frais — Fédération Studio",
    filename: "MATRICE NOTE de FRAIS LB.xls",
    category: "administration",
    description: "Matrice officielle de relevé de dépenses (Lydia Bareille) — à remettre chaque semaine",
    type: "xls",
  },

  // ── Modèles / Templates ───────────────────────────────────────────────────
  {
    id: "fdr-comedien",
    label: "Feuille de route Comédien (vierge)",
    filename: "FDR COMÉDIEN VIERGE.doc",
    category: "templates",
    description: "Modèle vierge de feuille de route à compléter pour les comédiens",
    type: "doc",
  },
  {
    id: "attestation-vente",
    label: "Attestation vente déco-régie (<1 000 €)",
    filename: "TC8_Attestation vente déco-régie pour tout achat de moins de 1.000 €.docx",
    category: "templates",
    description: "Formulaire d'attestation pour cession de matériel déco/régie en dessous de 1 000 €",
    type: "docx",
  },
];

export const DOC_CATEGORIES: { id: DocCategory | "all"; label: string }[] = [
  { id: "all",            label: "Tous" },
  { id: "planning",       label: "Planning" },
  { id: "scenario",       label: "Scénarios" },
  { id: "administration", label: "Admin" },
  { id: "templates",      label: "Modèles" },
];

export function catLabel(cat: DocCategory): string {
  const m: Record<DocCategory, string> = {
    planning: "Planning", scenario: "Scénario",
    administration: "Admin", templates: "Modèle",
  };
  return m[cat];
}

export function catColor(cat: DocCategory): string {
  const m: Record<DocCategory, string> = {
    planning:       "text-amber-400 bg-amber-400/10",
    scenario:       "text-cyan bg-cyan/10",
    administration: "text-info bg-info/10",
    templates:      "text-warning bg-warning/10",
  };
  return m[cat];
}

// ── Code admin ────────────────────────────────────────────────────────────────
export const ADMIN_CODE = process.env.NEXT_PUBLIC_DEFAULT_DEPT_CODE ?? "PROD";

// ── Documents personnalisés (localStorage) ────────────────────────────────────
const CUSTOM_KEY = "cino_custom_docs";

export function getCustomDocs(): DocEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch { return []; }
}

export function upsertCustomDoc(doc: DocEntry): void {
  const list = getCustomDocs();
  const idx  = list.findIndex((d) => d.id === doc.id);
  if (idx >= 0) list[idx] = doc; else list.push(doc);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

export function deleteCustomDoc(id: string): void {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(getCustomDocs().filter((d) => d.id !== id)));
}

export function extToType(filename: string): DocEntry["type"] {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "xls" || ext === "xlsx") return "xls";
  if (ext === "docx") return "docx";
  if (ext === "doc")  return "doc";
  return "pdf";
}
