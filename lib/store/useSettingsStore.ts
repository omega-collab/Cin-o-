"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";
export type FontSize = "sm" | "md" | "lg";
export type Lang = "fr" | "en";
export type LoginBg = "random" | "1" | "2" | "3" | "4" | "5" | "6";

export const LOGIN_BG_COUNT = 6;

export function resolveLoginBg(pref: LoginBg): string {
  if (pref === "random") {
    const n = (Math.floor(Date.now() / 86400000) % LOGIN_BG_COUNT) + 1;
    return `/bg-${n}.jpg`;
  }
  return `/bg-${pref}.jpg`;
}

interface SettingsStore {
  theme: Theme;
  fontSize: FontSize;
  lang: Lang;
  loginBg: LoginBg;
  setTheme: (t: Theme) => void;
  setFontSize: (s: FontSize) => void;
  setLang: (l: Lang) => void;
  setLoginBg: (bg: LoginBg) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "dark",
      fontSize: "md",
      lang: "fr",
      loginBg: "random",
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLang: (lang) => set({ lang }),
      setLoginBg: (loginBg) => set({ loginBg }),
    }),
    { name: "cin-o-settings" }
  )
);
