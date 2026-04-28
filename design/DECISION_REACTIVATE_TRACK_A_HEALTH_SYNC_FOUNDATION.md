# Decision: Reactivate Track A for Health Sync Foundation

Date: 2026-04-28
Status: Accepted for dark-launched backend work

## Context

Track B Phase A has produced a native iPhone capture app for Arboleaf body composition and Morpheus recovery screenshots. That app is being dogfooded locally.

Track A companion sync was previously deferred because writable cross-device sync was not safe enough. The known failure mode was severe: an empty local client could push before pulling and overwrite remote state.

The product direction still requires shared data:

- phone as the low-friction capture/input device
- desktop Arca as the richer planning, coaching, and analysis surface
- backend as the shared substrate for health, tasks, focus, and future companion flows

## Decision

Reactivate a narrow Track A slice: **health sync foundation only**.

This does not authorize a full writable companion app, task board sync, or automatic upload from the dogfood iOS app. It authorizes backend foundation work that can be built and tested in parallel while the iOS capture loop is dogfooded.

## Scope

In scope:

- Supabase schema for health capture records
- append-only health capture events
- idempotency by `owner_id + source_device_id + client_event_id`
- domain tables for queryable health coaching data
- RLS policies scoped to `auth.uid()`
- test/validation harnesses for schema contracts
- future iOS and desktop clients can target this API after dogfood validation

Out of scope for this decision:

- automatic upload from the current iOS dogfood app
- desktop write-back to health records
- task companion sync
- task ordering/reordering
- PWA companion shell
- storing raw screenshots in cloud by default
- cloud OCR

## Rollout Boundary

The current iOS capture app remains local-first during the dogfood week.

Backend work may proceed behind a dark-launch boundary:

1. migrations and RPCs can be written
2. test accounts and seeded records can exercise the backend
3. no primary live phone data is uploaded automatically
4. no desktop coach consumes this data until a read-only import path is explicitly added

## Safety Bar

Before real phone upload is enabled:

- duplicate upload retries are idempotent
- offline saves can queue and sync later
- measurement date edits sync correctly
- deletion is represented as a tombstone, not silent removal
- fresh desktop install can pull health history
- fresh phone install cannot overwrite desktop state
- logout/sign-in does not drop unsynced local entries
- screenshots remain local-only unless cloud media upload is explicitly enabled
- the remote health sync smoke test passes against a non-primary Supabase project

## Build Order

1. Merge the iOS dogfood branch after build verification.
2. Add dark-launched Supabase health schema.
3. Validate schema contracts locally.
4. Dogfood iOS capture daily.
5. After dogfood validates real use, add iOS upload behind an explicit setting.
6. Add desktop read-only health import.
7. Enrich health coach context with synced health history.
8. Revisit task companion sync separately under the existing sync recovery protocol.

## Rationale

Health capture sync is simpler and lower-risk than task board sync because records are mostly append/edit/delete by stable ID. It is still Track A infrastructure, so it must be explicit and bounded.

This lets backend work progress without making the current dogfood loop depend on unproven cross-device sync.
