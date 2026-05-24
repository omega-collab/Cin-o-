-- ═══════════════════════════════════════════════════════════════════════════
-- Création de projet avec déduplication par nom
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Avant : un utilisateur pouvait créer un projet "Tropiques Criminels S8"
-- alors qu'un autre membre de l'équipe avait déjà créé le même → équipe
-- éclatée sur 2 projets distincts au lieu d'un seul.
--
-- Maintenant : la création passe par une fonction qui vérifie d'abord si
-- un projet du même nom existe (case-insensitive). Si oui, on renvoie son
-- code d'invitation pour permettre à l'utilisateur de rejoindre le projet
-- existant au lieu d'en créer un doublon.
--
-- Bypass RLS via SECURITY DEFINER : la policy SELECT actuelle ne montre
-- que les projets dont on est déjà membre, donc côté client on ne pouvait
-- pas voir si un nom était déjà pris.

create or replace function public.create_project_with_dedup(p_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  existing public.projects;
  new_proj public.projects;
begin
  if auth.uid() is null then
    raise exception 'Non authentifié' using errcode = '42501';
  end if;

  normalized := trim(coalesce(p_name, ''));
  if length(normalized) < 1 then
    raise exception 'Nom de projet requis' using errcode = '22023';
  end if;

  -- Look for an existing project with the same name (case-insensitive)
  select * into existing
  from public.projects
  where lower(name) = lower(normalized)
  limit 1;

  if found then
    return json_build_object(
      'exists', true,
      'project', json_build_object(
        'id', existing.id,
        'name', existing.name,
        'invite_code', existing.invite_code
      )
    );
  end if;

  -- Create new project, current user is owner
  insert into public.projects (name, owner_id)
  values (normalized, auth.uid())
  returning * into new_proj;

  -- Add owner as member (so RLS-protected selects find them)
  insert into public.project_members (project_id, user_id, role)
  values (new_proj.id, auth.uid(), 'owner')
  on conflict (project_id, user_id) do nothing;

  -- Init empty project_data so realtime subscribers don't need to handle null
  insert into public.project_data (project_id, updated_by)
  values (new_proj.id, auth.uid())
  on conflict (project_id) do nothing;

  return json_build_object(
    'exists', false,
    'project', json_build_object(
      'id', new_proj.id,
      'name', new_proj.name,
      'invite_code', new_proj.invite_code,
      'owner_id', new_proj.owner_id,
      'created_at', new_proj.created_at
    )
  );
end;
$$;

revoke all on function public.create_project_with_dedup(text) from public;
grant execute on function public.create_project_with_dedup(text) to authenticated;

comment on function public.create_project_with_dedup(text) is
  'Crée un projet uniquement si aucun projet du même nom (case-insensitive) '
  'n''existe déjà. Sinon renvoie le projet existant + son invite_code pour '
  'permettre à l''utilisateur de le rejoindre. Évite les doublons de projets '
  'entre membres d''une même équipe.';
