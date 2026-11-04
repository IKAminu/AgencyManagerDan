create table if not exists public.agency_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 180),
  body text not null default '',
  kind text not null default 'Note' check (kind in ('Note', 'Reminder', 'To-do')),
  due_date date,
  priority text not null default 'Normal' check (priority in ('Low', 'Normal', 'High')),
  completed boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agency_notes_created_at_idx on public.agency_notes (created_at desc);
create index if not exists agency_notes_due_date_idx on public.agency_notes (due_date) where completed = false;
create index if not exists agency_notes_kind_completed_idx on public.agency_notes (kind, completed);

alter table public.agency_notes enable row level security;
revoke all on public.agency_notes from anon;
grant select, insert, update, delete on public.agency_notes to authenticated;

create policy "Live access for authorised MFA accounts"
on public.agency_notes
for all
to authenticated
using (
  ((select auth.jwt()) ->> 'aal') = 'aal2'
  and lower(((select auth.jwt()) ->> 'email')) in ('ikaminumail@gmail.com', 'dandurguairtravels@gmail.com')
)
with check (
  ((select auth.jwt()) ->> 'aal') = 'aal2'
  and lower(((select auth.jwt()) ->> 'email')) in ('ikaminumail@gmail.com', 'dandurguairtravels@gmail.com')
);
