# Handoff: Arca — Identity & Surfaces (v1)

## Overview

Arca is a local-first life-architecture tool — desktop app for execution and planning, iOS companion for capture. This package is the **first identity pass**: a wordmark, an icon family, an identity-token system, and three product surfaces (iOS Capture, Desktop Execute, marketing landing) reskinned in the new identity.

The design north-star is **"the vault under the arch."** Arca = arch + ark + arcanum: a structure that holds. The mark is a vault-arch A; the surfaces are warm parchment + deep navy ink + a single bronze accent.

## About the Design Files

The files in this bundle are **design references created in HTML/JSX**. They are prototypes showing intended look and behavior — not production code to copy directly.

The task is to **recreate these designs in Arca's existing codebase** (Tauri v2 desktop app + a forthcoming iOS Swift companion) using its established patterns — or, for the iOS app which doesn't exist yet, to choose SwiftUI with a token system that mirrors the CSS variables here.

The HTML/JSX files use React + inline JSX via Babel for fast iteration. They are not the production stack. **Lift the values, the layouts, the type/color decisions, and the component anatomy** — discard the React wiring.

## Fidelity

**High-fidelity for tokens and identity. Mid-fidelity for surfaces.**

- **Identity tokens** (colors, type, spacing, radii, shadows, the icon mark, the wordmark) are final and should be implemented pixel-for-pixel. The CSS variable values in this README are the source of truth.
- **Product surfaces** (iOS Capture screens, Desktop Execute home, landing page) are mid-fidelity mocks demonstrating *how the identity applies*. The IA, copy, and components shown are illustrative — don't ship the exact module list or task copy. Use them to understand spacing rhythm, type hierarchy, and density.

When in doubt: the tokens are non-negotiable; the screen content is a sketch.

## The Identity System

### The mark

A **vault-arch A**: two converging strokes meeting at a bronze keystone, with a four-pillar base. Reads at 16px through 1024px.

Anatomy (see `arca/icons.jsx` → `ArcaMark`):

- Outer canvas: 64×64, rounded square, `r=14`, fill `--ink` (`#1a1f2e`).
- Two converging strokes — left stroke from `(20, 50)` to `(32, 22)`, right stroke from `(44, 50)` to `(32, 22)`. Stroke `--paper-2` (`#e6dfce`), `stroke-width: 4`, `stroke-linecap: round`.
- Crossbar: horizontal at `y=38`, from `x=24` to `x=40`, same stroke spec.
- Keystone: small rectangle at the apex, `(28, 18) → (36, 24)`, fill `--bronze` (`#9a6b3a`), `r=1`.
- Four pillar feet at the base: tiny `2×4` bronze blocks at the foot of each stroke.

Variants shipped in `icons.jsx`:
- `ArcaMark` — full color (ink + bronze keystone)
- `ArcaMarkMono` — single ink color, no keystone
- `ArcaMarkBronze` — bronze keystone on parchment
- `ArcaMarkInverse` — paper strokes on bronze field
- `ArcaWordmark` — the lockup (mark + "ARCA" in Fraunces, letter-spacing 0.18em)

### Identity tokens (CSS variables — source of truth)

