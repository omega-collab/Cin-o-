"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StockItem, Movement, DepartmentSlug } from "@/lib/types";
import { INITIAL_STOCK } from "@/lib/data/departments";

interface DepartmentState {
  stock: Record<string, StockItem[]>;
  movements: Movement[];
  addMovement: (deptSlug: DepartmentSlug, movement: Omit<Movement, "id" | "timestamp">) => void;
  updateStockItem: (deptSlug: DepartmentSlug, itemId: string, updates: Partial<StockItem>) => void;
  resetStock: () => void;
}

export const useDepartmentStore = create<DepartmentState>()(
  persist(
    (set) => ({
      stock: INITIAL_STOCK,
      movements: [],
      addMovement: (_deptSlug, movement) =>
        set((state) => ({
          movements: [
            {
              ...movement,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
            ...state.movements,
          ],
        })),
      updateStockItem: (deptSlug, itemId, updates) =>
        set((state) => {
          const deptStock = state.stock[deptSlug] ?? [];
          return {
            stock: {
              ...state.stock,
              [deptSlug]: deptStock.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            },
          };
        }),
      resetStock: () => set({ stock: INITIAL_STOCK, movements: [] }),
    }),
    { name: "setflow-departments" }
  )
);
