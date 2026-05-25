"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import type { Project, ProjectMember, Profile } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/client";
import { resetProjectScopedStores } from "./resetProjectStores";

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
  syncError: string | null;
  // Actions
  setAuth: (user: User | null, session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (id: string | null) => void;
  setMembers: (members: ProjectMember[]) => void;
  setSyncing: (v: boolean) => void;
  setLastSyncedAt: (v: string) => void;
  setSyncError: (v: string | null) => void;
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
      syncError: null,

      setAuth: (user, session) => set({ user, session }),
      setProfile: (profile) => set({ profile }),
      setProjects: (projects) => set({ projects }),
      setActiveProject: (id) =>
        set((s) => {
          // Project really changing → reset all project-scoped local stores so
          // the new project starts from a clean slate. Supabase data (if any)
          // will then be loaded by useProjectSync.
          if (s.activeProjectId !== id) {
            resetProjectScopedStores();
          }
          return { activeProjectId: id };
        }),
      setMembers: (members) => set({ members }),
      setSyncing: (v) => set({ isSyncing: v }),
      setLastSyncedAt: (v) => set({ lastSyncedAt: v }),
      setSyncError: (v) => set({ syncError: v }),
      addProject: (project) =>
        set((s) => {
          // Upsert : remplace si l'id existe déjà (cas renommage/rotation du code),
          // sinon append. Évite les doublons qui faisaient que find() renvoyait
          // toujours la première entrée stale.
          const idx = s.projects.findIndex((p) => p.id === project.id);
          if (idx >= 0) {
            const next = s.projects.slice();
            next[idx] = project;
            return { projects: next };
          }
          return { projects: [...s.projects, project] };
        }),
      removeProject: (id) =>
        set((s) => {
          const wasActive = s.activeProjectId === id;
          if (wasActive) resetProjectScopedStores();
          return {
            projects: s.projects.filter((p) => p.id !== id),
            activeProjectId: wasActive ? null : s.activeProjectId,
          };
        }),

      signOut: async () => {
        await supabase.auth.signOut();
        resetProjectScopedStores();
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