```css
:root {
  /* Surfaces — warm parchment */
  --paper:    #efe9dc;   /* primary surface */
  --paper-2:  #e6dfce;   /* secondary surface, card backs */
  --paper-3:  #d9d0bb;   /* tertiary, dividers-as-fields */
  --vellum:   #f5f0e3;   /* lightest, hover surface */

  /* Ink — deep navy, never pure black */
  --ink:      #1a1f2e;   /* primary text, mark fill */
  --ink-2:    #2a3142;   /* secondary text */
  --ink-3:    #4a5263;   /* tertiary text, muted */
  --ink-soft: #6b7280;   /* metadata, captions */

  /* Single accent — keystone bronze */
  --bronze:        #9a6b3a;   /* the keystone, primary CTAs */
  --bronze-deep:   #7a5128;   /* hover, pressed */
  --bronze-light:  #c89b6e;   /* tints */
  --bronze-wash:   #f0e3d0;   /* backgrounds for active states */

  /* Domain hues — used ONLY as tab spines and sparkline tints */
  --domain-execute: #4a5568;  /* slate */
  --domain-plan:    #5a6b4a;  /* moss */
  --domain-health:  #9a6b3a;  /* bronze (shared with accent) */
  --domain-wealth:  #6b5a4a;  /* umber */
  --domain-wise:    #5a4a5a;  /* aubergine */

  /* Lines */
  --line-1: rgba(26, 31, 46, 0.08);   /* hairline */
  --line-2: rgba(26, 31, 46, 0.14);   /* default rule */
  --line-3: rgba(26, 31, 46, 0.22);   /* strong rule */

  /* Type */
  --font-display: "Fraunces", "Source Serif 4", Georgia, serif;
  --font-body:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* Radii — softer than JIA, harder than consumer-app default */
  --r-1: 4px;
  --r-2: 8px;
  --r-3: 10px;
  --r-4: 14px;
  --r-5: 18px;
  --r-pill: 999px;

  /* Shadows — warm, not gray */
  --shadow-1: 0 1px 2px rgba(26, 31, 46, 0.04);
  --shadow-2: 0 1px 3px rgba(26, 31, 46, 0.06), 0 8px 24px rgba(26, 31, 46, 0.04);
  --shadow-3: 0 4px 12px rgba(26, 31, 46, 0.08), 0 24px 48px rgba(26, 31, 46, 0.06);
}
```

### Type system

| Role | Family | Weight | Size | Tracking | Notes |
|---|---|---|---|---|---|
| Wordmark "ARCA" | Fraunces | 400 | varies (32–96px) | `0.18em` | Optical size 144 if available |
| Display H1 | Fraunces | 500 | clamp(2rem, 4vw, 3.4rem) | `-0.02em` | Hero + landing |
| Section heading | Fraunces | 500 | 1.6rem | `-0.015em` | |
| Card heading | Inter | 600 | 1.05rem | `0` | |
| Body | Inter | 400 | 0.95rem | `0` | line-height 1.55 |
| Eyebrow | Inter | 600 | 0.7rem | `0.12em` uppercase | `--ink-soft` color |
| Numerics (timer, stats) | JetBrains Mono | 500 | varies (1rem–4rem) | `0` | Tabular-nums always |
| Caption | Inter | 400 | 0.78rem | `0` | `--ink-3` color |

**Critical:** Body is **Inter**. Display is **Fraunces** (the warm serif personality). Numerics are **JetBrains Mono** with `font-variant-numeric: tabular-nums` — for timers and stats, never proportional.

### Spacing scale

4px base. `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80`.

### Accent strategy (READ THIS)

Bronze is **the keystone, not the wallpaper.** Use it on:
- The keystone in the mark
- Primary CTAs (filled bronze, paper text)
- Active tab indicator (a 2px bronze line under the active tab)
- A single sparkline accent in any chart (the recovery sparkline)
- "Live" / current-state indicators (a 6px bronze dot)

Do NOT use bronze for:
- Body text emphasis (use ink weight instead)
- Borders generally (use `--line-2`)
- Backgrounds at scale (only `--bronze-wash` on small active-state pills)
- Decoration

The whole identity rests on bronze being earned. If a screen has more than 3 bronze elements, redesign.

### Domain hues

Five product domains, each with a hue used **only as a tab spine** (a 3px vertical bar on the active sidebar item) and a **sparkline tint** in their respective dashboards. Never as fills, never as text colors.

- Execute: slate `#4a5568`
- Plan: moss `#5a6b4a`
- Health: bronze `#9a6b3a` (intentionally shares the accent)
- Wealth: umber `#6b5a4a`
- Wise: aubergine `#5a4a5a`

## Screens / Surfaces

### 1. Icon family (`arca/icons.jsx`)

Five marks: `ArcaMark`, `ArcaMarkMono`, `ArcaMarkBronze`, `ArcaMarkInverse`, `ArcaWordmark`. Plus three rejected directions (`RejectLettermark`, `RejectStrongbox`, `RejectArches`) shown for context — do not ship these.

The wordmark lockup: mark on the left at the same x-height as the cap-height of "ARCA". 12px gap. Fraunces 400, letter-spacing 0.18em, all-caps.

### 2. Identity tokens (`arca/identity.jsx`)

Reference rendering of the token system as design-system cards. Color swatches with hex values, type specimens, the depth ramp, the accent strategy explainer. **This is documentation, not a screen to ship** — but it's the canonical visual reference for "what does each token actually look like."

