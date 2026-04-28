# Idea: Apple HealthKit Integration

**Status:** Future ambition. 🌠 Not in current scope. Blocked on Track B Phase A proving the capture loop.
**Date filed:** 2026-04-28

## The idea

Read health data directly from **Apple HealthKit** instead of (or in addition to) parsing screenshots. The iPhone is already collecting weight, sleep, workouts, heart rate, etc. from connected devices (Arboleaf scale, Apple Watch, etc.) — Arca should be able to read those values directly without screenshot OCR.

## Why this matters

- **Zero friction capture.** Current capture flow requires the user to screenshot the source app, then import into Arca. HealthKit eliminates the middle step entirely.
- **Higher reliability.** OCR is fundamentally lossy. HealthKit returns structured data with no parsing errors.
- **Already aggregated.** HealthKit centralizes data from all sources (Apple Watch, Arboleaf, Oura, third-party apps). One integration replaces N screenshot pipelines.

## Why it's complex

1. **iPhone-only.** HealthKit doesn't run in the simulator. Every test cycle requires deploying to a physical device via TestFlight or Xcode device-run. Slow.

2. **Apple's permission gate is strict.** Each data type the app reads requires explicit user permission. The permission UI is a one-time modal — get it wrong (request too many, request unused ones) and Apple's App Store review will reject it.

3. **App Store review is heavier for HealthKit apps.** Apple's reviewers scrutinize HealthKit integrations more carefully than general apps. Privacy disclosures, marketing language, and screenshot guidelines all face higher bar.

4. **Read vs. write asymmetry.** Reading is comparatively safe. Writing data INTO HealthKit (e.g. logged workouts going back to Apple Watch) triggers Apple's medical-app review path with much stricter requirements (can include FDA-style language reviews).

5. **Data model translation.** HealthKit's units, sample types, and time semantics don't map 1:1 to Arca's `WeightEntry` or any future `WorkoutEntry`. Translation logic adds complexity and a new class of bugs.

## Suggested phasing (when this gets picked up)

### Phase 1 — Read-only weight
- Request permission for `HKQuantityTypeIdentifier.bodyMass` only
- Pull recent weight samples
- Compare to existing screenshot-based `WeightEntry` records — dedupe
- No write-back

### Phase 2 — Read more types
- Sleep (`HKCategoryTypeIdentifier.sleepAnalysis`)
- Heart rate (`HKQuantityTypeIdentifier.heartRate`)
- Resting heart rate (`HKQuantityTypeIdentifier.restingHeartRate`)
- Body fat percentage (`HKQuantityTypeIdentifier.bodyFatPercentage`)

### Phase 3 — Workout import
- HKWorkout objects from Apple Watch / connected fitness apps
- Map to Arca's eventual `WorkoutEntry` schema

### Phase 4 (optional, much later) — Write-back
- Log a workout from Arca → push to HealthKit
- Triggers Apple's stricter review path
- Decision needed: is the additional UX value worth the review burden?

## Sequencing

This is a **post-Phase-A** consideration:

1. Phase A (current): screenshot import proves the capture-first pattern with Arboleaf only.
2. Phase B (after A): Morpheus screenshots + voice + WOD photos prove pattern generalizes.
3. **Phase C (after B):** evaluate HealthKit. By then, we have:
   - Real screenshot pipelines that we can compare against
   - A clear sense of which metrics actually matter (no point integrating unused types)
   - Enough product clarity to write a proper HealthKit permission disclosure

## Related context

- iOS app is at `~/Workspace/Products/Arca/arca-ios-capture` (separate repo from desktop Arca)
- Currently iOS 17+ target (HealthKit available since iOS 8 — not a constraint)
- Apple Developer account is set up for `com.jwaterslynch.ArcaCapture`
- TestFlight distribution is needed for HealthKit testing — not yet set up

## Decision

**Don't start this until Phase A proves the screenshot capture loop is real and used daily.** The screenshot pipeline answers the user-experience question (will Julian actually capture daily?). HealthKit answers the technical-quality question (can we get cleaner data?). Order matters — UX first, then quality.
