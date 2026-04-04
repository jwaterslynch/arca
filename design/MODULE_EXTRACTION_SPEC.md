# Arca — Module Extraction Spec

**Status:** Ready for implementation
**Priority:** Highest engineering priority — do before any new features
**Goal:** Break the 30K-line monolith into isolated modules so changes to one surface cannot break another

---

## Why

Arca has a **change-risk problem**, not a feature problem. The monolithic `src/index.html` means:

- Every Codex task touches one 30K-line file
- A Wealth import fix can break the pomodoro timer
- AI prompt changes can corrupt onboarding
- No way to freeze stable code while iterating on new surfaces
- Code review is nearly impossible on a single-file diff

Module extraction creates **actual boundaries** between stable core and changing surfaces.

---

## Principles

1. **No framework rewrite.** No React, no Svelte, no TypeScript migration.
2. **Vite as bundler.** Minimal config. No custom string-concatenation pipeline.
3. **Extract leaves first.** Constants, helpers, date utils — things with zero coupling.
4. **One module at a time.** Each extraction is a single PR that can be tested and merged independently.
5. **Feature flags for risky surfaces.** Health, Wealth, experimental AI flows.
6. **No new features during extraction.** Bug fixes only until Phase 2 is complete.

---

## Build Setup (Phase 0)

### Add Vite

```bash
npm install --save-dev vite
```

### Create `vite.config.js`

```js
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // Single HTML output for Tauri
    rollupOptions: {
      input: "src/index.html",
    },
  },
  server: {
    port: 1420,
    strictPort: true,
  },
});
```

### Update `src-tauri/tauri.conf.json`

Change `frontendDist` from `"../src"` to `"../dist"` and add dev server URL:

```json
{
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420"
  }
}
```

### Update `package.json` scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Convert inline `<script>` to external module

In `index.html`, replace the inline `<script>` block with:

```html
<script type="module" src="./main.js"></script>
```

Create `src/main.js` containing everything that was between `<script>` and `</script>`.

At this point, the app should work identically — just loaded from an external file instead of inline. **Test thoroughly before proceeding.**

---

## Module Map

Based on the actual file structure (line counts are approximate):

### Tier 1 — Pure utilities (zero coupling, extract first)

| Module | ~Lines | Contents |
|--------|--------|----------|
| `lib/uid.js` | 10 | `uid()`, `escapeHtml()` |
| `lib/date.js` | 80 | `todayISO()`, `isoToLocalDateKey()`, `fmtClock()`, `parseDate()`, date arithmetic |
| `lib/money.js` | 40 | `moneyToMinor()`, `fmtMoney()`, currency helpers |
| `lib/dom.js` | 30 | `autoGrowTextarea()`, `isEditableElement()` |
| `lib/constants.js` | 60 | `STORAGE_KEY`, `POMO_PREF_KEY`, `TODAY_STAGE_LIMIT`, `NEXT_UP_SOFT_LIMIT`, all enum objects |

### Tier 2 — State & persistence (depends only on Tier 1)

| Module | ~Lines | Contents |
|--------|--------|----------|
| `state/schema.js` | 400 | `emptyState()`, `normalizeState()`, all normalization functions |
| `state/persistence.js` | 300 | `loadState()`, `saveState()`, `saveStateImmediate()`, debounce logic |
| `state/native-store.js` | 250 | Tauri file commands, `tryAutoLoadNativeState()`, backup/restore |
| `state/cloud-sync.js` | 300 | Supabase sync engine, `cloudSyncRpc()`, polling, push/pull |
| `state/ledger.js` | 100 | `queueLedgerEvent()`, flush logic |

### Tier 3 — AI infrastructure (depends on Tier 1 + 2)

