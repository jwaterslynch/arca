# PPP Flow Mobile Companion Build Checklist (v1)

Date: 2026-03-03  
References:
- `design/MOBILE_COMPANION_PRD_v1.md`
- `design/AI_ASSISTANT_CONTRACT_v1.md`
- `design/MOBILE_CLOUD_PHASE1_PLAN.md`
- `design/SUPABASE_SCHEMA_v1.sql`

## Definition of Done (Global)
1. iPhone build runs with no clipped onboarding content.
2. AI Capture is default mobile entry.
3. AI proposed changes apply exactly once.
4. Desktop and mobile reflect same board after sync.
5. No API keys in cloud board payloads.

## M0 Sprint: Mobile Usability Stabilization

## Ticket M0-1: Mobile onboarding layout fix
Owner: Frontend  
Estimate: 0.5 day

Checklist:
- [ ] Add phone breakpoint styles for onboarding containers.
- [ ] Force one-step-at-a-time rendering on mobile.
- [ ] Remove horizontal overflow and clipping.
- [ ] Verify steps 1-6 on iPhone 6.1" and 6.7".

Acceptance:
- [ ] No text overlap, no cut-off controls, no hidden primary CTA.

## Ticket M0-2: AI tab visibility and default routing
Owner: Frontend  
Estimate: 0.5 day

Checklist:
- [ ] Ensure AI Capture tab is available in mobile mode.
- [ ] Default initial tab to AI Capture on mobile.
- [ ] Persist last tab only after first successful session.

Acceptance:
- [ ] Fresh launch lands in AI Capture on phone.

## Ticket M0-3: Mobile action copy and affordances
Owner: Frontend  
Estimate: 0.5 day

Checklist:
- [ ] Rename `Ask AI` to `Send to board`.
- [ ] Add `Changes applied` toast.
- [ ] Add `Task deleted` toast.
- [ ] Disable apply button after successful apply until new response arrives.

Acceptance:
- [ ] User cannot trigger duplicate apply from rapid repeat taps.

## M1 Sprint: Companion MVP

## Ticket M1-1: Mobile IA shell
Owner: Frontend  
Estimate: 1 day

Checklist:
- [ ] Implement 3-tab shell: `Capture`, `Board`, `Timer`.
- [ ] Move settings to icon/sheet.
- [ ] Keep advanced settings collapsed by default.

Acceptance:
- [ ] Mobile nav is limited to companion flows only.

## Ticket M1-2: Provider chip switcher
Owner: Frontend + AI  
Estimate: 1 day

Checklist:
- [ ] Add top-row provider chips in Capture.
- [ ] Wire active provider change to existing provider config.
- [ ] Preserve per-provider masked key state.

Acceptance:
- [ ] Switching provider does not expose or overwrite other provider keys.

## Ticket M1-3: Proposed-changes robust apply
Owner: AI + Frontend  
Estimate: 1 day

Checklist:
- [ ] Enforce dry-run validation before apply.
- [ ] Add batch idempotency key (`client_event_id`) per apply.
- [ ] Keep undo-last-batch behavior.

Acceptance:
- [ ] Same batch cannot be applied twice from repeated taps or retries.

## Ticket M1-4: Board snapshot triage
Owner: Frontend  
Estimate: 1 day

Checklist:
- [ ] Build compact card lanes: `Today`, `Next Up`, `Backlog`.
- [ ] Add tap quick actions: move, done, delete.
- [ ] Enforce Today cap in mobile UI logic.

Acceptance:
- [ ] Triage actions complete in <= 2 taps after selecting a card.

## Ticket M1-5: Full-screen timer mode
Owner: Frontend  
Estimate: 1 day

Checklist:
- [ ] Add large timer display when running.
- [ ] Show current task at top.
- [ ] Add quick complete/defer actions.

Acceptance:
- [ ] Running timer is readable and operable one-handed.

## Ticket M1-6: Desktop-first companion linking (QR)
Owner: Frontend + Backend  
Estimate: 1 day

Checklist:
- [ ] Add `Link Mobile Companion` entry point on desktop settings.
- [ ] Generate one-time link token server-side with short TTL.
- [ ] Render QR + manual code fallback on desktop modal.
- [ ] Add desktop action to revoke pending tokens.

Acceptance:
- [ ] Desktop can produce a valid one-time pairing code in <=2 taps.

## M2 Sprint: Shared Cloud Sync Hardening

## Ticket M2-1: Sync engine integration
Owner: Backend + Client  
Estimate: 2 days

Checklist:
- [ ] Wire snapshot + event log push/pull.
- [ ] Add realtime subscription.
- [ ] Add offline queue and reconnect retry.

Acceptance:
- [ ] Mobile changes appear on desktop in near-real-time under normal connectivity.

## Ticket M2-1b: Mobile pairing flow (QR + code fallback)
Owner: Mobile + Backend  
Estimate: 1 day

Checklist:
- [ ] Add first-run screen: `Scan QR` or `Enter code`.
- [ ] Exchange token for authenticated session and board binding.
- [ ] Handle expired/used token errors with clear recovery message.
- [ ] Land linked users directly in `Capture`.

Acceptance:
- [ ] New mobile install links to existing desktop board in <=60 seconds.

## Ticket M2-2: Conflict handling and observability
Owner: Backend + Client  
Estimate: 1 day

Checklist:
- [ ] Apply last-write-wins + local replay policy.
- [ ] Log conflict-resolved events for diagnostics.
- [ ] Surface sync state: `Synced`, `Syncing`, `Offline`.

Acceptance:
- [ ] No silent data loss in disconnect/reconnect scenarios.

## Ticket M2-3: Security and data checks
Owner: Backend + QA  
Estimate: 0.5 day

Checklist:
- [ ] Verify API keys never enter synced JSON payload.
- [ ] Verify RLS policies restrict board access to owner.
- [ ] Verify no plain-text keys in logs.

Acceptance:
- [ ] Security checklist passes for test accounts.

## QA Regression Checklist
1. [ ] Brain dump on mobile -> apply -> task appears on desktop.
2. [ ] Desktop move/delete -> reflected on mobile.
3. [ ] Airplane mode mobile edits queue and sync later.
4. [ ] Provider switch still sends with active provider only.
5. [ ] Onboarding renders correctly in portrait mode.
6. [ ] Timer state persists across app background/foreground.
7. [ ] Desktop-generated QR links mobile successfully on first scan.
8. [ ] Expired/used code shows deterministic error and retry path.

## Release Gate (v1 Companion)
1. [ ] M0 complete
2. [ ] M1 complete
3. [ ] M2 sync smoke tests complete
4. [ ] iPhone device pass
5. [ ] Desktop-mobile cross-check pass
