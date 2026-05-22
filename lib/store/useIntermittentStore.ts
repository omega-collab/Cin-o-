"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkDay, IntermittentSettings } from "@/lib/types/intermittent";
import { DEFAULT_SETTINGS } from "@/lib/types/intermittent";

interface IntermittentState {
  workDays: WorkDay[];
  settings: IntermittentSettings;

  addWorkDay: (day: Omit<WorkDay, "id">) => void;
  updateWorkDay: (id: string, patch: Partial<Omit<WorkDay, "id">>) => void;
  deleteWorkDay: (id: string) => void;
  updateSettings: (patch: Partial<IntermittentSettings>) => void;
  reset: () => void;
}

export const useIntermittentStore = create<IntermittentState>()(
  persist(
    (set) => ({
      workDays: [],
      settings: DEFAULT_SETTINGS,

      addWorkDay: (day) =>
        set((s) => {
          if (s.workDays.some((d) => d.date === day.date)) return s;
          return {
            workDays: [
              { ...day, id: crypto.randomUUID() },
              ...s.workDays,
            ].sort((a, b) => b.date.localeCompare(a.date)),
          };
        }),

      updateWorkDay: (id, patch) =>
        set((s) => ({
          workDays: s.workDays.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),

      deleteWorkDay: (id) =>
        set((s) => ({ workDays: s.workDays.filter((d) => d.id !== id) })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      reset: () => set({ workDays: [], settings: DEFAULT_SETTINGS }),
    }),
    { name: "cin-o-intermittent", version: 1 }
  )
);
