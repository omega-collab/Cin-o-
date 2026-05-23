"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DepartmentSlug } from "@/lib/types";

interface UserProfile {
  department: DepartmentSlug | null;
  role: string | null;
  avatarId: string | null;
  onboardingDone: boolean;
  setProfile: (dept: DepartmentSlug, role: string) => void;
  setAvatar: (avatarId: string) => void;
  resetProfile: () => void;
}

export const useUserStore = create<UserProfile>()(
  persist(
    (set) => ({
      department: null,
      role: null,
      avatarId: null,
      onboardingDone: false,
      setProfile: (department, role) =>
        set({ department, role, onboardingDone: true }),
      setAvatar: (avatarId) => set({ avatarId }),
      resetProfile: () =>
        set({ department: null, role: null, avatarId: null, onboardingDone: false }),
    }),
    { name: "cin-o-user", version: 1 }
  )
);
