import type { DepartmentSlug } from "@/lib/types";

export interface RolePreset {
  tauxHoraireMin: number;
  tauxHoraireMax: number;
  tauxHoraireSuggere: number;
  mgJournalier: number;
  convention: "cinema" | "audiovisuel" | "les deux";
  note?: string;
}

// Barèmes indicatifs 2024 — convention collective cinéma / audiovisuel (IDPF)
export const ROLE_PRESETS: Record<string, RolePreset> = {
  // ── Caméra ─────────────────────────────────────────────────────────────────
  "Directeur de la photographie": { tauxHoraireMin: 55, tauxHoraireMax: 90, tauxHoraireSuggere: 68, mgJournalier: 520, convention: "cinema" },
  "Cadreur":                      { tauxHoraireMin: 40, tauxHoraireMax: 58, tauxHoraireSuggere: 47, mgJournalier: 380, convention: "cinema" },
  "1er assistant caméra":         { tauxHoraireMin: 33, tauxHoraireMax: 46, tauxHoraireSuggere: 38, mgJournalier: 300, convention: "cinema" },
  "2e assistant caméra":          { tauxHoraireMin: 25, tauxHoraireMax: 35, tauxHoraireSuggere: 29, mgJournalier: 240, convention: "cinema" },
  "3e assistant caméra":          { tauxHoraireMin: 20, tauxHoraireMax: 27, tauxHoraireSuggere: 23, mgJournalier: 190, convention: "cinema" },
  "Stagiaire caméra":             { tauxHoraireMin: 12, tauxHoraireMax: 15, tauxHoraireSuggere: 13, mgJournalier: 100, convention: "cinema", note: "Gratification légale minimum" },

  // ── Électricité ────────────────────────────────────────────────────────────
  "Chef électricien":  { tauxHoraireMin: 35, tauxHoraireMax: 55, tauxHoraireSuggere: 42, mgJournalier: 320, convention: "cinema" },
  "Électricien":       { tauxHoraireMin: 22, tauxHoraireMax: 33, tauxHoraireSuggere: 26, mgJournalier: 220, convention: "cinema" },

  // ── Machinerie ─────────────────────────────────────────────────────────────
  "Chef machiniste":      { tauxHoraireMin: 35, tauxHoraireMax: 52, tauxHoraireSuggere: 40, mgJournalier: 310, convention: "cinema" },
  "Machiniste":           { tauxHoraireMin: 22, tauxHoraireMax: 33, tauxHoraireSuggere: 26, mgJournalier: 220, convention: "cinema" },
  "Opérateur Steadicam":  { tauxHoraireMin: 42, tauxHoraireMax: 65, tauxHoraireSuggere: 52, mgJournalier: 400, convention: "cinema", note: "Majoration matériel possible" },

  // ── Son ────────────────────────────────────────────────────────────────────
  "Ingénieur du son": { tauxHoraireMin: 45, tauxHoraireMax: 65, tauxHoraireSuggere: 52, mgJournalier: 400, convention: "cinema" },
  "Perchman":         { tauxHoraireMin: 28, tauxHoraireMax: 40, tauxHoraireSuggere: 33, mgJournalier: 270, convention: "cinema" },
  "Assistant son":    { tauxHoraireMin: 20, tauxHoraireMax: 28, tauxHoraireSuggere: 23, mgJournalier: 190, convention: "cinema" },

  // ── Régie / Mise en scène ──────────────────────────────────────────────────
  "1er assistant réalisateur": { tauxHoraireMin: 40, tauxHoraireMax: 60, tauxHoraireSuggere: 48, mgJournalier: 380, convention: "cinema" },
  "2e assistant réalisateur":  { tauxHoraireMin: 28, tauxHoraireMax: 40, tauxHoraireSuggere: 33, mgJournalier: 260, convention: "cinema" },
  "Régisseur général":         { tauxHoraireMin: 35, tauxHoraireMax: 52, tauxHoraireSuggere: 42, mgJournalier: 320, convention: "cinema" },
  "Régisseur adjoint":         { tauxHoraireMin: 25, tauxHoraireMax: 36, tauxHoraireSuggere: 29, mgJournalier: 240, convention: "cinema" },
  "Régisseur de plateau":      { tauxHoraireMin: 22, tauxHoraireMax: 32, tauxHoraireSuggere: 26, mgJournalier: 210, convention: "cinema" },
  "Runner":                    { tauxHoraireMin: 12, tauxHoraireMax: 18, tauxHoraireSuggere: 14, mgJournalier: 110, convention: "cinema", note: "Souvent en auto-entrepreneur" },

  // ── Décoration ─────────────────────────────────────────────────────────────
  "Chef décorateur":          { tauxHoraireMin: 50, tauxHoraireMax: 75, tauxHoraireSuggere: 58, mgJournalier: 450, convention: "cinema" },
  "Ensemblier":               { tauxHoraireMin: 30, tauxHoraireMax: 45, tauxHoraireSuggere: 35, mgJournalier: 280, convention: "cinema" },
  "Accessoiriste de plateau": { tauxHoraireMin: 26, tauxHoraireMax: 38, tauxHoraireSuggere: 30, mgJournalier: 250, convention: "cinema" },
  "Peintre décorateur":       { tauxHoraireMin: 22, tauxHoraireMax: 32, tauxHoraireSuggere: 26, mgJournalier: 220, convention: "cinema" },
  "Menuisier décorateur":     { tauxHoraireMin: 22, tauxHoraireMax: 32, tauxHoraireSuggere: 26, mgJournalier: 220, convention: "cinema" },

  // ── HMC (Habillage · Maquillage · Coiffure) ────────────────────────────────
  "Chef costumier":  { tauxHoraireMin: 33, tauxHoraireMax: 50, tauxHoraireSuggere: 40, mgJournalier: 310, convention: "cinema" },
  "Costumier":       { tauxHoraireMin: 24, tauxHoraireMax: 35, tauxHoraireSuggere: 28, mgJournalier: 230, convention: "cinema" },
  "Chef maquilleur": { tauxHoraireMin: 33, tauxHoraireMax: 52, tauxHoraireSuggere: 40, mgJournalier: 310, convention: "cinema" },
  "Maquilleur":      { tauxHoraireMin: 25, tauxHoraireMax: 36, tauxHoraireSuggere: 29, mgJournalier: 240, convention: "cinema" },
  "Chef coiffeur":   { tauxHoraireMin: 30, tauxHoraireMax: 46, tauxHoraireSuggere: 36, mgJournalier: 280, convention: "cinema" },
  "Coiffeur":        { tauxHoraireMin: 23, tauxHoraireMax: 33, tauxHoraireSuggere: 27, mgJournalier: 220, convention: "cinema" },

  // ── Production ─────────────────────────────────────────────────────────────
  "Directeur de production":  { tauxHoraireMin: 50, tauxHoraireMax: 75, tauxHoraireSuggere: 60, mgJournalier: 460, convention: "cinema" },
  "Chargé de production":     { tauxHoraireMin: 28, tauxHoraireMax: 42, tauxHoraireSuggere: 33, mgJournalier: 270, convention: "cinema" },
  "Scripte":                  { tauxHoraireMin: 33, tauxHoraireMax: 48, tauxHoraireSuggere: 38, mgJournalier: 300, convention: "cinema" },
  "Secrétaire de production": { tauxHoraireMin: 22, tauxHoraireMax: 32, tauxHoraireSuggere: 26, mgJournalier: 210, convention: "cinema" },
  "Stagiaire":                { tauxHoraireMin: 12, tauxHoraireMax: 15, tauxHoraireSuggere: 13, mgJournalier: 100, convention: "les deux", note: "Gratification légale minimum" },

  // ── Mise en scène ──────────────────────────────────────────────────────────
  "Réalisateur":                { tauxHoraireMin: 80, tauxHoraireMax: 200, tauxHoraireSuggere: 110, mgJournalier: 800, convention: "cinema", note: "Variable selon notoriété et budget production" },
  "Réalisatrice":               { tauxHoraireMin: 80, tauxHoraireMax: 200, tauxHoraireSuggere: 110, mgJournalier: 800, convention: "cinema", note: "Variable selon notoriété et budget production" },
  "Stagiaire mise en scène":    { tauxHoraireMin: 12, tauxHoraireMax: 15,  tauxHoraireSuggere: 13,  mgJournalier: 100, convention: "cinema", note: "Gratification légale minimum" },

  // ── Cantine ────────────────────────────────────────────────────────────────
  "Traiteur de plateau": { tauxHoraireMin: 22, tauxHoraireMax: 32, tauxHoraireSuggere: 26, mgJournalier: 210, convention: "les deux" },
  "Cuisinier":           { tauxHoraireMin: 16, tauxHoraireMax: 25, tauxHoraireSuggere: 19, mgJournalier: 160, convention: "les deux" },
  "Aide-cuisinier":      { tauxHoraireMin: 13, tauxHoraireMax: 18, tauxHoraireSuggere: 15, mgJournalier: 130, convention: "les deux" },
};

