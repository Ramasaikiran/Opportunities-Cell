-- ══════════════════════════════════════════════════════════════════
-- Fix: free-tier users could never see ANY published job, regardless
-- of plan_visibility, because get_eligible_jobs() required
-- `ends_at > now()` to consider a subscription active. Free-plan
-- subscriptions (created by handle_new_user()) never set ends_at —
-- it's left NULL, since the free tier doesn't expire — so
-- `NULL > now()` evaluates to NULL, `status = 'active' AND NULL` is
-- NULL, and coalesce(..., false) made every free-tier user fail the
-- active check and get zero jobs back. This made the 'free' entry in
-- plan_visibility (added in the admin job-posting UI) completely
-- inert: no free-tier user could ever be shown a job, no matter what
-- an admin selected.
--
-- Fix: a free-plan subscription with no ends_at is active by
-- definition (it doesn't expire). Paid plans still require
-- ends_at > now() exactly as before — this does not loosen the
-- paywall for expired paid subscriptions.
-- ══════════════════════════════════════════════════════════════════

create or replace function public.get_eligible_jobs()
returns setof public.jobs language plpgsql security definer as $$
declare
  v_plan text;
  v_active boolean;
begin
  select s.plan,
         (s.status = 'active' and (s.plan = 'free' or s.ends_at > now()))
    into v_plan, v_active
  from public.subscriptions s
  where s.user_id = auth.uid()
  order by s.ends_at desc nulls last
  limit 1;

  -- No subscription row at all also means implicit free tier (matches
  -- how the rest of the app treats an absent subscription), not "no
  -- access" — belt-and-braces alongside handle_new_user() actually
  -- inserting a free row on signup.
  if v_plan is null then
    v_plan := 'free';
    v_active := true;
  end if;

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

-- Same bug pattern, currently unused by the frontend but fixed for
-- consistency so it doesn't silently break whoever reaches for it next.
create or replace function public.get_active_subscription(p_user_id uuid)
returns table (plan text, ends_at timestamptz) language sql security definer as $$
  select plan, ends_at from public.subscriptions
  where user_id = p_user_id and status = 'active' and (plan = 'free' or ends_at > now())
  order by ends_at desc nulls first limit 1;
$$;

select 'Free-tier job visibility fix complete ✓' as status;
