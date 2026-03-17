# Progressive Disclosure Spec — Health & Wealth Modules

## Problem

The Health module currently shows 7 sub-tabs (Overview, Assessment, Exercise, Nutrition, Sleep, Measurements, Vitals) from the moment a user first opens it — even when every single one is empty. This is overwhelming and makes the product feel clinical rather than inviting.

Wealth has a similar but less severe version of this problem with portfolio, property, trade history, and dividend features all visible before any data exists.

The Execute tab handles this well: it's a single grid surface that fills itself with content as data appears. No sub-tab overload, no wall of empty states.

## Design Principle

**Start simple. Earn complexity.**

Features should appear when they become useful — either because the user has enough data to benefit from them, or because they've explicitly opted in. The product should feel like it grows with you, not like it's waiting for you to catch up.

## Current State

### Health Module (7 sub-tabs, all visible from day one)

| Sub-tab | Empty state experience |
|---|---|
| Overview | Multiple empty cards: "No profile yet", "No vitals", "No sleep data", "No training block", "No practices" |
| Assessment | "No assessment week set up yet" |
| Exercise | "No exercise practices found yet" |
| Nutrition | "No nutrition targets yet" / "No bodyweight entries" |
| Sleep | "No sleep logs yet" |
| Measurements | "No measurement check-in yet" |
| Vitals | "No vitals logs yet" |

A new user sees 7 tabs, each containing an empty state. That's 7 signals that say "you haven't done anything yet."

### Wealth Module (3 sub-tabs + hidden feature panels)

| Sub-tab | Empty state experience |
|---|---|
| Overview | "No accounts yet" / "No transactions" |
| Portfolio | "No holdings" / Empty snapshot trend / Empty performance |
| Cash Flow | Empty drilldown tables |

Less severe, but property tracking, trade history, dividends, and portfolio snapshots are all rendered even when no data exists.

## Proposed Architecture

### Three Tiers of Visibility

**Tier 1 — Always visible.** Core tabs that define the module's identity. These appear from day one and show a warm, inviting welcome state when empty — not a list of missing data.

**Tier 2 — Data-activated.** Tabs that appear automatically once the user has enough relevant data. No configuration needed; the product notices you're ready.

**Tier 3 — User-activated.** Tabs that remain hidden until the user explicitly enables them from a module settings panel. These are power-user features that most people won't need on day one.

### Health Module — Tier Assignment

| Sub-tab | Tier | Activation condition |
|---|---|---|
| **Overview** | 1 — Always visible | Always present. Shows a warm welcome state when empty, then fills with summary cards as data accumulates. |
| **Exercise** | 2 — Data-activated | Appears once the user has ≥1 health-tagged life practice with ≥1 logged session. The data already flows from Execute tab practices. |
| **Assessment** | 3 — User-activated | Appears when user clicks "Add module" → Assessment. This is a specific protocol that not everyone will use. |
| **Nutrition** | 3 — User-activated | Appears when user clicks "Add module" → Nutrition. Macro tracking is a deliberate choice. |
| **Sleep** | 3 — User-activated | Appears when user clicks "Add module" → Sleep. Some users care about sleep data, many won't track it. |
| **Measurements** | 3 — User-activated | Appears when user clicks "Add module" → Measurements. Body measurements are niche. |
| **Vitals** | 3 — User-activated | Appears when user clicks "Add module" → Vitals. BP/resting HR tracking is for health-focused users. |

**Day-one experience:** User sees ONE tab (Overview) with a clean welcome state. As they log exercise via their life practices, the Exercise tab fades in. Everything else is opt-in.

### Wealth Module — Tier Assignment

