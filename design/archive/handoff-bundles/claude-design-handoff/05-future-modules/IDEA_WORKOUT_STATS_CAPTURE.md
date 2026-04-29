# Idea: Morpheus Workout Stats Capture

Date: 2026-04-28
Status: Parked until after daily recovery dogfood

## Context

The current Morpheus implementation captures the daily/post-workout home screen:

- Recovery %
- Recovery delta
- HRV
- Activity
- Sleep

That is enough for the first longitudinal recovery trend. The Workout Stats screen is a separate capture surface and should not be mixed into the daily snapshot parser.

## Fixture Reference

Local ignored fixtures:

- `fixtures/real/morpheus/IMG_0268.PNG` — Workout Stats summary
- `fixtures/real/morpheus/IMG_0269.PNG` — HR line graph
- `fixtures/real/morpheus/IMG_0270.PNG` — HR zone bar graph

The useful numeric data appears in `IMG_0268`; the graph screens are visualizations and should not be parsed first.

## Proposed Model

Future `WorkoutEntry` fields:

- `measurementDate`
- `durationSeconds`
- `rpe`
- `performance`
- `recoveryDelta`
- `calories`
- `maxHeartRate`
- `averageHeartRate`
- `recoveryZoneSeconds`
- `conditioningZoneSeconds`
- `overloadZoneSeconds`
- `rawOcrText`
- `parseConfidence`
- `needsReview`

## Parser Shape

Add this as a separate source branch:

- `CaptureSource.morpheusWorkout`
- `MorpheusWorkoutParser`
- `MorpheusWorkoutReviewView`
- `WorkoutEntry`

Do not overload `RecoveryEntry`; workout summaries have different cadence, semantics, and required fields.

## Decision Gate

Build this only after at least one week of dogfooding the daily recovery capture. If the daily home-screen capture is enough for useful coach conversations, defer this until there is a concrete missing-analysis need.
