# Discoverability Debt — Triage

> Draft recommendations. Three buckets: **Surface** (promote to Settings or visible UI),
> **Advanced** (keep but bury in Advanced / power-user settings), **Deprecate** (remove or
> mothball). Line refs are to `src/index.html` on `feat/task-detail-panel`.

---

## 1 · SURFACE — promote to first-class Settings

These are features most users would benefit from if they knew they existed.

| Feature | Current state | Recommended home | Notes |
|---------|--------------|-----------------|-------|
| **Pomodoro durations** (work/break) | Hardcoded defaults, no UI | Settings → Timer | Core workflow feature. Should be the first thing in Timer settings. |
| **Sound / alarm tone picker** | 5 tones exist, no chooser exposed | Settings → Timer → Sound | Bell, chime, singing-bowl, gong, digital. Let users audition them. |
| **Desktop notifications toggle** | Wired but not surfaced | Settings → Timer → Notifications | macOS permission prompt on first enable. |
| **Focus mode toggle** | Hidden in redesign (L2905, L14491) | Settings → Timer → Focus | Auto-hides non-essential UI during pomodoro. Valuable, just invisible. |
| **Auto-focus toggle** | Wired but hidden (L28317) | Settings → Timer → Focus | Auto-starts focus mode when timer begins. Pair with focus toggle. |
| **AI provider selector** | Crammed into AI chat modal | Settings → AI | Provider, model, API key, base URL. This is settings, not chat UI. |
| **AI temperature / max tokens** | Inside AI modal | Settings → AI → Advanced | Power users only, but belongs in settings not chat. |
| **Local AI setup wizard** (Ollama) | Separate hidden flow (L4459, L28477) | Settings → AI → Local Models | Detect → install → select. Great UX, nobody can find it. |
| **AI file/image attachments** | Supported across surfaces (L3154, L13514) | No settings change needed — surface in AI chat UI | Add visible attachment button + drag-drop hint. Not a settings item. |
| **Cloud sync config** | Flag exists, no UI | Settings → Sync & Storage | Supabase URL, anon key, enable/disable, device name. |
| **Storage mode selector** | Sync-banner state machine (L6870–L7424) | Settings → Sync & Storage | Browser cache / JSON file / native store / cloud. User should choose explicitly. |
| **Backup & restore** | Buried in App & Data modal | Settings → Sync & Storage → Backup | Import, export, auto-recovery. Critical for trust. |
| **Onboarding replay** | Supports reset + preview modes (L5044, L29846) | Settings → About / Help | "Re-run setup wizard" button. Useful after major updates. |
| **Keyboard shortcuts reference** | Hardcoded, no UI | Settings → Shortcuts | Read-only list first. Customization can come later. |
| **Finish Track / expansion gate** | Functional but undiscoverable (L15157, L12758) | Execute tab — visible toggle or banner | This is a productivity feature, not a setting. Needs a visible affordance in the main workflow. |
| **Closure review modal** | Built (L4310, L11368, L29701) | Review tab — accessible from day/week summary | Already has UI, just needs a clear entry point. |

## 2 · ADVANCED — keep but bury in power-user settings

These are real features that most users will never touch. Available but not prominent.

| Feature | Current state | Recommended home | Notes |
|---------|--------------|-----------------|-------|
| **Sound profile (volume levels)** | 3 profiles exist | Settings → Timer → Sound → Advanced | Most people just want on/off + tone. Volume profiles are niche. |
| **Chime length** | Configurable | Settings → Timer → Sound → Advanced | Pair with sound profile. |
| **AI per-provider model fetch** | Live model list from API | Settings → AI (auto, no separate control) | Happens behind the scenes when provider is selected. |
| **OpenAI-compatible endpoint** | Supported | Settings → AI → Advanced | For self-hosted / alternative providers. |
| **Health submodule picker** | Per-surface enable (L3340, L19520) | Settings → Modules → Health | Let users pick which Health surfaces to show once Health is enabled. |
| **Wealth submodule picker** | Per-surface enable (L29440) | Settings → Modules → Wealth | Same pattern as Health. |
| **Wealth import tooling** | Full import pipeline (L22307–L25460) | Wealth module → Import (when Wealth is active) | Review, undo, parser templates, category rules. Keep inside Wealth, not in top-level settings. |
| **Wealth property feed preview** | Live feed preview (L24928) | Wealth module → Properties | Same — lives inside the module, not settings. |
| **Plan Review coaching** | Practice-level coaching from review grid (L29989) | Review tab (already there) | Just needs better visual cue that coaching is available. |
| **Plan Review range toggles** | Week/month toggle (L3211) | Review tab (already there) | Discoverable enough once someone's in Review. |
| **Practices / domains config** | Exists but scattered | Settings → Practices | For users who want to customize their practice taxonomy. |
| **Sync polling interval** | Exists in sync engine | Settings → Sync & Storage → Advanced | Default is fine for 99% of users. |
| **Device tracking** | Part of cloud sync | Settings → Sync & Storage → Devices | Useful for multi-device users. Not prominent. |

## 3 · DEPRECATE — remove or mothball

These are candidates for removal. Either redundant, confusing, or not worth the maintenance cost.

