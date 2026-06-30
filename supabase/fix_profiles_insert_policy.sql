-- ================================================================
-- Fix: "new row violates row-level security policy for table profiles"
-- Cause: profiles has SELECT (own + admin) and UPDATE (own) policies,
-- but no INSERT policy. supabase.from('profiles').upsert(...) does
-- ON CONFLICT (id) DO UPDATE — but if no row exists yet for this user
-- (e.g. the signup trigger didn't fire, or this is an edge case),
-- Postgres falls through to a plain INSERT, which has no policy
-- permitting it → hard denial, even though the user owns that id.
-- ================================================================

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

NOTIFY pgrst, 'reload schema';
