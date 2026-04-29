# Arca iOS Health Capture: Phase A Brief

**Date:** 2026-04-20  
**Status:** Draft brief for audit before implementation  
**Track:** B — native iPhone health capture

## Goal

Build a native iOS prototype that can import an **Arboleaf scale screenshot**, extract structured health data locally, present it for manual review, save it locally, and show a simple historical trend.

This is a **capture prototype**, not a sync product.

## Scope

Phase A includes only:

- a **native iOS app** built with Swift / SwiftUI
- **one capture flow only**: Arboleaf screenshot import
- local OCR / first-pass parsing
- manual review before save
- local persistence only
- simple history list + weight trend view

## Out of Scope

Do **not** include any of the following in Phase A:

- Supabase auth
- cloud sync
- write-back into the desktop app
- PWA/browser companion work
- Execute / Plan task sync
- Morpheus parsing
- voice task capture
- WOD whiteboard photo parsing
- HealthKit integration
- App Store submission
- multi-user support
- cloud-based OCR
- mandatory AI/LLM parsing in the first implementation pass

## Product Shape

This prototype answers one narrow question:

**Can Arca on iPhone reliably turn a real Arboleaf screenshot into a saved structured entry with low friction and acceptable accuracy?**

If the answer is no, do not expand the surface area.

## Technical Direction

### Platform

- Swift
- SwiftUI
- native iOS app
- local-first architecture
- iOS 17+ target

### Storage

Use **SwiftData** for local persistence.

The local record should include:

- `id`
- `captured_at`
- `measurement_date`
- `source_type` = `arboleaf_screenshot`
- `original_image_path`
- `weight_kg` (required to save)
- `source_weight_value`
- `source_weight_unit`
- optional parsed metrics if available
- `raw_ocr_text`
- `parse_confidence`
- `needs_review`

### Parsing

Start with **Apple Vision** OCR plus deterministic parsing logic for the first implementation pass.

Do not start with cloud OCR.

Reason:

- keeps the prototype local
- removes credential and latency complexity
- makes parsing failures easier to debug
- gives the cheapest first signal on whether the capture loop is viable at all

Important constraint:

- the real technical risk is not OCR itself, but correctly associating each extracted value with the right label in a dense multi-metric layout
- do not brute-force this indefinitely with expanding regex rules if the fixture set shows the layout is too brittle
- if label/value association proves unreliable, stop and explicitly switch the parser plan to a vision-capable LLM fallback in the next phase rather than pretending deterministic parsing is holding

Before parser implementation starts:

- collect **3-5 real Arboleaf screenshots** as a fixture set
- use that fixture set as the first parser benchmark
- evaluate not only text extraction, but correct field-to-label mapping and correction burden on the review screen

### Save Model

Saving requires:

- a valid measurement date
- a valid `weight_kg`

Other fields may be missing and can still be saved if clearly marked optional.

Unit rule:

- parse whatever unit is shown in the screenshot
- store `weight_kg` as the canonical persisted value
- also keep the original parsed number and unit for debugging
- display can later respect a user-preferred unit, but storage stays canonical

## Screens

### 1. History

Shows:

- recent saved Arboleaf entries
- date
- weight
- key secondary metrics if available

Also include a simple weight trend chart.

This screen is the proof that capture creates useful retained data, not just one-off extraction.

### 2. Capture / Review

Flow:

1. User imports a screenshot from Photos or Files.
2. App runs local OCR and deterministic parsing.
3. App opens a review screen with parsed values populated.
4. User corrects any wrong fields.
5. User taps Save.
6. Entry appears in History immediately.

Editable fields on the review screen:

- measurement date
- weight
- parsed secondary metrics

Non-editable but visible debug context:

- source screenshot preview
- raw OCR text
- parse confidence or parse warning state

## UX Standard

Good enough, not over-designed.

Requirements:

- clear
- fast
- low-friction
- easy to correct parse mistakes

Do not chase polish before the pipeline works.

## Phase A Acceptance Criteria

Phase A is complete only when all of these are true:

1. The app runs on a real iPhone build from Xcode.
2. A user can import an Arboleaf screenshot from the photo library.
3. OCR runs locally and populates a review form.
4. The user can correct values before saving.
5. Saving creates a persistent local entry.
6. The saved entry appears in a history list after app relaunch.
7. A simple weight trend view renders from saved entries.
8. The flow works without login, network, or cloud services.
9. The parser is tested against a small real screenshot fixture set before expansion work starts.

## Failure Conditions

Do not proceed to Morpheus or any sync wiring if:

- OCR fails on most real screenshots
- parsing is too brittle to trust
- the review screen is too cumbersome to use daily
- saved entries do not persist reliably

If Phase A fails, tighten the Arboleaf pipeline before broadening scope.

## Suggested Repo / Workspace Shape

Build this in a **separate native iOS repo**, not inside the current Tauri desktop codebase.

Reason:

- Xcode project structure is different
- local iOS capture is a separate product surface
- avoids mixing native iOS setup with the desktop app repo before the pattern is proved

## Branch Recommendation

Recommended repo:

- `jwaterslynch/arca-ios-capture`

Branch shape:

- `main` holds the clean scaffold
- first implementation branch: `feat/arboleaf-phase-a`
- do not mix this repo with desktop sync or Tauri work

## Risks

- Vision OCR may extract inconsistent text depending on screenshot crop quality
- Arboleaf UI variants may differ across devices or app versions
- label/value association may be the real failure point even when OCR text looks good
- users may import partial crops instead of full screenshots, which can break positional assumptions
- unit variance (`kg` vs `lb`) can create silent data-quality bugs if normalization is sloppy
- `measurement_date` can drift if timezone handling is unclear or inferred incorrectly
- SwiftData implies an iOS 17+ floor and may force toolchain/device constraints
- first-time Xcode signing, provisioning, and device deployment may slow iteration materially
- this environment can write the Swift code, but cannot run Xcode, simulator, or TestFlight loops directly
- overbuilding the app shell before the parsing path is real
- accidentally reintroducing sync/auth scope creep

## Non-Negotiable Constraint

This prototype must remain **local-first and sync-free** in Phase A.

That is deliberate, not temporary negligence.

Track A companion sync remains a real product gap, but it is explicitly deferred while this capture pattern is proved.

## What The Auditor Should Challenge

Before implementation starts, the reviewing AI should specifically check:

- whether Vision-first parsing is the right first bet for the available fixture set
- whether the fallback point to an LLM parser is named clearly enough
- whether SwiftData is the simplest persistence choice
- whether the proposed data model is minimal enough
- whether any hidden sync/auth assumptions have crept back in
- whether the acceptance criteria are concrete enough to stop scope drift
