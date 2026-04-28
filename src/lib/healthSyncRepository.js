import {
  buildHealthCoachSyncSnapshot,
  buildHealthSyncReadModel
} from "./healthSyncReadModel.js";

const DEFAULT_SYNC_READ_LIMIT = 500;
const MAX_SYNC_READ_LIMIT = 5000;

export async function loadHealthSyncRows(client, options = {}) {
  const api = requireHealthSyncClient(client);
  const fetchOptions = healthSyncFetchOptions(options);
  const [recoverySnapshots, bodyMeasurements] = await Promise.all([
    api.fetchRecoverySnapshots(fetchOptions),
    api.fetchBodyMeasurements(fetchOptions)
  ]);

  return {
    fetchedAt: new Date().toISOString(),
    fetchOptions,
    recoverySnapshots: requireArray(recoverySnapshots, "recoverySnapshots"),
    bodyMeasurements: requireArray(bodyMeasurements, "bodyMeasurements")
  };
}

export async function loadHealthSyncReadModel(client, options = {}) {
  const rows = await loadHealthSyncRows(client, options);
  const model = buildHealthSyncReadModel(
    {
      recoverySnapshots: rows.recoverySnapshots,
      bodyMeasurements: rows.bodyMeasurements
    },
    {
      anchorDate: options.anchorDate,
      includeDeleted: options.includeDeleted,
      timeZone: options.timeZone
    }
  );

  return {
    ...model,
    sync: {
      fetchedAt: rows.fetchedAt,
      fetchLimit: rows.fetchOptions.limit,
      includeDeleted: rows.fetchOptions.includeDeleted,
      updatedAfter: rows.fetchOptions.updatedAfter || null,
      recoveryRowCount: rows.recoverySnapshots.length,
      bodyMeasurementRowCount: rows.bodyMeasurements.length
    }
  };
}

export async function loadHealthCoachSyncSnapshot(client, options = {}) {
  const model = await loadHealthSyncReadModel(client, options);
  return {
    ...buildHealthCoachSyncSnapshot(model),
    sync: model.sync
  };
}

export function healthSyncFetchOptions(options = {}) {
  const fetchOptions = {
    limit: syncReadLimit(options.limit),
    includeDeleted: Boolean(options.includeDeleted)
  };

  if (options.updatedAfter !== undefined && options.updatedAfter !== null && options.updatedAfter !== "") {
    fetchOptions.updatedAfter = isoTimestamp(options.updatedAfter, "updatedAfter");
  }

  return fetchOptions;
}

function requireHealthSyncClient(client) {
  if (!client || typeof client !== "object") {
    throw new Error("A health sync client is required.");
  }
  if (typeof client.fetchRecoverySnapshots !== "function") {
    throw new Error("Health sync client must expose fetchRecoverySnapshots().");
  }
  if (typeof client.fetchBodyMeasurements !== "function") {
    throw new Error("Health sync client must expose fetchBodyMeasurements().");
  }
  return client;
}

function requireArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array.`);
  }
  return value;
}

function syncReadLimit(value) {
  if (value === undefined || value === null || value === "") return DEFAULT_SYNC_READ_LIMIT;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0 || number > MAX_SYNC_READ_LIMIT) {
    throw new Error(`limit must be an integer between 1 and ${MAX_SYNC_READ_LIMIT}.`);
  }
  return number;
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
