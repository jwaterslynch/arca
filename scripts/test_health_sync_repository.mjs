#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  healthSyncFetchOptions,
  loadHealthCoachSyncSnapshot,
  loadHealthSyncReadModel,
  loadHealthSyncRows
} from "../src/lib/healthSyncRepository.js";

const recoveryRows = [
  {
    id: "r1",
    source_record_id: "morpheus-1",
    source_type: "morpheus_screenshot",
    measurement_at: "2026-04-28T06:57:15.000Z",
    captured_at: "2026-04-28T07:00:00.000Z",
    recovery_percent: 76,
    recovery_delta: -11,
    hrv: 70,
    activity: 5921,
    sleep_minutes: 502,
    parse_confidence: 1,
    needs_review: false
  }
];

const bodyRows = [
  {
    id: "b1",
    source_record_id: "arboleaf-1",
    source_type: "arboleaf_screenshot",
    measurement_at: "2026-04-28T06:50:00.000Z",
    captured_at: "2026-04-28T06:55:00.000Z",
    weight_kg: 76.4,
    body_fat_percent: 17.6,
    skeletal_muscle_percent: 48.2,
    muscle_mass_kg: 58.1,
    bmi: 23.1,
    parse_confidence: 1,
    needs_review: false
  }
];

function createMockClient() {
  const calls = [];
  return {
    calls,
    async fetchRecoverySnapshots(options) {
      calls.push({ method: "fetchRecoverySnapshots", options });
      return recoveryRows;
    },
    async fetchBodyMeasurements(options) {
      calls.push({ method: "fetchBodyMeasurements", options });
      return bodyRows;
    }
  };
}

function testFetchOptions() {
  assert.deepEqual(healthSyncFetchOptions(), {
    limit: 500,
    includeDeleted: false
  });
  assert.deepEqual(healthSyncFetchOptions({
    limit: "25",
    includeDeleted: true,
    updatedAfter: new Date("2026-04-28T00:00:00.000Z")
  }), {
    limit: 25,
    includeDeleted: true,
    updatedAfter: "2026-04-28T00:00:00.000Z"
  });
  assert.throws(() => healthSyncFetchOptions({ limit: 0 }), /limit must be an integer/);
  assert.throws(() => healthSyncFetchOptions({ updatedAfter: "not-a-date" }), /updatedAfter must be a valid ISO timestamp/);
}

async function testLoadRows() {
  const client = createMockClient();
  const rows = await loadHealthSyncRows(client, {
    limit: 25,
    updatedAfter: "2026-04-01T00:00:00.000Z"
  });

  assert.equal(rows.recoverySnapshots.length, 1);
  assert.equal(rows.bodyMeasurements.length, 1);
  assert.equal(client.calls.length, 2);
  assert.equal(client.calls[0].method, "fetchRecoverySnapshots");
  assert.deepEqual(client.calls[0].options, {
    limit: 25,
    includeDeleted: false,
    updatedAfter: "2026-04-01T00:00:00.000Z"
  });
  assert.deepEqual(client.calls[1].options, client.calls[0].options);
}

async function testLoadReadModel() {
  const client = createMockClient();
  const model = await loadHealthSyncReadModel(client, {
    anchorDate: "2026-04-28T23:59:59.000Z",
    timeZone: "Asia/Riyadh"
  });

  assert.equal(model.latestRecovery.sourceRecordId, "morpheus-1");
  assert.equal(model.latestBodyMeasurement.sourceRecordId, "arboleaf-1");
  assert.equal(model.recoverySummary.latestWorkoutImpactDelta, -11);
  assert.equal(model.recoverySummary.avg7d, 76);
  assert.equal(model.bodyMeasurements[0].measurementDate, "2026-04-28");
  assert.equal(model.sync.fetchLimit, 500);
  assert.equal(model.sync.recoveryRowCount, 1);
  assert.equal(model.sync.bodyMeasurementRowCount, 1);
}

async function testLoadCoachSnapshot() {
  const client = createMockClient();
  const snapshot = await loadHealthCoachSyncSnapshot(client, {
    anchorDate: "2026-04-28T23:59:59.000Z",
    timeZone: "Asia/Riyadh"
  });

  assert.equal(snapshot.recovery.count, 1);
  assert.equal(snapshot.recovery.latest.recovery_percent, 76);
  assert.equal(snapshot.recovery.latest_workout_impact_delta, -11);
  assert.equal(snapshot.body_composition.latest.weight_kg, 76.4);
  assert.equal(snapshot.sync.recoveryRowCount, 1);
}

async function testInvalidClient() {
  await assert.rejects(
    () => loadHealthSyncRows({ fetchRecoverySnapshots: async () => [] }),
    /fetchBodyMeasurements/
  );
  await assert.rejects(
    () => loadHealthSyncRows({
      fetchRecoverySnapshots: async () => ({}),
      fetchBodyMeasurements: async () => []
    }),
    /recoverySnapshots must be an array/
  );
}

testFetchOptions();
await testLoadRows();
await testLoadReadModel();
await testLoadCoachSnapshot();
await testInvalidClient();

console.log("Health sync repository tests passed.");
