"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DepartmentSlug } from "@/lib/types";

export interface DeptPrivateNote {
  id: string;
  department: DepartmentSlug;
  content: string;
  priority: "info" | "warning" | "critical";
  createdAt: string;
}

interface DeptNotesState {
  notes: DeptPrivateNote[];
  addNote: (note: Omit<DeptPrivateNote, "id" | "createdAt">) => void;
  deleteNote: (id: string) => void;
}

export const useDeptNotesStore = create<DeptNotesState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (n) =>
        set((s) => ({
          notes: [
            { ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
            ...s.notes,
          ],
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    { name: "cin-o-dept-notes-v1" }
  )
);
