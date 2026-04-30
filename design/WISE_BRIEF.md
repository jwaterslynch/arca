# Wise — A coach for the life half of the ledger

**Date:** 2026-04-30
**Audience:** Claude Design (claude.ai/design) — and Claude Code, for the MVP build
**Status:** New surface brief. Arrives after desktop v3 (Execute redesign) lands.
**Author:** Julian, drafted with Claude Code
**Repo:** https://github.com/jwaterslynch/arca
**Branch suggestion (when implementation starts):** `feat/wise-coach` off `release/beta.16` (or whatever ships after desktop v3 lands)

## Read this first

Arca's desktop has four tabs today: **Execute** (work tasks + the practices rail), **Plan** (pipeline + review), **Health** (the iOS Capture lane lives here for now), **Wealth** (placeholder). Claude Design's v3 mock slipped in a fifth: **Wise**. We didn't know what Wise was for at the time. Now we do.

**Wise is the coach for the life half of the ledger.** Execute is about *getting work done*. Plan is about *shaping the work*. Health and Wealth are *quiet data*. Wise is the room where the user has the conversation that comes *before* the work — the conversation about who they're trying to become, what practices would shape that, and why the ones they have aren't sticking.

The product loop:

```
                ┌────────────────────────────────────────────┐
                │  User's goals / problems / aspirations     │
                │  (outside of work)                         │
                └──────────────────┬─────────────────────────┘
                                   │
                                   ▼
                ┌────────────────────────────────────────────┐
                │  Wise — coach conversation                 │
                │  Curious, not guilt-driven                 │
                │  Reframes, notices, suggests               │
                └──────────────────┬─────────────────────────┘
                                   │
                                   ▼
                ┌────────────────────────────────────────────┐
                │  A daily life practice                     │
                │  (with target, kind, logging_hint, …)      │
                └──────────────────┬─────────────────────────┘
                                   │
                                   ▼
                ┌────────────────────────────────────────────┐
                │  Execute — practices rail                  │
                │  Dot ticks every day (or doesn't)          │
                └──────────────────┬─────────────────────────┘
                                   │
                                   │  adherence data
                                   ▼
                ┌────────────────────────────────────────────┐
                │  Wise notices what's logged and what's not │
                │  Brings it back into the next conversation │
                └────────────────────────────────────────────┘
```

The reason this works as a separate surface: **the rail handles "did I tick this today?" The conversation about why I'm avoiding it, whether the practice itself is wrong for me, or what should replace it — that's a different mode and deserves its own room.** Mixing them on one surface has tried before (across many products) and it always ends with one of the two functions getting watered down.

## The tonal commitment — non-negotiable

**Curiosity-driven, not guilt-driven.**

Wise notices. Wise asks. Wise reframes. Wise does **not**:

- Shame the user for missed days
- Push streaks as the central metric
- Use language like "you should", "you need to", "you failed to", "you only managed"
- Treat practices as a checklist of obligations
- Optimize for adherence as the goal in itself

Adherence is *information*, not the *target*. The target is whether the practice is doing what the user wanted it to do.

### Examples — bad coach response (do not do)

> "You've missed Meditation 4 days in a row. Let's get back on track. Can you commit to 10 minutes tomorrow morning?"

That's a guilt-trip with a fake-collaborative ending. The user's already feeling bad about it. Wise is now an enforcement mechanism.

### Examples — good coach response (do this)

> "I notice Meditation has been hollow most of this week. Walk before screens has stayed steady. Curious — is the morning feeling different lately, or has Meditation just stopped feeling like it's giving you what it used to?"

The coach is observing without judging. It's offering two reframes (different mornings vs. practice losing meaning) without insisting on either. It opens space.

> "You've added three practices in the last two months and only two of them are still ticking. That's a pattern worth looking at — not because three is too many, but because the ones that stuck were specific (a time, a duration, a place). The ones that drifted were aspirational. Want to talk about which of the current ones is which?"

Coach is using data — *adherence as information* — to surface a structural pattern, not to assign blame.

> "Walk before screens hit 7/7 this week. Which is great, but I want to ask: was the morning protective of attention this week in a way you noticed in the rest of your day? Or is it just a thing you do now and tick?"

Coach is checking whether the practice is *delivering*, not just whether it's being *done*. Adherence isn't the goal — the underlying outcome is.

