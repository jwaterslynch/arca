# Health Module PRD / Build Spec v1

> Status: Product and implementation spec
> Date: 16 March 2026
> Purpose: Consolidate the three Father Fit spreadsheet patterns into one coherent `Health` module for the app.

---

## 1. Why This Module Exists

The current app already supports:

- exercise practice logging
- exercise review
- exercise coaching

That is useful, but it is still too narrow. The three spreadsheet references show the real shape of the module:

1. **Assessment Template**  
   health intake and capability profiling

2. **Training Plan**  
   central program design and generated session structure

3. **Coaching Log**  
   nutrition compliance, bodyweight, measurements, and baseline assessment week

Taken together, they define a proper `Health` module:

- intake
- planning
- execution
- compliance
- progression
- reflection

This document defines that module for the product.

---

## 2. Source Patterns We Are Borrowing

### Spreadsheet 1: Training Assessment Template

Useful patterns:

- structured intake
- training availability
- injury/constraint capture
- equipment availability
- movement capability
- split/style preferences
- target muscle-group selection

Not worth copying:

- giant single-sheet form UI
- orange spreadsheet presentation
- manual `Y / No / Don't mind` grid UX

Product translation:

- `Health Setup` flow
- `Health Profile` data object

### Spreadsheet 2: Training Plan

Useful patterns:

- one central control sheet
- generated day/session templates
- exercise library by muscle or movement group
- week-by-week progression blocks
- key exercise / PB tracking
- overview + printable/execution surface split

Not worth copying:

- hard-coded `Day 1 ... Day 6` sheet structure
- brittle cell-reference architecture
- spreadsheet-first print layouts

Product translation:

- `Training Block`
- `Session Templates`
- `Exercise Library`
- `Planned vs Actual`
- `Progression`

### Spreadsheet 3: Coaching Log

Useful patterns:

- assessment week
- nutrition targets vs actuals
- bodyweight trend
- refeed day support
- biweekly measurement cadence
- waist-to-hip ratio
- meal diary and meal-source logging

Important implementation lesson:

- the spreadsheet’s calorie formula becomes wrong once macro columns shift
- the app must always compute from named fields, not positional columns

Product translation:

- `Assessment Week`
- `Nutrition`
- `Measurements`
- `Check-ins`

---

## 3. Product Boundary

`Health` is not just “exercise logs.”

It is the module for:

- training
- body composition
- nutrition compliance
- measurements
- constraints and injuries
- health-oriented coaching

It remains separate from:

- `Execute`
  - daily action surface
- `Plan`
  - work review and planning
- `Wealth`
  - financial state

The relationship is:

- Health generates insight and recommendations
- Execute receives concrete actions
- Review shows light summary, not the deep Health UI

---

## 4. Health Module Structure

### Top-level tab

- `Health`

### Primary subtabs

#### 1. `Overview`

Purpose:

- current health state at a glance
- adherence and progression summary

Components:

- this week: sessions, minutes, consistency
- last 30 days: volume, average energy, bodyweight trend
- key lift progress
- current training block summary
- nutrition compliance summary
- latest measurements summary
- recent activity feed
- coach prompt strip

#### 2. `Exercise`

Purpose:

- training plan and actual session execution

Components:

- current training block
- weekly schedule
- generated session templates
- recent session logs
- planned vs actual session detail
- lift progression
- weekly volume trend
- exercise coach

#### 3. `Nutrition`

Purpose:

- macro targets, actuals, bodyweight, and dietary consistency

Components:

- current daily targets
- refeed day configuration
- actual daily logs
- target vs actual summary
- 7-day and 30-day compliance
- weight trend
- meal diary
- source-of-meal breakdown
- nutrition coach

#### 4. `Measurements`

Purpose:

- body composition check-ins and slower physical changes

Components:

- biweekly measurement table
- waist-to-hip ratio
- delta since last check-in
- progress-photo checklist or media placeholder later
- measurement history chart

### Secondary flow, not a permanent subtab

#### `Health Setup`

This should be a setup flow or modal, not a persistent main tab.

It captures:

- training assessment
- injuries
- availability
- equipment
- exercise capability
- preferences

This is inspired by Spreadsheet 1.

---

## 5. Data Model

The module should reuse existing `life_practices` data where possible, but Health needs its own structured state for nutrition, measurements, and planning.

### 5.1 Reuse existing state

Keep using:

- `state.life_practices.practices`
- `state.life_practices.daily_log`

Use those for:

- exercise logging
- exercise coach history
- trend summaries

### 5.2 New Health state

Suggested top-level shape:

