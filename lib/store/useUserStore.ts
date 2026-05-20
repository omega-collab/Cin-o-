"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DepartmentSlug } from "@/lib/types";

interface UserProfile {
  department: DepartmentSlug | null;
  role: string | null;
  onboardingDone: boolean;
  setProfile: (dept: DepartmentSlug, role: string) => void;
  resetProfile: () => void;
}

export const useUserStore = create<UserProfile>()(
  persist(
    (set) => ({
      department: null,
      role: null,
      onboardingDone: false,
      setProfile: (department, role) =>
        set({ department, role, onboardingDone: true }),
      resetProfile: () =>
        set({ department: null, role: null, onboardingDone: false }),
    }),
    { name: "cin-o-user" }
  )
);
