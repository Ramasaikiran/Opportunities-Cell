-- ================================================================
-- Fix: infinite recursion in "profiles" RLS policy
-- Cause: "Admins can view all profiles" policy queries public.profiles
-- from inside its own USING clause on public.profiles → Postgres
-- recurses evaluating the same policy forever. This breaks EVERY
-- read of profiles made through the app (PostgREST/supabase-js),
-- even though it looks fine in the SQL editor (which runs as a
-- superuser and bypasses RLS entirely — that's why it was invisible
-- until now).
--
-- Fix: move the is_admin check into a SECURITY DEFINER function.
-- Such functions run as their owner (bypasses RLS for that one
-- lookup), so checking it no longer re-triggers the policy.
-- ================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Same recursion risk exists anywhere else "is_admin" is checked via a
-- direct profiles subquery inside a profiles-table policy (none currently,
-- but other tables reference profiles too — those are fine since the
-- recursion only happens when a table's policy queries *itself*).

NOTIFY pgrst, 'reload schema';
