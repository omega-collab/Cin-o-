-- Add department, role, avatar_id to profiles for persistent onboarding
alter table public.profiles
  add column if not exists department text,
  add column if not exists role       text,
  add column if not exists avatar_id  text;
