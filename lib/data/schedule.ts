import type { ScheduleSequence, AlertItem } from "@/lib/types";

export const TODAY_SCHEDULE: ScheduleSequence[] = [
  {
    id: "seq1",
    time: "07:30",
    location: "Ext. Rue de la Paix — Paris 1er",
    description: "Scène 12A — Arrivée personnage principal",
    cast: ["Marie Dupont (Rôle 1)", "Jean Martin (Rôle 2)"],
    crew: ["Caméra A", "Son", "Électro"],
    notes: "Lumière naturelle, prévoir réflecteur",
    period: "morning",
  },
  {
    id: "seq2",
    time: "09:00",
    location: "Ext. Rue de la Paix — Paris 1er",
    description: "Scène 12B — Dialogue trottoir",
    cast: ["Marie Dupont (Rôle 1)", "Jean Martin (Rôle 2)"],
    crew: ["Caméra A", "Caméra B", "Son", "Électro"],
    notes: "Plan large puis serré",
    period: "morning",
  },
  {
    id: "seq3",
    time: "11:30",
    location: "Int. Café des Artistes",
    description: "Scène 15 — Rendez-vous secret",
    cast: ["Marie Dupont (Rôle 1)", "Sophie Bernard (Rôle 3)"],
    crew: ["Caméra A", "Son", "Électro", "Machino"],
    notes: "Dolly backward, check permis tournage",
    period: "morning",
  },
  {
    id: "seq4",
    time: "14:00",
    location: "Int. Café des Artistes",
    description: "Scène 16 — Suite dispute",
    cast: ["Marie Dupont (Rôle 1)", "Sophie Bernard (Rôle 3)", "Paul Leroy (Figurant)"],
    crew: ["Caméra A", "Son"],
    period: "afternoon",
  },
  {
    id: "seq5",
    time: "16:30",
    location: "Ext. Jardin des Tuileries",
    description: "Scène 20 — Réconciliation — Coucher de soleil",
    cast: ["Marie Dupont (Rôle 1)", "Jean Martin (Rôle 2)"],
    crew: ["Caméra A", "Caméra B", "Son", "Électro", "Machino", "HMC"],
    notes: "Golden hour — heure de tournage max",
    period: "afternoon",
  },
];

export const TODAY_ALERTS: AlertItem[] = [
  {
    id: "a1",
    severity: "warning",
    message: "Cartes CFexpress caméra : stock bas (2 restantes)",
    department: "camera",
    timestamp: new Date().toISOString(),
  },
  {
    id: "a2",
    severity: "info",
    message: "Permis tournage Jardin des Tuileries confirmé jusqu'à 19h30",
    timestamp: new Date().toISOString(),
  },
  {
    id: "a3",
    severity: "warning",
    message: "Piles AA son : stock bas",
    department: "son",
    timestamp: new Date().toISOString(),
  },
];