### The voice in two lines

> *"What you're noticing is information. Let's stay with it instead of fixing it."*
> *"The practice serves you. You don't serve the practice."*

Those are the two phrases I'd put on the wall of the team that builds this.

## The two flows Wise has to support

### 1. The new-practice flow

The user has a goal, problem, or aspiration outside of work. Examples:

- *"I want to read more fiction. I keep picking up my phone instead."*
- *"I'm worried I'm losing my Arabic. I haven't sat down with it in months."*
- *"I want to be a better friend. I keep meaning to call my brother and not doing it."*
- *"I want to feel less anxious in the morning."*

The coach helps the user find a practice (often: a small, specific, time-anchored, observable thing) that would shape this. **Wise can propose a practice with structured fields filled in**:

```
{
  title: "Read fiction, twenty minutes, before bed",
  kind: "life_practice",
  minimum_minutes: 20,
  default_minutes: 20,
  logging_hint: "What were you reading? What stayed with you?",
  linked_goal: "Read more fiction (away from screens)",
  ...
}
```

The user reviews, edits, accepts. The practice lands in the rail on Execute. From the user's side: a beautiful, light flow that ends with a new dot in the rail.

### 2. The reframe flow

The user has an existing practice that's not landing. Examples:

- *"I haven't meditated in a week."*
- *"I keep skipping my walk."*
- *"Piano feels like a chore now."*

The coach pulls up that practice's adherence (last 7d, last 30d), recent entries, linked goals, and starts a conversation. The conversation can end in several places — none of them imposed:

- The practice **stays as-is** (the user just needed to talk about it)
- The practice gets **edited** (target shrinks, time-window changes, logging_hint changes, gets renamed to be more honest)
- The practice gets **paused** (with a date to revisit, not "deleted in shame")
- The practice gets **retired** (with the coach's blessing — sometimes a practice has done its work and you don't need it anymore)
- A **new practice replaces it**

All five outcomes should feel equally honourable from inside the conversation.

## Surface options

### Option A — Wise as a fifth tab (CD's mock direction)

Sibling to Execute / Plan / Health / Wealth. Real estate in the top bar. Same status as the others. Mobile parity is straightforward (each tab → each module on iOS).

What's on the surface:

- A single chat thread, vertical scroll, paper ground, conversation-as-journaling aesthetic
- A quiet header strip showing practice context: today's tick state, 7-day adherence at a glance, current streaks (low contrast)
- Suggested prompt chips when the thread is empty or stale ("Why am I avoiding Meditation?", "I want to start something new", "Reframe Walk before screens")
- A small affordance for the new-practice flow when the coach proposes one (review card with editable fields → "add to my practices")
- Possibly: a subtle date-of-last-conversation eyebrow ("Last spoke 9 days ago") to mark continuity without nagging

This is the destination shape. It reads like a journal you have a conversation with.

### Option B — MVP via drawer button

A fast first version. The Practices Manage drawer (already built in v3) gets a "Talk to coach" button in its header. Clicking opens a chat overlay (paper ground, mark in corner, conversation centered, dismissable like a focus-mode surface). The chat is the same thing — just without a permanent tab.

Why MVP first: lets us test whether the surface earns its place, what people actually use it for, and what the right tone of suggested prompts is — before we commit to a tab and a fully-designed Wise surface. Half-day of work versus several days.

### Option C — Coach mode inside the AI bar

Rejected. The AI bar is already the work-input surface ("Add a task, brain dump, or ask anything"). Mixing the curiosity-driven life conversation with the get-it-done work conversation muddies both. Different rooms. Different registers.

## Data contract — what Wise sees

The coach should have access to the maximal slice from day one. Cheaper to redact later than to plumb in.

**Per practice (read):**
- `id`, `title`, `kind`, `minimum_minutes`, `default_minutes`, `logging_hint`, `linked_goal`, `target_*`, `coach_key`, `domain_key`
- Last 30 days of `daily_log[date][practiceId]` (done + minutes + notes)
- Recent free-text entries (last ~10) with their notes
- Current streak + last-done-date

**Across all practices (read):**
- Full practices array (life_practice + work_domain)
- Last 30 days of daily_log
- Today's done count vs. total

