-- Arca
-- Phase 1 Supabase schema (local-first + snapshot/event sync)
-- Date: 2026-03-02

begin;

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Core tables
-- ------------------------------------------------------------

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Arca Board',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table if not exists public.board_snapshots (
  board_id uuid primary key references public.boards(id) on delete cascade,
  state_json jsonb not null,
  schema_version text not null,
  server_version bigint not null default 1,
  last_client_modified_at timestamptz null,
  last_client_device_id text null,
  updated_at timestamptz not null default now()
);

create table if not exists public.board_events (
  id bigint generated always as identity primary key,
  board_id uuid not null references public.boards(id) on delete cascade,
  device_id text not null,
  client_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (board_id, device_id, client_event_id)
);

create table if not exists public.device_checkpoints (
  board_id uuid not null references public.boards(id) on delete cascade,
  device_id text not null,
  last_seen_event_id bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (board_id, device_id)
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------

create index if not exists idx_boards_owner_id
  on public.boards(owner_id);

create index if not exists idx_board_snapshots_updated_at
  on public.board_snapshots(updated_at desc);

create index if not exists idx_board_events_board_id_id
  on public.board_events(board_id, id desc);

create index if not exists idx_board_events_board_id_created_at
  on public.board_events(board_id, created_at desc);

create index if not exists idx_device_checkpoints_board_id
  on public.device_checkpoints(board_id);

-- ------------------------------------------------------------
-- Updated-at trigger helper
-- ------------------------------------------------------------

create or replace function public.ppp_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_boards_set_updated_at on public.boards;
create trigger trg_boards_set_updated_at
before update on public.boards
for each row execute function public.ppp_set_updated_at();

drop trigger if exists trg_board_snapshots_set_updated_at on public.board_snapshots;
create trigger trg_board_snapshots_set_updated_at
before update on public.board_snapshots
for each row execute function public.ppp_set_updated_at();

drop trigger if exists trg_device_checkpoints_set_updated_at on public.device_checkpoints;
create trigger trg_device_checkpoints_set_updated_at
before update on public.device_checkpoints
for each row execute function public.ppp_set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------

alter table public.boards enable row level security;
alter table public.board_snapshots enable row level security;
alter table public.board_events enable row level security;
alter table public.device_checkpoints enable row level security;

-- Boards policies
drop policy if exists boards_select_own on public.boards;
create policy boards_select_own
on public.boards
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists boards_insert_own on public.boards;
create policy boards_insert_own
on public.boards
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists boards_update_own on public.boards;
create policy boards_update_own
on public.boards
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists boards_delete_own on public.boards;
create policy boards_delete_own
on public.boards
for delete
to authenticated
using (owner_id = auth.uid());

-- Child table policies (owner via boards)
drop policy if exists board_snapshots_select_own on public.board_snapshots;
create policy board_snapshots_select_own
on public.board_snapshots
for select
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = board_snapshots.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists board_snapshots_insert_own on public.board_snapshots;
create policy board_snapshots_insert_own
on public.board_snapshots
for insert
to authenticated
with check (
  exists (
    select 1
    from public.boards b
    where b.id = board_snapshots.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists board_snapshots_update_own on public.board_snapshots;
create policy board_snapshots_update_own
on public.board_snapshots
for update
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = board_snapshots.board_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.boards b
    where b.id = board_snapshots.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists board_snapshots_delete_own on public.board_snapshots;
create policy board_snapshots_delete_own
on public.board_snapshots
for delete
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = board_snapshots.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists board_events_select_own on public.board_events;
create policy board_events_select_own
on public.board_events
for select
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = board_events.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists board_events_insert_own on public.board_events;
create policy board_events_insert_own
on public.board_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.boards b
    where b.id = board_events.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists board_events_update_own on public.board_events;
create policy board_events_update_own
on public.board_events
for update
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = board_events.board_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.boards b
    where b.id = board_events.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists board_events_delete_own on public.board_events;
create policy board_events_delete_own
on public.board_events
for delete
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = board_events.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists checkpoints_select_own on public.device_checkpoints;
create policy checkpoints_select_own
on public.device_checkpoints
for select
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = device_checkpoints.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists checkpoints_insert_own on public.device_checkpoints;
create policy checkpoints_insert_own
on public.device_checkpoints
for insert
to authenticated
with check (
  exists (
    select 1
    from public.boards b
    where b.id = device_checkpoints.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists checkpoints_update_own on public.device_checkpoints;
create policy checkpoints_update_own
on public.device_checkpoints
for update
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = device_checkpoints.board_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.boards b
    where b.id = device_checkpoints.board_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists checkpoints_delete_own on public.device_checkpoints;
create policy checkpoints_delete_own
on public.device_checkpoints
for delete
to authenticated
using (
  exists (
    select 1
    from public.boards b
    where b.id = device_checkpoints.board_id
      and b.owner_id = auth.uid()
  )
);

-- ------------------------------------------------------------
-- RPC helpers
-- ------------------------------------------------------------

-- Ensure the current user has exactly one board and return its id.
create or replace function public.ensure_user_board(p_name text default 'My Arca Board')
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  insert into public.boards (owner_id, name)
  values (
    v_user,
    coalesce(nullif(trim(p_name), ''), 'My Arca Board')
  )
  on conflict (owner_id) do update
    set updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

-- Upsert full board snapshot and bump server_version.
create or replace function public.upsert_board_snapshot(
  p_board_id uuid,
  p_state_json jsonb,
  p_schema_version text,
  p_device_id text default null,
  p_client_modified_at timestamptz default null
)
returns table(server_version bigint, updated_at timestamptz)
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_curr bigint;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.boards b
    where b.id = p_board_id
      and b.owner_id = v_user
  ) then
    raise exception 'Board not found or not owned by current user' using errcode = '42501';
  end if;

  select bs.server_version
    into v_curr
  from public.board_snapshots bs
  where bs.board_id = p_board_id
  for update;

  if v_curr is null then
    insert into public.board_snapshots (
      board_id, state_json, schema_version, server_version, last_client_modified_at, last_client_device_id
    )
    values (
      p_board_id, p_state_json, p_schema_version, 1, p_client_modified_at, p_device_id
    );
  else
    update public.board_snapshots
    set
      state_json = p_state_json,
      schema_version = p_schema_version,
      server_version = v_curr + 1,
      last_client_modified_at = p_client_modified_at,
      last_client_device_id = p_device_id
    where board_id = p_board_id;
  end if;

  update public.boards set updated_at = now() where id = p_board_id;

  return query
  select bs.server_version, bs.updated_at
  from public.board_snapshots bs
  where bs.board_id = p_board_id;
end;
$$;

-- Append one event (idempotent on board_id+device_id+client_event_id).
create or replace function public.append_board_event(
  p_board_id uuid,
  p_device_id text,
  p_client_event_id text,
  p_event_type text,
  p_payload jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_id bigint;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.boards b
    where b.id = p_board_id
      and b.owner_id = v_user
  ) then
    raise exception 'Board not found or not owned by current user' using errcode = '42501';
  end if;

  if coalesce(trim(p_device_id), '') = '' then
    raise exception 'device_id is required';
  end if;
  if coalesce(trim(p_client_event_id), '') = '' then
    raise exception 'client_event_id is required';
  end if;
  if coalesce(trim(p_event_type), '') = '' then
    raise exception 'event_type is required';
  end if;

  insert into public.board_events (
    board_id, device_id, client_event_id, event_type, payload
  )
  values (
    p_board_id, trim(p_device_id), trim(p_client_event_id), trim(p_event_type), coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (board_id, device_id, client_event_id) do nothing
  returning id into v_id;

  if v_id is null then
    select be.id
      into v_id
    from public.board_events be
    where be.board_id = p_board_id
      and be.device_id = trim(p_device_id)
      and be.client_event_id = trim(p_client_event_id)
    limit 1;
  end if;

  update public.boards set updated_at = now() where id = p_board_id;

  return v_id;
end;
$$;

-- Upsert per-device checkpoint.
create or replace function public.upsert_device_checkpoint(
  p_board_id uuid,
  p_device_id text,
  p_last_seen_event_id bigint
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.boards b
    where b.id = p_board_id
      and b.owner_id = v_user
  ) then
    raise exception 'Board not found or not owned by current user' using errcode = '42501';
  end if;

  if coalesce(trim(p_device_id), '') = '' then
    raise exception 'device_id is required';
  end if;

  insert into public.device_checkpoints (
    board_id, device_id, last_seen_event_id
  )
  values (
    p_board_id, trim(p_device_id), greatest(0, coalesce(p_last_seen_event_id, 0))
  )
  on conflict (board_id, device_id) do update
    set last_seen_event_id = greatest(
      public.device_checkpoints.last_seen_event_id,
      excluded.last_seen_event_id
    );
end;
$$;

-- ------------------------------------------------------------
-- Grants
-- ------------------------------------------------------------

grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.boards to authenticated;
grant select, insert, update, delete on table public.board_snapshots to authenticated;
grant select, insert, update, delete on table public.board_events to authenticated;
grant select, insert, update, delete on table public.device_checkpoints to authenticated;

grant usage, select on sequence public.board_events_id_seq to authenticated;

grant execute on function public.ensure_user_board(text) to authenticated;
grant execute on function public.upsert_board_snapshot(uuid, jsonb, text, text, timestamptz) to authenticated;
grant execute on function public.append_board_event(uuid, text, text, text, jsonb) to authenticated;
grant execute on function public.upsert_device_checkpoint(uuid, text, bigint) to authenticated;

commit;
