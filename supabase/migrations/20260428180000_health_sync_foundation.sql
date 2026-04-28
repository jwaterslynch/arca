-- Arca health sync foundation
-- Dark-launched Track A slice for iOS capture -> Supabase -> desktop health coach.
-- Date: 2026-04-28

begin;

create extension if not exists pgcrypto;

-- Keep this migration deployable even if the board-sync schema has not been applied.
create or replace function public.arca_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Device registry
-- ------------------------------------------------------------

create table if not exists public.arca_devices (
  owner_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  platform text not null default 'unknown',
  app_version text null,
  display_name text null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, device_id),
  constraint arca_devices_device_id_not_blank check (length(trim(device_id)) > 0)
);

drop trigger if exists trg_arca_devices_set_updated_at on public.arca_devices;
create trigger trg_arca_devices_set_updated_at
before update on public.arca_devices
for each row execute function public.arca_set_updated_at();

-- ------------------------------------------------------------
-- Append-only event stream
-- ------------------------------------------------------------

create table if not exists public.health_capture_events (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_device_id text not null,
  client_event_id text not null,
  event_type text not null,
  entity_type text not null,
  source_record_id text not null,
  payload jsonb not null default '{}'::jsonb,
  client_created_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (owner_id, source_device_id, client_event_id),
  constraint health_capture_events_device_id_not_blank check (length(trim(source_device_id)) > 0),
  constraint health_capture_events_client_event_id_not_blank check (length(trim(client_event_id)) > 0),
  constraint health_capture_events_source_record_id_not_blank check (length(trim(source_record_id)) > 0),
  constraint health_capture_events_entity_type_valid check (
    entity_type in ('recovery_snapshot', 'body_measurement')
  ),
  constraint health_capture_events_event_type_valid check (
    event_type in (
      'recovery_snapshot_upserted',
      'recovery_snapshot_deleted',
      'body_measurement_upserted',
      'body_measurement_deleted'
    )
  )
);

create index if not exists idx_health_capture_events_owner_id_id
  on public.health_capture_events(owner_id, id desc);

create index if not exists idx_health_capture_events_owner_entity
  on public.health_capture_events(owner_id, entity_type, source_record_id);

-- ------------------------------------------------------------
-- Per-device event cursor
-- ------------------------------------------------------------

create table if not exists public.health_device_checkpoints (
  owner_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  last_seen_event_id bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (owner_id, device_id),
  constraint health_device_checkpoints_device_id_not_blank check (length(trim(device_id)) > 0),
  constraint health_device_checkpoints_last_seen_nonnegative check (last_seen_event_id >= 0)
);

drop trigger if exists trg_health_device_checkpoints_set_updated_at on public.health_device_checkpoints;
create trigger trg_health_device_checkpoints_set_updated_at
before update on public.health_device_checkpoints
for each row execute function public.arca_set_updated_at();

-- ------------------------------------------------------------
-- Queryable health domain tables
-- ------------------------------------------------------------

create table if not exists public.recovery_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_record_id text not null,
  source_type text not null default 'morpheus_screenshot',
  source_device_id text not null,
  measurement_at timestamptz not null,
  captured_at timestamptz not null,
  recovery_percent numeric(5,2) not null,
  recovery_delta numeric(5,2) null,
  hrv integer null,
  activity integer null,
  sleep_minutes integer null,
  sleep_duration_display text null,
  parse_confidence numeric(4,3) null,
  needs_review boolean not null default false,
  original_image_storage_path text null,
  raw_ocr_text text null,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, source_type, source_record_id),
  constraint recovery_snapshots_source_record_id_not_blank check (length(trim(source_record_id)) > 0),
  constraint recovery_snapshots_source_type_valid check (source_type in ('morpheus_screenshot')),
  constraint recovery_snapshots_recovery_percent_range check (recovery_percent >= 0 and recovery_percent <= 100),
  constraint recovery_snapshots_hrv_nonnegative check (hrv is null or hrv >= 0),
  constraint recovery_snapshots_activity_nonnegative check (activity is null or activity >= 0),
  constraint recovery_snapshots_sleep_minutes_nonnegative check (sleep_minutes is null or sleep_minutes >= 0),
  constraint recovery_snapshots_parse_confidence_range check (
    parse_confidence is null or (parse_confidence >= 0 and parse_confidence <= 1)
  )
);

