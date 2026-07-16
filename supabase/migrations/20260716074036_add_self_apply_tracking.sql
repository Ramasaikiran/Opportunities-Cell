-- Prevent duplicate applications to the same job (belt-and-suspenders with app-level checks)
alter table public.job_applications
  add constraint job_applications_user_job_unique unique (user_id, job_id);

-- Self-apply RPC for free/basic users clicking "Apply" themselves.
-- Bypasses the admin-only RLS insert policy safely (definer), but the
-- existing 30/month free-tier trigger still fires and can block it.
create or replace function public.record_self_application(p_job_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_job record;
begin
  select title, company into v_job from public.jobs where id = p_job_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Job not found');
  end if;

  begin
    insert into public.job_applications (user_id, job_id, job_title, company, status, admin_id)
    values (auth.uid(), p_job_id, v_job.title, v_job.company, 'applied', null);
  exception
    when unique_violation then
      return jsonb_build_object('ok', false, 'error', 'You already applied to this job');
    when others then
      return jsonb_build_object('ok', false, 'error', sqlerrm);
  end;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.record_self_application(uuid) to authenticated;

-- Helper the frontend can call to show "X/30 used this month" without
-- needing to know plan logic client-side.
create or replace function public.get_my_application_usage()
returns jsonb language plpgsql security definer as $$
declare
  v_plan text;
  v_count int;
begin
  select plan into v_plan from public.subscriptions
  where user_id = auth.uid() and status = 'active'
  order by created_at desc limit 1;

  select count(*) into v_count from public.job_applications
  where user_id = auth.uid()
    and date_trunc('month', applied_at) = date_trunc('month', now());

  return jsonb_build_object(
    'plan', coalesce(v_plan, 'free'),
    'used', v_count,
    'limit', case when v_plan = 'free' or v_plan is null then 30 else null end
  );
end;
$$;

grant execute on function public.get_my_application_usage() to authenticated;