```js
state.health = {
  profile: {},
  training_blocks: [],
  session_templates: [],
  nutrition_targets: [],
  nutrition_logs: [],
  assessment_week_logs: [],
  body_measurements: [],
  progress_checkins: []
}
```

### 5.3 Entities

#### `health_profile`

```js
{
  id,
  created_at,
  updated_at,
  training_days_per_week,
  max_sessions_per_week,
  blocked_days,            // ["monday", "wednesday"]
  ideal_session_minutes,
  injuries_note,
  extra_note,
  target_muscle_groups,    // ["quads", "glutes", "back"]
  preferred_splits,        // ["upper_lower", "full_body"]
  preferred_styles,        // ["bodybuilding"]
  load_preference,         // "heavy_low_volume" | "lighter_high_volume" | "mixed" | "dont_mind"
  capability_flags,        // object of bench/squat/deadlift/etc
  equipment_flags          // object of rack, smith, cable, sled, etc
}
```

#### `training_block`

```js
{
  id,
  title,
  status,                  // active | completed | archived
  start_date,
  end_date,
  weeks,
  sessions_per_week,
  deload_week,
  deload_type,
  rest_time_note,
  tempo_note,
  focus_note,
  source                    // ai | coach | manual
}
```

#### `session_template`

```js
{
  id,
  training_block_id,
  day_index,               // 1..n
  title,
  split_label,
  exercises: [
    {
      exercise,
      muscle_group,
      sets,
      reps,
      progression_type,    // load | reps | density | amrap
      note
    }
  ]
}
```

#### `nutrition_target`

```js
{
  id,
  start_date,
  end_date,
  kind,                    // daily | refeed
  protein_g,
  carbs_g,
  fats_g,
  kcal,
  source                   // ai | coach | manual
}
```

#### `nutrition_log`

```js
{
  id,
  date,
  protein_g,
  carbs_g,
  fats_g,
  kcal,
  weight_kg,
  steps,
  training_minutes,
  cardio_kcal,
  cardio_type,
  meals: [
    {
      slot,                // meal_1 ... meal_5 | snacks
      text,
      source               // home | takeaway | restaurant | other
    }
  ]
}
```

#### `assessment_week_log`

This is structurally similar to `nutrition_log`, but tied to a temporary 7-day baseline flow.

```js
{
  id,
  assessment_id,
  date,
  protein_g,
  carbs_g,
  fats_g,
  kcal,
  weight_kg,
  steps,
  training_minutes,
  cardio_kcal,
  cardio_type,
  meals: [...]
}
```

#### `body_measurement`

```js
{
  id,
  date,
  chest_cm,
  arm_r_cm,
  arm_l_cm,
  waist_cm,
  hips_cm,
  thigh_r_cm,
  thigh_l_cm
}
```

#### `progress_checkin`

```js
{
  id,
  date,
  photos_taken,            // boolean for MVP
  note
}
```

---

## 6. Core Calculations

### 6.1 Exercise

#### Weekly consistency

```js
consistency = distinct_days_with_logged_sessions / 7
```

#### 30-day session count

```js
session_count_30d = count(session_logs in last 30 days)
```

#### 30-day minutes

```js
minutes_30d = sum(session.minutes)
```

#### Weekly volume buckets

```js
weekly_volume = sum(minutes or sets/reps proxy per week)
```

#### Key lift max

Use named metrics from structured logs:

```js
max_weight_kg_by_exercise = max(entry.metrics.weight_kg grouped by exercise)
```

#### Average energy

```js
avg_energy = average(entry.metrics.energy where present)
```

### 6.2 Nutrition

#### Calories from macros

Always compute from named fields:

```js
kcal = protein_g * 4 + carbs_g * 4 + fats_g * 9
```

#### Daily compliance

```js
protein_delta = actual_protein_g - target_protein_g
carbs_delta   = actual_carbs_g - target_carbs_g
fats_delta    = actual_fats_g - target_fats_g
kcal_delta    = actual_kcal - target_kcal
```

#### Weekly compliance score

For MVP, simple tolerance-based scoring is enough:

```js
day_is_on_target if
abs(protein_delta) <= protein_tolerance &&
abs(carbs_delta)   <= carb_tolerance &&
abs(fats_delta)    <= fat_tolerance
```

Then:

```js
weekly_compliance = on_target_days / logged_days
```

### 6.3 Measurements

#### Waist-to-hip ratio

```js
waist_to_hip_ratio = waist_cm / hips_cm
```

Guard:

```js
if hips_cm <= 0 => null
```

