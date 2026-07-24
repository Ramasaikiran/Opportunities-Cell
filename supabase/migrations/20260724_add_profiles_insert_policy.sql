-- Fixes a real gap: profiles had SELECT and UPDATE policies but no INSERT
-- policy. The normal signup path never hits this because the
-- handle_new_user() trigger runs SECURITY DEFINER and bypasses RLS —
-- but AuthCallback.tsx has a client-side fallback that inserts a profile
-- row directly when it isn't found yet (a real race: OAuth redirects can
-- reach the client before the trigger's row is visible to a fresh
-- SELECT). That fallback insert has always been silently rejected by RLS
-- with no INSERT policy to satisfy — previously swallowed without
-- surfacing an error, now surfaced as a hard failure after a recent
-- error-handling fix. This policy makes that fallback actually work
-- instead of just failing more visibly.
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
