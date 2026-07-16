alter table public.subscriptions drop constraint subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check
  check (plan = any (array['basic'::text, 'pro'::text, 'maxpro'::text]));
