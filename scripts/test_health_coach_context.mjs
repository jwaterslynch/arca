#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  buildHealthCoachContext,
  compactCompanionSyncSnapshot,
  compactDesktopHealthSnapshot
} from "../src/lib/healthCoachContext.js";

const desktopSnapshot = {
  current_surface: "Health > Overview",
  visible_modules: ["Overview", "Exercise", "Sleep"],
  focused_practice: {
    id: "practice-1",
    title: "Gym"
  },
  profile_summary: {
    target_sessions_per_week: 4
  },
  training_block: null,
  exercise_summary: {
    practice_count: 1
  },
  nutrition_summary: null,
  sleep_summary: {
    recovery_state: "Steady",
    avg_sleep_hours_7d: 7.1
  },
  body_composition: {
    latest_weight_kg: 77,
    waist_to_hip_ratio: 0.82
  },
  ignored_large_field: "not part of the stable context"
};

const companionSnapshot = {
  generated_at: "2026-04-28T07:05:00.000Z",
  coverage: {
    first_measurement_at: "2026-04-24T06:00:00.000Z",
    latest_measurement_at: "2026-04-28T06:57:15.000Z",
    days_covered: 5
  },
  recovery: {
    count: 2,
    latest: {
      measurement_date: "2026-04-28",
      recovery_percent: 76,
      recovery_delta: -11,
      hrv: 70,
      activity: 5921,
      sleep_hours: 8.37
    },
    avg_7d: 82,
    hrv_avg_7d: 69,
    sleep_hours_avg_7d: 8.18,
    latest_workout_impact_delta: -11
  },
  body_composition: {
    count: 1,
    latest: {
      measurement_date: "2026-04-28",
      weight_kg: 76.4,
      body_fat_percent: 17.6,
      muscle_mass_kg: 58.1
    },
    weight_delta_30d_kg: -0.8,
    body_fat_delta_30d_pct: -0.7,
    muscle_mass_delta_30d_kg: 0.3
  },
  review_flags: [
    {
      kind: "recovery_snapshot",
      source_record_id: "morpheus-1",
      measurement_date: "2026-04-28"
    }
  ],
  sync: {
    fetchedAt: "2026-04-28T07:06:00.000Z",
    recoveryRowCount: 2,
    bodyMeasurementRowCount: 1
  }
};

function testCompactors() {
  const desktop = compactDesktopHealthSnapshot(desktopSnapshot);
  assert.equal(desktop.current_surface, "Health > Overview");
  assert.deepEqual(desktop.visible_modules, ["Overview", "Exercise", "Sleep"]);
  assert.equal(desktop.ignored_large_field, undefined);

  const companion = compactCompanionSyncSnapshot(companionSnapshot);
  assert.equal(companion.recovery.count, 2);
  assert.equal(companion.recovery.latest.recovery_delta, -11);
  assert.equal(companion.body_composition.latest.weight_kg, 76.4);
  assert.equal(companion.review_flags.length, 1);
}

function testBuildContext() {
  const context = buildHealthCoachContext({
    generatedAt: "2026-04-28T07:10:00.000Z",
    desktopSnapshot,
    companionSnapshot
  });

  assert.equal(context.context_version, "health-coach-context-v1");
  assert.equal(context.generated_at, "2026-04-28T07:10:00.000Z");
  assert.equal(context.current_surface, "Health > Overview");
  assert.equal(context.desktop_health.body_composition.latest_weight_kg, 77);
  assert.equal(context.companion_capture.recovery.latest.recovery_percent, 76);
  assert.equal(context.combined_signals.desktop.avg_sleep_hours_7d, 7.1);
  assert.equal(context.combined_signals.companion.latest_recovery_delta, -11);
  assert.equal(context.combined_signals.companion.latest_body_weight_kg, 76.4);
  assert.equal(context.combined_signals.review_flag_count, 1);
  assert.deepEqual(context.combined_signals.latest_weight_sources, [
    {
      source: "desktop_health",
      weight_kg: 77
    },
    {
      source: "companion_arboleaf",
      measurement_date: "2026-04-28",
      weight_kg: 76.4
    }
  ]);
  assert(context.combined_signals.data_gaps.includes("Some synced health captures still need review."));
}

function testMissingInputs() {
  const context = buildHealthCoachContext({
    generatedAt: "2026-04-28T07:10:00.000Z"
  });

  assert.equal(context.desktop_health, null);
  assert.equal(context.companion_capture, null);
  assert.equal(context.combined_signals.review_flag_count, 0);
  assert(context.combined_signals.data_gaps.includes("No desktop Health snapshot is available."));
  assert(context.combined_signals.data_gaps.includes("No synced companion health capture is available."));
}

function testInvalidGeneratedAt() {
  assert.throws(
    () => buildHealthCoachContext({ generatedAt: "bad-date" }),
    /generatedAt must be a valid ISO timestamp/
  );
}

testCompactors();
testBuildContext();
testMissingInputs();
testInvalidGeneratedAt();

console.log("Health coach context tests passed.");