| Feature | Tier | Activation condition |
|---|---|---|
| **Overview** | 1 — Always visible | Always present. Welcome state when no accounts exist. |
| **Portfolio** | 2 — Data-activated | Appears once ≥1 holding exists in any account. |
| **Cash Flow** | 2 — Data-activated | Appears once ≥5 categorised transactions exist. |
| **Properties** | 3 — User-activated | Appears when user clicks "Add module" → Property Tracking. |
| **Trade History** | 2 — Data-activated | Appears within Portfolio once ≥1 trade is logged. Renders as a section inside Portfolio, not a separate tab. |
| **Dividends** | 2 — Data-activated | Appears within Portfolio once ≥1 dividend entry exists. Same — section inside Portfolio, not a separate tab. |
| **Snapshot Trend** | 2 — Data-activated | Appears within Portfolio once ≥2 monthly snapshots exist. |

**Day-one experience:** User sees ONE tab (Overview) with a prompt to add their first account. Portfolio and Cash Flow tabs appear as data flows in. Property tracking is opt-in.

## Implementation

### 1. Module Registry

Add a `state.modules` object that tracks which optional modules are enabled:

```javascript
// Default state
state.modules = {
  health: {
    nutrition: false,
    sleep: false,
    measurements: false,
    vitals: false,
    assessment: false
  },
  wealth: {
    properties: false
  }
};
```

This persists to localStorage via the existing `saveState()` mechanism.

### 2. Tab Rendering Logic

Modify `renderHealth()` to conditionally build the tab bar:

```javascript
function getVisibleHealthTabs() {
  const tabs = ["overview"]; // Tier 1 — always visible

  // Tier 2 — data-activated
  const practices = getHealthPractices();
  const hasExerciseData = practices.some(p =>
    (state.daily_log || []).some(d => d.practice_id === p.id)
  );
  if (hasExerciseData) tabs.push("exercise");

  // Tier 3 — user-activated
  const mods = (state.modules && state.modules.health) || {};
  if (mods.assessment) tabs.push("assessment");
  if (mods.nutrition) tabs.push("nutrition");
  if (mods.sleep) tabs.push("sleep");
  if (mods.measurements) tabs.push("measurements");
  if (mods.vitals) tabs.push("vitals");

  return tabs;
}
```

Then in `renderHealth()`:

```javascript
function renderHealth() {
  const visible = getVisibleHealthTabs();

  // Rebuild tab bar with only visible tabs
  const tabBar = document.getElementById("healthSubtabs");
  if (tabBar) {
    tabBar.innerHTML = visible.map(t => {
      const label = { overview: "Overview", exercise: "Exercise",
        assessment: "Assessment", nutrition: "Nutrition",
        sleep: "Sleep", measurements: "Measurements",
        vitals: "Vitals" }[t] || t;
      const active = t === activeHealthTab ? " active" : "";
      return `<div class="health-subtab${active}" data-health-tab="${t}">${label}</div>`;
    }).join("");
    // Re-bind click handlers
    bindHealthSubtabClicks();
  }

  // Show/hide panels
  document.querySelectorAll(".health-panel").forEach(panel => {
    const tabName = panel.id.replace("health-panel-", "");
    panel.style.display = visible.includes(tabName) ? "" : "none";
    panel.classList.toggle("active", panel.id === `health-panel-${activeHealthTab}`);
  });

  // Only render visible panels (performance optimisation)
  if (visible.includes("overview")) renderHealthOverview();
  if (visible.includes("assessment")) renderHealthAssessment();
  if (visible.includes("exercise")) renderHealthExercise();
  if (visible.includes("nutrition")) renderHealthNutrition();
  if (visible.includes("sleep")) renderHealthSleep();
  if (visible.includes("measurements")) renderHealthMeasurements();
  if (visible.includes("vitals")) renderHealthVitals();
}
```

Apply the same pattern to `renderWealth()` with `getVisibleWealthTabs()`.

### 3. "Add Module" Button

On the Overview tab of both Health and Wealth, add a small button that opens a module picker:

```html
<button class="module-add-btn" onclick="openModulePicker('health')">
  + Add tracking module
</button>
```

The picker is a simple modal listing available (not yet enabled) modules with a one-line description and a toggle:

