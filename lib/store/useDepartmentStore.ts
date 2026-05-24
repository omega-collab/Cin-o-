"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StockItem, Movement, DepartmentSlug } from "@/lib/types";
import { INITIAL_STOCK } from "@/lib/data/departments";

const MAX_MOVEMENTS = 500;
const SUBTRACT_TYPES = new Set(["depart", "out", "emprunt", "casse", "defectueux"]);
const ADD_TYPES = new Set(["retour", "in", "reception"]);

interface DepartmentState {
  stock: Record<string, StockItem[]>;
  movements: Movement[];
  addMovement: (deptSlug: DepartmentSlug, movement: Omit<Movement, "id" | "timestamp" | "deptSlug">) => void;
  updateStockItem: (deptSlug: DepartmentSlug, itemId: string, updates: Partial<StockItem>) => void;
  setStock: (deptSlug: DepartmentSlug, items: StockItem[]) => void;
  // Merge incoming items into the existing stock, deduplicating by normalized
  // name. Quantities sum, the more restrictive status wins (out > low > ok),
  // and notes are concatenated. Used by the multi-file stock import flow so
  // each new document complements the existing stock instead of erasing it.
  mergeStock: (deptSlug: DepartmentSlug, items: StockItem[]) => void;
  resetStock: () => void;
}

// out is the most restrictive (no stock), then low, then ok.
const STATUS_PRIORITY: Record<StockItem["status"], number> = { out: 2, low: 1, ok: 0 };

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

export const useDepartmentStore = create<DepartmentState>()(
  persist(
    (set) => ({
      stock: INITIAL_STOCK,
      movements: [],
      addMovement: (deptSlug, movement) =>
        set((state) => {
          const movements = [
            {
              ...movement,
              deptSlug,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
            ...state.movements,
          ].slice(0, MAX_MOVEMENTS);

          // Update stock quantity for the affected item
          const deptStock = state.stock[deptSlug] ?? [];
          const updatedStock = deptStock.map((item) => {
            if (item.id !== movement.itemId) return item;
            const delta = SUBTRACT_TYPES.has(movement.type)
              ? -movement.quantity
              : ADD_TYPES.has(movement.type)
              ? movement.quantity
              : 0;
            if (delta === 0) return item;
            const newQty = Math.max(0, item.quantity + delta);
            const newStatus: StockItem["status"] =
              newQty === 0 ? "out" : newQty <= 2 ? "low" : item.status === "out" ? "ok" : item.status;
            return { ...item, quantity: newQty, status: newStatus };
          });

          return {
            movements,
            stock: { ...state.stock, [deptSlug]: updatedStock },
          };
        }),
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
      setStock: (deptSlug, items) =>
        set((state) => ({ stock: { ...state.stock, [deptSlug]: items } })),
      mergeStock: (deptSlug, incoming) =>
        set((state) => {
          const existing = state.stock[deptSlug] ?? [];
          // Index existing by normalized name for fast lookup
          const byName = new Map<string, StockItem>();
          for (const it of existing) byName.set(normalizeName(it.name), it);

          for (const inc of incoming) {
            const key = normalizeName(inc.name);
            if (!key) continue;
            const prev = byName.get(key);
            if (!prev) {
              byName.set(key, { ...inc, id: inc.id || crypto.randomUUID() });
              continue;
            }
            // Merge : sum quantities, pick the most restrictive status,
            // concat notes if different.
            const mergedNotes = [prev.notes, inc.notes]
              .filter((n): n is string => !!n?.trim())
              .filter((n, i, arr) => arr.indexOf(n) === i)
              .join(" · ") || undefined;
            const status =
              STATUS_PRIORITY[inc.status] > STATUS_PRIORITY[prev.status]
                ? inc.status
                : prev.status;
            byName.set(key, {
              ...prev,
              quantity: prev.quantity + inc.quantity,
              status,
              unit: prev.unit || inc.unit,
              notes: mergedNotes,
            });
          }

          return { stock: { ...state.stock, [deptSlug]: Array.from(byName.values()) } };
        }),
      resetStock: () => set({ stock: INITIAL_STOCK, movements: [] }),
    }),
    {
      name: "cin-o-departments",
      version: 3,
      partialize: (state) => ({
        stock: state.stock,
        movements: state.movements.map((m) => ({ ...m, photo: undefined })),
      }),
    }
  )
);
