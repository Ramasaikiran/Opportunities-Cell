-- Run in Supabase SQL editor (Opportunities-Cell project, not Safeshe).

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'expire-subscriptions-daily',
  '0 2 * * *',
  $$
  select net.http_post(
    url := 'https://ctfdkpizemhoccwtsvib.supabase.co/functions/v1/expire-subscriptions',
    headers := '{"x-cron-secret": "REMOVED_SECRET"}'::jsonb
  );
  $$
);

select cron.schedule(
  'send-renewal-reminders-daily',
  '0 3 * * *',
  $$
  select net.http_post(
    url := 'https://ctfdkpizemhoccwtsvib.supabase.co/functions/v1/send-renewal-reminders',
    headers := '{"x-cron-secret": "REMOVED_SECRET"}'::jsonb
  );
  $$
);