```
┌─────────────────────────────────────────────┐
│  Health Modules                             │
│                                             │
│  ☐ Assessment Week                          │
│    Baseline your nutrition over 7 days      │
│                                             │
│  ☐ Nutrition                                │
│    Track daily macros, calories, and meals   │
│                                             │
│  ☐ Sleep                                    │
│    Log sleep hours, quality, and recovery    │
│                                             │
│  ☐ Body Measurements                        │
│    Track chest, waist, hips, arms, thighs   │
│                                             │
│  ☐ Vitals                                   │
│    Log weight, resting HR, blood pressure    │
│                                             │
│              [ Save ]                       │
└─────────────────────────────────────────────┘
```

Toggling a module on immediately persists to `state.modules` and re-renders the tab bar.

### 4. Overview Welcome State

Replace the current multi-card empty state on the Health Overview with a single, warm welcome:

```html
<div class="module-welcome">
  <h3>Your health dashboard</h3>
  <p>
    This will fill itself as you log activity. Health practices from your
    daily routine flow here automatically — or you can add tracking modules
    for nutrition, sleep, measurements, and more.
  </p>
  <button class="module-add-btn" onclick="openModulePicker('health')">
    + Add tracking module
  </button>
</div>
```

Once any data exists, this welcome state is replaced by the real overview cards. The transition is automatic — no user action needed beyond using the product.

Same pattern for Wealth Overview:

```html
<div class="module-welcome">
  <h3>Your wealth dashboard</h3>
  <p>
    Add your first account to start tracking holdings, cash flow,
    and net worth — or add modules for property tracking and more.
  </p>
  <button class="btn" onclick="openAddAccountModal()">
    + Add account
  </button>
</div>
```

### 5. CSS for Module Add Button

```css
.module-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px dashed var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.module-add-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(var(--accent-rgb), 0.05);
}

.module-welcome {
  text-align: center;
  padding: 48px 24px;
  max-width: 420px;
  margin: 0 auto;
}
.module-welcome h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.module-welcome p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 24px;
}
```

### 6. Fallback Behaviour

If `activeHealthTab` points to a tab that's no longer visible (e.g., user disabled a module), fall back to "overview":

```javascript
if (!visible.includes(activeHealthTab)) {
  activeHealthTab = "overview";
}
```

### 7. Data Migration

For existing users who already have health data in disabled modules, the module should auto-enable if data exists:

```javascript
function autoEnableModulesWithData() {
  const h = state.health || {};
  const mods = state.modules.health;

  if ((h.nutrition_logs || []).length > 0) mods.nutrition = true;
  if ((h.sleep_logs || []).length > 0) mods.sleep = true;
  if ((h.body_measurements || []).length > 0) mods.measurements = true;
  if ((h.vitals_logs || []).length > 0) mods.vitals = true;
  if (h.assessment_week && h.assessment_week.start_date) mods.assessment = true;

  // Wealth
  const w = state.modules.wealth;
  const hasProperties = (state.wealth_properties || []).length > 0;
  if (hasProperties) w.properties = true;
}
```

Call this once on app boot, after `loadState()` and before the first render.

## Summary

The changes are:

1. Add `state.modules` with boolean flags for each optional feature
2. Modify `renderHealth()` and `renderWealth()` to build tab bars dynamically from `getVisibleHealthTabs()` / `getVisibleWealthTabs()`
3. Add a module picker modal accessible from Overview tabs
4. Replace multi-card empty states with a single warm welcome message
5. Auto-enable modules where data already exists (migration safety)
6. Only call render functions for visible panels (performance win)

The result: a Health tab that starts with one clean Overview, grows an Exercise tab when you start logging, and lets you opt into nutrition/sleep/measurements/vitals when you're ready. Same for Wealth — Overview first, then Portfolio and Cash Flow as data arrives, with Properties as an opt-in.

No existing features are removed. No data is lost. The complexity is all still there — it just waits until you need it.
