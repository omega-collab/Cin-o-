import type { DepartmentSlug } from "@/lib/types";

export interface RolePreset {
  tauxHoraireMin: number;
  tauxHoraireMax: number;
  tauxHoraireSuggere: number;  // valeur pré-remplie
  mgJournalier: number;
  convention: "cinema" | "audiovisuel" | "les deux";
  note?: string;
}

// Barèmes indicatifs 2024 — convention collective cinéma / audiovisuel (IDPF)
// Sources : grilles FO Spectacle, SPIAC-CGT, IATSE France (valeurs indicatives)
export const ROLE_PRESETS: Record<string, RolePreset> = {
  // ── Caméra ─────────────────────────────────────────────────────────────────
  "Chef opérateur":   { tauxHoraireMin: 55, tauxHoraireMax: 85, tauxHoraireSuggere: 65, mgJournalier: 480, convention: "cinema" },
  "1er AC":           { tauxHoraireMin: 35, tauxHoraireMax: 48, tauxHoraireSuggere: 40, mgJournalier: 320, convention: "cinema" },
  "2e AC":            { tauxHoraireMin: 27, tauxHoraireMax: 36, tauxHoraireSuggere: 30, mgJournalier: 250, convention: "cinema" },
  "3e AC":            { tauxHoraireMin: 22, tauxHoraireMax: 28, tauxHoraireSuggere: 24, mgJournalier: 200, convention: "cinema" },

  // ── Électro ────────────────────────────────────────────────────────────────
  "Chef électricien": { tauxHoraireMin: 35, tauxHoraireMax: 55, tauxHoraireSuggere: 42, mgJournalier: 320, convention: "cinema" },
  "Gaffer":           { tauxHoraireMin: 35, tauxHoraireMax: 55, tauxHoraireSuggere: 42, mgJournalier: 320, convention: "cinema" },
  "Électricien":      { tauxHoraireMin: 24, tauxHoraireMax: 35, tauxHoraireSuggere: 28, mgJournalier: 230, convention: "cinema" },

  // ── Machino ────────────────────────────────────────────────────────────────
  "Chef machiniste":  { tauxHoraireMin: 35, tauxHoraireMax: 50, tauxHoraireSuggere: 40, mgJournalier: 320, convention: "cinema" },
  "Machiniste":       { tauxHoraireMin: 24, tauxHoraireMax: 35, tauxHoraireSuggere: 28, mgJournalier: 230, convention: "cinema" },

  // ── Son ────────────────────────────────────────────────────────────────────
  "Ingénieur du son": { tauxHoraireMin: 45, tauxHoraireMax: 65, tauxHoraireSuggere: 52, mgJournalier: 400, convention: "cinema" },
  "Perchman":         { tauxHoraireMin: 30, tauxHoraireMax: 42, tauxHoraireSuggere: 35, mgJournalier: 280, convention: "cinema" },
  "Assistant son":    { tauxHoraireMin: 22, tauxHoraireMax: 30, tauxHoraireSuggere: 25, mgJournalier: 200, convention: "cinema" },

  // ── Régie ──────────────────────────────────────────────────────────────────
  "Régisseur général":   { tauxHoraireMin: 35, tauxHoraireMax: 52, tauxHoraireSuggere: 42, mgJournalier: 320, convention: "cinema" },
  "1er Ass. régie":      { tauxHoraireMin: 24, tauxHoraireMax: 35, tauxHoraireSuggere: 28, mgJournalier: 230, convention: "cinema" },
  "2e Ass. régie":       { tauxHoraireMin: 20, tauxHoraireMax: 28, tauxHoraireSuggere: 22, mgJournalier: 190, convention: "cinema" },

  // ── Déco ───────────────────────────────────────────────────────────────────
  "Chef décorateur":     { tauxHoraireMin: 50, tauxHoraireMax: 72, tauxHoraireSuggere: 58, mgJournalier: 450, convention: "cinema" },
  "Accessoiriste":       { tauxHoraireMin: 27, tauxHoraireMax: 38, tauxHoraireSuggere: 31, mgJournalier: 260, convention: "cinema" },
  "Régisseur plateau":   { tauxHoraireMin: 24, tauxHoraireMax: 35, tauxHoraireSuggere: 28, mgJournalier: 230, convention: "cinema" },

  // ── HMC ────────────────────────────────────────────────────────────────────
  "Chef maquilleur":     { tauxHoraireMin: 35, tauxHoraireMax: 52, tauxHoraireSuggere: 42, mgJournalier: 320, convention: "cinema" },
  "Maquilleur":          { tauxHoraireMin: 27, tauxHoraireMax: 38, tauxHoraireSuggere: 31, mgJournalier: 260, convention: "cinema" },
  "Coiffeur":            { tauxHoraireMin: 25, tauxHoraireMax: 35, tauxHoraireSuggere: 28, mgJournalier: 230, convention: "cinema" },

  // ── Production ─────────────────────────────────────────────────────────────
  "Directeur de prod.":  { tauxHoraireMin: 50, tauxHoraireMax: 72, tauxHoraireSuggere: 58, mgJournalier: 450, convention: "cinema" },
  "Secrétaire de prod.": { tauxHoraireMin: 24, tauxHoraireMax: 35, tauxHoraireSuggere: 28, mgJournalier: 230, convention: "cinema" },
  "Stagiaire":           { tauxHoraireMin: 12, tauxHoraireMax: 15, tauxHoraireSuggere: 13, mgJournalier: 100, convention: "les deux", note: "Gratification légale minimum" },

  // ── Cantine ────────────────────────────────────────────────────────────────
  "Cuisinier":           { tauxHoraireMin: 18, tauxHoraireMax: 28, tauxHoraireSuggere: 22, mgJournalier: 180, convention: "les deux" },
  "Aide-cuisinier":      { tauxHoraireMin: 14, tauxHoraireMax: 20, tauxHoraireSuggere: 16, mgJournalier: 150, convention: "les deux" },
};

