alter table public.jobs add column if not exists plan_visibility text[] not null default array['basic','pro','maxpro'];
alter table public.jobs add column if not exists status text not null default 'draft' check (status = any (array['draft','published','closed']));
alter table public.jobs add column if not exists work_mode text;
