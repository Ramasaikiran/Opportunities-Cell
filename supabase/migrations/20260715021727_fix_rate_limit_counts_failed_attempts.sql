-- ══════════════════════════════════════════════════════════════════
-- FIX: check_signup_rate_limit inserted a hit on every CHECK call,
-- even when the actual signUp() afterward failed (bad network, OTP
-- issue, etc). Users retrying a failed signup got punished with an
-- escalating 30s -> 60s gap despite never creating an account.
--
-- Split into:
--   check_signup_rate_limit(p_ip)   -- read-only, no insert
--   record_signup_attempt(p_ip)     -- called only after real success
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
  end if;

  if cnt >= 1 and cnt < 3 then
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

  -- No insert here anymore — checking is free. A hit is only
  -- recorded via record_signup_attempt(), after a real success.
  return jsonb_build_object('allowed', true);
end;
$$;

create or replace function public.record_signup_attempt(p_ip text)
returns void language plpgsql security definer as $$
begin
  delete from public.rate_limits
  where identifier = p_ip and action = 'signup' and hit_at < now() - interval '2 hours';

  -- Reset the 3-strike window once it's aged past 2 hours
  if (select count(*) from public.rate_limits where identifier = p_ip and action = 'signup') >= 3 then
    delete from public.rate_limits where identifier = p_ip and action = 'signup';
  end if;

  insert into public.rate_limits (identifier, action) values (p_ip, 'signup');
end;
$$;