// Barèmes par département pour la section indicative
export const DEPT_SCALES: Record<DepartmentSlug, { label: string; range: string }[]> = {
  camera:     [
    { label: "Chef opérateur", range: "55–85 €/h" },
    { label: "1er AC",         range: "35–48 €/h" },
    { label: "2e / 3e AC",     range: "22–36 €/h" },
  ],
  electro:    [
    { label: "Chef élec. / Gaffer", range: "35–55 €/h" },
    { label: "Électricien",         range: "24–35 €/h" },
  ],
  machino:    [
    { label: "Chef machiniste", range: "35–50 €/h" },
    { label: "Machiniste",      range: "24–35 €/h" },
  ],
  son:        [
    { label: "Ingénieur du son", range: "45–65 €/h" },
    { label: "Perchman",         range: "30–42 €/h" },
    { label: "Assistant son",    range: "22–30 €/h" },
  ],
  regie:      [
    { label: "Régisseur général", range: "35–52 €/h" },
    { label: "1er Ass. régie",    range: "24–35 €/h" },
    { label: "2e Ass. régie",     range: "20–28 €/h" },
  ],
  deco:       [
    { label: "Chef décorateur",  range: "50–72 €/h" },
    { label: "Accessoiriste",    range: "27–38 €/h" },
    { label: "Régie plateau",    range: "24–35 €/h" },
  ],
  hmc:        [
    { label: "Chef maquilleur", range: "35–52 €/h" },
    { label: "Maquilleur",      range: "27–38 €/h" },
    { label: "Coiffeur",        range: "25–35 €/h" },
  ],
  production: [
    { label: "Directeur de prod.", range: "50–72 €/h" },
    { label: "Secrétaire prod.",   range: "24–35 €/h" },
  ],
  cantine:    [
    { label: "Cuisinier",      range: "18–28 €/h" },
    { label: "Aide-cuisinier", range: "14–20 €/h" },
  ],
};
