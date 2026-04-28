# Health Module Build Spec v1

## Purpose

Add the first real `Health` module to the product without introducing a new backend or state model.

This is `H1` from [HEALTHY_WEALTHY_WISE_IA.md](/Users/julianwaterslynch/Workspace/Products/Arca/arca/design/HEALTHY_WEALTHY_WISE_IA.md):

- top-level `Health` tab
- `Overview` subtab
- `Exercise` subtab
- all data sourced from existing `state.life_practices`

This build is intentionally a UI redistribution, not a schema rewrite.

## Scope

### Included

- new top-level `Health` tab beside `Plan` and `Wealth`
- `Overview` and `Exercise` subtabs
- health summaries derived from existing practice logs
- exercise-focused drill-down using current gym/exercise practices
- direct links back to current logging and review surfaces

### Not included

- new `state.health` collections
- nutrition, sleep, or vitals logs
- HealthKit or mobile sync
- moving exercise AI coaching out of `Review`
- new chart library or complex custom graphing

## Data Source

Use existing practice data only:

- `state.life_practices.practices`
- `state.life_practices.daily_log`

Health-relevant practices are identified from `coach_key` / inferred coach key:

- `gym`

This is intentionally narrow for v1. It keeps the module honest and avoids pretending sleep/nutrition data exists when it does not.

## UX Structure

### Top-level tab

- `Health`

### Subtabs

- `Overview`
- `Exercise`

### Health > Overview

This is the quick physical-state dashboard using current exercise data.

Components:

- summary cards
  - exercise sessions this week
  - total exercise minutes this week
  - health consistency this week
  - last logged session
- active health practices list
  - each exercise practice with weekly sessions and total minutes
- recent activity feed
  - last 6 exercise entries across all health practices
- CTA row
  - `Open Execute Logging`
  - `Open Review Coaching`

### Health > Exercise

This is the detailed exercise surface using current gym/exercise entries.

Components:

- one card per exercise practice
- per-practice 30-day metric summary
  - session count
  - total minutes
  - max weight if present
  - total sets / reps if present
  - average energy if present
- recent structured/free-text entry history
- current target / minimum minutes if configured
- CTA row
  - `Log in Execute`
  - `Open in Review`

## Rendering Rules

### Overview cards

Compute from current week only.

- `exercise sessions this week`
  - count of `entries[]` for health practices in the current week
- `total exercise minutes this week`
  - sum of `entry.minutes`
- `health consistency this week`
  - distinct logged days this week / 7
- `last logged session`
  - most recent health entry date + short text

### Exercise summaries

Compute from the last 30 calendar days for each health practice.

Use existing helpers where possible:

- `recentPracticeEntries`
- `summarizePracticeMetrics`
- `inferPracticeCoachKey`
- `practiceEntryDisplayText`

## Interaction Model

### Log in Execute

Takes the user to `Execute`, where the existing practice drawer logging remains the source of truth for H1.

### Open in Review

Takes the user to `Plan > Review`, where the existing practice coach already works.

This keeps H1 honest:

- Health gets its own surface now
- exercise AI migration happens in `H2`

## State Impact

No required state changes.

Optional runtime-only UI state:

- `activeHealthTab`

Persisting the selected Health subtab is optional and not required for v1.

## Acceptance Criteria

1. The app has a new top-level `Health` tab.
2. `Health` contains `Overview` and `Exercise` subtabs.
3. `Overview` renders meaningful summaries from existing gym/exercise practice data.
4. `Exercise` shows per-practice cards with recent history and 30-day metrics.
5. No new backend or storage schema is introduced.
6. Existing `Execute`, `Plan`, and `Wealth` behavior remains unchanged.
7. If no health practices exist, the tab shows a clear empty state instead of broken placeholders.

## Next Phase

`H2` moves exercise coaching from `Review` into `Health`.

That follow-up should add:

- exercise coach drawer/panel in `Health`
- local-AI privacy badge emphasis for health data
- “push to Execute” task generation from Health coaching
