-- ============================================================
-- Opportunities Cell — Auth schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- 1. Profiles table -------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null,
  email           text not null,
  avatar_url      text,
  user_type       text check (user_type in ('student', 'professional')),
  account_status  text not null default 'pending_onboarding'
                    check (account_status in ('pending_onboarding', 'active', 'suspended')),
  created_at      timestamptz not null default now(),
  last_login      timestamptz
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Auto-create a profile the moment a user signs up ---------------
-- Fires on auth.users INSERT (covers both email/password and Google OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, account_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    case when new.email_confirmed_at is not null then 'active' else 'pending_onboarding' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Activate profile once the magic link confirms the email --------
create or replace function public.handle_email_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
       set account_status = 'active'
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after update on auth.users
  for each row execute procedure public.handle_email_confirmed();

-- 4. Track last_login on every sign-in -------------------------------
-- Called from the client (see AuthContext) via an RPC, since
-- auth.users last_sign_in_at updates don't fire a row trigger reliably
-- across all providers.
create or replace function public.touch_last_login()
returns void
language sql
security definer set search_path = public
as $$
  update public.profiles set last_login = now() where id = auth.uid();
$$;

-- 5. Onboarding detail tables ----------------------------------------
create table if not exists public.student_details (
  id                    uuid primary key references public.profiles(id) on delete cascade,
  college_name          text not null,
  cgpa                  numeric(4,2),
  location_preference   text,
  mobile_number         text,
  technical_skills      text[] default '{}',
  projects              text,
  resume_url            text,
  updated_at            timestamptz not null default now()
);

create table if not exists public.professional_details (
  id                    uuid primary key references public.profiles(id) on delete cascade,
  previous_job_title    text,
  previous_company      text,
  years_experience      numeric(3,1),
  location_preference   text,
  mobile_number         text,
  technical_skills      text[] default '{}',
  resume_url            text,
  updated_at            timestamptz not null default now()
);

alter table public.student_details enable row level security;
alter table public.professional_details enable row level security;

create policy "Users manage their own student details"
  on public.student_details for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage their own professional details"
  on public.professional_details for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- 6. Resume storage ---------------------------------------------------
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "Users upload their own resume"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users read their own resume"
  on storage.objects for select
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Setup checklist (Supabase Dashboard):
-- 1. Authentication → Providers → enable Email + Google.
-- 2. Authentication → URL Configuration → add your site URL and
--    /auth/callback as a redirect URL (e.g. http://localhost:5173/auth/callback
--    and your production domain).
-- 3. Authentication → Email Templates → "Confirm signup" should use
--    {{ .ConfirmationURL }} — this is the magic link, no OTP needed.
-- ============================================================