#### Delta since last check-in

```js
delta = current_measurement - previous_measurement
```

### 6.4 Assessment Week

Use it to establish:

- baseline average daily calories
- baseline average weight
- baseline steps
- training frequency
- common meal sources

These should feed the first nutrition and training recommendations.

---

## 7. AI Scope

Health coaching should be split by context.

### Exercise coach

Reads:

- current training block
- session history
- lift progression
- energy trend
- consistency
- injury constraints
- equipment availability

Can answer:

- what should I do next session?
- am I progressing?
- what lift is stalling?
- should I deload?
- what exercise substitutions fit my gym?

### Nutrition coach

Reads:

- targets
- actual logs
- assessment week baseline
- bodyweight trend
- meal-source patterns

Can answer:

- where am I missing target?
- is my intake consistent?
- what meal pattern is driving poor compliance?
- do I need a target adjustment?

### Measurement coach

Reads:

- body measurements
- bodyweight trend
- progress check-ins

Can answer:

- what is changing?
- is waist trending down?
- are measurements flat despite training?

### Privacy position

Health is sensitive.

UI should strongly recommend local AI for:

- health profile
- measurements
- nutrition analysis
- coaching conversations

---

## 8. UX Principles

### Do

- separate planned vs actual
- keep the Overview calm and high signal
- use structured fields for all numeric health data
- allow quick logging and later deep review
- use clear cadence markers: daily, weekly, biweekly

### Do not

- recreate spreadsheet grids
- force users to edit giant forms
- use positional formulas or column-order assumptions
- mix onboarding/intake with day-to-day tracking on one screen

---

## 9. MVP Build Order

### Phase H3: Health Profile Intake

Build:

- `Health Setup` flow
- health profile state
- injuries, availability, equipment, capabilities, preferences

Reason:

- this is the foundation for meaningful training block generation

### Phase H4: Training Block MVP

Build:

- `training_block`
- `session_templates`
- generated session view inside `Health > Exercise`
- planned vs actual session comparison

Reason:

- Spreadsheet 2’s strongest idea is structured progression, not just logging

### Phase H5: Nutrition MVP

Build:

- `nutrition_targets`
- `nutrition_logs`
- `Health > Nutrition`
- daily target vs actual
- bodyweight trend

Reason:

- Spreadsheet 3 shows this is a first-class coaching layer

### Phase H6: Measurements MVP

Build:

- `body_measurements`
- `Health > Measurements`
- waist-to-hip ratio
- measurement deltas

Reason:

- gives the module a slower-timescale body composition view

### Phase H7: Assessment Week

Build:

- 7-day assessment flow
- meal diary
- baseline summary

Reason:

- best entry path before nutrition coaching or plan generation

---

## 10. What To Build Now vs Later

### Build now

- health profile intake
- training block structure
- generated session templates
- nutrition targets and logs
- body measurements
- key calculations:
  - calories from macros
  - weekly consistency
  - volume and lift progression
  - waist-to-hip ratio

### Build later

- progress photo storage
- Apple Health / Google Fit sync
- HealthKit integration
- advanced nutrition scoring
- recovery readiness scoring
- wearable integrations
- coach memory specific to health block cycles

### Explicitly not now

- full medical / diagnostic interpretation
- complex meal planning engine
- macro auto-adjustment without review
- exhaustive photo workflows

---

## 11. Relationship To Existing App State

### Existing things to keep

- `life_practices` for exercise logging
- practice-specific exercise coaching
- Health tab shell already implemented
- progression cards already started from exercise logs

### New things to add

- health profile state
- training block state
- nutrition and measurement state

### Migration strategy

- do not rewrite existing exercise logs
- extend Health around them
- allow old exercise logs to continue powering trends
- gradually introduce structured training and nutrition objects

---

## 12. Acceptance Criteria For The Full Health Module

The module is working when a user can:

1. complete a structured health/training assessment
2. generate or configure a training block
3. open today’s planned session in `Health > Exercise`
4. log actual performance against the plan
5. see 30-day progression and key lift changes
6. track nutrition targets vs actual intake
7. track body measurements over time
8. ask the Health coach what is changing and what to adjust

That is the real target state.

---

## 13. Recommended Immediate Next Step

Build `Phase H3`: **Health Profile Intake**

Reason:

- it is the cleanest next dependency
- it comes directly from Spreadsheet 1
- it unlocks meaningful training block generation
- it does not require mobile, HealthKit, or a backend rewrite

After that:

1. `H4` training block MVP
2. `H5` nutrition MVP
3. `H6` measurements MVP

