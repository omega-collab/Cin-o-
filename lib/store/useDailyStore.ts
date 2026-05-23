"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyShoot, DailySequence } from "@/lib/types";

const DEFAULT_SHOOT: DailyShoot = {
  date: "",
  projectTitle: "",
  shootingDay: 1,
  location: "",
  callTime: "07:00",
  mealTime: "12:30",
  sequences: [],
  isPublished: false,
};

interface DailyStore {
  shoot: DailyShoot;
  update: (patch: Partial<DailyShoot>) => void;
  setSequences: (sequences: DailySequence[]) => void;
  publish: () => void;
  unpublish: () => void;
  reset: () => void;
}

export const useDailyStore = create<DailyStore>()(
  persist(
    (set) => ({
      shoot: DEFAULT_SHOOT,
      update: (patch) =>
        set((s) => ({ shoot: { ...s.shoot, ...patch } })),
      setSequences: (sequences) =>
        set((s) => ({ shoot: { ...s.shoot, sequences } })),
      publish: () =>
        set((s) => ({ shoot: { ...s.shoot, isPublished: true } })),
      unpublish: () =>
        set((s) => ({ shoot: { ...s.shoot, isPublished: false } })),
      reset: () => set({ shoot: DEFAULT_SHOOT }),
    }),
    { name: "cin-o-daily", version: 1 }
  )
);