// Barèmes par département pour la section indicative dans SalarySettings
export const DEPT_SCALES: Record<DepartmentSlug, { label: string; range: string }[]> = {
  camera: [
    { label: "Directeur de la photographie", range: "55–90 €/h" },
    { label: "Cadreur",                      range: "40–58 €/h" },
    { label: "1er assistant caméra",         range: "33–46 €/h" },
    { label: "2e assistant caméra",          range: "25–35 €/h" },
    { label: "3e assistant caméra",          range: "20–27 €/h" },
  ],
  electro: [
    { label: "Chef électricien", range: "35–55 €/h" },
    { label: "Électricien",      range: "22–33 €/h" },
  ],
  machino: [
    { label: "Chef machiniste",     range: "35–52 €/h" },
    { label: "Machiniste",          range: "22–33 €/h" },
    { label: "Opérateur Steadicam", range: "42–65 €/h" },
  ],
  son: [
    { label: "Ingénieur du son", range: "45–65 €/h" },
    { label: "Perchman",         range: "28–40 €/h" },
    { label: "Assistant son",    range: "20–28 €/h" },
  ],
  regie: [
    { label: "1er assistant réalisateur", range: "40–60 €/h" },
    { label: "2e assistant réalisateur",  range: "28–40 €/h" },
    { label: "Régisseur général",         range: "35–52 €/h" },
    { label: "Régisseur adjoint",         range: "25–36 €/h" },
    { label: "Régisseur de plateau",      range: "22–32 €/h" },
  ],
  deco: [
    { label: "Chef décorateur",          range: "50–75 €/h" },
    { label: "Ensemblier",               range: "30–45 €/h" },
    { label: "Accessoiriste de plateau", range: "26–38 €/h" },
    { label: "Peintre / Menuisier déco", range: "22–32 €/h" },
  ],
  hmc: [
    { label: "Chef costumier",  range: "33–50 €/h" },
    { label: "Costumier",       range: "24–35 €/h" },
    { label: "Chef maquilleur", range: "33–52 €/h" },
    { label: "Maquilleur",      range: "25–36 €/h" },
    { label: "Chef coiffeur",   range: "30–46 €/h" },
    { label: "Coiffeur",        range: "23–33 €/h" },
  ],
  production: [
    { label: "Directeur de production",  range: "50–75 €/h" },
    { label: "Chargé de production",     range: "28–42 €/h" },
    { label: "Scripte",                  range: "33–48 €/h" },
    { label: "Secrétaire de production", range: "22–32 €/h" },
  ],
  cantine: [
    { label: "Traiteur de plateau", range: "22–32 €/h" },
    { label: "Cuisinier",           range: "16–25 €/h" },
    { label: "Aide-cuisinier",      range: "13–18 €/h" },
  ],
  direction: [
    { label: "Réalisateur/trice",         range: "80–200 €/h" },
    { label: "1er assistant réalisateur", range: "40–60 €/h"  },
    { label: "2e assistant réalisateur",  range: "28–40 €/h"  },
  ],
};
