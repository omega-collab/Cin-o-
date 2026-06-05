-- ═══════════════════════════════════════════════════════════════════════════
-- Pointage individuel des intermittents (work_days)
-- ═══════════════════════════════════════════════════════════════════════════
-- Chaque user a sa propre liste de WorkDay (date, heures début/fin, pause
-- déjeuner, convention). Sémantique strictement personnelle : pas de partage
-- entre membres du même projet — la prod ne voit pas les heures de l'équipe.
--
-- La table est synchronisée par useWorkDaysSync au mount de /heures et
-- /today (carte de pointage). RLS user-scope strict.

create table if not exists public.work_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  date date not null,
  start_time text not null,
  end_time text not null,
  lunch_start text,
  lunch_end text,
  convention text not null check (convention in ('cinema', 'audiovisuel')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Une seule entrée par user+date — le pointage écrase au lieu de dupliquer
create unique index if not exists work_days_user_date_unique
  on public.work_days(user_id, date);

create index if not exists work_days_user_date_idx
  on public.work_days(user_id, date desc);

-- RLS : user voit/écrit que ses propres workdays
alter table public.work_days enable row level security;

drop policy if exists "work_days_select_own" on public.work_days;
create policy "work_days_select_own"
  on public.work_days for select
  using (auth.uid() = user_id);

drop policy if exists "work_days_insert_own" on public.work_days;
create policy "work_days_insert_own"
  on public.work_days for insert
  with check (auth.uid() = user_id);

drop policy if exists "work_days_update_own" on public.work_days;
create policy "work_days_update_own"
  on public.work_days for update
  using (auth.uid() = user_id);

drop policy if exists "work_days_delete_own" on public.work_days;
create policy "work_days_delete_own"
  on public.work_days for delete
  using (auth.uid() = user_id);

-- Trigger updated_at
create or replace function public.set_updated_at_work_days()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists work_days_set_updated_at on public.work_days;
create trigger work_days_set_updated_at
  before update on public.work_days
  for each row execute function public.set_updated_at_work_days();
