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

Anatomy (see `arca/icons.jsx` → `ArcaMark` — that file is the source of truth; values below are derived from a 1024-grid then scaled by `size`):

- Outer canvas: square, corner radius `size * 0.225`, filled with a navy gradient (`#1a2740` → `#0f1822` → `#0a1018`).
- Two converging strokes from a wide base to a near-apex (`leftX = G(298), rightX = G(726), baseY = G(740), apexY = G(290)`), with a small inboard `apexGap = G(28)` so the keystone reads as separate. Stroke `url(#stroke-…)` (parchment gradient `#f4ead6` → `#d8c9ad`), `stroke-width = size * 0.062`, round caps.
- Crossbar: horizontal at `crossY = G(580)`, from `crossLX = G(412)` to `crossRX = G(612)`, same stroke spec.
- Keystone: a **circle** with a radial bronze gradient (`#e3b685` → `#b07a3e` → `#8a5a2a`), centered at the apex, radius `G(34)`. (NOT a rectangle — earlier sketches said rectangle; the implemented mark is circular.)
- Optional base line and four domain dots at the base — toggled via `domainDots` and `baseLine` props.
- Optional inner shadow on the navy field for depth (`innerShadow` prop).

Variants shipped in `icons.jsx`:
- `ArcaMark` — full color (ink + bronze keystone)
- `ArcaMarkMono` — single ink color, no keystone
- `ArcaMarkBronze` — bronze keystone on parchment
- `ArcaMarkInverse` — paper strokes on bronze field
- `ArcaWordmark` — the lockup (mark + "ARCA" in Fraunces, letter-spacing 0.18em)

### Identity tokens (CSS variables — source of truth)

```css
/* CANONICAL — these are the values in Arca Identity.html. Match exactly. */
:root {
  /* Ink & paper */
  --ink:        #0f1822;   /* deep navy near-black — primary text, mark bg */
  --ink-2:      #1a2532;   /* secondary ink */
  --paper:      #f4efe6;   /* warm parchment — page background */
  --paper-2:    #ebe4d6;   /* deeper parchment — card backs, tile fills */
  --surface:    #fdfbf6;   /* card surface, lightest */
  --surface-2:  #f7f1e5;   /* hover/active surface */

  /* Lines */
  --line:       rgba(15,24,34,0.10);  /* default rule */
  --line-2:     rgba(15,24,34,0.06);  /* hairline */

  /* Text */
  --text:       #1a2532;
  --text-2:     #5b6573;
  --text-3:     #8a8d92;

  /* Accent — bronze keystone */
  --accent:        #b07a3e;   /* the keystone, primary CTAs */
  --accent-2:      #c9956b;   /* lighter bronze, hover-glow */
  --accent-deep:   #8a5a2a;   /* pressed */
  --accent-soft:   rgba(176,122,62,0.12);  /* active-state pill backs */
  --accent-glow:   rgba(176,122,62,0.22);

  /* Domain hues — four, not five. ONLY as tab spines and sparkline tints. */
  --d-execute: #2f4a5c;   /* slate teal */
  --d-health:  #5a6b3a;   /* moss */
  --d-wealth:  #8a5a2a;   /* deep bronze (shares accent family) */
  --d-wise:    #4a3a5c;   /* aubergine */
  /* Note: no --d-plan token. Plan inherits Execute's slate (they're the
     "Operate" group); if you need a distinct hue for Plan in future,
     add it here and document the choice. */

  /* Semantic */
  --danger:    #a94032;
  --warn:      #b07a3e;
  --ok:        #4a6b3a;

  /* Radii */
  --radius-sm: 8px;
  --radius:    12px;
  --radius-lg: 16px;
  --radius-xl: 22px;

  /* Depth — warm, ink-tinted, not gray */
  --shadow-sm:    0 1px 2px rgba(15,24,34,0.05), 0 1px 1px rgba(15,24,34,0.04);
  --shadow-md:    0 1px 3px rgba(15,24,34,0.06), 0 8px 24px rgba(15,24,34,0.06);
  --shadow-lg:    0 2px 6px rgba(15,24,34,0.08), 0 24px 60px rgba(15,24,34,0.10);
  --shadow-icon:  0 8px 22px rgba(15,24,34,0.18), 0 1px 0 rgba(255,255,255,0.06) inset;
  --shadow-accent: 0 8px 22px rgba(176,122,62,0.24);
}

/* Type stack (declared globally on body) */
font-family: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
/* .display */ font-family: "Fraunces", Georgia, serif; font-weight: 500; letter-spacing: -0.02em;
/* .mono */    font-family: "JetBrains Mono", ui-monospace, monospace;
/* .num */     font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "ss01" 1;
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
| `--paper` | `#f4efe6` |
| `--paper-2` | `#ebe4d6` |
| `--surface` | `#fdfbf6` |
| `--ink` | `#0f1822` |
| `--ink-2` | `#1a2532` |
| `--accent` (bronze) | `#b07a3e` |
| `--accent-deep` | `#8a5a2a` |
| `--accent-2` | `#c9956b` |
| `--d-execute` (slate) | `#2f4a5c` |
| `--d-health` (moss) | `#5a6b3a` |
| `--d-wealth` (umber) | `#8a5a2a` |
| `--d-wise` (aubergine) | `#4a3a5c` |
| Display font | Fraunces 400/500 (opsz 9..144) |
| Body font | Inter 400/500/600/700/800 |
| Mono font | JetBrains Mono 400/500 (tabular-nums) |
| Radii | 8 / 12 / 16 / 22 |

## Family resemblance — answered explicitly

**Yes, this shares DNA with JIA / Stockroom and the broader JWL portfolio system. Intentionally — but only at the system layer.**

What's shared (and *should* be):
- Warm paper surface (cream/parchment), not white
- Dark deep ink, not pure black
- Single earned signal color
- Inter body + JetBrains Mono numerics + serif display
- Mono eyebrows for the metadata register
- No emoji, no gradients beyond ambient warmth, no glow
- Sentence case, British/AU spelling, factual micro-copy

What's distinctively Arca's (and JIA cannot have):
- **Bronze keystone** vs JIA's oxblood. Bronze is warmth/holding/precious-thing. Oxblood is risk/decision/judgment. Bronze is wrong for a journal; oxblood is wrong for a vessel.
- **Fraunces** vs JIA's Source Serif 4. Arca is your daily companion — personality is allowed. JIA is institutional — austerity is required.
- **Softer geometry.** Arca radii 8–22; JIA radii 0–4. Journals are sharp; vessels are smoothed by use.
- **A vault-arch icon mark.** JIA shouldn't have one (its wordmark is its identity). Arca needs one (it lives on a dock and a home screen).

The rule: a stranger should see both products and think *"same maker"* — not *"same product."* Share the system; diverge the identity.

If you're implementing both in the same monorepo, **share the type stack and spacing scale; keep color tokens, radii, and the icon mark separate.**

---


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
