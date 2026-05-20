"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CanteenMenu } from "@/lib/types";

const DEFAULT_MENU: CanteenMenu = {
  date: "",
  starter: "",
  main: "",
  dessert: "",
  special: "",
  shootingLocation: "",
  canteenLocation: "",
};

interface CanteenState {
  menu: CanteenMenu;
  updateMenu: (menu: Partial<CanteenMenu>) => void;
  resetMenu: () => void;
}

export const useCanteenStore = create<CanteenState>()(
  persist(
    (set) => ({
      menu: DEFAULT_MENU,
      updateMenu: (updates) =>
        set((state) => ({ menu: { ...state.menu, ...updates } })),
      resetMenu: () => set({ menu: DEFAULT_MENU }),
    }),
    { name: "cin-o-canteen", version: 2 }
  )
);
