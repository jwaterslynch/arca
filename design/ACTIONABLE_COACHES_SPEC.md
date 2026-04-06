# Actionable Coaches Spec — Health & Wealth

## The Problem

The Health and Wealth coaches are read-only. They can see data and give advice, but they can't do anything. When a user says "log these exercises" or "add this transaction," the coach deflects with instructions on how to do it manually. That's the opposite of a personal chief of staff.

Real interaction that triggered this spec:

```
User: "Log these exercises"
Coach: "I can't directly log the workout for you, but I'll walk you
        through how to do it in Arca..."
User: (asks again)
Coach: (deflects again)
User: (asks a third time)
Coach: (still can't do it)
```

This happened because the Health Coach has no mechanism to propose or execute state changes.

## The Solution Already Exists

Plan Coach already has a working action system:

1. User sends a natural-language request ("add a task for the quarterly review")
2. AI returns structured JSON with an `actions` array
3. `buildAiProposal()` parses the actions into a proposal with selectable items
4. User sees a preview card with checkboxes and an "Apply" button
5. `applyAiSelectedActions()` executes each action against `state`
6. State is saved, UI re-renders

The same pattern extends to Health and Wealth. The AI provider call path doesn't change. The system prompt just needs to describe the available actions, and the apply function needs to handle the new action types.

## What Should Have Happened

```
User: "I did a backyard kettlebell session — KB swings 3x15 @20kg,
       goblet squats 3x10 @20kg, KB rows 3x10 each side @20kg,
       then a circuit of 3 rounds: 10 swings, 8 squats, 6 push-ups"

Coach: "Got it. Here's what I'll log:"

┌─────────────────────────────────────────────────┐
│ ✅ Log exercise session                         │
│    Exercise / Gym · Today · 35 min              │
│    KB Swings 3×15 @20kg                         │
│    Goblet Squats 3×10 @20kg                     │
│    One-Arm KB Rows 3×10 each @20kg              │
│    Circuit: 3 rounds (swings, squats, push-ups) │
│                                                 │
│         [ Log This Session ]  [ Edit First ]    │
└─────────────────────────────────────────────────┘
```

One click. Done.

## New Action Types

### Health Coach Actions

| Action type | What it does | Key fields |
|---|---|---|
| `health.log_session` | Log a structured exercise session | `practice_id`, `date`, `duration_minutes`, `exercises[]` (each with name, sets, reps, weight, notes), `energy` (1-5), `notes` |
| `health.set_weekly_target` | Set the weekly session target for a practice | `practice_id`, `sessions_per_week` |
| `health.update_profile` | Update health profile fields | `fields` object with any subset of profile fields (training_days_per_week, max_sessions_per_week, ideal_session_minutes, blocked_days, injuries_note, target_muscle_groups, etc.) |
| `health.create_training_block` | Create or update the active training block | `title`, `start_date`, `duration_weeks`, `sessions_per_week`, `deload_week`, `split_focus` |
| `health.log_nutrition` | Log a daily nutrition entry | `date`, `protein_g`, `carbs_g`, `fats_g`, `calories`, `weight_kg`, `steps`, `training_minutes`, `cardio_minutes`, `notes` |
| `health.log_sleep` | Log a sleep entry | `date`, `hours`, `quality` (1-5), `bedtime`, `wake_time`, `notes` |
| `health.log_vitals` | Log a vitals entry | `date`, `weight_kg`, `resting_hr`, `systolic`, `diastolic`, `notes` |
| `health.log_measurement` | Log a body measurement | `date`, `chest_cm`, `arm_r_cm`, `arm_l_cm`, `waist_cm`, `hips_cm`, `thigh_r_cm`, `thigh_l_cm`, `notes` |

### Wealth Coach Actions

| Action type | What it does | Key fields |
|---|---|---|
| `wealth.add_transaction` | Add a manual transaction | `account_id`, `date`, `description`, `amount`, `category`, `notes` |
| `wealth.recategorise` | Change the category of a transaction | `transaction_id`, `new_category` |
| `wealth.add_holding` | Add a holding to the portfolio | `account_id`, `symbol`, `units`, `avg_cost`, `currency` |
| `wealth.update_property_estimate` | Update a property's current estimate | `property_id`, `estimate_value`, `confidence`, `source`, `notes` |
| `wealth.add_account` | Create a new wealth account | `name`, `type`, `opening_balance`, `currency` |

## Implementation

### Step 1: Extend `applySingleAiAction()`

Add handlers for each new action type. The function already has a clean `if (action.type === "...")` chain. New handlers follow the same pattern:

