-- Privacy-safe public feed: first name + company + status only, no PII, no IDs.
-- Real data only — returns empty array until real placements happen; the
-- frontend hides the widget entirely rather than showing a fake/empty feed.
create or replace function public.get_recent_activity()
returns table(first_name text, company text, status text, days_ago int)
language sql security definer stable as $$
  select
    coalesce(p.first_name, split_part(p.full_name, ' ', 1)) as first_name,
    ja.company,
    ja.status,
    extract(day from now() - ja.applied_at)::int as days_ago
  from public.job_applications ja
  join public.profiles p on p.id = ja.user_id
  where ja.status in ('shortlisted','interview','offer','joined','hired')
    and ja.applied_at > now() - interval '60 days'
  order by ja.applied_at desc
  limit 8;
$$;

grant execute on function public.get_recent_activity() to anon, authenticated;
