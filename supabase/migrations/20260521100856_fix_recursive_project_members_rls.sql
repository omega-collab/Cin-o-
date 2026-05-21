-- CORRECTIF CRITIQUE : politique SELECT récursive sur project_members
--
-- Problème : la politique "members_select_same_project" autorisait un SELECT
-- sur project_members en vérifiant project_id dans une sous-requête qui
-- SELECT-ait elle-même project_members. PostgreSQL évaluait la politique
-- récursivement → stack overflow → HTTP 500 sur TOUTES les requêtes
-- /projects et /project_members.
--
-- Correction : remplacer la sous-requête récursive par un filtre direct
-- sur user_id. Un utilisateur peut voir uniquement ses propres lignes.
drop policy if exists "members_select_same_project" on public.project_members;

create policy "members_select_same_project" on public.project_members
  for select to public using (user_id = auth.uid());
