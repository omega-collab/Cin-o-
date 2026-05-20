"use client";

import { create } from "zustand";
import type { DepartmentSlug } from "@/lib/types";

interface AccessState {
  unlockedDepartments: Set<DepartmentSlug>;
  unlock: (slug: DepartmentSlug) => void;
  lock: (slug: DepartmentSlug) => void;
  isUnlocked: (slug: DepartmentSlug) => boolean;
  lockAll: () => void;
}

export const useAccessStore = create<AccessState>()((set, get) => ({
  unlockedDepartments: new Set<DepartmentSlug>(),
  unlock: (slug) =>
    set((state) => ({
      unlockedDepartments: new Set([...state.unlockedDepartments, slug]),
    })),
  lock: (slug) =>
    set((state) => {
      const next = new Set(state.unlockedDepartments);
      next.delete(slug);
      return { unlockedDepartments: next };
    }),
  isUnlocked: (slug) => get().unlockedDepartments.has(slug),
  lockAll: () => set({ unlockedDepartments: new Set<DepartmentSlug>() }),
}));
