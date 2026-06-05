-- ═══════════════════════════════════════════════════════════════════════════
-- Extension RLS work_days : la production peut voir les heures de l'équipe
-- ═══════════════════════════════════════════════════════════════════════════
-- Avant : RLS strict user-scope (auth.uid() = user_id) — chaque user ne
-- voit que ses propres workdays.
--
-- Maintenant : les users avec profiles.department = 'production' (= les
-- admins de fait dans CinéO) ET membres du projet via project_members
-- peuvent SELECT toutes les workdays liées à ce project_id.
--
-- INSERT/UPDATE/DELETE restent strict user-scope : seul le proprio peut
-- modifier ses heures (la prod regarde, ne touche pas).

drop policy if exists "work_days_select_own" on public.work_days;
drop policy if exists "work_days_select_own_or_prod" on public.work_days;

create policy "work_days_select_own_or_prod"
  on public.work_days for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.profiles p
      join public.project_members pm
        on pm.user_id = p.id
      where p.id = auth.uid()
        and p.department = 'production'
        and pm.project_id = work_days.project_id
        and work_days.project_id is not null
    )
  );
