-- ═══════════════════════════════════════════════════════════════════════════
-- Sync du menu cantine (useCanteenStore) entre tous les membres du projet
-- ═══════════════════════════════════════════════════════════════════════════
-- Sans cette colonne, useCanteenStore restait local (zustand/persist
-- localStorage). Le menu rempli par un user n'apparaissait jamais pour les
-- autres → on ajoute canteen_store jsonb au snapshot upsert/load de
-- useProjectSync, comme shoot_store et department_store.
--
-- Les policies RLS existantes sur project_data (lecture/écriture pour les
-- membres du projet) couvrent automatiquement la nouvelle colonne.

alter table public.project_data
  add column if not exists canteen_store jsonb not null default '{}'::jsonb;