```javascript
if (action.type === "health.log_session") {
  const health = ensureHealthStateShape();
  const practice = (state.practices || []).find(p => p.id === action.practice_id);
  if (!practice) return `Practice not found: ${action.practice_id}`;

  const date = action.date || todayKey();
  const entry = {
    id: uid(),
    practice_id: action.practice_id,
    date,
    duration: Number(action.duration_minutes) || 30,
    exercises: (action.exercises || []).map(ex => ({
      name: String(ex.name || "").trim(),
      sets: Number(ex.sets) || 0,
      reps: Number(ex.reps) || 0,
      weight: Number(ex.weight) || 0,
      notes: String(ex.notes || "").trim()
    })),
    energy: Math.min(5, Math.max(1, Number(action.energy) || 0)) || null,
    notes: String(action.notes || "").trim(),
    created_at: new Date().toISOString()
  };

  // Add to daily log (same path as manual logging)
  if (!state.daily_log) state.daily_log = [];
  state.daily_log.push({
    id: uid(),
    practice_id: action.practice_id,
    date,
    status: "done",
    duration: entry.duration,
    notes: entry.exercises.map(ex =>
      `${ex.name}${ex.sets ? ` ${ex.sets}x${ex.reps}` : ""}${ex.weight ? ` @${ex.weight}kg` : ""}`
    ).join(", ") + (entry.notes ? ` — ${entry.notes}` : ""),
    structured_exercises: entry.exercises,
    energy: entry.energy,
    created_at: entry.created_at
  });
  return "";
}
```

Each action handler validates inputs, applies the change to `state`, and returns an empty string on success or an error message on failure. The existing rollback mechanism (snapshot + revert on error) protects against partial failures.

### Step 2: Extend `describeAiAction()`

Add human-readable labels for the new actions:

```javascript
if (action.type === "health.log_session") {
  const exerciseList = (action.exercises || [])
    .map(ex => `${ex.name}${ex.sets ? ` ${ex.sets}×${ex.reps}` : ""}${ex.weight ? ` @${ex.weight}kg` : ""}`)
    .join(", ");
  return `Log session: ${exerciseList || "exercise"} (${action.duration_minutes || "?"}min)`;
}
if (action.type === "health.set_weekly_target") {
  return `Set weekly target: ${action.sessions_per_week} sessions/week`;
}
if (action.type === "wealth.add_transaction") {
  return `Add transaction: ${action.description} $${action.amount}`;
}
```

### Step 3: Update Coach System Prompts

Each coach's system prompt needs to describe the available actions and the expected JSON response format. The key addition is telling the AI to return structured actions when the user asks for a change, not just advice.

Add to Health Coach system prompt:

```
When the user asks you to LOG, RECORD, SET, CREATE, or UPDATE something,
respond with a JSON block containing an "actions" array. Each action has
a "type" field and the relevant data fields.

Available action types:
- health.log_session: { practice_id, date, duration_minutes, exercises: [{name, sets, reps, weight, notes}], energy, notes }
- health.set_weekly_target: { practice_id, sessions_per_week }
- health.update_profile: { fields: { ... } }
- health.create_training_block: { title, start_date, duration_weeks, sessions_per_week, deload_week }
- health.log_nutrition: { date, protein_g, carbs_g, fats_g, calories, weight_kg, steps, notes }
- health.log_sleep: { date, hours, quality, bedtime, wake_time, notes }
- health.log_vitals: { date, weight_kg, resting_hr, systolic, diastolic, notes }
- health.log_measurement: { date, chest_cm, waist_cm, hips_cm, ... }

When the user describes a workout, parse it into structured exercises and
propose a log_session action. Always include a plain-text summary before
the JSON block.

Example response when user says "I did 3x10 goblet squats at 20kg and 3x15 swings":
---
Got it — here's what I'll log for today:

```json
{
  "summary": "Kettlebell session: goblet squats and swings",
  "actions": [{
    "type": "health.log_session",
    "practice_id": "<gym_practice_id>",
    "date": "2026-03-19",
    "duration_minutes": 30,
    "exercises": [
      { "name": "Goblet Squats", "sets": 3, "reps": 10, "weight": 20 },
      { "name": "KB Swings", "sets": 3, "reps": 15, "weight": 20 }
    ],
    "energy": null,
    "notes": ""
  }]
}
```
---

If the user is just asking questions or seeking advice, respond normally
with text only — no actions block.
```

Same pattern for Wealth Coach with `wealth.*` action types.

### Step 4: Parse Coach Responses for Actions

The Health and Wealth coach response handlers (`requestHealthCoaching`, `requestWealthCoaching`) currently just display the text. They need to detect and parse JSON action blocks:

