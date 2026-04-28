# Idea: Distinct Focus Shortcut and User-Configurable Shortcuts

**Status:** Parked. Small product feature, not current focus. 🎨
**Date filed:** 2026-04-28

## The immediate problem

`Cmd+Enter` currently has overlapping meaning:

- In the AI composer, it behaves like send/submit because the textarea keydown handler treats modified Enter the same as plain Enter.
- Outside editable fields, it behaves like "start or resume focus" and can also enter Focus mode.

This creates a context conflict. The behavior is not truly random, but it feels flaky because the same chord means different things depending on cursor location and timer state.

## Product judgment

There are two distinct ideas here:

1. **Near-term cleanup**
   - Give Focus mode its own distinct shortcut.
   - Keep composer submit behavior local to the composer.
   - Show shortcuts clearly in Settings.

2. **Broader shortcut customization**
   - Let users view and override selected keyboard shortcuts in Settings.
   - Store user overrides locally.
   - Validate collisions and reserved OS/app shortcuts.

These should not be treated as the same-sized feature.

## Recommendation

### v1 when revisited

Do the smaller, cleaner thing first:

- Assign Focus mode its own dedicated global shortcut
- Keep AI submit inside the composer
- Update the read-only shortcut reference in Settings

This solves the actual friction without adding a full preferences system.

### v2 only if it earns the complexity

Add user-configurable shortcuts in Settings, but keep scope narrow:

- only for a small set of high-value actions
- validate conflicts
- provide a "reset to defaults" action
- do not expose every internal shortcut on day one

## Why full customization is not the immediate answer

Configurable shortcuts sound simple, but they add product and technical complexity:

1. **Collision handling**
   - User picks a shortcut already used by another Arca action
   - User picks a shortcut reserved by macOS or by text-entry conventions

2. **Context rules**
   - Some shortcuts should work globally
   - Some should not fire while typing in inputs
   - Some should be local to a specific surface

3. **Discoverability**
   - The product needs a clear defaults layer even if customization exists
   - Otherwise users inherit a confusing shortcut model instead of a cleaner one

4. **Persistence and migration**
   - Shortcut overrides become another local preference system with upgrade behavior

## Suggested initial customizable set (if v2 happens)

- Focus mode enter/exit
- Focus AI input
- Tab switching
- Start/pause timer

Avoid opening customization for every action until the model is proven.

## Related current state

- Shortcut reference already exists in Settings as a read-only list
- `Cmd+Enter` currently maps to focus start/resume outside editable fields
- AI composers currently intercept Enter-based submit inside editable fields

## Decision for now

Park this feature.

When revisited, prefer:

1. distinct Focus shortcut first
2. shortcut customization second, only if the defaults still feel constraining in real use
