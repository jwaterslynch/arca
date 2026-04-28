const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeRecoverySnapshotRow(row = {}, options = {}) {
  const measurementAt = isoTimestamp(row.measurement_at || row.measurementAt, "measurement_at");
  const capturedAt = optionalIsoTimestamp(row.captured_at || row.capturedAt);
  const deletedAt = optionalIsoTimestamp(row.deleted_at || row.deletedAt);
  return {
    kind: "recovery_snapshot",
    id: stringOrNull(row.id),
    sourceRecordId: requiredString(row.source_record_id || row.sourceRecordId, "source_record_id"),
    sourceType: stringOrDefault(row.source_type || row.sourceType, "morpheus_screenshot"),
    sourceDeviceId: stringOrNull(row.source_device_id || row.sourceDeviceId),
    measurementAt,
    measurementDate: localDateKey(measurementAt, options.timeZone),
    capturedAt,
    recoveryPercent: finiteNumberOrNull(row.recovery_percent ?? row.recoveryPercent),
    recoveryDelta: finiteNumberOrNull(row.recovery_delta ?? row.recoveryDelta),
    hrv: integerOrNull(row.hrv),
    activity: integerOrNull(row.activity),
    sleepMinutes: integerOrNull(row.sleep_minutes ?? row.sleepMinutes),
    sleepHours: integerOrNull(row.sleep_minutes ?? row.sleepMinutes) == null
      ? null
      : integerOrNull(row.sleep_minutes ?? row.sleepMinutes) / 60,
    sleepDurationDisplay: stringOrNull(row.sleep_duration_display || row.sleepDurationDisplay),
    parseConfidence: finiteNumberOrNull(row.parse_confidence ?? row.parseConfidence),
    needsReview: row.needs_review === true || row.needsReview === true,
    deletedAt,
    updatedAt: optionalIsoTimestamp(row.updated_at || row.updatedAt)
  };
}

export function normalizeBodyMeasurementRow(row = {}, options = {}) {
  const measurementAt = isoTimestamp(row.measurement_at || row.measurementAt, "measurement_at");
  const capturedAt = optionalIsoTimestamp(row.captured_at || row.capturedAt);
  const deletedAt = optionalIsoTimestamp(row.deleted_at || row.deletedAt);
  return {
    kind: "body_measurement",
    id: stringOrNull(row.id),
    sourceRecordId: requiredString(row.source_record_id || row.sourceRecordId, "source_record_id"),
    sourceType: stringOrDefault(row.source_type || row.sourceType, "arboleaf_screenshot"),
    sourceDeviceId: stringOrNull(row.source_device_id || row.sourceDeviceId),
    measurementAt,
    measurementDate: localDateKey(measurementAt, options.timeZone),
    capturedAt,
    weightKg: finiteNumberOrNull(row.weight_kg ?? row.weightKg),
    sourceWeightValue: finiteNumberOrNull(row.source_weight_value ?? row.sourceWeightValue),
    sourceWeightUnit: stringOrNull(row.source_weight_unit || row.sourceWeightUnit),
    bodyFatPercent: finiteNumberOrNull(row.body_fat_percent ?? row.bodyFatPercent),
    skeletalMusclePercent: finiteNumberOrNull(row.skeletal_muscle_percent ?? row.skeletalMusclePercent),
    muscleMassKg: finiteNumberOrNull(row.muscle_mass_kg ?? row.muscleMassKg),
    bodyWaterPercent: finiteNumberOrNull(row.body_water_percent ?? row.bodyWaterPercent),
    boneMassKg: finiteNumberOrNull(row.bone_mass_kg ?? row.boneMassKg),
    visceralFat: finiteNumberOrNull(row.visceral_fat ?? row.visceralFat),
    subcutaneousFatPercent: finiteNumberOrNull(row.subcutaneous_fat_percent ?? row.subcutaneousFatPercent),
    metabolicAge: integerOrNull(row.metabolic_age ?? row.metabolicAge),
    bmi: finiteNumberOrNull(row.bmi),
    proteinPercent: finiteNumberOrNull(row.protein_percent ?? row.proteinPercent),
    bmrKcal: integerOrNull(row.bmr_kcal ?? row.bmrKcal),
    fatFreeBodyWeightKg: finiteNumberOrNull(row.fat_free_body_weight_kg ?? row.fatFreeBodyWeightKg),
    bodyType: stringOrNull(row.body_type || row.bodyType),
    parseConfidence: finiteNumberOrNull(row.parse_confidence ?? row.parseConfidence),
    needsReview: row.needs_review === true || row.needsReview === true,
    deletedAt,
    updatedAt: optionalIsoTimestamp(row.updated_at || row.updatedAt)
  };
}

