-- ═══════════════════════════════════════════════════════════════════════════
-- Fix : rejoindre un projet par code d'invitation
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Problème : la policy SELECT sur public.projects exigeait que l'utilisateur
-- soit déjà owner ou déjà membre du projet. Conséquence : un utilisateur
-- externe qui faisait `SELECT FROM projects WHERE invite_code = '...'` ne
-- voyait rien et l'app affichait "Code invalide" alors que le code était bon.
--
-- Solution : une fonction SECURITY DEFINER qui :
--   1. Trouve le projet par invite_code (bypass RLS)
--   2. Crée l'entrée project_members pour l'utilisateur courant
--   3. Retourne le projet (qui devient visible via la policy normale après ajout)
--
-- Cette approche est plus sûre que d'ouvrir SELECT à tout le monde sur
-- public.projects : le code reste un secret partagé, et seul un user
-- authentifié peut consommer la fonction.

create or replace function public.join_project_by_code(p_code text)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  proj public.projects;
  normalized_code text;
begin
  -- Auth required
  if auth.uid() is null then
    raise exception 'Non authentifié' using errcode = '42501';
  end if;

  normalized_code := upper(trim(p_code));
  if normalized_code is null or length(normalized_code) < 4 then
    raise exception 'Code invalide' using errcode = '22023';
  end if;

  -- Find project by invite_code (SECURITY DEFINER bypasses RLS so we can
  -- see projects the user is not yet a member of).
  select * into proj
  from public.projects
  where invite_code = normalized_code
  limit 1;

  if not found then
    raise exception 'Code invalide' using errcode = '22023';
  end if;

  -- Add caller as member (idempotent — no error if already member)
  insert into public.project_members (project_id, user_id, role)
  values (proj.id, auth.uid(), 'member')
  on conflict (project_id, user_id) do nothing;

  return proj;
end;
$$;

-- Lock down execution to authenticated users only
revoke all on function public.join_project_by_code(text) from public;
grant execute on function public.join_project_by_code(text) to authenticated;

comment on function public.join_project_by_code(text) is
  'Permet à un utilisateur authentifié de rejoindre un projet via son code '
  'd''invitation, même si la policy SELECT sur projects le bloquerait. '
  'Bypass RLS via SECURITY DEFINER puis insère dans project_members.';
