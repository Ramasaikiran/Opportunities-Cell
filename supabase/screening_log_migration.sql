-- Tracks every job we screened for a user, matched or rejected, and why.
create table if not exists public.job_screening_log (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  job_id            uuid not null references public.jobs(id) on delete cascade,
  decision          text not null check (decision in ('applied','rejected')),
  industry_matched  boolean not null default false,
  skills_matched    boolean not null default false,
  experience_matched boolean not null default false,
  missing_metrics   text[] default '{}',  -- e.g. {'experience','industry'}
  created_at        timestamptz not null default now(),
  unique (user_id, job_id)
);

alter table public.job_screening_log enable row level security;
drop policy if exists "users read own screening log" on public.job_screening_log;
create policy "users read own screening log" on public.job_screening_log
  for select using (auth.uid() = user_id);
drop policy if exists "admin manages screening log" on public.job_screening_log;
create policy "admin manages screening log" on public.job_screening_log
  for all using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

-- Per-user match funnel: picked in domain, matched skills, applied
create or replace function public.get_user_match_stats(p_user_id uuid)
returns json language sql security definer as $$
  select json_build_object(
    'jobs_in_domain', (
      select count(*) from public.job_screening_log
      where user_id = p_user_id and industry_matched
    ),
    'jobs_matched_skills', (
      select count(*) from public.job_screening_log
      where user_id = p_user_id and skills_matched
    ),
    'jobs_applied', (
      select count(*) from public.job_screening_log
      where user_id = p_user_id and decision = 'applied'
    )
  );
$$;
