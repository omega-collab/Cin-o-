"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DepartmentSlug } from "@/lib/types";

interface AccessState {
  unlockedDepartments: Set<DepartmentSlug>;
  unlock: (slug: DepartmentSlug) => void;
  lock: (slug: DepartmentSlug) => void;
  isUnlocked: (slug: DepartmentSlug) => boolean;
  lockAll: () => void;
}

const setStorage = createJSONStorage(() => localStorage, {
  reviver: (key, value) => {
    if (key === "unlockedDepartments" && Array.isArray(value)) {
      return new Set<DepartmentSlug>(value as DepartmentSlug[]);
    }
    return value;
  },
  replacer: (_key, value) => {
    if (value instanceof Set) return Array.from(value as Set<unknown>);
    return value;
  },
});

export const useAccessStore = create<AccessState>()(
  persist(
    (set, get) => ({
      unlockedDepartments: new Set<DepartmentSlug>(),
      unlock: (slug) =>
        set((state) => ({
          unlockedDepartments: new Set(Array.from(state.unlockedDepartments).concat(slug)),
        })),
      lock: (slug) =>
        set((state) => {
          const next = new Set(state.unlockedDepartments);
          next.delete(slug);
          return { unlockedDepartments: next };
        }),
      isUnlocked: (slug) => get().unlockedDepartments.has(slug),
      lockAll: () => set({ unlockedDepartments: new Set<DepartmentSlug>() }),
    }),
    { name: "cin-o-access", version: 1, storage: setStorage }
  )
);
