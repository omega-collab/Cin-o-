"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Store local du pointage en cours (coupure déjeuner uniquement).
// Pas sync Supabase : c'est un compteur perso qui se reset à minuit
// ou quand l'utilisateur clique "Fin de journée". L'horodatage final
// est consolidé dans useIntermittentStore au moment du clic "Fin de
// journée" (voir EndOfDayCard).

export interface ShiftPointage {
  // Date YYYY-MM-DD du pointage en cours. Utilisé pour reset auto si
  // l'utilisateur ré-ouvre l'app le lendemain sans avoir cliqué "Fin
  // de journée" la veille.
  date: string;
  lunchStart?: string;  // HH:MM
  lunchEnd?: string;    // HH:MM
}

interface ShiftPointageState {
  pointage: ShiftPointage | null;
  startLunch: () => void;
  endLunch: () => void;
  reset: () => void;
  // Reset si la date stockée n'est plus aujourd'hui. À appeler au
  // mount du composant qui affiche le pointage.
  ensureToday: () => void;
}

function nowHHMM(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export const useShiftPointageStore = create<ShiftPointageState>()(
  persist(
    (set, get) => ({
      pointage: null,

      startLunch: () =>
        set(() => {
          const today = todayISO();
          const time = nowHHMM();
          return { pointage: { date: today, lunchStart: time } };
        }),

      endLunch: () =>
        set((s) => {
          const today = todayISO();
          // Si pas de lunchStart ou date périmée, on ignore — l'UX
          // n'autorise pas ce clic dans ces cas. Sécurité.
          if (!s.pointage || s.pointage.date !== today || !s.pointage.lunchStart) {
            return s;
          }
          return {
            pointage: { ...s.pointage, lunchEnd: nowHHMM() },
          };
        }),

      reset: () => set({ pointage: null }),

      ensureToday: () => {
        const { pointage } = get();
        if (!pointage) return;
        if (pointage.date !== todayISO()) {
          set({ pointage: null });
        }
      },
    }),
    { name: "cin-o-shift-pointage-v1" }
  )
);
