#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  bodyMeasurementPayload,
  createHealthSyncClient,
  HealthSyncError,
  newClientEventId,
  recoveryPayload
} from "../src/lib/healthSyncClient.js";

function jsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status || 200,
    async text() {
      return body === undefined ? "" : JSON.stringify(body);
    }
  };
}

function createMockFetch(responseBody = { ok: true }) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse(responseBody);
  };
  return { calls, fetchImpl };
}

function testPayloadMappers() {
  const capturedAt = new Date("2026-04-28T07:10:00.000Z");
  const recovery = recoveryPayload({
    deviceId: "phone-1",
    clientEventId: "evt-recovery-1",
    sourceRecordId: "local-recovery-1",
    measurementAt: "2026-04-28T06:57:15.000Z",
    capturedAt,
    recoveryPercent: "76",
    recoveryDelta: "-11",
    hrv: 70,
    activity: 5921,
    sleepMinutes: 502,
    sleepDurationDisplay: "08:22",
    parseConfidence: 1,
    metadata: { source: "test" }
  });

  assert.equal(recovery.p_source_device_id, "phone-1");
  assert.equal(recovery.p_client_event_id, "evt-recovery-1");
  assert.equal(recovery.p_measurement_at, "2026-04-28T06:57:15.000Z");
  assert.equal(recovery.p_captured_at, "2026-04-28T07:10:00.000Z");
  assert.equal(recovery.p_recovery_percent, 76);
  assert.equal(recovery.p_recovery_delta, -11);
  assert.equal(recovery.p_needs_review, false);

  const body = bodyMeasurementPayload({
    deviceId: "phone-1",
    clientEventId: "evt-body-1",
    sourceRecordId: "local-body-1",
    measurementAt: capturedAt,
    capturedAt,
    weightKg: "76.45",
    sourceWeightValue: "168.54",
    sourceWeightUnit: "lb",
    bodyFatPercent: 17.6,
    bmrKcal: "1730",
    needsReview: true
  });

  assert.equal(body.p_weight_kg, 76.45);
  assert.equal(body.p_source_weight_value, 168.54);
  assert.equal(body.p_source_weight_unit, "lb");
  assert.equal(body.p_bmr_kcal, 1730);
  assert.equal(body.p_needs_review, true);

  assert.throws(
    () => recoveryPayload({ deviceId: "phone-1" }),
    /clientEventId is required/
  );
  assert.throws(
    () => bodyMeasurementPayload({ deviceId: "phone-1", clientEventId: "evt", sourceRecordId: "rec", measurementAt: capturedAt, capturedAt }),
    /weightKg must be a finite number/
  );
}

async function testRpcRequests() {
  const mock = createMockFetch("returned-id");
  const client = createHealthSyncClient({
    supabaseUrl: "https://example.supabase.co/",
    anonKey: "anon",
    accessToken: "token",
    fetchImpl: mock.fetchImpl
  });

  const result = await client.upsertRecoverySnapshot({
    deviceId: "phone-1",
    clientEventId: "evt-recovery-1",
    sourceRecordId: "local-recovery-1",
    measurementAt: "2026-04-28T06:57:15.000Z",
    capturedAt: "2026-04-28T07:10:00.000Z",
    recoveryPercent: 76
  });

  assert.equal(result, "returned-id");
  assert.equal(mock.calls.length, 1);
  assert.equal(
    mock.calls[0].url,
    "https://example.supabase.co/rest/v1/rpc/upsert_recovery_snapshot_from_capture"
  );
  assert.equal(mock.calls[0].options.method, "POST");
  assert.equal(mock.calls[0].options.headers.apikey, "anon");
  assert.equal(mock.calls[0].options.headers.Authorization, "Bearer token");

  const payload = JSON.parse(mock.calls[0].options.body);
  assert.equal(payload.p_source_device_id, "phone-1");
  assert.equal(payload.p_recovery_percent, 76);
}

async function testSelectRequests() {
  const mock = createMockFetch([]);
  const client = createHealthSyncClient({
    supabaseUrl: "https://example.supabase.co",
    anonKey: "anon",
    accessToken: "token",
    fetchImpl: mock.fetchImpl
  });

  await client.fetchEventsAfter({ lastSeenEventId: 12, limit: 25 });
  assert.match(mock.calls[0].url, /health_capture_events/);
  assert.match(mock.calls[0].url, /id=gt\.12/);
  assert.match(mock.calls[0].url, /order=id\.asc/);
  assert.match(mock.calls[0].url, /limit=25/);

  await client.fetchRecoverySnapshots();
  assert.match(mock.calls[1].url, /recovery_snapshots/);
  assert.match(mock.calls[1].url, /deleted_at=is\.null/);
}

async function testErrorHandling() {
  const calls = [];
  const client = createHealthSyncClient({
    supabaseUrl: "http://localhost:54321",
    anonKey: "anon",
    accessToken: "token",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ message: "bad" }, { ok: false, status: 400 });
    }
  });

  await assert.rejects(
    () => client.registerDevice({ deviceId: "phone-1" }),
    (error) => error instanceof HealthSyncError && error.status === 400 && error.body.message === "bad"
  );

  assert.equal(calls.length, 1);
  assert.throws(
    () => createHealthSyncClient({ supabaseUrl: "http://example.com", anonKey: "anon", accessToken: "token", fetchImpl: () => {} }),
    /supabaseUrl must be HTTPS/
  );
}

function testEventIds() {
  const id = newClientEventId("recovery");
  assert.match(id, /^recovery-/);
}

await testPayloadMappers();
await testRpcRequests();
await testSelectRequests();
await testErrorHandling();
testEventIds();

console.log("Health sync client tests passed.");
