#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const migrationPath = path.join(
  repoRoot,
  "supabase",
  "migrations",
  "20260428180000_health_sync_foundation.sql"
);

const sql = fs.readFileSync(migrationPath, "utf8");

const requiredFragments = [
  "create table if not exists public.arca_devices",
  "create table if not exists public.health_capture_events",
  "create table if not exists public.health_device_checkpoints",
  "create table if not exists public.recovery_snapshots",
  "create table if not exists public.body_measurements",
  "unique (owner_id, source_device_id, client_event_id)",
  "alter table public.arca_devices enable row level security",
  "alter table public.health_capture_events enable row level security",
  "alter table public.health_device_checkpoints enable row level security",
  "alter table public.recovery_snapshots enable row level security",
  "alter table public.body_measurements enable row level security",
  "owner_id = auth.uid()",
  "create or replace function public.register_health_device",
  "create or replace function public.append_health_capture_event",
  "create or replace function public.upsert_recovery_snapshot_from_capture",
  "create or replace function public.upsert_body_measurement_from_capture",
  "create or replace function public.tombstone_health_capture_record",
  "create or replace function public.upsert_health_device_checkpoint",
  "client_event_id already used for a different health event",
  "grant select, insert on table public.health_capture_events to authenticated"
];

const failures = [];

for (const fragment of requiredFragments) {
  if (!sql.includes(fragment)) {
    failures.push(`Missing required fragment: ${fragment}`);
  }
}

const hasUpdateGrantOnEvents = /grant\s+[^;]*\bupdate\b[^;]*on\s+table\s+public\.health_capture_events\b/i.test(sql);
const hasDeleteGrantOnEvents = /grant\s+[^;]*\bdelete\b[^;]*on\s+table\s+public\.health_capture_events\b/i.test(sql);
const hasDeleteGrantOnRecovery = /grant\s+[^;]*\bdelete\b[^;]*on\s+table\s+public\.recovery_snapshots\b/i.test(sql);
const hasDeleteGrantOnBody = /grant\s+[^;]*\bdelete\b[^;]*on\s+table\s+public\.body_measurements\b/i.test(sql);

if (hasUpdateGrantOnEvents) {
  failures.push("health_capture_events must not grant UPDATE; events are append-only.");
}

if (hasDeleteGrantOnEvents) {
  failures.push("health_capture_events must not grant DELETE; events are append-only.");
}

if (hasDeleteGrantOnRecovery) {
  failures.push("recovery_snapshots must not grant DELETE; use tombstone_health_capture_record.");
}

if (hasDeleteGrantOnBody) {
  failures.push("body_measurements must not grant DELETE; use tombstone_health_capture_record.");
}

const beginCount = (sql.match(/\bbegin\s*;/gi) || []).length;
const commitCount = (sql.match(/\bcommit\s*;/gi) || []).length;

if (beginCount !== 1 || commitCount !== 1) {
  failures.push(`Expected one begin/commit pair, found begin=${beginCount}, commit=${commitCount}.`);
}

if (failures.length) {
  console.error("Health sync schema contract check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Health sync schema contract check passed.");
