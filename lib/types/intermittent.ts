export type ConventionType = "cinema" | "audiovisuel";

export interface WorkDay {
  id: string;
  date: string;         // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  lunchStart?: string; // HH:MM — début de pause repas
  lunchEnd?: string;   // HH:MM — fin de pause repas
  convention: ConventionType;
  notes?: string;
}

export interface ComputedDay {
  effectiveMinutes: number;    // durée travaillée nette (sans pause repas)
  heuresNormales: number;      // premières 8h
  heuresSup: number;           // au-delà de 8h effectives
  heuresAnticipees: number;    // avant 7h AM
  heuresDeNuit: number;        // après 22h PM
  lunchMinutes: number;        // durée de la pause repas
  isJourneeContinue: boolean;  // pause < 30 min
  coefficient: number;         // coefficient global de la journée (pour affichage)
}

export interface IntermittentSettings {
  convention: ConventionType;
  tauxJournalier: number;   // MG journalier brut en €
  tauxHoraire: number;      // taux horaire brut en €
  showSalaryPreview: boolean;
}

export const DEFAULT_SETTINGS: IntermittentSettings = {
  convention: "cinema",
  tauxJournalier: 280,
  tauxHoraire: 35,
  showSalaryPreview: false,
};
