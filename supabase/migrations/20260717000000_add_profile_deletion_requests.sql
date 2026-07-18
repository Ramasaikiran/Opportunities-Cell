-- ================================================================
-- Profile deletion requests: user requests, admin approves/rejects.
-- Approval hard-deletes the profile row (cascades to student_details/
-- professional_details/subscriptions/job_applications/saved_jobs via
-- existing FK `on delete cascade` constraints).
--
-- Note: this does NOT delete the underlying auth.users row — that
-- requires the service_role key (supabase.auth.admin.deleteUser),
-- which cannot be called safely from the client. Run that separately
-- from a trusted backend/edge function if full account removal
-- (including login credentials) is required.
-- ================================================================

create table if not exists public.profile_deletion_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  user_email    text not null,
  user_name     text not null,
  status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  reason        text,
  requested_at  timestamptz not null default now(),
  resolved_at   timestamptz,
  resolved_by   uuid references public.profiles(id)
);

alter table public.profile_deletion_requests enable row level security;

drop policy if exists "users view own deletion requests" on public.profile_deletion_requests;
create policy "users view own deletion requests"
  on public.profile_deletion_requests for select
  using (auth.uid() = user_id);

drop policy if exists "admins view all deletion requests" on public.profile_deletion_requests;
create policy "admins view all deletion requests"
  on public.profile_deletion_requests for select
  using (public.is_admin());

-- No insert/update/delete policies: writes only happen through the
-- SECURITY DEFINER functions below, which run as the table owner and
-- enforce their own checks (one pending request per user; admin-only
-- resolution). This blocks a user from forging another user's request
-- or self-approving.

create or replace function public.request_profile_deletion(p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  _email text;
  _name  text;
begin
  if exists (
    select 1 from public.profile_deletion_requests
    where user_id = auth.uid() and status = 'pending'
  ) then
    raise exception 'You already have a pending deletion request.';
  end if;

  select email, full_name into _email, _name
  from public.profiles where id = auth.uid();

  if _email is null then
    raise exception 'Profile not found.';
  end if;

  insert into public.profile_deletion_requests (user_id, user_email, user_name, reason)
  values (auth.uid(), _email, _name, p_reason);
end;
$$;

create or replace function public.admin_resolve_deletion_request(p_request_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  _target_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized.';
  end if;

  select user_id into _target_user
  from public.profile_deletion_requests
  where id = p_request_id and status = 'pending';

  if _target_user is null then
    raise exception 'Request not found or already resolved.';
  end if;

  update public.profile_deletion_requests
  set status = case when p_approve then 'approved' else 'rejected' end,
      resolved_at = now(),
      resolved_by = auth.uid()
  where id = p_request_id;

  if p_approve then
    delete from public.profiles where id = _target_user;
  end if;
end;
$$;

grant execute on function public.request_profile_deletion(text) to authenticated;
grant execute on function public.admin_resolve_deletion_request(uuid, boolean) to authenticated;
