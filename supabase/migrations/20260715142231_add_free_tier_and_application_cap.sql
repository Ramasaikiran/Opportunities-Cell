-- Allow 'free' as a valid plan
alter table public.subscriptions drop constraint subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check
  check (plan = any (array['free'::text, 'basic'::text, 'pro'::text, 'maxpro'::text]));

alter table public.jobs alter column plan_visibility set default array['free','basic','pro','maxpro'];

-- Auto-enroll every new user in the free plan so caps have something to check against
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $function$
declare
  _full text; _first text; _last text;
begin
  _full  := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  _first := coalesce(new.raw_user_meta_data->>'given_name',  split_part(_full, ' ', 1));
  _last  := coalesce(new.raw_user_meta_data->>'family_name',
              case when position(' ' in _full) > 0
                   then substring(_full from position(' ' in _full) + 1)
                   else null end);
  insert into public.profiles (id, full_name, first_name, last_name, email, avatar_url, account_status)
  values (new.id, _full, _first, _last, new.email, new.raw_user_meta_data->>'avatar_url',
          case when new.email_confirmed_at is not null then 'active' else 'pending_onboarding' end)
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, amount_paise, status, starts_at)
  values (new.id, 'free', 0, 'active', now())
  on conflict do nothing;

  return new;
end;
$function$;

-- Enforce: free-plan users get max 30 admin-applied jobs per calendar month.
-- Paid plans (basic/pro/maxpro) are uncapped.
create or replace function public.check_free_tier_application_cap()
returns trigger language plpgsql security definer as $$
declare
  user_plan text;
  monthly_count int;
begin
  select plan into user_plan from public.subscriptions
  where user_id = new.user_id and status = 'active'
  order by created_at desc limit 1;

  if user_plan is distinct from 'free' then
    return new;
  end if;

  select count(*) into monthly_count from public.job_applications
  where user_id = new.user_id
    and date_trunc('month', applied_at) = date_trunc('month', now());

  if monthly_count >= 30 then
    raise exception 'Free plan limit reached: 30 applications per month. Upgrade to Basic/Pro for unlimited applications.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_free_tier_application_cap on public.job_applications;
create trigger trg_free_tier_application_cap
  before insert on public.job_applications
  for each row execute function public.check_free_tier_application_cap();
