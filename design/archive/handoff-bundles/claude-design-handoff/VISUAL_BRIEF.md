# Arca — Visual Design Brief for Claude Design

**Date:** 2026-04-29
**Audience:** Claude Design (claude.ai/design)
**Status:** Handoff brief

## Read this first

This brief asks you to do three things, in priority order:

1. Redesign the Arca app icon family (desktop, mobile, monochrome).
2. Propose the visual identity that lives behind the icon (color, type, depth, accent).
3. Ideate layout improvements for the Arca surfaces (desktop home, iOS Capture home).

You should also feel free to argue back. If you think the four-domain framing is wrong, say so. If you think a direction in the prior icon work earns its place, say so. We trust your judgment on form. We're holding the product strategy.

## TL;DR positioning

**Arca is a local-first personal OS, not a productivity app.**

It started as a deep-work execution tool (tasks + Pomodoro + weekly review) and is mid-evolution into a four-domain life operating system:

- **Execute / Plan** — the productivity spine. Tasks, focus, time, weekly review.
- **Health** — exercise, nutrition, sleep, vitals, energy. Has an iOS companion (ArcaCapture) for screenshot-based capture from Arboleaf scales and Morpheus.
- **Wealth** — net worth, cash flow, portfolio, super, property, crypto.
- **Wise** — meditation, reading, languages, philosophy, relationships, creativity.

The vision is iOS-as-personal-OS: one user, deeply theirs, calm to use, fast to capture, slow to reflect. Closer to a *trusted vault* than to a *productivity dashboard*.

## Why "Arca"

Latin: *ark / chest*. The word means a vessel that holds something precious — a strongbox. The name was chosen through three rounds of availability vetting (see `01-product-context/PRODUCT_NAMING_OPTIONS_v3.md`), surviving when most candidates were taken in the productivity-software space.

