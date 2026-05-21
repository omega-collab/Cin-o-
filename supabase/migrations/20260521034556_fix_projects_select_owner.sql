-- Le propriétaire d'un projet ne pouvait pas voir son propre projet
-- si aucune entrée dans project_members ne l'associait (ex. juste après création).
-- On ajoute auth.uid() = owner_id comme condition alternative.
drop policy if exists "projects_select_member" on public.projects;

create policy "projects_select_member" on public.projects
  for select to public using (
    auth.uid() = owner_id
    or id in (
      select project_id from public.project_members where user_id = auth.uid()
    )
  );
