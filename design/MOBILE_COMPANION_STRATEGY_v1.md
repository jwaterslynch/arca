# PPP Flow Mobile Companion Strategy (v1)

Date: 2026-03-03  
Owner: Product/Engineering

## 1) Goal
Define the mobile app as a fast capture and triage companion to the desktop whiteboard, with AI as the primary interaction model.

## 2) Product Positioning
- Desktop is the control surface: planning, board management, review, deeper edits.
- Mobile is the capture surface: brain-dump, quick triage, quick commit, quick check.
- Do not pursue full feature parity on phone in v1.

## 3) Primary Mobile Jobs To Be Done
1. Capture ideas/tasks instantly (typed or voice dictation).
2. Convert free-form brain dumps into structured board actions via AI.
3. Review and apply AI-proposed changes in one tap.
4. Do quick status checks (Today list, next focus, recent completions).

## 4) Current Problems Observed
- Onboarding is not phone-safe (content clipping/overflow, too much text on one screen).
- AI workspace is not obvious or reachable quickly on phone.
- Form-heavy controls are too fiddly for mobile use.

## 5) Mobile UX Strategy
### A) Default Screen = AI Capture
- Landing screen should open directly to a large input field + mic/dictation-friendly prompt.
- Replace "Ask AI" wording with conversational copy (e.g., "Send to board").
- Always show "Proposed Changes" immediately below chat responses.
- One clear primary action: `Apply Changes`.

### B) Secondary Screen = Board Snapshot
- Show only high-value lanes: `Today`, `Next Up`, `Backlog (count only or compact)`.
- Provide quick actions only (mark done, move lane, delete).
- Avoid dense editing controls on phone.

### C) Settings as Tertiary
- Keep AI provider/API settings hidden behind a settings icon.
- On phone, default to one active provider at a time.
- Advanced settings remain collapsed by default.

## 6) Onboarding Strategy For Mobile
### Direction
- Keep onboarding short and single-purpose: "connect AI + add first tasks".
- Use true full-screen slides (one step per screen, no stacked content bleed).

### Proposed Mobile Onboarding Steps
1. Welcome (what app does in one paragraph).
2. AI assist optional (connect now vs set up later).
3. Brain dump prompt (user enters 3-5 tasks/practices).
4. AI proposes structured tasks.
5. User approves and lands on board snapshot.

### Explicit Mobile Rules
- Max ~120 words per screen.
- One CTA per screen.
- No nested forms during onboarding.
- No split-pane layouts on mobile.

## 7) AI-First Interaction Contract (Mobile)
User input -> AI response with structured actions -> user review -> apply -> toast confirmation.

Required guardrails:
- No silent writes.
- Show exact actions before apply.
- Support undo-last-AI-batch.
- Prevent duplicate apply (disable button after apply until next response).

## 8) Scope Boundaries (v1 Mobile Companion)
In scope:
- AI capture/chat
- Proposed changes + apply/undo
- Compact Today/Next Up view
- Minimal task editing and delete

Out of scope:
- Full desktop funnel editing experience
- Full weekly review authoring
- Full focus-form editing parity

## 9) Sync and Data Assumption
Short term:
- Mobile can run local-first for testing.

Target:
- Shared cloud sync (Supabase plan already drafted) so phone capture appears on desktop quickly.
- Conflict policy v1: last-write-wins + event log.

## 10) Phased Delivery
### Phase M0 (Immediate polish)
- Fix mobile onboarding layout and overflow.
- Make AI tab visible and default on phone.
- Simplify CTA labels and add apply confirmation state.

### Phase M1 (Companion MVP)
- AI capture-first home.
- Compact board snapshot tab.
- Stable apply/undo flow with anti-duplicate protection.

### Phase M2 (Cross-device loop)
- Enable cloud sync (phone <-> desktop).
- Add offline queue + reconnect behavior.

## 11) Success Metrics
- Time to first capture < 15 seconds.
- % sessions using AI capture flow.
- % proposed action batches applied.
- Duplicate-apply incidents per 100 sessions.
- D1 mobile retention for active desktop users.

## 12) Open Questions
1. Should mobile open directly to AI chat every launch, or remember last tab?
2. Should onboarding force AI setup first, or keep equal emphasis on manual setup?
3. Should board snapshot allow drag/drop on phone, or only tap move controls?
4. How aggressive should auto-suggestions be after each brain dump?

## 13) Product Decision
Treat mobile as a companion capture device first.  
The highest-value loop is:
`brain dump -> AI structures -> user approves -> board updates -> execute on desktop`.
