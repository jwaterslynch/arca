# Arca Mobile Companion PRD (v1)

Date: 2026-03-03  
Status: Ready for implementation planning  
Owner: Product + Engineering

## 1) Product Thesis
Arca mobile is not a desktop clone. It is a companion that optimizes the highest-value loop:

`brain dump -> AI structures -> user approves -> board updates -> execute`

Desktop remains the full control surface for deep planning and full board management.

## 2) Goals
1. Make AI-first task capture the default mobile experience.
2. Keep mobile and desktop boards synced near-real-time.
3. Support fast execution on phone with a strong current-task + timer flow.
4. Reduce mobile complexity by hiding advanced controls.
5. Make account creation and primary onboarding desktop-first, with mobile linked as a companion.

## 3) Non-Goals (v1)
1. Full feature parity with desktop focus/review forms.
2. Complex weekly review authoring on phone.
3. Full Kanban parity with all desktop controls.
4. Autonomous AI writes without user approval.

## 4) Core User Stories
1. As a user, I can choose my preferred LLM provider and talk naturally to add/edit/delete tasks.
2. As a user, I can review AI-proposed board changes and apply them once without duplicates.
3. As a user, mobile changes appear on desktop quickly via shared cloud sync.
4. As a user, I can see my current task and run a prominent timer while executing.
5. As a user, I can triage tasks across `Backlog`, `Next Up`, and `Today` with low friction.
6. As a user, I can link my phone to my desktop account via QR and immediately access my existing board.

## 5) Mobile Information Architecture
Use a simple 3-tab layout plus hidden settings:

1. `Capture` (default tab)
2. `Board`
3. `Timer`
4. `Settings` (icon/sheet, not a full primary tab)

Desktop is the default place for:
1. account sign-up/login
2. full onboarding and education
3. companion device linking

## 6) Screen Specs

## 6.1 Capture (Default)
Purpose: fast brain dump and AI-assisted structuring.

Elements:
1. Active provider chip (tap to switch provider).
2. Chat stream optimized for short turn-taking.
3. Large input area with dictation-friendly UX.
4. `Send to board` action (not `Ask AI`).
5. Proposed changes list directly under latest AI response.
6. Primary button: `Apply Changes`.
7. Secondary button: `Undo Last AI Batch` (time-limited).

Rules:
1. No silent writes.
2. `Apply Changes` disables after apply until next model response.
3. Show toast: `Changes applied`.

## 6.2 Board (Snapshot/Triage)
Purpose: quick inspection and light triage.

Elements:
1. Lanes: `Today`, `Next Up`, `Backlog`.
2. Compact cards with category, depth, goal badges.
3. Quick actions: `Move`, `Done`, `Delete`.
4. Optional reorder handle for lane ordering.

Rules:
1. Enforce `Today` cap = 5 open tasks.
2. Keep interactions tap-first (drag/drop optional enhancement).

## 6.3 Timer (Execution)
Purpose: reduce friction for deep-work execution.

Elements:
1. Current task title at top.
2. Start/Pause/Stop controls with large touch targets.
3. Running state enters focus mode with enlarged timer.
4. Quick complete/defer current task actions.

Rules:
1. If no current task selected, prompt from `Today`.
2. Keep timer visible and dominant while running.

## 6.4 Settings (Hidden/Minimal)
Purpose: one-time setup, then mostly out of sight.

Elements:
1. AI enabled toggle.
2. Provider selector.
3. Provider-specific API key (stored in keychain).
4. Optional advanced model/base-url override (collapsed by default).
5. Connection test.

Rules:
1. API keys never stored in cloud board data.
2. Show masked key state per provider.

## 6.5 Mobile Onboarding
Purpose: quick activation, not full education.

Steps:
1. Welcome (1 short screen).
2. AI setup optional (`Connect now` or `Set up later`).
3. First brain dump (3-5 tasks/practices prompt).
4. AI proposed changes preview.
5. Apply and land in `Board` or `Capture`.

Constraints:
1. One screen at a time, no overlapping/stacked content.
2. Max about 120 words per step.
3. No split panes on mobile.

## 7) AI and Provider Contract
Source of truth: `design/AI_ASSISTANT_CONTRACT_v1.md`.

Mobile requirements:
1. Same system prompt and action schema as desktop.
2. Same validation and dry-run rules before apply.
3. Provider options:
   - OpenAI
   - Anthropic
   - Google Gemini
   - xAI Grok
   - DeepSeek
   - OpenAI-compatible