| Module | ~Lines | Contents |
|--------|--------|----------|
| `ai/config.js` | 400 | `aiDefaultBaseUrl()`, `aiDefaultModel()`, prefs, provider registry |
| `ai/providers.js` | 600 | `aiCallProvider()` — the multi-provider fetch logic |
| `ai/prompts.js` | 500 | System prompts, context building, schema hints |
| `ai/actions.js` | 800 | `normalizeAiAction()`, `applySingleAiAction()`, `describeAiAction()`, rollback |
| `ai/proposals.js` | 300 | `buildAiProposal()`, `parseCoachActionsFromResponse()`, rendering |
| `ai/composer.js` | 300 | Composer chrome, attachment UI, status icons |
| `ai/local-wizard.js` | 400 | Ollama setup wizard, model pull, probe |

### Tier 4 — Domain modules (depend on Tier 1-3)

| Module | ~Lines | Contents |
|--------|--------|----------|
| `domains/execute.js` | 800 | Hero timer render, today task list, drag-reorder, task selection |
| `domains/pomodoro.js` | 500 | Timer engine, audio, notifications, focus mode |
| `domains/pipeline.js` | 600 | Kanban board, drag between stages, task CRUD, pipeline modal |
| `domains/practices.js` | 800 | Life practices CRUD, logging, streaks, daily log |
| `domains/plan.js` | 600 | Plan sidebar, goals, commitments, Plan Coach |
| `domains/health.js` | 4800 | All health surfaces: profile, training, nutrition, sleep, vitals, coaches |
| `domains/wealth.js` | 6400 | All wealth surfaces: portfolio, cashflow, properties, import, coaches |
| `domains/review.js` | 500 | Weekly review, contribution calendar, sparklines, heatmaps |
| `domains/onboarding.js` | 750 | Setup wizard, AI intake, board creation |

### Tier 5 — Shell (depends on everything)

| Module | ~Lines | Contents |
|--------|--------|----------|
| `main.js` | 400 | `render()`, tab switching, keyboard shortcuts, event listener registration, startup sequence |

---

## Smoke Test Gate

Every extraction PR **must** pass this checklist before merging to `develop`. If any item fails, the PR is rejected — no exceptions.

| # | Check | How to verify |
|---|-------|---------------|
| 1 | App launches | `cargo tauri dev` → window appears, no white screen |
| 2 | Execute tab renders | Today tasks visible, hero timer shows |
| 3 | Timer start / pause / resume | Click start → timer counts → pause → resume → counts again |
| 4 | Focus mode | Start timer → focus overlay appears → Escape exits |
| 5 | `f` key fullscreen | Press `f` → true macOS fullscreen → press `f` again → exits |
| 6 | `Cmd+K` command palette | Opens, searches, selects an action |
| 7 | Plan tab | Renders goals, commitments, pipeline |
| 8 | AI settings | Open settings → change provider → no crash |
| 9 | One AI interaction | Send a message to any coach → response renders |
| 10 | Drag-to-reorder | Drag a Today task → order persists after release |
| 11 | Save / load | Make a change → reload app → change persists |
| 12 | Onboarding | Clear state → onboarding wizard appears and completes |

Run this manually after every extraction. Automate individual checks as time permits, but the manual pass is the mandatory gate.

---

## Extraction Order

**Do NOT extract everything at once.** One module per PR, test after each.

### Phase 1 — Foundation (Week 1)

1. Set up Vite (Phase 0 above)
2. Move `<script>` to `src/main.js`
3. Extract `lib/constants.js`
4. Extract `lib/uid.js`
5. Extract `lib/date.js`
6. Extract `lib/money.js`
7. Extract `lib/dom.js`

**Test:** App works identically. No regressions.

### Phase 2 — State layer (Week 2)

8. Extract `state/schema.js`
9. Extract `state/persistence.js`
10. Extract `state/native-store.js`
11. Extract `state/ledger.js`
12. Extract `state/cloud-sync.js`

**Test:** State loads, saves, syncs, imports, exports. Backup/restore works.

### Phase 3 — AI layer (Week 3)

13. Extract `ai/config.js`
14. Extract `ai/providers.js`
15. Extract `ai/prompts.js`
16. Extract `ai/actions.js`
17. Extract `ai/proposals.js`
18. Extract `ai/composer.js`
19. Extract `ai/local-wizard.js`