### 3. iOS Capture (`arca/ios-capture.jsx`)

Three artboards in iOS device frames (390×844, iPhone 14 Pro). Replaces a long-scrolling list view with a calm tile grid.

- **Empty state.** Centered: small mark, "Start the vessel" Fraunces display, body explainer, primary bronze CTA "Begin capture", text link "Restore from backup". Top bar reads "Capture" eyebrow + "Today" heading.
- **Populated.** Top bar with date + ring progress (small). Three groups by domain — "Body composition", "Recovery", "Workouts" — each a section header (Inter 600 0.85rem uppercase, `--ink-soft`) followed by a 2-column grid of tiles. Each tile: paper-2 bg, 14px radius, 16px padding, label (Inter 500 0.85rem) + value (JetBrains Mono 1.4rem) + tiny sparkline or last-entry timestamp.
- **Recovery detail.** Back chevron + "Recovery" title. A single hero tile showing 7-day sparkline (bronze accent line, ink fills below at 12% opacity), then a vertical list of recent entries (timestamp mono + value mono + delta).

iOS chrome: standard tab bar (Capture / Today / Review / More), 49pt. Status bar handled by `IOSDevice` frame component. Content padding accounts for dynamic island (60px top) and home indicator (110px bottom in scrollable areas).

### 4. Desktop Execute (`arca/desktop.jsx`)

Single artboard, 1440×900. The Execute home (deep-work timer + tasks) reskinned in the new identity.

Layout (from left to right):

- **Sidebar** (220px): wordmark at top (24px Fraunces + 32px mark), then five tabs grouped by section.
  - "Operate" group: Execute (active — bronze tab spine), Plan
  - "Life" group: Health, Wealth, Wise
  - Each tab: 12px vertical padding, 16px horizontal, Inter 500 0.95rem; active state has a 3px domain-hued bar on the left edge AND a paper-2 background.
- **Main column** (flex 1): page eyebrow "EXECUTE", Fraunces "Today's session" heading, then a hero card.
  - **Hero timer card** (paper bg, line-2 border, 18px radius, 32px padding): JetBrains Mono `1:23:47` at 4rem 500 weight, ink color, tabular-nums. Below: current task pill (paper-2 bg, 999px radius, current-task name Inter 500 0.95rem, "Strategic" tag in `--ink-3`). Right side: bronze "Pause" button.
  - **Task list** below: section eyebrow "QUEUE", then rows. Each row: 12px padding, hairline divider, checkbox (12px square, 4px radius, 1px ink border) + task title (Inter 500 0.95rem) + small domain pill on the right (paper-2 bg, 8px radius, 10px padding, Inter 500 0.7rem, domain-hue text).
- **Right rail** (300px): "Today" eyebrow + date, then three small stat cards stacked (Sessions / Deep ratio / Closures). Each: paper-2 bg, 14px radius, 20px padding, eyebrow + JetBrains Mono number + delta caption.

### 5. Landing page (`arca/landing.jsx`)

Single artboard, marketing landing. Hero with wordmark lockup at scale, Fraunces tagline ("A vault for the life you're building"), body para in `--ink-2`, two CTAs (bronze primary + ghost secondary). Three-column feature grid below using the icon family. One-page rationale section: "Why a keystone?", "Why parchment?", "Three things to push back on" — that last section is intentional honesty about the design choices.

### 6. Design canvas (`Arca Identity.html` + `design-canvas.jsx`)

The wrapper — a pan/zoom canvas presenting all five sections side-by-side. **Not part of the product.** It's the design-review surface. Discard for production.

## Interactions & Behavior

This pass is **mostly static**. Interactions to recreate:

- Tab switches in the desktop sidebar: 160ms ease, the bronze indicator slides between active items.
- Timer card: the mono digits should tick (use `requestAnimationFrame`, not setInterval; tabular-nums prevents layout shift).
- iOS tile press: 120ms paper-2 → vellum bg fade on press.
- Sparklines: static. Animation is a future pass.

No complex flows in this version. The desktop nav, the iOS tab bar, and the CTAs are the only live elements.

## State Management

- Desktop: active tab (string), timer state (running/paused, elapsed seconds), current task (id).
- iOS: current tab (Capture / Today / Review / More), current detail screen (none / module-id).
- Persistence: timer state should survive reload (localStorage in web; SwiftUI `@AppStorage` on iOS). The original Arca uses an immutable event ledger — preserve that posture for any state that affects history.