create index if not exists idx_recovery_snapshots_owner_measurement
  on public.recovery_snapshots(owner_id, measurement_at desc)
  where deleted_at is null;

drop trigger if exists trg_recovery_snapshots_set_updated_at on public.recovery_snapshots;
create trigger trg_recovery_snapshots_set_updated_at
before update on public.recovery_snapshots
for each row execute function public.arca_set_updated_at();

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_record_id text not null,
  source_type text not null default 'arboleaf_screenshot',
  source_device_id text not null,
  measurement_at timestamptz not null,
  captured_at timestamptz not null,
  weight_kg numeric(7,3) not null,
  source_weight_value numeric(7,3) null,
  source_weight_unit text null,
  body_fat_percent numeric(5,2) null,
  skeletal_muscle_percent numeric(5,2) null,
  muscle_mass_kg numeric(7,3) null,
  body_water_percent numeric(5,2) null,
  bone_mass_kg numeric(7,3) null,
  visceral_fat numeric(5,2) null,
  subcutaneous_fat_percent numeric(5,2) null,
  metabolic_age integer null,
  bmi numeric(5,2) null,
  protein_percent numeric(5,2) null,
  bmr_kcal integer null,
  fat_free_body_weight_kg numeric(7,3) null,
  body_type text null,
  parse_confidence numeric(4,3) null,
  needs_review boolean not null default false,
  original_image_storage_path text null,
  raw_ocr_text text null,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, source_type, source_record_id),
  constraint body_measurements_source_record_id_not_blank check (length(trim(source_record_id)) > 0),
  constraint body_measurements_source_type_valid check (source_type in ('arboleaf_screenshot')),
  constraint body_measurements_weight_range check (weight_kg > 0 and weight_kg < 1000),
  constraint body_measurements_source_weight_unit_valid check (
    source_weight_unit is null or source_weight_unit in ('kg', 'lb')
  ),
  constraint body_measurements_parse_confidence_range check (
    parse_confidence is null or (parse_confidence >= 0 and parse_confidence <= 1)
  )
);

create index if not exists idx_body_measurements_owner_measurement
  on public.body_measurements(owner_id, measurement_at desc)
  where deleted_at is null;

drop trigger if exists trg_body_measurements_set_updated_at on public.body_measurements;
create trigger trg_body_measurements_set_updated_at
before update on public.body_measurements
for each row execute function public.arca_set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.arca_devices enable row level security;
alter table public.health_capture_events enable row level security;
alter table public.health_device_checkpoints enable row level security;
alter table public.recovery_snapshots enable row level security;
alter table public.body_measurements enable row level security;

drop policy if exists arca_devices_select_own on public.arca_devices;
create policy arca_devices_select_own
on public.arca_devices
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists arca_devices_insert_own on public.arca_devices;
create policy arca_devices_insert_own
on public.arca_devices
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists arca_devices_update_own on public.arca_devices;
create policy arca_devices_update_own
on public.arca_devices
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists arca_devices_delete_own on public.arca_devices;
create policy arca_devices_delete_own
on public.arca_devices
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists health_capture_events_select_own on public.health_capture_events;
create policy health_capture_events_select_own
on public.health_capture_events
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists health_capture_events_insert_own on public.health_capture_events;
create policy health_capture_events_insert_own
on public.health_capture_events
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists health_device_checkpoints_select_own on public.health_device_checkpoints;
create policy health_device_checkpoints_select_own
on public.health_device_checkpoints
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists health_device_checkpoints_insert_own on public.health_device_checkpoints;
create policy health_device_checkpoints_insert_own
on public.health_device_checkpoints
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists health_device_checkpoints_update_own on public.health_device_checkpoints;
create policy health_device_checkpoints_update_own
on public.health_device_checkpoints
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists recovery_snapshots_select_own on public.recovery_snapshots;
create policy recovery_snapshots_select_own
on public.recovery_snapshots
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists recovery_snapshots_insert_own on public.recovery_snapshots;
create policy recovery_snapshots_insert_own
on public.recovery_snapshots
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists recovery_snapshots_update_own on public.recovery_snapshots;
create policy recovery_snapshots_update_own
on public.recovery_snapshots
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists body_measurements_select_own on public.body_measurements;
create policy body_measurements_select_own
on public.body_measurements
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists body_measurements_insert_own on public.body_measurements;
create policy body_measurements_insert_own
on public.body_measurements
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists body_measurements_update_own on public.body_measurements;
create policy body_measurements_update_own
on public.body_measurements
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- ------------------------------------------------------------
-- RPC write surface
-- ------------------------------------------------------------

