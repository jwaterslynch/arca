# Coach UI Redesign Spec

## Goal

Every surface in the app should have a consistent, attractive, always-visible coach panel. Right now the Execute tab gets this right — the AI input is right there in the sidebar, always visible, ready to go. The other tabs are inconsistent: Plan has an "AI Assistant" section plus a separate "Plan Coach" drawer, Health and Wealth have small buttons that open side drawers, and Plan has an entire "AI Workspace" sub-tab that may no longer be needed.

This spec standardises the coach experience across all four tabs.

## Current State (Problems)

### Execute Tab
- ✅ Inline AI bar always visible at top of main content area
- ✅ Cmd+K focuses the input
- ✅ Works well — this is the reference design

### Plan Tab
- ❌ Right sidebar has "AI Assistant" section — should be renamed "Plan Coach"
- ❌ "AI Assistant" label is generic and inconsistent with Health/Wealth naming
- ❌ "Coach · ⌘K" button opens a separate side drawer — redundant with the sidebar chat
- ❌ "AI Workspace" is a full sub-tab next to Pipeline and Review — this feels like settings, not a planning surface
- ❌ Cmd+K opens the side drawer instead of focusing the always-visible sidebar input

### Health Tab
- ❌ Coach is a small "Coach · ⌘K" button in the toolbar — easy to miss
- ❌ Opens a side drawer that slides over the content
- ❌ No always-visible coach presence on the page itself
- ❌ Drawer is disconnected from the content the user is looking at

### Wealth Tab
- ❌ Same issues as Health — small button, drawer overlay, no embedded presence

## Proposed Design

### Principle

The coach should feel like it **lives on every surface** — not like it's a popup you have to summon. The Execute tab already does this. We extend the same pattern everywhere.

### Execute Tab — No Changes
- Keep as-is. It's the reference.

### Plan Tab — Embed Coach in Sidebar

**Rename "AI Assistant" → "Plan Coach"**
- Change the heading from `AI Assistant` to `Plan Coach`
- Remove the `Review mode` / `Auto mode` sub-label (or move it to a small badge)
- The sidebar chat input IS the Plan Coach — it should say "Ask Plan Coach..." as placeholder

**Remove the "Coach · ⌘K" button from the sidebar**
- It currently opens a redundant side drawer
- Cmd+K should focus the sidebar Plan Coach input directly (it already does for Execute)
- The sidebar IS the coach — no need for a separate drawer

**Deprecate the Plan Coach side drawer**
- The `planCoachDrawer` and `planCoachBackdrop` elements become unused
- Cmd+K focuses `planSidebarChatInput` instead of calling `openPlanCoach()`
- The sidebar chat and the drawer were duplicating functionality

**Reconsider AI Workspace sub-tab**
- AI Workspace currently provides: settings panel, message log, proposal viewer
- Settings are now accessible from the gear icon in the top bar
- The proposal viewer is useful but could live inline in the sidebar
- **Recommendation**: Keep AI Workspace for now but rename it to "AI Settings" or move its content elsewhere in a future pass. It's low priority compared to the coach consistency fixes.

### Health Tab — Add Embedded Coach Panel

**Add a coach card below the health content**
- Similar to how Plan has the AI chat card in its sidebar
- On Health, add a "Health Coach" card at the bottom of the overview panel (or as a fixed footer)
- Contains: heading "Health Coach", provider pill, chat messages, input field
- Always visible when scrolled to bottom, or pinned as a collapsible panel

**Alternative (simpler): Convert the drawer to a right sidebar**
- Health currently uses the full width for content
- Add a right sidebar (like Plan has) that contains the Health Coach
- This creates a consistent two-column layout: content left, coach right
- On narrow screens, the coach collapses to the drawer pattern

**Keep the "Coach · ⌘K" button in the toolbar** as a scroll-to/focus shortcut
- Instead of opening a drawer, it scrolls to and focuses the embedded coach input

### Wealth Tab — Same as Health
- Mirror whatever pattern Health uses
- Wealth Coach embedded in a right sidebar or bottom card
- "Coach · ⌘K" button scrolls to / focuses the input

## Implementation Priority

### Phase 1 — Quick Wins (do now)
1. **Rename Plan sidebar**: "AI Assistant" → "Plan Coach", placeholder → "Ask Plan Coach..."
2. **Remove Plan Coach drawer**: Cmd+K focuses sidebar input, remove "Coach · ⌘K" button from sidebar
3. **Rename references**: Update empty state text, mode labels, etc.

### Phase 2 — Layout Consistency (next pass)
4. **Health right sidebar**: Add a Plan-style right sidebar to Health with embedded coach
5. **Wealth right sidebar**: Same for Wealth
6. **Remove Health/Wealth drawers**: Once embedded coaches work, the side drawers are deprecated

### Phase 3 — Cleanup
7. **AI Workspace decision**: Either rename, move to settings, or remove
8. **Responsive behaviour**: On narrow screens, coach panels collapse to expandable cards

## Naming Convention

| Surface | Coach Name | Placeholder | Heading |
|---------|-----------|-------------|---------|
| Execute | (inline AI bar) | "Brain dump, plan, or ask..." | N/A — it's the AI bar |
| Plan | Plan Coach | "Ask Plan Coach..." | "Plan Coach" |
| Health | Health Coach | "Ask Health Coach..." | "Health Coach" |
| Wealth | Wealth Coach | "Ask Wealth Coach..." | "Wealth Coach" |

## Cmd+K Behaviour

| Surface | Current | Proposed |
|---------|---------|----------|
| Execute | Focuses inline AI bar | No change |
| Plan | Opens Plan Coach side drawer | Focuses Plan sidebar coach input |
| Health | Opens Health Coach side drawer | Focuses Health embedded coach input (Phase 2) / Opens drawer (Phase 1) |
| Wealth | Opens Wealth Coach side drawer | Focuses Wealth embedded coach input (Phase 2) / Opens drawer (Phase 1) |

## Visual Reference

The Plan sidebar already has the right layout:

```
┌─────────────────┐
│ Primary Goal     │
│ Research: 10...  │
├─────────────────┤
│ Plan Coach       │  ← rename from "AI Assistant"
│ ChatGPT ·        │
│                  │
│ [chat messages]  │
│                  │
│ [+ input field]  │
├─────────────────┤
│ This Week's      │
│ Commitments      │
└─────────────────┘
```

Health and Wealth should get a similar right sidebar in Phase 2.