## Design Tokens (one-line summary)

| Token | Value |
|---|---|
| `--paper` | `#efe9dc` |
| `--paper-2` | `#e6dfce` |
| `--ink` | `#1a1f2e` |
| `--ink-2` | `#2a3142` |
| `--bronze` | `#9a6b3a` |
| `--bronze-deep` | `#7a5128` |
| Display font | Fraunces 400/500 |
| Body font | Inter 400/500/600 |
| Mono font | JetBrains Mono 400/500 (tabular-nums) |
| Spacing | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80 |
| Radii | 4 / 8 / 10 / 14 / 18 / 999 |

## Family resemblance — note for the developer

This identity is a sibling of the **Julian Waters-Lynch portfolio system** and specifically of **JIA / Stockroom** (paper + ink + earned-signal serif identity). The shared DNA:

- Warm paper surface (cream/parchment), not white
- Dark deep ink, not pure black
- Single earned signal color (Arca: bronze; JIA: oxblood)
- Serif display + Inter body + JetBrains Mono numerics
- Mono eyebrows for the metadata register
- No emoji, no gradients, no glow

The differences are deliberate: Arca is softer (radii 4–18 vs JIA's 0–4), uses a warmer accent (bronze vs oxblood), and uses Fraunces (more personality) vs Source Serif 4 (more austere). This is correct — Arca is a daily companion, JIA is an institutional product.

If you're implementing Arca and JIA in the same monorepo or shared design system, **share the type stack and the spacing scale, but keep the color tokens and radii separate.**

## Assets

- The mark is built in inline SVG in `arca/icons.jsx`. No raster export needed — render as SVG at all sizes.
- For app-icon export (macOS .icns, iOS .icns), rasterize at the required sizes from the SVG. The mark is designed to read at 16px.
- Fraunces, Inter, JetBrains Mono — all from Google Fonts. Self-host for the desktop app; load via system fonts where possible on iOS.
- No photography, no illustration. If imagery is needed in future passes, ask before adding.

## Files

```
design_handoff_arca_identity/
├── README.md                       ← you are here
├── Arca Identity.html              ← entry point — open in browser to view all surfaces
├── design-canvas.jsx               ← canvas runtime (pan/zoom + focus mode); not for production
├── ios-frame.jsx                   ← iOS device frame component; not for production
└── arca/
    ├── app.jsx                     ← composes the canvas with all sections
    ├── icons.jsx                   ← THE MARK — vault-arch A + variants + wordmark
    ├── identity.jsx                ← token reference cards
    ├── ios-capture.jsx             ← iOS Capture mocks (3 artboards)
    ├── desktop.jsx                 ← Desktop Execute home
    └── landing.jsx                 ← Marketing landing
```

## What to push back on (intentional honesty)

Three calls in this pass that should be questioned, not assumed:

1. **Fraunces vs Inter-only.** Fraunces gives Arca personality but adds a font dependency and a slightly idiosyncratic display voice. A single-family Inter system (with weight contrast doing the work) would be more austere and load faster. Worth A/B'ing.
2. **Keystone bronze warmth.** Bronze is warm and metaphorically right (the keystone), but it edges toward "rustic" if mishandled. If you find yourself adding more brown notes to compensate, you've gone too warm — pull back to a cooler bronze (`#8a5e2e`) or substitute a deep ochre.
3. **Domain pills on tasks.** Tagging every task with its life-domain pill is information-dense and might be visual noise. Consider showing the pill only when filtering across domains; default the home view to no pills.

These are flagged because the right answer depends on usage data we don't have yet.

## Implementation order (suggested)

1. Lock the tokens (the CSS variables block at the top of this README) into the codebase as the design-system foundation.
2. Build the mark as an SVG component. Verify it reads at 16px on the macOS dock and the iOS home screen.
3. Build the wordmark lockup. This is the single highest-leverage element of the identity.
4. Apply the tokens to the existing Execute screen first (highest-traffic surface in Arca). Validate before propagating to Plan / Health / Wealth / Wise.
5. iOS Capture is greenfield — start it after the desktop reskin is shipped, so the iOS mocks here can be revised against learnings.