export function buildHealthSyncReadModel(input = {}, options = {}) {
  const recoverySnapshots = (input.recoverySnapshots || [])
    .map((row) => normalizeRecoverySnapshotRow(row, options))
    .filter((row) => options.includeDeleted || !row.deletedAt)
    .sort(descendingMeasurementAt);

  const bodyMeasurements = (input.bodyMeasurements || [])
    .map((row) => normalizeBodyMeasurementRow(row, options))
    .filter((row) => options.includeDeleted || !row.deletedAt)
    .sort(descendingMeasurementAt);

  const allMeasurements = [...recoverySnapshots, ...bodyMeasurements].sort(descendingMeasurementAt);
  const anchorDate = options.anchorDate ? isoTimestamp(options.anchorDate, "anchorDate") : new Date().toISOString();

  return {
    generatedAt: new Date().toISOString(),
    timeZone: options.timeZone || "UTC",
    anchorDate,
    recoverySnapshots,
    bodyMeasurements,
    latestRecovery: recoverySnapshots[0] || null,
    latestBodyMeasurement: bodyMeasurements[0] || null,
    coverage: buildCoverage(allMeasurements),
    recoverySummary: buildRecoverySummary(recoverySnapshots, anchorDate),
    bodySummary: buildBodySummary(bodyMeasurements, anchorDate)
  };
}

export function buildHealthCoachSyncSnapshot(readModel) {
  const model = readModel?.recoverySummary && readModel?.bodySummary
    ? readModel
    : buildHealthSyncReadModel(readModel || {});

  return {
    generated_at: model.generatedAt,
    coverage: model.coverage,
    recovery: {
      count: model.recoverySnapshots.length,
      latest: model.latestRecovery ? compactRecovery(model.latestRecovery) : null,
      avg_7d: model.recoverySummary.avg7d,
      avg_30d: model.recoverySummary.avg30d,
      hrv_avg_7d: model.recoverySummary.hrvAvg7d,
      hrv_avg_30d: model.recoverySummary.hrvAvg30d,
      sleep_hours_avg_7d: model.recoverySummary.sleepHoursAvg7d,
      sleep_hours_avg_30d: model.recoverySummary.sleepHoursAvg30d,
      latest_workout_impact_delta: model.recoverySummary.latestWorkoutImpactDelta
    },
    body_composition: {
      count: model.bodyMeasurements.length,
      latest: model.latestBodyMeasurement ? compactBody(model.latestBodyMeasurement) : null,
      weight_delta_30d_kg: model.bodySummary.weightDelta30dKg,
      body_fat_delta_30d_pct: model.bodySummary.bodyFatDelta30dPct,
      muscle_mass_delta_30d_kg: model.bodySummary.muscleMassDelta30dKg
    },
    review_flags: model.recoverySnapshots
      .filter((row) => row.needsReview)
      .map((row) => ({ kind: row.kind, source_record_id: row.sourceRecordId, measurement_date: row.measurementDate }))
      .concat(
        model.bodyMeasurements
          .filter((row) => row.needsReview)
          .map((row) => ({ kind: row.kind, source_record_id: row.sourceRecordId, measurement_date: row.measurementDate }))
      )
      .slice(0, 20)
  };
}

function buildCoverage(rows) {
  if (!rows.length) {
    return {
      first_measurement_at: null,
      latest_measurement_at: null,
      days_covered: 0
    };
  }
  const sortedAsc = [...rows].sort(ascendingMeasurementAt);
  const first = sortedAsc[0].measurementAt;
  const latest = sortedAsc[sortedAsc.length - 1].measurementAt;
  return {
    first_measurement_at: first,
    latest_measurement_at: latest,
    days_covered: Math.max(1, Math.round((new Date(latest) - new Date(first)) / DAY_MS) + 1)
  };
}

