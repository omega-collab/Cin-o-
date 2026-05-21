-- ═══════════════════════════════════════════════════════════════════════════
-- CinéO — schéma initial
-- ═══════════════════════════════════════════════════════════════════════════

-- Profiles (liés à auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  initials     text not null default '',
  created_at   timestamptz default now()
);

-- Projets
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null default upper(left(replace(gen_random_uuid()::text, '-', ''), 6)),
  owner_id    uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- Membres d'un projet
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'member',
  joined_at  timestamptz default now(),
  primary key (project_id, user_id)
);

-- Données partagées d'un projet (feuille de service + départements)
create table if not exists public.project_data (
  project_id       uuid primary key references public.projects(id) on delete cascade,
  shoot_store      jsonb not null default '{}',
  department_store jsonb not null default '{}',
  updated_at       timestamptz default now(),
  updated_by       uuid references auth.users(id)
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.projects      enable row level security;
alter table public.project_members enable row level security;
alter table public.project_data  enable row level security;

-- Profiles : lecture publique, modification de son propre profil
create policy "profiles_select_all" on public.profiles
  for select to public using (true);

create policy "profiles_update_own" on public.profiles
  for update to public using (auth.uid() = id);

-- Projects : le propriétaire peut tout faire, les membres peuvent lire
create policy "projects_insert_own" on public.projects
  for insert to public with check (auth.uid() = owner_id);

create policy "projects_select_member" on public.projects
  for select to public using (
    id in (select project_id from public.project_members where user_id = auth.uid())
  );

create policy "projects_update_owner" on public.projects
  for update to public using (auth.uid() = owner_id);

create policy "projects_delete_owner" on public.projects
  for delete to public using (auth.uid() = owner_id);

-- Project members : insertion libre (own), lecture récursive (corrigée en 20260521100856)
create policy "members_insert_self" on public.project_members
  for insert to public with check (auth.uid() = user_id);

-- NOTE : cette politique est récursive (project_members référence project_members)
-- et cause des erreurs HTTP 500. Elle est remplacée dans la migration 20260521100856.
create policy "members_select_same_project" on public.project_members
  for select to public using (
    project_id in (
      select project_id from public.project_members where user_id = auth.uid()
    )
  );

create policy "members_delete_self_or_owner" on public.project_members
  for delete to public using (
    auth.uid() = user_id
    or project_id in (
      select project_id from public.project_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- Project data : lecture/écriture pour les membres
create policy "project_data_select_member" on public.project_data
  for select to public using (
    project_id in (select project_id from public.project_members where user_id = auth.uid())
  );

create policy "project_data_upsert_member" on public.project_data
  for insert to public with check (
    project_id in (select project_id from public.project_members where user_id = auth.uid())
  );

create policy "project_data_update_member" on public.project_data
  for update to public using (
    project_id in (select project_id from public.project_members where user_id = auth.uid())
  );

-- ── Trigger : création du profil à l'inscription ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, initials)
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'initials'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