4. Per-provider key storage in device keychain.

## 8) Cloud Sync Contract
Source of truth: `design/MOBILE_CLOUD_PHASE1_PLAN.md` and `design/SUPABASE_SCHEMA_v1.sql`.

Mobile requirements:
1. Shared board state with desktop.
2. Snapshot + event log sync model.
3. Near-real-time updates through Supabase realtime.
4. Idempotency key on every AI apply batch (`client_event_id`).
5. Conflict policy v1: last-write-wins + replay unsynced local events.

## 8.1 Companion Linking Contract (Desktop -> Mobile)
Primary pattern: desktop-first onboarding with QR linking.

Flow:
1. Desktop user signs in (or creates account) and completes setup.
2. Desktop shows `Link Mobile Companion` button in settings/onboarding completion.
3. Desktop generates one-time link token (short TTL, e.g., 5-10 minutes) and renders QR.
4. Mobile app opens to `Scan QR or Enter Code`.
5. Mobile exchanges token for authenticated session + board binding.
6. Mobile lands in `Capture` tab with synced board loaded.

Security rules:
1. One-time token, single use.
2. Token expires quickly.
3. Token scoped to account + board id only.
4. Revoke all pending link tokens from desktop settings.

## 9) Functional Requirements
1. AI capture is reachable in one tap at app open.
2. User can switch provider without exposing raw API key values.
3. AI responses can create, move, update, complete, and delete tasks (with explicit confirmation).
4. Duplicate apply prevention in UI and sync layer.
5. Current-task execution with timer state persistence.
6. Board triage supports move, done, delete in <=2 taps after selecting a card.
7. Desktop can generate QR link tokens for mobile companion pairing.
8. Mobile can link account by QR scan or manual code fallback.

## 10) UX Requirements
1. Touch targets >= 44px.
2. No horizontal clipping at iPhone widths.
3. Avoid dense form inputs in primary flows.
4. Settings hidden by default.
5. Clear confirmation feedback after apply and delete.

## 11) Technical Checklist

## M0: Mobile Usability Stabilization
1. Fix onboarding overflow/clipping at iPhone widths.
2. Default to `Capture` tab on mobile.
3. Ensure AI panel is visible on mobile build.
4. Replace `Ask AI` wording with conversational action copy.
5. Add apply-success and delete-success toasts.

## M1: Companion MVP
1. Implement mobile IA (`Capture`, `Board`, `Timer`).
2. Add provider chip switcher in Capture.
3. Implement anti-duplicate apply lock + idempotency key wiring.
4. Add compact board triage controls.
5. Add full-screen timer execution mode.

## M2: Cross-Device Sync Hardening
1. Turn on shared cloud sync in production mode.
2. Add offline queue and reconnect retry.
3. Add conflict resolution logging and user-safe fallbacks.
4. Add sync status indicator and diagnostics panel.

## 12) Acceptance Criteria (v1)
1. User can dictate a brain dump, apply AI changes once, and see those tasks on desktop within 5 seconds median.
2. No duplicate task creation from repeated taps on apply.
3. Mobile onboarding renders correctly on iPhone without clipped content.
4. User can complete at least one full loop on phone:
   - capture -> apply -> move task -> start timer -> mark done.
5. API keys remain local to device keychain and are not present in synced board payloads.
6. User can pair mobile from desktop in under 60 seconds using QR.

## 13) Metrics
1. Time to first AI capture (install -> first applied batch).
2. Apply conversion rate (`proposed -> applied`).
3. Duplicate apply incident rate.
4. Daily mobile capture sessions per active desktop user.
5. Sync lag mobile->desktop and desktop->mobile.

## 14) Risks and Mitigations
1. Risk: mobile UI becomes desktop clone and too complex.
   - Mitigation: enforce 3-tab IA and out-of-scope list.
2. Risk: duplicate writes from flaky connectivity.
   - Mitigation: idempotency keys + apply button lock.
3. Risk: provider setup confusion.
   - Mitigation: per-provider masked key state + one-tap test.
4. Risk: trust in AI suggestions drops.
   - Mitigation: strict review-before-apply and transparent action list.

## 15) Decision Log
1. Mobile is AI-first companion, not parity app.
2. Desktop remains primary planning surface.
3. Same AI action contract and board rules across platforms.
4. Cloud sync is required for companion value, not optional long term.
5. Desktop is the default onboarding surface; mobile is linked as companion via QR/code.