**Test:** All coaches respond. Actions apply. Proposals render. Ollama wizard works.

### Phase 4 — Domain modules (Weeks 4-5)

20. Extract `domains/pomodoro.js`
21. Extract `domains/practices.js`
22. Extract `domains/execute.js`
23. Extract `domains/pipeline.js`
24. Extract `domains/plan.js`
25. Extract `domains/review.js`
26. Extract `domains/onboarding.js`
27. Extract `domains/health.js`
28. Extract `domains/wealth.js`

**Test:** Every tab, every coach, every modal, every keyboard shortcut.

### Phase 5 — CSS extraction (Week 6)

29. Split CSS into per-domain files: `css/core.css`, `css/execute.css`, `css/plan.css`, `css/health.css`, `css/wealth.css`, `css/modals.css`, `css/onboarding.css`
30. Import via Vite in `index.html`

**CSS timing note:** Phase 5 is the default home for CSS extraction, but if an earlier extraction PR requires non-trivial CSS edits (e.g., extracting `domains/health.js` means touching 200+ lines of Health CSS), pull the relevant CSS slice into its own file as part of that PR rather than waiting. The rule: if a JS extraction touches more than ~20 lines of CSS, extract the CSS for that domain at the same time.

---

## Shared State Pattern

The biggest challenge is that all modules currently read/write a single global `state` object. The extraction should **not** try to encapsulate state yet — that's a Phase 6 concern. Instead:

```js
// state/store.js — the single source of truth
export const state = loadState();
export const pomodoro = loadPomodoroPrefs();

// Every module imports from the same store
import { state } from "../state/store.js";
```

This preserves the current mutation pattern while making dependencies explicit.

---

## Feature Flags

Add to `state`:

```js
state.feature_flags = {
  health_enabled: true,
  wealth_enabled: true,
  cloud_sync_enabled: false,
  experimental_ai: false,
};
```

Domain modules check their flag before rendering:

```js
// domains/health.js
export function renderHealth() {
  if (!state.feature_flags.health_enabled) return;
  // ... existing render logic
}
```

A simple toggle in the App & Data modal lets users enable/disable surfaces.

---

## Branching Model

Implement immediately, before extraction begins:

```
main          ← stable releases only, tagged (v0.1.0-beta.4, etc.)
  └─ develop  ← integration branch, PRs merge here
       ├─ feat/vite-setup
       ├─ feat/extract-lib-constants
       ├─ feat/extract-state-layer
       └─ ...
```

**Rules:**
- `main` is always deployable. Tag before each release.
- `develop` is the integration target. All feature branches merge here.
- Feature branches are short-lived (1-3 days max).
- Codex works on feature branches only, never directly on `develop` or `main`.
- Each extraction step is its own branch + PR.

**Tag the current working state now:**

```bash
git tag v0.1.0-beta.4-stable
git checkout -b develop
git push origin develop
```

---

## What Not To Do

- **Don't add TypeScript.** It adds a compilation step and slows Codex down. Do it later if needed.
- **Don't add a test framework yet.** Module boundaries are the first defense. Tests come after extraction.
- **Don't refactor function signatures during extraction.** Move code as-is. Clean up in a later pass.
- **Don't extract and add features simultaneously.** Extraction PRs should be pure moves with zero behavior change.
- **Don't try to extract Health and Wealth first.** They're the largest and most coupled. Extract leaves and infrastructure first.

---

## Success Criteria

The extraction is complete when:

1. `src/index.html` contains only HTML + CSS imports + `<script type="module" src="./main.js">`
2. `src/main.js` is under 500 lines (just orchestration + event listeners)
3. No module is larger than 1000 lines (except Health and Wealth, which are ~5K each and can be split further later)
4. `npm run build` produces a single `dist/index.html` that Tauri serves
5. `cargo tauri dev` hot-reloads on module changes
6. A change to `domains/wealth.js` cannot break `domains/pomodoro.js`
7. Codex can be told "only modify files in `domains/health.js`" and that instruction is enforceable