create or replace function public.register_health_device(
  p_device_id text,
  p_platform text default 'unknown',
  p_app_version text default null,
  p_display_name text default null
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_device_id text := trim(coalesce(p_device_id, ''));
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if v_device_id = '' then
    raise exception 'device_id is required';
  end if;

  insert into public.arca_devices (
    owner_id, device_id, platform, app_version, display_name, last_seen_at
  )
  values (
    v_user,
    v_device_id,
    coalesce(nullif(trim(p_platform), ''), 'unknown'),
    nullif(trim(coalesce(p_app_version, '')), ''),
    nullif(trim(coalesce(p_display_name, '')), ''),
    now()
  )
  on conflict (owner_id, device_id) do update
    set platform = excluded.platform,
        app_version = excluded.app_version,
        display_name = coalesce(excluded.display_name, public.arca_devices.display_name),
        last_seen_at = now();
end;
$$;

create or replace function public.append_health_capture_event(
  p_source_device_id text,
  p_client_event_id text,
  p_event_type text,
  p_entity_type text,
  p_source_record_id text,
  p_payload jsonb default '{}'::jsonb,
  p_client_created_at timestamptz default now()
)
returns bigint
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_event_id bigint;
  v_source_device_id text := trim(coalesce(p_source_device_id, ''));
  v_client_event_id text := trim(coalesce(p_client_event_id, ''));
  v_event_type text := trim(coalesce(p_event_type, ''));
  v_entity_type text := trim(coalesce(p_entity_type, ''));
  v_source_record_id text := trim(coalesce(p_source_record_id, ''));
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if v_source_device_id = '' then
    raise exception 'source_device_id is required';
  end if;
  if v_client_event_id = '' then
    raise exception 'client_event_id is required';
  end if;
  if v_source_record_id = '' then
    raise exception 'source_record_id is required';
  end if;

  perform public.register_health_device(v_source_device_id, 'unknown', null, null);

  insert into public.health_capture_events (
    owner_id,
    source_device_id,
    client_event_id,
    event_type,
    entity_type,
    source_record_id,
    payload,
    client_created_at
  )
  values (
    v_user,
    v_source_device_id,
    v_client_event_id,
    v_event_type,
    v_entity_type,
    v_source_record_id,
    coalesce(p_payload, '{}'::jsonb),
    coalesce(p_client_created_at, now())
  )
  on conflict (owner_id, source_device_id, client_event_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select hce.id
      into v_event_id
    from public.health_capture_events hce
    where hce.owner_id = v_user
      and hce.source_device_id = v_source_device_id
      and hce.client_event_id = v_client_event_id
    limit 1;
  end if;

  return v_event_id;
end;
$$;

create or replace function public.upsert_recovery_snapshot_from_capture(
  p_source_device_id text,
  p_client_event_id text,
  p_source_record_id text,
  p_measurement_at timestamptz,
  p_captured_at timestamptz,
  p_recovery_percent numeric,
  p_recovery_delta numeric default null,
  p_hrv integer default null,
  p_activity integer default null,
  p_sleep_minutes integer default null,
  p_sleep_duration_display text default null,
  p_parse_confidence numeric default null,
  p_needs_review boolean default false,
  p_original_image_storage_path text default null,
  p_raw_ocr_text text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_existing_event_type text;
  v_existing_entity_type text;
  v_existing_source_record_id text;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select hce.event_type, hce.entity_type, hce.source_record_id
    into v_existing_event_type, v_existing_entity_type, v_existing_source_record_id
  from public.health_capture_events hce
  where hce.owner_id = v_user
    and hce.source_device_id = trim(p_source_device_id)
    and hce.client_event_id = trim(p_client_event_id)
  limit 1;

  if v_existing_event_type is not null then
    if v_existing_event_type <> 'recovery_snapshot_upserted'
       or v_existing_entity_type <> 'recovery_snapshot'
       or v_existing_source_record_id <> trim(p_source_record_id) then
      raise exception 'client_event_id already used for a different health event';
    end if;

    select rs.id
      into v_id
    from public.recovery_snapshots rs
    where rs.owner_id = v_user
      and rs.source_type = 'morpheus_screenshot'
      and rs.source_record_id = trim(p_source_record_id)
    limit 1;

    return v_id;
  end if;

  perform public.append_health_capture_event(
    p_source_device_id,
    p_client_event_id,
    'recovery_snapshot_upserted',
    'recovery_snapshot',
    p_source_record_id,
    jsonb_build_object(
      'measurement_at', p_measurement_at,
      'captured_at', p_captured_at,
      'recovery_percent', p_recovery_percent,
      'recovery_delta', p_recovery_delta,
      'hrv', p_hrv,
      'activity', p_activity,
      'sleep_minutes', p_sleep_minutes,
      'needs_review', coalesce(p_needs_review, false)
    ) || coalesce(p_metadata, '{}'::jsonb),
    coalesce(p_captured_at, now())
  );

  insert into public.recovery_snapshots (
    owner_id,
    source_record_id,
    source_type,
    source_device_id,
    measurement_at,
    captured_at,
    recovery_percent,
    recovery_delta,
    hrv,
    activity,
    sleep_minutes,
    sleep_duration_display,
    parse_confidence,
    needs_review,
    original_image_storage_path,
    raw_ocr_text,
    metadata,
    deleted_at
  )
  values (
    v_user,
    trim(p_source_record_id),
    'morpheus_screenshot',
    trim(p_source_device_id),
    p_measurement_at,
    p_captured_at,
    p_recovery_percent,
    p_recovery_delta,
    p_hrv,
    p_activity,
    p_sleep_minutes,
    nullif(trim(coalesce(p_sleep_duration_display, '')), ''),
    p_parse_confidence,
    coalesce(p_needs_review, false),
    nullif(trim(coalesce(p_original_image_storage_path, '')), ''),
    p_raw_ocr_text,
    coalesce(p_metadata, '{}'::jsonb),
    null
  )
  on conflict (owner_id, source_type, source_record_id) do update
    set source_device_id = excluded.source_device_id,
        measurement_at = excluded.measurement_at,
        captured_at = excluded.captured_at,
        recovery_percent = excluded.recovery_percent,
        recovery_delta = excluded.recovery_delta,
        hrv = excluded.hrv,
        activity = excluded.activity,
        sleep_minutes = excluded.sleep_minutes,
        sleep_duration_display = excluded.sleep_duration_display,
        parse_confidence = excluded.parse_confidence,
        needs_review = excluded.needs_review,
        original_image_storage_path = excluded.original_image_storage_path,
        raw_ocr_text = excluded.raw_ocr_text,
        metadata = excluded.metadata,
        deleted_at = null
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.upsert_body_measurement_from_capture(
  p_source_device_id text,
  p_client_event_id text,
  p_source_record_id text,
  p_measurement_at timestamptz,
  p_captured_at timestamptz,
  p_weight_kg numeric,
  p_source_weight_value numeric default null,
  p_source_weight_unit text default null,
  p_body_fat_percent numeric default null,
  p_skeletal_muscle_percent numeric default null,
  p_muscle_mass_kg numeric default null,
  p_body_water_percent numeric default null,
  p_bone_mass_kg numeric default null,
  p_visceral_fat numeric default null,
  p_subcutaneous_fat_percent numeric default null,
  p_metabolic_age integer default null,
  p_bmi numeric default null,
  p_protein_percent numeric default null,
  p_bmr_kcal integer default null,
  p_fat_free_body_weight_kg numeric default null,
  p_body_type text default null,
  p_parse_confidence numeric default null,
  p_needs_review boolean default false,
  p_original_image_storage_path text default null,
  p_raw_ocr_text text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_existing_event_type text;
  v_existing_entity_type text;
  v_existing_source_record_id text;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select hce.event_type, hce.entity_type, hce.source_record_id
    into v_existing_event_type, v_existing_entity_type, v_existing_source_record_id
  from public.health_capture_events hce
  where hce.owner_id = v_user
    and hce.source_device_id = trim(p_source_device_id)
    and hce.client_event_id = trim(p_client_event_id)
  limit 1;

  if v_existing_event_type is not null then
    if v_existing_event_type <> 'body_measurement_upserted'
       or v_existing_entity_type <> 'body_measurement'
       or v_existing_source_record_id <> trim(p_source_record_id) then
      raise exception 'client_event_id already used for a different health event';
    end if;

    select bm.id
      into v_id
    from public.body_measurements bm
    where bm.owner_id = v_user
      and bm.source_type = 'arboleaf_screenshot'
      and bm.source_record_id = trim(p_source_record_id)
    limit 1;

    return v_id;
  end if;

  perform public.append_health_capture_event(
    p_source_device_id,
    p_client_event_id,
    'body_measurement_upserted',
    'body_measurement',
    p_source_record_id,
    jsonb_build_object(
      'measurement_at', p_measurement_at,
      'captured_at', p_captured_at,
      'weight_kg', p_weight_kg,
      'source_weight_value', p_source_weight_value,
      'source_weight_unit', p_source_weight_unit,
      'body_fat_percent', p_body_fat_percent,
      'skeletal_muscle_percent', p_skeletal_muscle_percent,
      'needs_review', coalesce(p_needs_review, false)
    ) || coalesce(p_metadata, '{}'::jsonb),
    coalesce(p_captured_at, now())
  );

  insert into public.body_measurements (
    owner_id,
    source_record_id,
    source_type,
    source_device_id,
    measurement_at,
    captured_at,
    weight_kg,
    source_weight_value,
    source_weight_unit,
    body_fat_percent,
    skeletal_muscle_percent,
    muscle_mass_kg,
    body_water_percent,
    bone_mass_kg,
    visceral_fat,
    subcutaneous_fat_percent,
    metabolic_age,
    bmi,
    protein_percent,
    bmr_kcal,
    fat_free_body_weight_kg,
    body_type,
    parse_confidence,
    needs_review,
    original_image_storage_path,
    raw_ocr_text,
    metadata,
    deleted_at
  )
  values (
    v_user,
    trim(p_source_record_id),
    'arboleaf_screenshot',
    trim(p_source_device_id),
    p_measurement_at,
    p_captured_at,
    p_weight_kg,
    p_source_weight_value,
    nullif(trim(coalesce(p_source_weight_unit, '')), ''),
    p_body_fat_percent,
    p_skeletal_muscle_percent,
    p_muscle_mass_kg,
    p_body_water_percent,
    p_bone_mass_kg,
    p_visceral_fat,
    p_subcutaneous_fat_percent,
    p_metabolic_age,
    p_bmi,
    p_protein_percent,
    p_bmr_kcal,
    p_fat_free_body_weight_kg,
    nullif(trim(coalesce(p_body_type, '')), ''),
    p_parse_confidence,
    coalesce(p_needs_review, false),
    nullif(trim(coalesce(p_original_image_storage_path, '')), ''),
    p_raw_ocr_text,
    coalesce(p_metadata, '{}'::jsonb),
    null
  )
  on conflict (owner_id, source_type, source_record_id) do update
    set source_device_id = excluded.source_device_id,
        measurement_at = excluded.measurement_at,
        captured_at = excluded.captured_at,
        weight_kg = excluded.weight_kg,
        source_weight_value = excluded.source_weight_value,
        source_weight_unit = excluded.source_weight_unit,
        body_fat_percent = excluded.body_fat_percent,
        skeletal_muscle_percent = excluded.skeletal_muscle_percent,
        muscle_mass_kg = excluded.muscle_mass_kg,
        body_water_percent = excluded.body_water_percent,
        bone_mass_kg = excluded.bone_mass_kg,
        visceral_fat = excluded.visceral_fat,
        subcutaneous_fat_percent = excluded.subcutaneous_fat_percent,
        metabolic_age = excluded.metabolic_age,
        bmi = excluded.bmi,
        protein_percent = excluded.protein_percent,
        bmr_kcal = excluded.bmr_kcal,
        fat_free_body_weight_kg = excluded.fat_free_body_weight_kg,
        body_type = excluded.body_type,
        parse_confidence = excluded.parse_confidence,
        needs_review = excluded.needs_review,
        original_image_storage_path = excluded.original_image_storage_path,
        raw_ocr_text = excluded.raw_ocr_text,
        metadata = excluded.metadata,
        deleted_at = null
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.tombstone_health_capture_record(
  p_source_device_id text,
  p_client_event_id text,
  p_entity_type text,
  p_source_record_id text,
  p_deleted_at timestamptz default now(),
  p_payload jsonb default '{}'::jsonb
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_entity_type text := trim(coalesce(p_entity_type, ''));
  v_deleted_at timestamptz := coalesce(p_deleted_at, now());
  v_existing_event_type text;
  v_existing_entity_type text;
  v_existing_source_record_id text;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select hce.event_type, hce.entity_type, hce.source_record_id
    into v_existing_event_type, v_existing_entity_type, v_existing_source_record_id
  from public.health_capture_events hce
  where hce.owner_id = v_user
    and hce.source_device_id = trim(p_source_device_id)
    and hce.client_event_id = trim(p_client_event_id)
  limit 1;

  if v_existing_event_type is not null then
    if v_existing_entity_type <> v_entity_type
       or v_existing_source_record_id <> trim(p_source_record_id)
       or (
         v_entity_type = 'recovery_snapshot'
         and v_existing_event_type <> 'recovery_snapshot_deleted'
       )
       or (
         v_entity_type = 'body_measurement'
         and v_existing_event_type <> 'body_measurement_deleted'
       ) then
      raise exception 'client_event_id already used for a different health event';
    end if;

    return;
  end if;

  if v_entity_type = 'recovery_snapshot' then
    perform public.append_health_capture_event(
      p_source_device_id,
      p_client_event_id,
      'recovery_snapshot_deleted',
      'recovery_snapshot',
      p_source_record_id,
      jsonb_build_object('deleted_at', v_deleted_at) || coalesce(p_payload, '{}'::jsonb),
      v_deleted_at
    );

    update public.recovery_snapshots
      set deleted_at = v_deleted_at
    where owner_id = v_user
      and source_type = 'morpheus_screenshot'
      and source_record_id = trim(p_source_record_id);
  elsif v_entity_type = 'body_measurement' then
    perform public.append_health_capture_event(
      p_source_device_id,
      p_client_event_id,
      'body_measurement_deleted',
      'body_measurement',
      p_source_record_id,
      jsonb_build_object('deleted_at', v_deleted_at) || coalesce(p_payload, '{}'::jsonb),
      v_deleted_at
    );

    update public.body_measurements
      set deleted_at = v_deleted_at
    where owner_id = v_user
      and source_type = 'arboleaf_screenshot'
      and source_record_id = trim(p_source_record_id);
  else
    raise exception 'Unsupported entity_type: %', p_entity_type;
  end if;
end;
$$;

create or replace function public.upsert_health_device_checkpoint(
  p_device_id text,
  p_last_seen_event_id bigint
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_device_id text := trim(coalesce(p_device_id, ''));
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if v_device_id = '' then
    raise exception 'device_id is required';
  end if;

  insert into public.health_device_checkpoints (
    owner_id, device_id, last_seen_event_id
  )
  values (
    v_user, v_device_id, greatest(0, coalesce(p_last_seen_event_id, 0))
  )
  on conflict (owner_id, device_id) do update
    set last_seen_event_id = greatest(
      public.health_device_checkpoints.last_seen_event_id,
      excluded.last_seen_event_id
    );
end;
$$;

-- ------------------------------------------------------------
-- Grants
-- ------------------------------------------------------------

grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.arca_devices to authenticated;
grant select, insert on table public.health_capture_events to authenticated;
grant select, insert, update on table public.health_device_checkpoints to authenticated;
grant select, insert, update on table public.recovery_snapshots to authenticated;
grant select, insert, update on table public.body_measurements to authenticated;

grant usage, select on sequence public.health_capture_events_id_seq to authenticated;

grant execute on function public.register_health_device(text, text, text, text) to authenticated;
grant execute on function public.append_health_capture_event(text, text, text, text, text, jsonb, timestamptz) to authenticated;
grant execute on function public.upsert_recovery_snapshot_from_capture(text, text, text, timestamptz, timestamptz, numeric, numeric, integer, integer, integer, text, numeric, boolean, text, text, jsonb) to authenticated;
grant execute on function public.upsert_body_measurement_from_capture(text, text, text, timestamptz, timestamptz, numeric, numeric, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, integer, numeric, numeric, integer, numeric, text, numeric, boolean, text, text, jsonb) to authenticated;
grant execute on function public.tombstone_health_capture_record(text, text, text, text, timestamptz, jsonb) to authenticated;
grant execute on function public.upsert_health_device_checkpoint(text, bigint) to authenticated;

commit;