**Beyond practices (read):**
- Recent task closures (last 7d) — context for *"you've been buried in deep work this week"*
- Deep-work ratio (last 7d) — context for *"work is taking most of you right now"*
- Top-level goals (the ones the user has set in Plan)

**Write capabilities:**
- Propose a new practice (creates a draft; user reviews + accepts → lands in `state.life_practices.practices`)
- Propose an edit to an existing practice (same flow)
- Propose pause / retire of a practice
- Append a note to a practice (with the user's consent)
- It does **not** silently mutate state. Every write goes through a "review and accept" card.

## Existing infrastructure that helps

The plumbing is partly built already. Search the repo for:

- `requestPracticeCoaching(practiceId, userQuestion, options)` — fires a coaching request with practice context
- `buildPracticeCoachContext(practiceId)` — gathers per-practice context (recent entries, linked tasks, linked commitments)
- `buildPracticeCoachSystemPrompt(coachKey)` — system prompt for a domain coach
- `inferPracticeCoachKey(practice)` — domain inference
- `getPracticeCoachUi(practiceId, preferredSurface)` — UI mounting hook

These were built for an earlier (smaller) coach concept where each practice had its own per-row coach drawer. The data layer is reusable; the UI layer is the part that needs Wise's vision.

## Conversation shape — opening cards

When the user enters Wise with no active conversation, show a small set of starter prompts. These are the cold-start solver. They should be specific, calm, and inviting.

### Starter set v1 (pick 4–6 to ship)

- *"What's one thing in your non-work life that's been on your mind?"*
- *"Pick a practice that hasn't been ticking. Want to talk about it?"*
- *"Is there something you used to do that you miss?"*
- *"What would you want a friend to ask you about right now?"*
- *"Show me what's logged this week."* (data-driven entry: coach summarises adherence + asks one question about it)
- *"I want to start something new."*
- *"I want to retire something."*
- *"Is something missing from my practices?"*

The prompts should feel like a kind friend's notebook, not a productivity app's onboarding.

## Proactive vs reactive

**MVP: reactive only.** User opens Wise; conversation happens. No notifications, no nudges, no badge counts.

**Phase 2 (when MVP earns its place): gentle proactive nudges.** Off by default. User opts in. Examples:

- A small dot on the Wise tab when something has shifted ("Walk before screens has been hollow 4 days; want to talk?")
- A morning prompt once per week: *"It's been a week since we last talked. Anything come up?"*
- After three days of low deep-work ratio: *"You've been in shallow this week. Want to look at what your practices say about it?"*

All proactive prompts must be:

- Skippable in one click
- Phrased as offers, not assignments
- Triggered by a specific observation, not by a generic schedule

The bar: *the user should never feel surveilled by their own app.*

## Open product questions

These need a call before final implementation, but we can start MVP without locking them.

1. **Coach personality / style.** One coach, or multiple "coach modes" the user picks (e.g., *Curious / Direct / Stoic / Warm*)? My instinct: one coach to start. Multiple modes can come later if users ask.
2. **Memory.** Does Wise remember previous conversations? Does it summarise them? My instinct: yes, with explicit user-visible memory ("here's what I remembered from last time"). No black-box memory.
3. **Voice / tone calibration.** Should the user be able to nudge the coach's voice? *"Be more direct."* / *"Less wordy."* My instinct: yes, simple controls.
4. **What does Wise NOT talk about?** Work tasks (those belong to the AI bar / Plan). Health metrics (Health tab). Money (Wealth). Wise stays in the life-practice/aspiration room. Ambiguous edges (e.g., "I'm avoiding gym because of work stress") — the coach can hold work in context but the *focus* is the practice.
5. **Practice-proposal acceptance UI.** When the coach proposes a practice, what does the review card look like? Inline in the chat? Separate sheet? My vote: inline review card with editable fields, "add" / "edit" / "not yet" buttons.
6. **Privacy.** What happens to conversation history? Encrypted at rest with the rest of the app? Deletable per-conversation? Per-message? My vote: same encryption as the rest, plus a clear "delete this conversation" affordance.
7. **Mobile parity.** When Wise lands on iOS, does it have the same shape? My vote: yes, mirrors desktop with a bottom-sheet keyboard handling. Same conversation thread. Same data.
8. **Streaks displayed.** Streaks earn their place in Wise (data) but should be shown in a way that doesn't trigger guilt. Maybe: streaks shown as 7-day adherence dots (mirrors the rail), not as a number that resets.

## Open visual questions for Claude Design

These are for CD when their usage resets:

1. **What's Wise's visual idiom?** Execute is parchment workspace. Focus is navy depth. What is Wise? Some directions to argue:
   - A page from a notebook — wide column, generous whitespace, conversation as handwriting-adjacent
   - A morning/evening register — different ground depending on time of day
   - The mark used as a quiet section divider between conversations or topics
   - Fraunces serif for the user's words; Inter for the coach's? Or both Fraunces? (Reflective register might want serif throughout.)
2. **The prompt cards.** They need to feel inviting, not like quiz questions. Subtle, type-led, paper-tinted.
3. **The practice-proposal review card.** Inline in the thread. Should feel like a hand-written suggestion, not a form. Editable fields but quiet.
4. **The header context strip.** What does *"today's adherence at a glance"* look like in this register? Probably the same dot pattern as the rail, but smaller and more contextual.
5. **The empty state.** When the user lands here for the first time. Could be one of the strongest moments in the app — what's the line of copy? What's the visual? My instinct: the mark, generous space, a single Fraunces line like *"Tell me what's on your mind."*

## Implementation notes for engineering (MVP path)

If we build the MVP drawer-button version first:

1. **Add a "Talk to coach" button** to the v3 practices drawer header (next to the close ×).
2. **Build a chat overlay** — same `position: fixed; inset: 0` shape as the focus mode, but paper-on-ink-strokes (light ground, dark text). Mark top-left, "Wise" wordmark or eyebrow next to it. Single conversation column, max-width ~720px, centered. Esc closes.
3. **Wire the existing `requestPracticeCoaching`** to power the conversation. Pass full daily_log + practices + recent task closures as context.
4. **Render a streaming chat thread** — user bubbles right-aligned in Inter, coach in Fraunces serif (or both Fraunces if the register feels right).
5. **Build the practice-proposal card** inline in the thread when the coach output includes a `propose_practice` block. Editable fields, "add" CTA, "not now" dismiss.
6. **Hard rule**: any state mutation requires user click. No silent writes from the coach.
7. **Persist conversation history** to localStorage (same encryption pattern as the rest of state). Show timestamp on resume ("Last spoke 9 days ago").

If we go straight to Wise-as-tab:

1. **Add `<button data-tab="wise">Wise</button>`** to the top-bar mode-switcher.
2. **Add `<div class="surface" id="surface-wise">` with the conversation column + context strip.**
3. **Same wiring as MVP**, just mounted as a permanent surface.
4. Mobile: identical shape, sized for narrow viewport.

## Suggested phasing

- **Phase A — MVP** (~half-day to a day): drawer-button entry → chat overlay → existing coach plumbing → no proactive features. Ships behind a settings flag if you want to test before exposing.
- **Phase B — Wise as a tab** (~2 days): if MVP earns its place, promote to a real tab. Adds the context strip, persistent thread, suggested prompts, practice-proposal review card.
- **Phase C — Proactive nudges** (~1–2 days): opt-in only. Triggered observations, never schedule-based. Bar: each nudge must pass *"would I rather skip this on day 50?"*
- **Phase D — Mobile parity** (~tied to mobile work): mirror the surface on iOS. Same conversation thread, same data.

## What success looks like

A user opens Wise on a Sunday evening. The coach asks one question grounded in what it noticed about the week. The user responds — not in a rush, not because they have to, but because the question is the right one. The conversation goes somewhere. By the end, either the user has a sharper sense of why one of their practices isn't landing, or they've added a new one, or they've simply named something they couldn't name yet. They close the app and feel met.

The opposite of how habit-tracker apps usually feel.

## What to push back on

- If a coach surface in Arca shouldn't exist at all — say so. Maybe this should be a separate product. (My read: it belongs *here* because the data is here.)
- If the Wise tab is the wrong primary surface and it should live somewhere else — say so.
- If the curiosity-tone framing is too prescriptive (i.e., constrains the design / language too much) — say so. We can hold tone loosely if it serves the user.
- If you want a sibling brief for the new-practice review card as its own component — ask for it.

— Julian (with Claude Code)
