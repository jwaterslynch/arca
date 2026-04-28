#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  buildHealthCoachSyncSnapshot,
  buildHealthSyncReadModel,
  localDateKey,
  normalizeBodyMeasurementRow,
  normalizeRecoverySnapshotRow
} from "../src/lib/healthSyncReadModel.js";

const recoveryRows = [
  {
    id: "r3",
    source_record_id: "morpheus-3",
    source_type: "morpheus_screenshot",
    source_device_id: "phone",
    measurement_at: "2026-04-28T06:57:15.000Z",
    captured_at: "2026-04-28T07:00:00.000Z",
    recovery_percent: "76",
    recovery_delta: "-11",
    hrv: 70,
    activity: 5921,
    sleep_minutes: 502,
    sleep_duration_display: "08:22",
    parse_confidence: "1",
    needs_review: false,
    updated_at: "2026-04-28T07:00:00.000Z"
  },
  {
    id: "r2",
    source_record_id: "morpheus-2",
    measurement_at: "2026-04-24T06:00:00.000Z",
    captured_at: "2026-04-24T06:05:00.000Z",
    recovery_percent: 88,
    recovery_delta: -5,
    hrv: 68,
    sleep_minutes: 480
  },
  {
    id: "r1",
    source_record_id: "morpheus-1",
    measurement_at: "2026-03-28T06:00:00.000Z",
    captured_at: "2026-03-28T06:05:00.000Z",
    recovery_percent: 90,
    hrv: 72,
    sleep_minutes: 450
  },
  {
    id: "r-deleted",
    source_record_id: "morpheus-deleted",
    measurement_at: "2026-04-27T06:00:00.000Z",
    captured_at: "2026-04-27T06:05:00.000Z",
    recovery_percent: 1,
    deleted_at: "2026-04-27T07:00:00.000Z"
  }
];

const bodyRows = [
  {
    id: "b2",
    source_record_id: "arboleaf-2",
    source_type: "arboleaf_screenshot",
    source_device_id: "phone",
    measurement_at: "2026-04-28T06:50:00.000Z",
    captured_at: "2026-04-28T06:55:00.000Z",
    weight_kg: "76.4",
    body_fat_percent: "17.6",
    skeletal_muscle_percent: "48.2",
    muscle_mass_kg: "58.1",
    bmi: "23.1",
    needs_review: false
  },
  {
    id: "b1",
    source_record_id: "arboleaf-1",
    measurement_at: "2026-03-27T06:50:00.000Z",
    captured_at: "2026-03-27T06:55:00.000Z",
    weight_kg: 77.2,
    body_fat_percent: 18.3,
    muscle_mass_kg: 57.8
  }
];

function testRowNormalizers() {
  const recovery = normalizeRecoverySnapshotRow(recoveryRows[0], { timeZone: "Asia/Riyadh" });
  assert.equal(recovery.kind, "recovery_snapshot");
  assert.equal(recovery.sourceRecordId, "morpheus-3");
  assert.equal(recovery.measurementDate, "2026-04-28");
  assert.equal(recovery.recoveryPercent, 76);
  assert.equal(recovery.recoveryDelta, -11);
  assert.equal(recovery.sleepHours, 502 / 60);

  const body = normalizeBodyMeasurementRow(bodyRows[0], { timeZone: "Asia/Riyadh" });
  assert.equal(body.kind, "body_measurement");
  assert.equal(body.weightKg, 76.4);
  assert.equal(body.bodyFatPercent, 17.6);
  assert.equal(body.muscleMassKg, 58.1);
}

function testReadModel() {
  const model = buildHealthSyncReadModel(
    { recoverySnapshots: recoveryRows, bodyMeasurements: bodyRows },
    { anchorDate: "2026-04-28T23:59:59.000Z", timeZone: "Asia/Riyadh" }
  );

  assert.equal(model.recoverySnapshots.length, 3);
  assert.equal(model.bodyMeasurements.length, 2);
  assert.equal(model.latestRecovery.sourceRecordId, "morpheus-3");
  assert.equal(model.latestBodyMeasurement.sourceRecordId, "arboleaf-2");
  assert.equal(model.coverage.first_measurement_at, "2026-03-27T06:50:00.000Z");
  assert.equal(model.coverage.latest_measurement_at, "2026-04-28T06:57:15.000Z");
  assert.equal(model.recoverySummary.avg7d, 82);
  assert.equal(model.recoverySummary.hrvAvg7d, 69);
  assert.equal(model.recoverySummary.sleepHoursAvg7d, 8.18);
  assert.equal(model.recoverySummary.latestWorkoutImpactDelta, -11);
  assert.equal(model.bodySummary.weightDelta30dKg, -0.8);
  assert.equal(model.bodySummary.bodyFatDelta30dPct, -0.7);
  assert.equal(model.bodySummary.muscleMassDelta30dKg, 0.3);
}

function testCoachSnapshot() {
  const model = buildHealthSyncReadModel(
    { recoverySnapshots: recoveryRows, bodyMeasurements: bodyRows },
    { anchorDate: "2026-04-28T23:59:59.000Z", timeZone: "Asia/Riyadh" }
  );
  const snapshot = buildHealthCoachSyncSnapshot(model);

  assert.equal(snapshot.recovery.count, 3);
  assert.equal(snapshot.recovery.latest.recovery_percent, 76);
  assert.equal(snapshot.recovery.avg_7d, 82);
  assert.equal(snapshot.body_composition.latest.weight_kg, 76.4);
  assert.equal(snapshot.body_composition.weight_delta_30d_kg, -0.8);
  assert.deepEqual(snapshot.review_flags, []);
}

function testDateKey() {
  assert.equal(localDateKey("2026-04-27T22:30:00.000Z", "Asia/Riyadh"), "2026-04-28");
  assert.equal(localDateKey("2026-04-27T22:30:00.000Z", "UTC"), "2026-04-27");
}

testRowNormalizers();
testReadModel();
testCoachSnapshot();
testDateKey();

console.log("Health sync read-model tests passed.");