Intended tone (from the naming doc's "tone map"): **a warm, integrated life system**. Not corporate. Not gamified. Not flashy.

The name carries weight. The icon should earn it.

## Vibe references

### Primary: Things by Cultured Code

https://culturedcode.com/things/

What we want from Things — the *tonal* DNA, not the visual rip:

- Calm, generous whitespace
- Restrained color, single confident accent
- Type discipline (humanist, light, considered)
- A logo that feels weighted despite minimal line work
- A product that respects the user's attention

What we explicitly do NOT want:

- The exact red-bullseye logo (it's iconic — leave it alone)
- A green-tinted Things copy
- The to-do-app interaction model (Arca is more than tasks)

### Secondary references (for the "more depth" dimension)

Things is famously flat. We want depth without busy. Look at:

- Recent iOS depth language (subtle dimensionality, restrained material)
- Linear (precision, restraint, dark elegance)
- Bear (warm, inviting, content-respecting)
- iA Writer (radical simplicity, content-first)

## Prior work in this repo

**Important**: prior icon work exists at `arca/design/icon-concepts/` (or `02-prior-icon-work/` in the bundle) and **never shipped**. Review it and decide whether to build on it or argue for a clean reset. Either is fine. We want the strongest answer, not the most polite one.

| File | Concept |
|------|---------|
| `concept-1-lettermark.svg` | Geometric A monogram. Dark navy bg, cream stroke, gold accent at apex. |
| `concept-2-strongbox.svg` | Stylized chest with keyhole. References the Latin etymology directly. |
| `concept-3-abstract-arch.svg` | Nested arches with **four dots = four domains**. |
| `arca-icon-final.svg` | Refined lettermark, marked "final" but never deployed. |
| `compare.html` | Side-by-side comparison page. Open this first. |

The shared palette tokens across all four concepts:

- Background: `#1a1a2e` → `#16213e` (deep navy gradient)
- Stroke / foreground: `#e8e0d4` (warm cream / parchment)
- Accent: `#c9956b` (bronze / gold)

This palette is much more Things-tonally-adjacent than what the production app actually uses today — see next section.

## Current production state (what's actually shipped)

There is a real disconnect between the icon-concepts folder and the running app. They went in different directions.

**Live desktop app** (`arca/src/index.html` — single-page Tauri shell, all CSS in the head):

- Background: `#f4f7f6` (cool gray-green)
- Surface: `#fff`
- Accent: `#1a8f55` (bright productivity green)
- Type: Inter, weights 400–800
- Subtle shadows, 12px / 8px radii
- Reads as a generic clean productivity web app

**Live app icon**: green-A on dark green. Used everywhere in `arca/src-tauri/icons/` and the landing page.

**iOS Capture companion** (`arca-ios-capture/ArcaCapture/`):

- **No app icon at all** — `AppIcon.appiconset/Contents.json` declares 13 image slots and contains zero PNGs
- Two-tab structure: History (long scrolling chart list) and Capture (screenshot import)
- Native SwiftUI

So when Julian says "I'm not perfectly sold on the current icon," he means the **green-A in production**. When he says "Things-vibe with depth," he means the navy/cream/bronze direction in the icon-concepts folder *was* closer to the right tonal place than what's actually shipped — but it's still unrefined and unvalidated against the live product.

## What we want you to design

### Priority 1: The app icon family

- macOS: 16, 32, 128, 256, 512px (+ @2x), assembled into `.icns`
- iOS: full AppIcon set, 1024 master
- iOS monochrome / tinted variants (iOS 18+ — **mandatory**, not optional)
- In-app glyph (used in headers / top-bar)
- Wordmark (icon + name lockup for the landing page)

Decide whether the icon is:

- A lettermark (refined "A"), or
- An object (the strongbox / vault / arc), or
- An abstract mark (the four-domain symbol), or
- A synthesis we haven't named yet

Make the call and tell us why.

### Priority 2: The visual identity

Deliver a small but real *system*, not a pile of mockups:

- Color tokens — `bg`, `surface`, `line`, `text`, `text2`, `accent`, accent variants, `danger`, `warn`, `deep`, `shallow`. Output as CSS custom properties **and** a Swift `Color` extension.
- Typography — heading, body, mono, numerical/tabular. Weight ramp.
- Accent strategy — where the accent shows up; what's restrained.
- Depth / material language — shadow, border, gradient rules.
- Iconography style for in-app system icons (tab bars, capture sources, module tiles).

### Priority 3: Layout ideation

Two surfaces. Show us how the design language renders.

**Surface A — iOS Capture home tile grid.**
- Currently: long scrolling `List` of stacked charts (Weight, Body Fat, Muscle Mass, Recovery, HRV, Sleep, Workout Impact). Feels like a CRM dashboard.
- Source of pain: `arca-ios-capture/ArcaCapture/Views/HistoryView.swift`
- Target: tile / card grid where each module is a calm card with a sparkline + latest value, tap to expand into a full chart + entry list view.
- Modules grouped into:
  - Body composition (Weight, Body Fat, Muscle, …)
  - Recovery (Recovery, HRV, Sleep, Workout Impact)
  - Workouts (planned: whiteboard photo capture, manual fallback)
  - (Future) Voice → Tasks

**Surface B — Desktop Execute home.**
- Currently: hero timer panel + today's tasks panel + weekly review widgets in a fixed grid. See `arca/src/index.html`.
- Target: same functional density but in the new identity. Optionally explore how the four-domain navigation (Execute/Plan + Health/Wealth/Wise) appears at the desktop level — tabs? sidebar? something else?

### Stretch (optional)

- First-launch / empty-state moments for the iOS Capture app
- Empty states across both apps (currently generic)
- Landing page direction (`arca-landing/index.html`)

## Constraints

- Icon must read at 16px through 1024px without losing identity
- Must work on dark and light backgrounds
- iOS monochrome-tinted mode compliance is mandatory
- macOS Tahoe-style depth allowed but not required
- Single confident accent preferred over rainbow palettes
- Don't drift from the Latin etymology (ark / chest / vault) **unless you have a strong reason and you state it**

## What we don't want

- Five competing concepts with no recommendation
- Pure Figma mockups with no source files (give us SVG, CSS tokens, asset exports)
- A Things knockoff in green
- A skeuomorphic chest with rivets and wood grain
- Rainbow color systems (tasks=blue, health=red, wealth=green …)
- Animation-heavy mockups that won't survive contact with shipping
- A "hero illustration" everywhere — the icon and identity should do the work

## Audit questions you should challenge

Before delivering, ask yourself:

- Is the four-domain framing represented somehow (icon, color, structural pattern), or is it only in the IA doc?
- Does the icon scale to 16px without losing identity?
- Does the visual identity work for both a productivity app *and* a health/wealth dashboard?
- Is "vault" too literal as a metaphor? Would something more abstract serve the same emotional weight?
- Does the navy/cream/bronze palette in the prior icon concepts earn its place, or is there a stronger direction?
- Will Julian be able to live with this for years, or does it have a short trend half-life?

## Source material

Wire your GitHub access to read these repos as primary source:

- `arca` — Tauri desktop app: productivity spine, current visual system, icon folder, design docs
- `arca-ios-capture` — iOS health capture companion
- `arca-landing` — landing page

Key files to anchor on:

- `arca/CHATGPT_PRODUCT_CONTEXT_v0.1.0-beta.2.md` — product context
- `arca/design/HEALTHY_WEALTHY_WISE_IA.md` — four-domain IA
- `arca/design/PRODUCT_NAMING_OPTIONS_v3.md` — name etymology + vetting
- `arca/design/icon-concepts/` — prior icon work (incl. `compare.html`)
- `arca/src/index.html` — current desktop visual system
- `arca/src-tauri/icons/` — current production icons
- `arca-ios-capture/ArcaCapture/Views/HistoryView.swift` — the long-scroll-chart problem to solve
- `arca-ios-capture/design/PHASE_A_BRIEF.md` — mobile capture context

> **If you received this as a zip bundle**: a curated snapshot is in `01-product-context/`, `02-prior-icon-work/`, `03-current-production-icons/`, `04-current-surfaces/`, and `05-future-modules/`. The bundle is offline-readable; prefer GitHub for the live source if available.

## Deliverables we want back

1. **Icon recommendation + reasoning** — which direction, why, what you considered and rejected.
2. **Icon source files** — SVG masters + sized exports (macOS `.icns` ingredients, iOS AppIcon set, monochrome variants).
3. **Color + type token files** — CSS custom properties + Swift `Color` extension. Tokens, not hex codes scattered through screenshots.
4. **2–3 layout mockups** for the iOS Capture home tile grid (with empty state, populated state, expanded module).
5. **1–2 layout mockups** for the desktop Execute home in the new identity.
6. **A short rationale doc** (one page) — the "why" behind each major decision.

Ship in a way Julian can drop into the codebase. SVGs and CSS tokens are both code; PNGs and Figma frames are screenshots.

## What success looks like

When Julian opens the app one day and his immediate response is *"yes, that's what Arca was supposed to feel like."* Not "wow, what a logo." Not "what a beautiful color system." Just **recognition** — that this finally looks like the thing he's been building.
