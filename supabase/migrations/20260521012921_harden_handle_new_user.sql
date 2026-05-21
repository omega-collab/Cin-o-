-- Robustesse du trigger : coalesce pour éviter un display_name/initials vide
-- quand les metadata ne sont pas renseignées (ex. connexion OAuth future).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'initials', upper(left(split_part(new.email, '@', 1), 2)))
  );
  return new;
end;
$$;
