#!/usr/bin/env node

import {
  createHealthSyncClient,
  HealthSyncError
} from "../src/lib/healthSyncClient.js";
import {
  loadHealthCoachSyncSnapshot,
  loadHealthSyncReadModel
} from "../src/lib/healthSyncRepository.js";

const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_TEST_EMAIL",
  "SUPABASE_TEST_PASSWORD"
];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error("Missing required environment variables:");
  for (const key of missing) console.error(`- ${key}`);
  console.error("\nExample:");
  console.error("SUPABASE_URL=https://project.supabase.co \\");
  console.error("SUPABASE_ANON_KEY=... \\");
  console.error("SUPABASE_TEST_EMAIL=test@example.com \\");
  console.error("SUPABASE_TEST_PASSWORD=... \\");
  console.error("npm run smoke:health-sync");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL.replace(/\/+$/, "");
const anonKey = process.env.SUPABASE_ANON_KEY;
const email = process.env.SUPABASE_TEST_EMAIL;
const password = process.env.SUPABASE_TEST_PASSWORD;

const runId = `smoke-${new Date().toISOString().replace(/[-:.TZ]/g, "")}-${Math.random()
  .toString(16)
  .slice(2, 8)}`;
const deviceId = `${runId}-device`;
const recoveryRecordId = `${runId}-recovery`;
const bodyRecordId = `${runId}-body`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function readJsonOrText(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function authSession() {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  const body = await readJsonOrText(response);
  if (!response.ok) {
    throw new Error(`Auth failed (${response.status}): ${JSON.stringify(body)}`);
  }
  assert(body?.access_token, "auth response returned an access token");
  return {
    accessToken: body.access_token,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${body.access_token}`,
      "Content-Type": "application/json"
    }
  };
}

async function selectRows(headers, table, params) {
  const query = new URLSearchParams(params);
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "GET",
    headers
  });
  const body = await readJsonOrText(response);
  if (!response.ok) {
    throw new Error(`Select ${table} failed (${response.status}): ${JSON.stringify(body)}`);
  }
  assert(Array.isArray(body), `${table} select returned an array`);
  return body;
}

function numeric(value) {
  return Number(value);
}

async function expectClientFailure(operation, expectedMessagePart) {
  try {
    await operation();
  } catch (error) {
    assert(error instanceof HealthSyncError, "failure came from HealthSyncError");
    const message = JSON.stringify(error.body ?? error.message);
    assert(
      message.includes(expectedMessagePart),
      `failure should mention "${expectedMessagePart}", got ${message}`
    );
    return;
  }
  throw new Error(`Expected client operation to fail with "${expectedMessagePart}"`);
}

async function main() {
  console.log(`Health sync smoke test run: ${runId}`);
  const session = await authSession();
  const headers = session.headers;
  const client = createHealthSyncClient({
    supabaseUrl,
    anonKey,
    accessToken: session.accessToken
  });

  console.log("Registering device...");
  await client.registerDevice({
    deviceId,
    platform: "smoke-test",
    appVersion: "smoke",
    displayName: "Health Sync Smoke Test"
  });

  const now = new Date().toISOString();
  const recoveryEventId = `${runId}-recovery-upsert`;
  const bodyEventId = `${runId}-body-upsert`;

  console.log("Upserting recovery snapshot...");
  const recoveryUuid = await client.upsertRecoverySnapshot({
    deviceId,
    clientEventId: recoveryEventId,
    sourceRecordId: recoveryRecordId,
    measurementAt: now,
    capturedAt: now,
    recoveryPercent: 76,
    recoveryDelta: -11,
    hrv: 70,
    activity: 5921,
    sleepMinutes: 502,
    sleepDurationDisplay: "08:22",
    parseConfidence: 1,
    needsReview: false,
    metadata: { smoke_test: true, run_id: runId }
  });
  assert(typeof recoveryUuid === "string" && recoveryUuid.length > 10, "recovery upsert returned uuid");

  console.log("Retrying same recovery event with changed payload; should be a no-op...");
  const retryRecoveryUuid = await client.upsertRecoverySnapshot({
    deviceId,
    clientEventId: recoveryEventId,
    sourceRecordId: recoveryRecordId,
    measurementAt: now,
    capturedAt: now,
    recoveryPercent: 55,
    recoveryDelta: -2,
    hrv: 1,
    activity: 1,
    sleepMinutes: 1,
    sleepDurationDisplay: "00:01",
    parseConfidence: 0.1,
    needsReview: true,
    metadata: { smoke_test: true, run_id: runId, attempted_duplicate_mutation: true }
  });
  assert(retryRecoveryUuid === recoveryUuid, "duplicate recovery event returned same uuid");

  const recoveryRows = await selectRows(headers, "recovery_snapshots", {
    select: "id,source_record_id,recovery_percent,recovery_delta,hrv,activity,sleep_minutes,deleted_at",
    source_record_id: `eq.${recoveryRecordId}`
  });
  assert(recoveryRows.length === 1, "one recovery row exists");
  assert(numeric(recoveryRows[0].recovery_percent) === 76, "duplicate retry did not mutate recovery_percent");
  assert(numeric(recoveryRows[0].recovery_delta) === -11, "duplicate retry did not mutate recovery_delta");
  assert(numeric(recoveryRows[0].hrv) === 70, "duplicate retry did not mutate hrv");

  console.log("Checking duplicate event id cannot be reused for a different entity...");
  await expectClientFailure(
    () => client.upsertBodyMeasurement({
      deviceId,
      clientEventId: recoveryEventId,
      sourceRecordId: bodyRecordId,
      measurementAt: now,
      capturedAt: now,
      weightKg: 76.45
    }),
    "client_event_id already used"
  );

  console.log("Upserting body measurement...");
  const bodyUuid = await client.upsertBodyMeasurement({
    deviceId,
    clientEventId: bodyEventId,
    sourceRecordId: bodyRecordId,
    measurementAt: now,
    capturedAt: now,
    weightKg: 76.45,
    sourceWeightValue: 76.45,
    sourceWeightUnit: "kg",
    bodyFatPercent: 17.6,
    skeletalMusclePercent: 48.2,
    muscleMassKg: 58.1,
    parseConfidence: 1,
    needsReview: false,
    metadata: { smoke_test: true, run_id: runId }
  });
  assert(typeof bodyUuid === "string" && bodyUuid.length > 10, "body upsert returned uuid");

  const bodyRows = await selectRows(headers, "body_measurements", {
    select: "id,source_record_id,weight_kg,body_fat_percent,deleted_at",
    source_record_id: `eq.${bodyRecordId}`
  });
  assert(bodyRows.length === 1, "one body measurement row exists");
  assert(numeric(bodyRows[0].weight_kg) === 76.45, "body weight persisted");

  console.log("Loading repository read model...");
  const readModel = await loadHealthSyncReadModel(client, {
    includeDeleted: true,
    limit: 5000,
    anchorDate: now,
    timeZone: "UTC"
  });
  const modelRecovery = readModel.recoverySnapshots.find((row) => row.sourceRecordId === recoveryRecordId);
  const modelBody = readModel.bodyMeasurements.find((row) => row.sourceRecordId === bodyRecordId);
  assert(modelRecovery?.recoveryDelta === -11, "repository read model normalized recovery delta");
  assert(modelRecovery?.sleepHours === 502 / 60, "repository read model normalized sleep hours");
  assert(modelBody?.weightKg === 76.45, "repository read model normalized body weight");

  const coachSnapshot = await loadHealthCoachSyncSnapshot(client, {
    includeDeleted: true,
    limit: 5000,
    anchorDate: now,
    timeZone: "UTC"
  });
  assert(coachSnapshot.sync.recoveryRowCount >= 1, "coach sync snapshot loaded recovery rows");
  assert(coachSnapshot.sync.bodyMeasurementRowCount >= 1, "coach sync snapshot loaded body measurement rows");

  console.log("Tombstoning records...");
  const recoveryDeleteEventId = `${runId}-recovery-delete`;
  const bodyDeleteEventId = `${runId}-body-delete`;

  await client.tombstoneRecord({
    deviceId,
    clientEventId: recoveryDeleteEventId,
    entityType: "recovery_snapshot",
    sourceRecordId: recoveryRecordId,
    deletedAt: new Date(),
    payload: { smoke_test: true, run_id: runId }
  });
  await client.tombstoneRecord({
    deviceId,
    clientEventId: recoveryDeleteEventId,
    entityType: "recovery_snapshot",
    sourceRecordId: recoveryRecordId,
    deletedAt: new Date(Date.now() + 60_000),
    payload: { smoke_test: true, run_id: runId, attempted_duplicate_delete: true }
  });
  await client.tombstoneRecord({
    deviceId,
    clientEventId: bodyDeleteEventId,
    entityType: "body_measurement",
    sourceRecordId: bodyRecordId,
    deletedAt: new Date(),
    payload: { smoke_test: true, run_id: runId }
  });

  const tombstonedRecovery = await selectRows(headers, "recovery_snapshots", {
    select: "source_record_id,deleted_at",
    source_record_id: `eq.${recoveryRecordId}`
  });
  const tombstonedBody = await selectRows(headers, "body_measurements", {
    select: "source_record_id,deleted_at",
    source_record_id: `eq.${bodyRecordId}`
  });
  assert(!!tombstonedRecovery[0]?.deleted_at, "recovery row was tombstoned");
  assert(!!tombstonedBody[0]?.deleted_at, "body row was tombstoned");

  const eventRows = await selectRows(headers, "health_capture_events", {
    select: "id,event_type,entity_type,source_record_id,client_event_id",
    source_record_id: `in.(${recoveryRecordId},${bodyRecordId})`,
    order: "id.asc"
  });
  const uniqueClientEvents = new Set(eventRows.map((row) => row.client_event_id));
  assert(eventRows.length === uniqueClientEvents.size, "event rows are unique by client_event_id");
  assert(eventRows.length === 4, "exactly four events persisted: recovery upsert/delete + body upsert/delete");

  const maxEventId = Math.max(...eventRows.map((row) => Number(row.id)));
  await client.upsertCheckpoint(deviceId, maxEventId);
  const checkpointRows = await selectRows(headers, "health_device_checkpoints", {
    select: "device_id,last_seen_event_id",
    device_id: `eq.${deviceId}`
  });
  assert(checkpointRows.length === 1, "checkpoint row exists");
  assert(Number(checkpointRows[0].last_seen_event_id) === maxEventId, "checkpoint advanced to max event id");

  console.log("Health sync smoke test passed.");
  console.log(`Created tombstoned test records with run_id=${runId}`);
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
