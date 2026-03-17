## Progressive Disclosure Implementation Plan

### Goal

Reduce empty-state overload in `Health` and `Wealth` without removing any capability.

The fix is UI exposure, not rollback:
- keep the underlying models
- keep the features
- reveal them when they become useful

### Principles

1. `Overview` is always visible.
2. Auto-tabs are derived from real data, not preference state.
3. Optional modules are persisted only when the user explicitly enables them.
4. Existing data must auto-reveal the relevant module so nothing appears to disappear.
5. Empty modules should not dominate day-one UI.

### Shipping Rules

#### Health

- Always visible:
  - `Overview`
- Auto-visible:
  - `Exercise`
    - visible once the user has logged exercise data, a training block, or generated session templates
- User-enabled:
  - `Assessment`
  - `Nutrition`
  - `Sleep`
  - `Measurements`
  - `Vitals`

#### Wealth

- Always visible:
  - `Overview`
- Auto-visible:
  - `Portfolio`
    - visible once the user has holdings, trades, dividends, snapshots, or property tracking enabled/data present
  - `Cash Flow`
    - visible once there are at least 5 transactions
- User-enabled:
  - `Property Tracking`
    - implemented as a section inside `Portfolio`, not a separate tab

### State Shape

Persist only explicit opt-ins:

```js
state.modules = {
  health: {
    assessment: false,
    nutrition: false,
    sleep: false,
    measurements: false,
    vitals: false
  },
  wealth: {
    properties: false
  }
};
```

Auto-visible tabs stay derived from data and are not stored.

### Migration Rules

At boot, auto-enable any optional module that already has data:

- `health.assessment_week` -> `modules.health.assessment = true`
- `health.nutrition_targets` or `health.nutrition_logs` -> `modules.health.nutrition = true`
- `health.sleep_logs` -> `modules.health.sleep = true`
- `health.body_measurements` or `health.progress_checkins` -> `modules.health.measurements = true`
- `health.vitals_logs` -> `modules.health.vitals = true`
- `wealth.properties` -> `modules.wealth.properties = true`

This is a visibility migration only. No health or wealth data is transformed or removed.

### Rendering Changes

#### Health

- Rebuild the Health tab strip dynamically from `getVisibleHealthTabs()`
- Hide the tab strip entirely when only one Health tab is visible
- Fallback `activeHealthTab` to `overview` if the current tab is no longer visible
- Only render visible panels
- Add a warm overview welcome state when there is no meaningful Health setup/data yet
- Add `+ Add tracking module` from Health Overview

#### Wealth

- Rebuild the Wealth tab strip dynamically from `getVisibleWealthTabs()`
- Hide the tab strip entirely when only one Wealth tab is visible
- Fallback `activeWealthTab` to `overview` if hidden
- Only render visible panels
- Add a warm overview welcome state when there is no meaningful Wealth data yet
- Add `+ Add tracking module` from Wealth Overview
- Hide property sections inside `Portfolio` until property tracking is enabled or property data exists

### Module Picker

Add a lightweight shared picker modal.

Health options:
- Assessment Week
- Nutrition
- Sleep
- Measurements
- Vitals

Wealth options:
- Property Tracking

Behavior:
- show only modules not already enabled
- clicking `Add` persists the module flag immediately
- re-render the current surface
- if all available modules are already enabled, show a simple “nothing else to add” state

### Overview Welcome States

#### Health welcome

Shown only when there is no meaningful Health setup or logged data.

Actions:
- `Set Up Profile`
- `Set Up Block`
- `+ Add tracking module`

#### Wealth welcome

Shown only when there are no accounts, transactions, holdings, or properties.

Actions:
- `+ Add account`
- `+ Add tracking module`

### Scope Boundaries

This pass does not:
- remove any Health or Wealth feature
- change calculations
- change coach logic
- create new tabs
- split the single-file architecture

This pass only changes:
- visibility rules
- tab-strip construction
- empty-state behavior
- optional module enable flows

### Expected Outcome

Day one:
- `Health` feels like one calm module, not seven empty tabs
- `Wealth` feels like one calm module, not a half-finished cockpit

As data appears:
- `Exercise`, `Portfolio`, and `Cash Flow` appear automatically
- advanced tracking surfaces appear when the user opts in
- existing users keep access to anything they already populated
