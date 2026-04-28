#!/usr/bin/env node

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

async function authHeaders() {
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
    apikey: anonKey,
    Authorization: `Bearer ${body.access_token}`,
    "Content-Type": "application/json"
  };
}

async function rpc(headers, name, payload) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  const body = await readJsonOrText(response);
  if (!response.ok) {
    throw new Error(`RPC ${name} failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function expectRpcFailure(headers, name, payload, expectedMessagePart) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  const body = await readJsonOrText(response);
  assert(!response.ok, `${name} should have failed`);
  const message = JSON.stringify(body);
  assert(
    message.includes(expectedMessagePart),
    `${name} failure should mention "${expectedMessagePart}", got ${message}`
  );
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

async function main() {
  console.log(`Health sync smoke test run: ${runId}`);
  const headers = await authHeaders();

  console.log("Registering device...");
  await rpc(headers, "register_health_device", {
    p_device_id: deviceId,
    p_platform: "smoke-test",
    p_app_version: "smoke",
    p_display_name: "Health Sync Smoke Test"
  });

  const now = new Date().toISOString();
  const recoveryEventId = `${runId}-recovery-upsert`;
  const bodyEventId = `${runId}-body-upsert`;

  console.log("Upserting recovery snapshot...");
  const recoveryUuid = await rpc(headers, "upsert_recovery_snapshot_from_capture", {
    p_source_device_id: deviceId,
    p_client_event_id: recoveryEventId,
    p_source_record_id: recoveryRecordId,
    p_measurement_at: now,
    p_captured_at: now,
    p_recovery_percent: 76,
    p_recovery_delta: -11,
    p_hrv: 70,
    p_activity: 5921,
    p_sleep_minutes: 502,
    p_sleep_duration_display: "08:22",
    p_parse_confidence: 1,
    p_needs_review: false,
    p_metadata: { smoke_test: true, run_id: runId }
  });
  assert(typeof recoveryUuid === "string" && recoveryUuid.length > 10, "recovery upsert returned uuid");

  console.log("Retrying same recovery event with changed payload; should be a no-op...");
  const retryRecoveryUuid = await rpc(headers, "upsert_recovery_snapshot_from_capture", {
    p_source_device_id: deviceId,
    p_client_event_id: recoveryEventId,
    p_source_record_id: recoveryRecordId,
    p_measurement_at: now,
    p_captured_at: now,
    p_recovery_percent: 55,
    p_recovery_delta: -2,
    p_hrv: 1,
    p_activity: 1,
    p_sleep_minutes: 1,
    p_sleep_duration_display: "00:01",
    p_parse_confidence: 0.1,
    p_needs_review: true,
    p_metadata: { smoke_test: true, run_id: runId, attempted_duplicate_mutation: true }
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
  await expectRpcFailure(
    headers,
    "upsert_body_measurement_from_capture",
    {
      p_source_device_id: deviceId,
      p_client_event_id: recoveryEventId,
      p_source_record_id: bodyRecordId,
      p_measurement_at: now,
      p_captured_at: now,
      p_weight_kg: 76.45
    },
    "client_event_id already used"
  );

  console.log("Upserting body measurement...");
  const bodyUuid = await rpc(headers, "upsert_body_measurement_from_capture", {
    p_source_device_id: deviceId,
    p_client_event_id: bodyEventId,
    p_source_record_id: bodyRecordId,
    p_measurement_at: now,
    p_captured_at: now,
    p_weight_kg: 76.45,
    p_source_weight_value: 76.45,
    p_source_weight_unit: "kg",
    p_body_fat_percent: 17.6,
    p_skeletal_muscle_percent: 48.2,
    p_muscle_mass_kg: 58.1,
    p_parse_confidence: 1,
    p_needs_review: false,
    p_metadata: { smoke_test: true, run_id: runId }
  });
  assert(typeof bodyUuid === "string" && bodyUuid.length > 10, "body upsert returned uuid");

  const bodyRows = await selectRows(headers, "body_measurements", {
    select: "id,source_record_id,weight_kg,body_fat_percent,deleted_at",
    source_record_id: `eq.${bodyRecordId}`
  });
  assert(bodyRows.length === 1, "one body measurement row exists");
  assert(numeric(bodyRows[0].weight_kg) === 76.45, "body weight persisted");

  console.log("Tombstoning records...");
  const recoveryDeleteEventId = `${runId}-recovery-delete`;
  const bodyDeleteEventId = `${runId}-body-delete`;

  await rpc(headers, "tombstone_health_capture_record", {
    p_source_device_id: deviceId,
    p_client_event_id: recoveryDeleteEventId,
    p_entity_type: "recovery_snapshot",
    p_source_record_id: recoveryRecordId,
    p_deleted_at: new Date().toISOString(),
    p_payload: { smoke_test: true, run_id: runId }
  });
  await rpc(headers, "tombstone_health_capture_record", {
    p_source_device_id: deviceId,
    p_client_event_id: recoveryDeleteEventId,
    p_entity_type: "recovery_snapshot",
    p_source_record_id: recoveryRecordId,
    p_deleted_at: new Date(Date.now() + 60_000).toISOString(),
    p_payload: { smoke_test: true, run_id: runId, attempted_duplicate_delete: true }
  });
  await rpc(headers, "tombstone_health_capture_record", {
    p_source_device_id: deviceId,
    p_client_event_id: bodyDeleteEventId,
    p_entity_type: "body_measurement",
    p_source_record_id: bodyRecordId,
    p_deleted_at: new Date().toISOString(),
    p_payload: { smoke_test: true, run_id: runId }
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
  await rpc(headers, "upsert_health_device_checkpoint", {
    p_device_id: deviceId,
    p_last_seen_event_id: maxEventId
  });
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