```javascript
function parseCoachResponse(rawText) {
  // Try to extract a JSON block from the response
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) return { text: rawText, proposal: null };

  try {
    const parsed = JSON.parse(jsonMatch[1].trim());
    if (parsed.actions && Array.isArray(parsed.actions) && parsed.actions.length > 0) {
      // Strip the JSON block from display text
      const cleanText = rawText.replace(/```json[\s\S]*?```/, "").trim();
      return { text: cleanText, proposal: parsed };
    }
  } catch (e) {
    // JSON parse failed — treat entire response as text
  }
  return { text: rawText, proposal: null };
}
```

When a proposal is detected, build it using the existing `buildAiProposal()` (or a coach-specific variant) and render the preview card inline in the coach messages.

### Step 5: Render Action Cards in Coach Messages

When the coach returns actions, render them as a confirmation card inside the message stream:

```html
<div class="wealth-coach-msg assistant">
  <div class="coach-action-card">
    <div class="coach-action-summary">Log exercise session</div>
    <div class="coach-action-items">
      <label><input type="checkbox" checked> KB Swings 3×15 @20kg</label>
      <label><input type="checkbox" checked> Goblet Squats 3×10 @20kg</label>
      <label><input type="checkbox" checked> KB Rows 3×10 each @20kg</label>
    </div>
    <div class="coach-action-buttons">
      <button class="primary" data-coach-apply>Log This Session</button>
      <button class="ghost" data-coach-edit>Edit First</button>
    </div>
  </div>
</div>
```

The "Edit First" button opens the relevant form (e.g., exercise log modal) pre-filled with the parsed data so the user can adjust before saving.

### Step 6: State Variable Per Coach

Each coach needs its own proposal state (Health and Wealth coaches are independent of Plan):

```javascript
let healthCoachProposal = null;
let wealthCoachProposal = null;
```

The apply function is shared (`applySingleAiAction` handles all action types), but the proposal lifecycle is per-coach.

## Interaction Modes

The coaches now have two modes, detected automatically from the AI response:

1. **Advisory mode** (no JSON block) — coach gives text advice, same as today
2. **Action mode** (JSON block with actions) — coach proposes changes, user confirms

The user never has to think about modes. If they say "how's my training going?" they get advice. If they say "log my workout" they get an action card. The AI decides based on the verb.

## Practice ID Resolution

The coach needs to know which practice to log against. The system prompt should include the user's current practices in the snapshot:

```json
{
  "practices": [
    { "id": "abc123", "title": "Exercise / Gym", "domain": "health" },
    { "id": "def456", "title": "Meditation", "domain": "mind" }
  ]
}
```

If the user says "log my gym session," the AI maps it to the practice with title containing "gym" or "exercise." If ambiguous, the AI should ask.

## Build Sequence

1. **Add action types to `applySingleAiAction()`** — start with `health.log_session` only
2. **Add action descriptions to `describeAiAction()`**
3. **Update Health Coach system prompt** with action schema
4. **Add `parseCoachResponse()` to detect JSON blocks**
5. **Render action cards in coach message stream**
6. **Wire up Apply / Edit buttons**
7. **Test end-to-end**: tell the coach about a workout → see proposal → click Apply → verify it appears in Exercise log
8. **Repeat for remaining Health actions** (weekly target, profile, training block, nutrition, sleep, vitals, measurements)
9. **Repeat for Wealth actions** (transaction, recategorise, holding, property, account)

Start with `health.log_session` because that's the action that triggered this spec. Get one action type working perfectly before expanding.

## CSS for Action Cards

```css
.coach-action-card {
  padding: 14px 16px;
  border: 1px solid var(--accent);
  border-radius: 14px;
  background: var(--accent-light);
}
.coach-action-summary {
  font-weight: 700;
  font-size: .84rem;
  margin-bottom: 10px;
}
.coach-action-items {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  font-size: .82rem;
}
.coach-action-items label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.coach-action-buttons {
  display: flex;
  gap: 8px;
}
```

## What This Unlocks

Once this pattern is live, every coach interaction that involves "do something" becomes a one-click action. Examples:

- "Log my workout" → action card → Apply
- "Set my weekly target to 4 sessions" → action card → Apply
- "Add a $500 transfer to savings" → action card → Apply
- "Recategorise that Uber charge as transport" → action card → Apply
- "Update the house estimate to $850k" → action card → Apply
- "Create a 6-week strength block starting Monday" → action card → Apply
- "I slept 7 hours last night, quality 4/5" → action card → Apply

The coach becomes a natural-language interface to every feature in the app. That's the "personal chief of staff" promise delivered.
