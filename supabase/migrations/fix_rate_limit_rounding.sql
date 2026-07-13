-- ══════════════════════════════════════════════════════════════════
-- FIX: check_signup_rate_limit was truncating retry_after_seconds
-- toward zero. Sub-second remaining time showed as "0s" while the
-- user was still blocked. Round up instead so it never shows 0
-- while `allowed` is false.
-- Safe to run standalone — this is a `create or replace`, no new
-- tables or destructive changes.
-- ══════════════════════════════════════════════════════════════════

create or replace function public.check_signup_rate_limit(p_ip text)
returns jsonb language plpgsql security definer as $$
declare
  hits timestamptz[];
  cnt int;
  last_hit timestamptz;
  third_hit timestamptz;
  now_ts timestamptz := now();
begin
  delete from public.rate_limits
  where identifier = p_ip and action = 'signup' and hit_at < now_ts - interval '2 hours';

  select array_agg(hit_at order by hit_at) into hits
  from public.rate_limits where identifier = p_ip and action = 'signup';

  cnt := coalesce(array_length(hits, 1), 0);

  if cnt >= 3 then
    third_hit := hits[3];
    if now_ts - third_hit < interval '2 hours' then
      return jsonb_build_object('allowed', false,
        'retry_after_seconds', ceil(extract(epoch from (third_hit + interval '2 hours' - now_ts)))::int,
        'reason', 'cooldown');
    end if;
    delete from public.rate_limits where identifier = p_ip and action = 'signup';
    cnt := 0;
  end if;

  if cnt >= 1 then
    last_hit := hits[cnt];
    declare required_gap interval := case cnt when 1 then interval '30 seconds' else interval '60 seconds' end;
    begin
      if now_ts - last_hit < required_gap then
        return jsonb_build_object('allowed', false,
          'retry_after_seconds', ceil(extract(epoch from (last_hit + required_gap - now_ts)))::int,
          'reason', 'delay');
      end if;
    end;
  end if;

  insert into public.rate_limits (identifier, action) values (p_ip, 'signup');
  return jsonb_build_object('allowed', true);
end;
$$;
