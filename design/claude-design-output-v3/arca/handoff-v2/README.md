# Arca Desktop v2 — Integration handoff

**Date:** 2026-04-30
**For:** Julian / Claude Code
**Branch suggestion:** `feat/desktop-v2-practices-stillness` off `release/beta.15`

This bundle ships the Practices panel redesign and two stillness moments. Plain HTML/CSS/JS — no build step required. Drops into `arca/src/index.html` and the existing styles/scripts.

## What's in here

```
handoff-v2/
├── practices.css         Panel + tick + drawer styles
├── practices.html        Markup template for the practices panel
├── practices.js          Tick + expand interactions (vanilla)
├── focus-mode.css        Focus Mode Lock overlay styles
├── focus-mode.html       Overlay markup (one instance, sits at body end)
├── focus-mode.js         FocusLock.enter()/exit() controller
├── session-closed.css    Session Closed Beat overlay styles
├── session-closed.html   Overlay markup (one instance, sits at body end)
├── session-closed.js     Listens for arca:session-closed events
├── empty-state.html      Reusable mark-on-vellum empty state (style + markup inline)
└── README.md             This file
```

All token references (`--paper`, `--ink`, `--accent`, etc.) are already defined in v1 and need no changes.

## Integration order

1. **Practices panel** (≈30 min)
   - In `arca/src/index.html`, find the existing `.practice-*` block (≈ lines 292–346) and replace it with `practices.html`.
   - Append `practices.css` to your stylesheet.
   - Append `practices.js` to your script bundle (or inline at end of body).
   - Wire your existing habit-store to listen for `arca:practice-tick` / `arca:practice-expand` events.

2. **Focus Mode Lock** (≈45 min)
   - Append `focus-mode.html` once near `</body>`.
   - Append `focus-mode.css` to your stylesheet. (Replace the inline `<svg>` mark with the canonical `arca-mark-flat.svg` from v1.)
   - Append `focus-mode.js` to your script bundle.
   - In your existing `#focusModeBtn` handler, replace the workspace-dim with:
     ```js
     FocusLock.enter({ minutes: 25, taskName: currentTask.name });
     ```
   - When `FocusLock` exits via timer expiry it dispatches `arca:session-closed` automatically — that hands off to the next overlay.

3. **Session Closed Beat** (≈30 min)
   - Append `session-closed.html` once near `</body>`.
   - Append `session-closed.css` and `session-closed.js`.
   - For non-focus-mode pomodoros (where the user just runs the inline timer), dispatch the event yourself:
     ```js
     window.dispatchEvent(new CustomEvent('arca:session-closed', {
       detail: { duration: '52:00' }
     }));
     ```

4. **Empty-state mark** (drop-in)
   - Use `empty-state.html` as a reference. The `<style>` block in it is small enough to inline once globally if multiple panels use it.

5. **Reduce-motion settings toggle** (optional, ≈30 min)
   - All three components already respect `@media (prefers-reduced-motion: reduce)`.
   - If you want an explicit override toggle in Settings: set `data-reduce-motion="true"` on `<html>` and add a CSS rule mirroring the prefers-reduced-motion block.

Total estimated work: half a day, as you said.

## What's intentionally not here

- **The pomodoro completion → session-closed wiring.** I don't know your existing event names. The handoff dispatches `arca:session-closed`; you connect it.
- **The practices data layer.** The HTML is a template for two example rows. Render this server-side (or however you currently render practices) using the same data-attribute contract: `data-practice-id`, `data-ticked`, `data-expanded`.
- **The icon master SVGs.** I've inlined a simplified vault-arch in the markup for visual reference, but you should swap to `arca/design/icons-v1/arca-mark-flat.svg` (paper-on-navy variant) for production. The simplified version is recognizable but doesn't have the keystone detail.
- **The desktop.jsx update.** Per your request — it's a design-review file, not production. The canvas mockup at `Arca v2.html` shows the intended states.

## Things to verify once it's live

These are the open questions from the v2 design review:

1. **Tick duration.** Currently 320ms stroke + 240ms strikethrough = 560ms total. On the edge of "slow." Try 200+180 = 380ms once it's wired and see whether the longer beat is more satisfying or just slower.

2. **Per-item progress dots at home view.** Currently only in the drawer. On Day 30, you may want a small per-item indicator at rest. Adding back is one CSS rule (`.practice-row__weekdots` rendered next to the meta line) — easy to bolt on if you decide you want it.

3. **Long task names in focus mode.** 96px JetBrains Mono leaves room for ~50 char task names at default window width. The CSS clamps to 72px under 1100px viewport. Verify both breakpoints with your actual data.

4. **Animations on Tauri vs browser.** CSS animations should work identically, but `position: fixed` overlays on Tauri windows can occasionally have z-index quirks with the title bar. If the overlay sits *under* the chrome on macOS, set `data-tauri-drag-region` to false on the overlay and adjust z-index.

## What got rejected

For the record (also documented in `Arca v2.html`'s "What was considered, and rejected" page):

- Launch splash → ceremony, not punctuation
- Last-task-of-the-day moment → calls attention to itself
- Weekly review entry → review *is* the stillness
- Calendar/week transitions → invisible by design
- Sound → deferred to a deliberate v3 decision
- Empty-state mark counted as a "moment" → it's permanent quiet, not a beat

The rule that drove the cuts: *a stillness moment earns its place only if it changes what the user can do next.*

— Claude Design
