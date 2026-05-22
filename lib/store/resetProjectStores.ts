"use client";

import { useShootStore } from "./useShootStore";
import { useDepartmentStore } from "./useDepartmentStore";
import { useExpenseStore } from "./useExpenseStore";
import { useIntermittentStore } from "./useIntermittentStore";
import { useDeptNotesStore } from "./useDeptNotesStore";
import { useCanteenStore } from "./useCanteenStore";
import { useAccessStore } from "./useAccessStore";

/**
 * Reset all project-scoped stores to their initial empty state.
 * Called when switching to / creating a new project, or deleting the active one.
 *
 * Stores reset:
 * - shoot (feuille de service, sequences, cast, dept codes…)
 * - department (stock, movements)
 * - expense (notes de frais)
 * - intermittent (work days, settings)
 * - deptNotes (private dept notes)
 * - canteen (menu)
 * - access (unlocked departments)
 *
 * Stores NOT reset (user/global scope):
 * - useUserStore (department, role, avatar — profil utilisateur)
 * - useProjectStore (auth + project list)
 * - useSettingsStore (theme, language, font size)
 */
export function resetProjectScopedStores(): void {
  useShootStore.getState().resetFull();
  useDepartmentStore.getState().resetStock();
  useExpenseStore.getState().reset();
  useIntermittentStore.getState().reset();
  useDeptNotesStore.getState().reset();
  useCanteenStore.getState().resetMenu();
  useAccessStore.getState().lockAll();
}
