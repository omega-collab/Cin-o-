-- ═══════════════════════════════════════════════════════════════════════════
-- Admin features : régénérer le code d'invitation + renommer le projet
-- ═══════════════════════════════════════════════════════════════════════════
-- Deux RPC SECURITY DEFINER (limitées au propriétaire du projet) pour
-- supporter les nouveaux contrôles admin :
--   - rotate_invite_code(project_id) → génère un nouveau code unique
--   - update_project_name(project_id, new_name) → renomme (avec dédup)

-- ── 1. Rotate invite code ───────────────────────────────────────────────────
create or replace function public.rotate_invite_code(p_project_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  attempt int := 0;
  proj_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'Non authentifié' using errcode = '42501';
  end if;

  -- Only the owner can rotate (and we bypass RLS to check)
  select owner_id into proj_owner from public.projects where id = p_project_id;
  if proj_owner is null then
    raise exception 'Projet introuvable' using errcode = '22023';
  end if;
  if proj_owner <> auth.uid() then
    raise exception 'Seul le propriétaire peut régénérer le code' using errcode = '42501';
  end if;

  -- Generate a 6-char uppercase hex code (0-9A-F), retry on collision (très rare avant ~1000 projets)
  loop
    new_code := upper(left(replace(gen_random_uuid()::text, '-', ''), 6));
    exit when not exists (select 1 from public.projects where invite_code = new_code);
    attempt := attempt + 1;
    if attempt > 10 then
      raise exception 'Impossible de générer un code unique' using errcode = '50000';
    end if;
  end loop;

  update public.projects set invite_code = new_code where id = p_project_id;
  return new_code;
end;
$$;

revoke all on function public.rotate_invite_code(uuid) from public;
grant execute on function public.rotate_invite_code(uuid) to authenticated;

-- ── 2. Update project name (with dedup check) ──────────────────────────────
create or replace function public.update_project_name(p_project_id uuid, p_new_name text)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  proj_owner uuid;
  collision_id uuid;
  updated public.projects;
begin
  if auth.uid() is null then
    raise exception 'Non authentifié' using errcode = '42501';
  end if;

  normalized := trim(coalesce(p_new_name, ''));
  if length(normalized) < 1 then
    raise exception 'Nom requis' using errcode = '22023';
  end if;

  select owner_id into proj_owner from public.projects where id = p_project_id;
  if proj_owner is null then
    raise exception 'Projet introuvable' using errcode = '22023';
  end if;
  if proj_owner <> auth.uid() then
    raise exception 'Seul le propriétaire peut renommer' using errcode = '42501';
  end if;

  -- Check collision (case-insensitive, exclude self)
  select id into collision_id
  from public.projects
  where lower(name) = lower(normalized)
    and id <> p_project_id
  limit 1;

  if collision_id is not null then
    raise exception 'Un autre projet porte déjà ce nom' using errcode = '22023';
  end if;

  update public.projects
  set name = normalized
  where id = p_project_id
  returning * into updated;

  return updated;
end;
$$;

revoke all on function public.update_project_name(uuid, text) from public;
grant execute on function public.update_project_name(uuid, text) to authenticated;
