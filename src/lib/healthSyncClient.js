const DEFAULT_SELECT_LIMIT = 500;

export class HealthSyncError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "HealthSyncError";
    this.status = details.status || 0;
    this.body = details.body;
    this.endpoint = details.endpoint || "";
  }
}

export function newClientEventId(prefix = "health") {
  const safePrefix = String(prefix || "health").replace(/[^a-z0-9_-]/gi, "-").slice(0, 32);
  if (globalThis.crypto?.randomUUID) {
    return `${safePrefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${safePrefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createHealthSyncClient(config = {}) {
  const supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl);
  const anonKey = requiredString(config.anonKey, "anonKey");
  const accessToken = requiredString(config.accessToken, "accessToken");
  const fetchImpl = config.fetchImpl || globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw new HealthSyncError("A fetch implementation is required.");
  }

  function authHeaders() {
    return {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };
  }

  async function rpc(functionName, payload = {}) {
    const endpoint = `${supabaseUrl}/rest/v1/rpc/${functionName}`;
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload || {})
    });
    return parseResponse(response, endpoint);
  }

  async function select(tableName, params = {}) {
    const query = new URLSearchParams(params);
    const endpoint = `${supabaseUrl}/rest/v1/${tableName}?${query}`;
    const response = await fetchImpl(endpoint, {
      method: "GET",
      headers: authHeaders()
    });
    return parseResponse(response, endpoint);
  }

  return {
    registerDevice(device) {
      return rpc("register_health_device", {
        p_device_id: requiredString(device.deviceId, "deviceId"),
        p_platform: optionalString(device.platform) || "unknown",
        p_app_version: optionalString(device.appVersion),
        p_display_name: optionalString(device.displayName)
      });
    },

    upsertRecoverySnapshot(record) {
      return rpc("upsert_recovery_snapshot_from_capture", recoveryPayload(record));
    },

    upsertBodyMeasurement(record) {
      return rpc("upsert_body_measurement_from_capture", bodyMeasurementPayload(record));
    },

    tombstoneRecord(record) {
      const entityType = requiredString(record.entityType, "entityType");
      if (!["recovery_snapshot", "body_measurement"].includes(entityType)) {
        throw new HealthSyncError(`Unsupported health entityType: ${entityType}`);
      }
      return rpc("tombstone_health_capture_record", {
        p_source_device_id: requiredString(record.deviceId, "deviceId"),
        p_client_event_id: requiredString(record.clientEventId, "clientEventId"),
        p_entity_type: entityType,
        p_source_record_id: requiredString(record.sourceRecordId, "sourceRecordId"),
        p_deleted_at: toIsoTimestamp(record.deletedAt || new Date(), "deletedAt"),
        p_payload: record.payload || {}
      });
    },

    upsertCheckpoint(deviceId, lastSeenEventId) {
      return rpc("upsert_health_device_checkpoint", {
        p_device_id: requiredString(deviceId, "deviceId"),
        p_last_seen_event_id: nonnegativeInteger(lastSeenEventId, "lastSeenEventId")
      });
    },

    fetchRecoverySnapshots(options = {}) {
      const params = {
        select: [
          "id",
          "source_record_id",
          "source_type",
          "source_device_id",
          "measurement_at",
          "captured_at",
          "recovery_percent",
          "recovery_delta",
          "hrv",
          "activity",
          "sleep_minutes",
          "sleep_duration_display",
          "parse_confidence",
          "needs_review",
          "deleted_at",
          "updated_at"
        ].join(","),
        order: "measurement_at.desc",
        limit: String(limitValue(options.limit))
      };
      if (!options.includeDeleted) params.deleted_at = "is.null";
      if (options.updatedAfter) params.updated_at = `gt.${toIsoTimestamp(options.updatedAfter, "updatedAfter")}`;
      return select("recovery_snapshots", params);
    },

    fetchBodyMeasurements(options = {}) {
      const params = {
        select: [
          "id",
          "source_record_id",
          "source_type",
          "source_device_id",
          "measurement_at",
          "captured_at",
          "weight_kg",
          "source_weight_value",
          "source_weight_unit",
          "body_fat_percent",
          "skeletal_muscle_percent",
          "muscle_mass_kg",
          "body_water_percent",
          "bone_mass_kg",
          "visceral_fat",
          "subcutaneous_fat_percent",
          "metabolic_age",
          "bmi",
          "protein_percent",
          "bmr_kcal",
          "fat_free_body_weight_kg",
          "body_type",
          "parse_confidence",
          "needs_review",
          "deleted_at",
          "updated_at"
        ].join(","),
        order: "measurement_at.desc",
        limit: String(limitValue(options.limit))
      };
      if (!options.includeDeleted) params.deleted_at = "is.null";
      if (options.updatedAfter) params.updated_at = `gt.${toIsoTimestamp(options.updatedAfter, "updatedAfter")}`;
      return select("body_measurements", params);
    },

    fetchEventsAfter(options = {}) {
      const lastSeenEventId = nonnegativeInteger(options.lastSeenEventId || 0, "lastSeenEventId");
      return select("health_capture_events", {
        select: "id,source_device_id,client_event_id,event_type,entity_type,source_record_id,payload,client_created_at,created_at",
        id: `gt.${lastSeenEventId}`,
        order: "id.asc",
        limit: String(limitValue(options.limit))
      });
    }
  };
}

export function recoveryPayload(record = {}) {
  return {
    p_source_device_id: requiredString(record.deviceId, "deviceId"),
    p_client_event_id: requiredString(record.clientEventId, "clientEventId"),
    p_source_record_id: requiredString(record.sourceRecordId, "sourceRecordId"),
    p_measurement_at: toIsoTimestamp(record.measurementAt, "measurementAt"),
    p_captured_at: toIsoTimestamp(record.capturedAt, "capturedAt"),
    p_recovery_percent: numberValue(record.recoveryPercent, "recoveryPercent"),
    p_recovery_delta: optionalNumber(record.recoveryDelta),
    p_hrv: optionalInteger(record.hrv),
    p_activity: optionalInteger(record.activity),
    p_sleep_minutes: optionalInteger(record.sleepMinutes),
    p_sleep_duration_display: optionalString(record.sleepDurationDisplay),
    p_parse_confidence: optionalNumber(record.parseConfidence),
    p_needs_review: Boolean(record.needsReview),
    p_original_image_storage_path: optionalString(record.originalImageStoragePath),
    p_raw_ocr_text: optionalString(record.rawOcrText),
    p_metadata: record.metadata || {}
  };
}

export function bodyMeasurementPayload(record = {}) {
  return {
    p_source_device_id: requiredString(record.deviceId, "deviceId"),
    p_client_event_id: requiredString(record.clientEventId, "clientEventId"),
    p_source_record_id: requiredString(record.sourceRecordId, "sourceRecordId"),
    p_measurement_at: toIsoTimestamp(record.measurementAt, "measurementAt"),
    p_captured_at: toIsoTimestamp(record.capturedAt, "capturedAt"),
    p_weight_kg: numberValue(record.weightKg, "weightKg"),
    p_source_weight_value: optionalNumber(record.sourceWeightValue),
    p_source_weight_unit: optionalString(record.sourceWeightUnit),
    p_body_fat_percent: optionalNumber(record.bodyFatPercent),
    p_skeletal_muscle_percent: optionalNumber(record.skeletalMusclePercent),
    p_muscle_mass_kg: optionalNumber(record.muscleMassKg),
    p_body_water_percent: optionalNumber(record.bodyWaterPercent),
    p_bone_mass_kg: optionalNumber(record.boneMassKg),
    p_visceral_fat: optionalNumber(record.visceralFat),
    p_subcutaneous_fat_percent: optionalNumber(record.subcutaneousFatPercent),
    p_metabolic_age: optionalInteger(record.metabolicAge),
    p_bmi: optionalNumber(record.bmi),
    p_protein_percent: optionalNumber(record.proteinPercent),
    p_bmr_kcal: optionalInteger(record.bmrKcal),
    p_fat_free_body_weight_kg: optionalNumber(record.fatFreeBodyWeightKg),
    p_body_type: optionalString(record.bodyType),
    p_parse_confidence: optionalNumber(record.parseConfidence),
    p_needs_review: Boolean(record.needsReview),
    p_original_image_storage_path: optionalString(record.originalImageStoragePath),
    p_raw_ocr_text: optionalString(record.rawOcrText),
    p_metadata: record.metadata || {}
  };
}

async function parseResponse(response, endpoint) {
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new HealthSyncError(`Health sync request failed (${response.status})`, {
      status: response.status,
      body,
      endpoint
    });
  }

  return body;
}

function normalizeSupabaseUrl(value) {
  const url = requiredString(value, "supabaseUrl").replace(/\/+$/, "");
  if (!/^https:\/\/.+/i.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    throw new HealthSyncError("supabaseUrl must be HTTPS, or localhost for local testing.");
  }
  return url;
}

function requiredString(value, fieldName) {
  const string = String(value || "").trim();
  if (!string) {
    throw new HealthSyncError(`${fieldName} is required.`);
  }
  return string;
}

function optionalString(value) {
  const string = String(value || "").trim();
  return string || null;
}

function numberValue(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new HealthSyncError(`${fieldName} must be a finite number.`);
  }
  return number;
}

function optionalNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  return numberValue(value, "optionalNumber");
}

function optionalInteger(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new HealthSyncError("Expected an integer value.");
  }
  return number;
}

function nonnegativeInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new HealthSyncError(`${fieldName} must be a non-negative integer.`);
  }
  return number;
}

function toIsoTimestamp(value, fieldName) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new HealthSyncError(`${fieldName} must be a valid Date.`);
    }
    return value.toISOString();
  }
  const string = requiredString(value, fieldName);
  const date = new Date(string);
  if (Number.isNaN(date.getTime())) {
    throw new HealthSyncError(`${fieldName} must be a valid ISO timestamp.`);
  }
  return string;
}

function limitValue(value) {
  const number = value === undefined ? DEFAULT_SELECT_LIMIT : Number(value);
  if (!Number.isInteger(number) || number <= 0 || number > 5000) {
    throw new HealthSyncError("limit must be an integer between 1 and 5000.");
  }
  return number;
}