| Feature | Current state | Recommendation | Notes |
|---------|--------------|---------------|-------|
| **Browser-cache storage mode** | Part of sync-banner state machine | **Remove** | This is a Tauri desktop app. Native store is the only sane default. Browser cache is a web-app artifact. |
| **Linked JSON file mode** | Part of storage modes | **Evaluate** | May still be useful for users who want a human-readable backup location. Could keep as Advanced. Borderline. |
| **App & Data modal** (as a container) | Houses import/export, flags, reset | **Decompose** | Not really a coherent surface. Split its contents into the appropriate Settings tabs and retire the modal itself. |
| **`ai_only` onboarding path** | Exists (L14124) | **Evaluate** | Does this still make sense as a separate path, or should onboarding just have an "AI setup" step? Simplification candidate. |

---

## Proposed Settings architecture

Based on the triage above, the Settings panel would have these tabs:

```
Settings (⌘,)
├── Timer
│   ├── Work & break durations
│   ├── Sound (tone picker, on/off)
│   ├── Notifications (desktop notify toggle)
│   └── Focus (focus mode, auto-focus)
├── AI
│   ├── Provider & model
│   ├── API key & base URL
│   ├── Local models (Ollama wizard)
│   └── Advanced (temperature, max tokens, compatible endpoints)
├── Modules
│   ├── Health (master toggle + submodule picker)
│   └── Wealth (master toggle + submodule picker)
├── Sync & Storage
│   ├── Storage mode (native store / cloud)
│   ├── Cloud sync config
│   ├── Backup & restore
│   └── Advanced (polling, devices)
├── Practices
│   └── Practice & domain configuration
├── Shortcuts
│   └── Keyboard shortcut reference (read-only v1)
└── About
    ├── Version info
    ├── Re-run onboarding
    └── Reset / danger zone
```

## Phased rollout plan

The point of this work is to surface the stable core without reopening the Health/Wealth complexity. Each phase should land as a focused PR with no unrelated behavior changes.

### Phase 1 — Settings shell

Build a real `Settings` subtab in Plan by reusing the current `assistant` panel slot.

- Rename `AI Settings` tab to `Settings`
- Add section navigation inside Settings:
  - General
  - Focus Timer
  - AI
  - Data & Sync
- Keep AI behavior intact, but move it into the `AI` section
- Surface existing timer controls that are already wired:
  - work minutes
  - break minutes
  - sound enabled
  - sound profile
  - alarm tone
  - chime length
  - desktop notifications
  - auto-focus mode
- Use bridge actions for non-core surfaces rather than rewriting them:
  - `Open Cloud Sync`
  - `Open App & Data`
  - `Preview Setup Wizard`

### Phase 2 — General + structure cleanup

- Move experimental module toggles into `General`
- Add onboarding replay / reset entry points with clearer wording
- Add shortcuts reference
- Decide whether appearance stays placeholder or becomes a real section

### Phase 3 — Data & sync consolidation

- Pull backup / export / restore into the Settings surface
- Surface storage mode intentionally
- Bring cloud sync config into Settings instead of hiding it behind a separate modal
- Retire or shrink the `App & Data` modal once the main flows are migrated

### Phase 4 — AI cleanup

- Keep sidebar as the primary conversational AI surface
- Keep Settings > AI for provider setup, local model setup, testing, and review
- Remove leftover wording and UX that still implies a second competing AI workspace

### Phase 5 — Structure / practices

- Add editable practice defaults and practice/domain configuration
- Keep goals and tasks out of Settings
- Decide whether practice structure belongs in Settings or its own lightweight editor

## Delivery rules

- `main` stays stable
- extraction / settings work happens on feature branches off `develop`
- each PR should do one of:
  - code move only
  - one settings surface increment
- no feature mixing, no opportunistic refactors, no visual side quests inside the same PR

## Regression gate for every settings PR

Run this smoke test before merging:

1. Launch the Tauri app
2. Open Execute
3. Start, pause, and resume the timer
4. Enter and exit focus mode
5. Press `f` to expand/unexpand
6. Press `Cmd+K` and confirm AI focus still works
7. Open Plan
8. Open Settings and confirm the expected section renders
9. Run one AI interaction from a normal surface
10. Drag-to-reorder in Execute and confirm Plan reflects the same order
11. Save/load state and confirm no data disappears
12. Open onboarding preview and close it cleanly

## Build / test commands

- Full desktop dev app: `npm run dev`
- Full desktop build: `npm run build`
- Frontend-only dev: `npm run vite:dev`
- Frontend-only build: `npm run vite:build`

For settings work, prefer:

1. patch the feature branch
2. run `npm run build`
3. smoke-test the installed app only after the build is clean

---

## Open questions

1. **Finish Track** — Is this a settings toggle, or does it need a visible affordance in the Execute tab itself (e.g. a banner or lock icon)?
2. **Linked JSON file mode** — Keep as advanced storage option or drop entirely?
3. **`ai_only` onboarding path** — Simplify into the main onboarding flow or keep as a separate fast-track?
4. **Dark mode** — Notably absent from the codebase. Is this on the roadmap for the Settings panel, or out of scope for now?
5. **Display / appearance settings** — Beyond dark mode, are there other display preferences worth adding (font size, density, accent colour)?
