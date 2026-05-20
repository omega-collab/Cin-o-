"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";
export type FontSize = "sm" | "md" | "lg";
export type Lang = "fr" | "en";

interface SettingsStore {
  theme: Theme;
  fontSize: FontSize;
  lang: Lang;
  setTheme: (t: Theme) => void;
  setFontSize: (s: FontSize) => void;
  setLang: (l: Lang) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "dark",
      fontSize: "md",
      lang: "fr",
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLang: (lang) => set({ lang }),
    }),
    { name: "cin-o-settings" }
  )
);
