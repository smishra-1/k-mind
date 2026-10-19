-- Run this once in the Supabase dashboard: SQL Editor > New query.
create table if not exists public.mind_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  topic text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists mind_maps_user_created_idx
  on public.mind_maps (user_id, created_at desc);

alter table public.mind_maps enable row level security;

create policy "Users read their own maps" on public.mind_maps
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users insert their own maps" on public.mind_maps
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users delete their own maps" on public.mind_maps
  for delete to authenticated using (user_id = (select auth.uid()));
