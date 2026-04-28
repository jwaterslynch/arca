#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);

const checks = [
  ["schema", "scripts/validate_health_sync_schema.mjs"],
  ["client", "scripts/test_health_sync_client.mjs"],
  ["read model", "scripts/test_health_sync_read_model.mjs"],
  ["repository", "scripts/test_health_sync_repository.mjs"],
  ["coach context", "scripts/test_health_coach_context.mjs"]
];

for (const [label, script] of checks) {
  console.log(`\n== Health sync ${label} ==`);
  const result = spawnSync(process.execPath, [script], {
    cwd: repoRoot,
    stdio: "inherit"
  });

  if (result.error) {
    console.error(result.error?.stack || result.error?.message || result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("\nAll health sync contract tests passed.");
