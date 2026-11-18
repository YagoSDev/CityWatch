begin;

create table public.reports (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (category in ('iluminacao', 'vias', 'limpeza', 'outros')),
  title text not null check (char_length(regexp_replace(title, '^\s+|\s+$', '', 'g')) between 5 and 80),
  public_place text not null check (char_length(regexp_replace(public_place, '^\s+|\s+$', '', 'g')) between 3 and 120),
  description text not null check (char_length(regexp_replace(description, '^\s+|\s+$', '', 'g')) between 10 and 500),
  created_at timestamptz not null default now()
);

create index reports_user_created_idx on public.reports (user_id, created_at desc, id desc);
alter table public.reports enable row level security;

revoke all on public.reports from public, anon, authenticated;
grant select on public.reports to authenticated;
grant insert (id, category, title, public_place, description) on public.reports to authenticated;

create policy "Owners can read their reports"
  on public.reports for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners can create their reports"
  on public.reports for insert to authenticated
  with check (user_id = (select auth.uid()));

commit;
