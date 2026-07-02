-- ══════════════════════════════════════════════════════════════════
-- 3-PLAN SYSTEM + JOB PUBLISHING MIGRATION
-- Run after existing migration.sql
-- ══════════════════════════════════════════════════════════════════

-- ── Jobs table: new admin/publishing fields ─────────────────────────
alter table public.jobs add column if not exists work_mode text
  check (work_mode in ('remote','hybrid','onsite'));
alter table public.jobs add column if not exists last_date date;
alter table public.jobs add column if not exists plan_visibility text[] not null default array['basic','pro','maxpro'];
alter table public.jobs add column if not exists status text not null default 'draft'
  check (status in ('draft','published','inactive'));
alter table public.jobs add column if not exists updated_at timestamptz not null default now();

-- Backfill: existing active jobs become published & visible to all plans
update public.jobs set status = 'published' where is_active = true and status = 'draft';

-- Auto-update updated_at on every edit
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists trg_jobs_touch on public.jobs;
create trigger trg_jobs_touch before update on public.jobs
  for each row execute function public.touch_updated_at();

-- ── Saved jobs ────────────────────────────────────────────────────
create table if not exists public.saved_jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);
alter table public.saved_jobs enable row level security;
drop policy if exists "users manage own saved jobs" on public.saved_jobs;
create policy "users manage own saved jobs" on public.saved_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Renewal reminders ─────────────────────────────────────────────
create table if not exists public.renewal_reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  reminder_type text not null default 'expiry_2day',
  sent_at       timestamptz not null default now()
);
alter table public.renewal_reminders enable row level security;
drop policy if exists "admin reads reminders" on public.renewal_reminders;
create policy "admin reads reminders" on public.renewal_reminders
  for select using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

-- ── Eligible jobs RPC — single source of truth for gating ──────────
-- Returns published jobs visible to the caller's active plan.
-- Returns nothing if subscription is not active.
create or replace function public.get_eligible_jobs()
returns setof public.jobs language plpgsql security definer as $$
declare
  v_plan text;
  v_active boolean;
begin
  select s.plan, (s.status = 'active' and s.ends_at > now())
    into v_plan, v_active
  from public.subscriptions s
  where s.user_id = auth.uid()
  order by s.ends_at desc nulls last
  limit 1;

  if not coalesce(v_active, false) then
    return;
  end if;

  return query
    select * from public.jobs j
    where j.status = 'published'
      and v_plan = any(j.plan_visibility)
    order by j.posted_at desc;
end;
$$;

-- ── Jobs RLS: only admin can write, published jobs readable via RPC ─
alter table public.jobs enable row level security;
drop policy if exists "admin manages jobs" on public.jobs;
create policy "admin manages jobs" on public.jobs
  for all using (exists (select 1 from public.profiles where id = auth.uid() and is_admin))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

select 'Plan + jobs publishing migration complete ✓' as status;
