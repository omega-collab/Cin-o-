"use client";

import { useShootStore } from "./useShootStore";
import { useDepartmentStore } from "./useDepartmentStore";
import { useDeptNotesStore } from "./useDeptNotesStore";
import { useCanteenStore } from "./useCanteenStore";
import { useAccessStore } from "./useAccessStore";
import { useDailyStore } from "./useDailyStore";

/**
 * Reset all project-scoped stores to their initial empty state.
 * Called when switching to / creating a new project, or deleting the active one.
 *
 * Stores reset (data tied to the active project / current shoot):
 * - shoot (feuille de service, sequences, cast, dept codes…)
 * - department (stock, movements)
 * - daily (lightweight DailyShoot — also tied to a project)
 * - deptNotes (private dept notes)
 * - canteen (menu)
 * - access (unlocked departments)
 *
 * Stores NOT reset (personal/global scope — survive project switch):
 * - useUserStore (department, role, avatar — profil utilisateur)
 * - useProjectStore (auth + project list)
 * - useSettingsStore (theme, language, font size)
 * - useIntermittentStore (work days + salary settings = données personnelles)
 * - useExpenseStore (notes de frais personnelles)
 * - useMatriceStore (matrice de frais personnelle)
 * - useHistoryStore (historique applicatif global)
 */
export function resetProjectScopedStores(): void {
  useShootStore.getState().resetFull();
  useDepartmentStore.getState().resetStock();
  useDailyStore.getState().reset();
  useDeptNotesStore.getState().reset();
  useCanteenStore.getState().resetMenu();
  useAccessStore.getState().lockAll();
}
