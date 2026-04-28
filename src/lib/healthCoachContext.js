const CONTEXT_VERSION = "health-coach-context-v1";

export function buildHealthCoachContext(input = {}) {
  const generatedAt = isoTimestamp(input.generatedAt || new Date(), "generatedAt");
  const desktopHealth = compactDesktopHealthSnapshot(input.desktopSnapshot || input.localSnapshot || null);
  const companionCapture = compactCompanionSyncSnapshot(input.companionSnapshot || input.syncSnapshot || null);

  return {
    context_version: CONTEXT_VERSION,
    generated_at: generatedAt,
    current_surface: stringOrNull(desktopHealth?.current_surface),
    visible_modules: Array.isArray(desktopHealth?.visible_modules) ? desktopHealth.visible_modules : [],
    desktop_health: desktopHealth,
    companion_capture: companionCapture,
    combined_signals: buildCombinedSignals(desktopHealth, companionCapture)
  };
}

export function compactDesktopHealthSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return null;
  return {
    current_surface: stringOrNull(snapshot.current_surface),
    visible_modules: stringArray(snapshot.visible_modules),
    focused_practice: plainObjectOrNull(snapshot.focused_practice),
    profile_summary: plainObjectOrNull(snapshot.profile_summary),
    training_block: plainObjectOrNull(snapshot.training_block),
    exercise_summary: plainObjectOrNull(snapshot.exercise_summary),
    nutrition_summary: plainObjectOrNull(snapshot.nutrition_summary),
    sleep_summary: plainObjectOrNull(snapshot.sleep_summary),
    body_composition: plainObjectOrNull(snapshot.body_composition)
  };
}

export function compactCompanionSyncSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return null;
  const recovery = snapshot.recovery && typeof snapshot.recovery === "object" ? snapshot.recovery : {};
  const body = snapshot.body_composition && typeof snapshot.body_composition === "object" ? snapshot.body_composition : {};

  return {
    generated_at: stringOrNull(snapshot.generated_at),
    sync: plainObjectOrNull(snapshot.sync),
    coverage: plainObjectOrNull(snapshot.coverage),
    recovery: {
      count: integerOrZero(recovery.count),
      latest: plainObjectOrNull(recovery.latest),
      avg_7d: numberOrNull(recovery.avg_7d),
      avg_30d: numberOrNull(recovery.avg_30d),
      hrv_avg_7d: numberOrNull(recovery.hrv_avg_7d),
      hrv_avg_30d: numberOrNull(recovery.hrv_avg_30d),
      sleep_hours_avg_7d: numberOrNull(recovery.sleep_hours_avg_7d),
      sleep_hours_avg_30d: numberOrNull(recovery.sleep_hours_avg_30d),
      latest_workout_impact_delta: numberOrNull(recovery.latest_workout_impact_delta)
    },
    body_composition: {
      count: integerOrZero(body.count),
      latest: plainObjectOrNull(body.latest),
      weight_delta_30d_kg: numberOrNull(body.weight_delta_30d_kg),
      body_fat_delta_30d_pct: numberOrNull(body.body_fat_delta_30d_pct),
      muscle_mass_delta_30d_kg: numberOrNull(body.muscle_mass_delta_30d_kg)
    },
    review_flags: Array.isArray(snapshot.review_flags) ? snapshot.review_flags.slice(0, 20) : []
  };
}

function buildCombinedSignals(desktopHealth, companionCapture) {
  const desktopBody = desktopHealth?.body_composition || {};
  const desktopSleep = desktopHealth?.sleep_summary || {};
  const companionRecovery = companionCapture?.recovery || {};
  const companionBody = companionCapture?.body_composition || {};
  const companionLatestRecovery = companionRecovery.latest || {};
  const companionLatestBody = companionBody.latest || {};
  const dataGaps = [];

  if (!desktopHealth) dataGaps.push("No desktop Health snapshot is available.");
  if (!companionCapture) dataGaps.push("No synced companion health capture is available.");
  if (companionCapture && !companionRecovery.count) dataGaps.push("No synced Morpheus recovery snapshots yet.");
  if (companionCapture && !companionBody.count) dataGaps.push("No synced Arboleaf body measurements yet.");
  if (companionCapture?.review_flags?.length) dataGaps.push("Some synced health captures still need review.");

  return {
    desktop: {
      latest_weight_kg: numberOrNull(desktopBody.latest_weight_kg),
      waist_to_hip_ratio: numberOrNull(desktopBody.waist_to_hip_ratio),
      avg_sleep_hours_7d: numberOrNull(desktopSleep.avg_sleep_hours_7d),
      recovery_state: stringOrNull(desktopSleep.recovery_state)
    },
    companion: {
      latest_recovery_percent: numberOrNull(companionLatestRecovery.recovery_percent),
      latest_recovery_delta: numberOrNull(companionLatestRecovery.recovery_delta),
      latest_hrv: integerOrNull(companionLatestRecovery.hrv),
      latest_sleep_hours: numberOrNull(companionLatestRecovery.sleep_hours),
      latest_body_weight_kg: numberOrNull(companionLatestBody.weight_kg),
      latest_body_fat_percent: numberOrNull(companionLatestBody.body_fat_percent),
      latest_muscle_mass_kg: numberOrNull(companionLatestBody.muscle_mass_kg),
      recovery_avg_7d: numberOrNull(companionRecovery.avg_7d),
      hrv_avg_7d: numberOrNull(companionRecovery.hrv_avg_7d),
      sleep_hours_avg_7d: numberOrNull(companionRecovery.sleep_hours_avg_7d),
      latest_workout_impact_delta: numberOrNull(companionRecovery.latest_workout_impact_delta),
      weight_delta_30d_kg: numberOrNull(companionBody.weight_delta_30d_kg),
      body_fat_delta_30d_pct: numberOrNull(companionBody.body_fat_delta_30d_pct),
      muscle_mass_delta_30d_kg: numberOrNull(companionBody.muscle_mass_delta_30d_kg)
    },
    latest_weight_sources: latestWeightSources(desktopBody, companionLatestBody),
    review_flag_count: companionCapture?.review_flags?.length || 0,
    data_gaps: dataGaps
  };
}

function latestWeightSources(desktopBody, companionLatestBody) {
  const sources = [];
  const desktopWeight = numberOrNull(desktopBody.latest_weight_kg);
  const companionWeight = numberOrNull(companionLatestBody.weight_kg);
  if (desktopWeight !== null) {
    sources.push({
      source: "desktop_health",
      weight_kg: desktopWeight
    });
  }
  if (companionWeight !== null) {
    sources.push({
      source: "companion_arboleaf",
      measurement_date: stringOrNull(companionLatestBody.measurement_date),
      weight_kg: companionWeight
    });
  }
  return sources;
}

function plainObjectOrNull(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return { ...value };
}

function stringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 20);
}

function stringOrNull(value) {
  const string = String(value || "").trim();
  return string || null;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function integerOrNull(value) {
  const number = numberOrNull(value);
  return Number.isInteger(number) ? number : null;
}

function integerOrZero(value) {
  return integerOrNull(value) ?? 0;
}

function isoTimestamp(value, fieldName) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error(`${fieldName} must be a valid Date.`);
    return value.toISOString();
  }
  const string = String(value || "").trim();
  const date = new Date(string);
  if (!string || Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid ISO timestamp.`);
  }
  return string;
}
