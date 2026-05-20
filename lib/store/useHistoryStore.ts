"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryEntry } from "@/lib/types";

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            {
              ...entry,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
            ...state.entries,
          ],
        })),
      clearHistory: () => set({ entries: [] }),
    }),
    { name: "cin-o-history" }
  )
);
