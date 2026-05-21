"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import type { Project, ProjectMember, Profile } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";

interface ProjectState {
  // Auth
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  // Projects
  projects: Project[];
  activeProjectId: string | null;
  members: ProjectMember[];
  // Sync
  lastSyncedAt: string | null;
  isSyncing: boolean;
  // Actions
  setAuth: (user: User | null, session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (id: string | null) => void;
  setMembers: (members: ProjectMember[]) => void;
  setSyncing: (v: boolean) => void;
  setLastSyncedAt: (v: string) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  signOut: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      projects: [],
      activeProjectId: null,
      members: [],
      lastSyncedAt: null,
      isSyncing: false,

      setAuth: (user, session) => set({ user, session }),
      setProfile: (profile) => set({ profile }),
      setProjects: (projects) => set({ projects }),
      setActiveProject: (id) => set({ activeProjectId: id }),
      setMembers: (members) => set({ members }),
      setSyncing: (v) => set({ isSyncing: v }),
      setLastSyncedAt: (v) => set({ lastSyncedAt: v }),
      addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
      removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          profile: null,
          projects: [],
          activeProjectId: null,
          members: [],
          lastSyncedAt: null,
        });
      },
    }),
    {
      name: "cineo-project",
      partialize: (s) => ({
        activeProjectId: s.activeProjectId,
        // Don't persist auth — reload from Supabase session
      }),
    }
  )
);

export function getActiveProject(state: ProjectState): Project | null {
  return state.projects.find((p) => p.id === state.activeProjectId) ?? null;
}