function buildRecoverySummary(rows, anchorDate) {
  const in7 = rowsWithinDays(rows, anchorDate, 7);
  const in30 = rowsWithinDays(rows, anchorDate, 30);
  return {
    avg7d: average(in7.map((row) => row.recoveryPercent)),
    avg30d: average(in30.map((row) => row.recoveryPercent)),
    hrvAvg7d: average(in7.map((row) => row.hrv)),
    hrvAvg30d: average(in30.map((row) => row.hrv)),
    sleepHoursAvg7d: average(in7.map((row) => row.sleepHours)),
    sleepHoursAvg30d: average(in30.map((row) => row.sleepHours)),
    latestWorkoutImpactDelta: firstFinite(rows.map((row) => row.recoveryDelta))
  };
}

function buildBodySummary(rows, anchorDate) {
  const latest = rows[0] || null;
  const comparison = latest ? nearestAtOrBefore(rows, new Date(anchorDate).getTime() - (30 * DAY_MS)) : null;
  return {
    weightDelta30dKg: latest && comparison ? delta(latest.weightKg, comparison.weightKg) : null,
    bodyFatDelta30dPct: latest && comparison ? delta(latest.bodyFatPercent, comparison.bodyFatPercent) : null,
    muscleMassDelta30dKg: latest && comparison ? delta(latest.muscleMassKg, comparison.muscleMassKg) : null
  };
}

function compactRecovery(row) {
  return {
    measurement_date: row.measurementDate,
    recovery_percent: row.recoveryPercent,
    recovery_delta: row.recoveryDelta,
    hrv: row.hrv,
    activity: row.activity,
    sleep_hours: row.sleepHours
  };
}

function compactBody(row) {
  return {
    measurement_date: row.measurementDate,
    weight_kg: row.weightKg,
    body_fat_percent: row.bodyFatPercent,
    skeletal_muscle_percent: row.skeletalMusclePercent,
    muscle_mass_kg: row.muscleMassKg,
    bmi: row.bmi
  };
}

export function localDateKey(value, timeZone = "UTC") {
  const date = new Date(isoTimestamp(value, "date"));
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function rowsWithinDays(rows, anchorDate, days) {
  const anchor = new Date(anchorDate).getTime();
  const earliest = anchor - ((days - 1) * DAY_MS);
  return rows.filter((row) => {
    const timestamp = new Date(row.measurementAt).getTime();
    return timestamp >= earliest && timestamp <= anchor;
  });
}

function nearestAtOrBefore(rows, timestamp) {
  const sortedAsc = [...rows].sort(ascendingMeasurementAt);
  let candidate = null;
  for (const row of sortedAsc) {
    if (new Date(row.measurementAt).getTime() <= timestamp) {
      candidate = row;
    }
  }
  return candidate;
}

function average(values) {
  const numeric = values.filter((value) => Number.isFinite(value));
  if (!numeric.length) return null;
  return round(numeric.reduce((sum, value) => sum + value, 0) / numeric.length, 2);
}

function delta(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  return round(current - previous, 2);
}

function firstFinite(values) {
  return values.find((value) => Number.isFinite(value)) ?? null;
}

function round(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function descendingMeasurementAt(a, b) {
  return new Date(b.measurementAt).getTime() - new Date(a.measurementAt).getTime();
}

function ascendingMeasurementAt(a, b) {
  return new Date(a.measurementAt).getTime() - new Date(b.measurementAt).getTime();
}

function isoTimestamp(value, fieldName) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error(`${fieldName} must be a valid Date.`);
    return value.toISOString();
  }
  const string = requiredString(value, fieldName);
  const date = new Date(string);
  if (Number.isNaN(date.getTime())) throw new Error(`${fieldName} must be a valid ISO timestamp.`);
  return string;
}

function optionalIsoTimestamp(value) {
  if (value == null || value === "") return null;
  return isoTimestamp(value, "timestamp");
}

function requiredString(value, fieldName) {
  const string = String(value || "").trim();
  if (!string) throw new Error(`${fieldName} is required.`);
  return string;
}

function stringOrNull(value) {
  const string = String(value || "").trim();
  return string || null;
}

function stringOrDefault(value, fallback) {
  return stringOrNull(value) || fallback;
}

function finiteNumberOrNull(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function integerOrNull(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}
