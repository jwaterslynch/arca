# Domain Coach Pattern — Plan, Health, Wealth, Wisdom

**Date:** 2026-04-30
**Audience:** Claude Design (claude.ai/design)
**Status:** Architecture brief. Sits on top of `HEALTHY_WEALTHY_WISE_IA.md` (the existing information-architecture doc), the v3 desktop redesign that just shipped, and the Wise MVP coach.
**Author:** Julian, drafted with Claude Code
**Repo:** https://github.com/jwaterslynch/arca
**Branch suggestion (when implementation starts):** `feat/domain-coach-pattern` off the current `release/beta.15` (v0.1.0-beta.15 ships the Wisdom MVP coach as-is — Wise renamed to Wisdom — which becomes the first instance of the pattern this brief describes).

## Read this first

What's been shipped so far:

- **Identity v1** — parchment / ink / bronze tokens, vault-arch A mark, Fraunces serif, JetBrains Mono numerics. Locked.
- **Desktop v3** — single-column Execute, practices rail at top, slim stats footer, native focus mode (navy radial ground, 48px mark, 128px mono timer).
- **Wisdom MVP** (currently called "Wise" in the codebase — to be renamed) — top-bar tab, paper ground, conversation thread in Fraunces, composer at bottom, propose-and-accept practice card, data-aware starter chips, last-spoke caption, ⌘+ zoom. Curiosity-not-guilt system prompt with explicit forbidden phrases.
- **Existing drawer coaches** — Plan coach, Health coach, Wealth coach. All exist as right-side slide-out drawers (`.wealth-coach-drawer` shared CSS, with messages arrays and system prompts for each). Functional but architecturally cramped. They predate the v3 redesign.

What `HEALTHY_WEALTHY_WISE_IA.md` already establishes:

- Two layers: Operating System (Execute / Plan — the daily rhythm) and Life Dashboards (Health / Wealth / Wisdom — the reflective surfaces).
- Practice routing: gym/exercise → Health, meditation/reading/language → Wisdom, research/revenue → Plan-Review.
- Per-domain coach personalities: Health = evidence-based and practical; Wealth = analytical and cautious (never gives financial advice); Wisdom = Socratic and reflective.
- Cross-domain intelligence as a Phase 3+ ambition.

What this brief asks for:

**A unifying visual + interaction pattern that promotes the four reflective surfaces (Plan, Health, Wealth, Wisdom) from drawer-coaches into first-class half-screen workspaces.** Each tab is a **data view on the left** and a **coach conversation on the right**, sharing the same domain context. Same skeleton across all four. Differences only where they earn their place.

## Naming

**Rename "Wise" → "Wisdom"** through the codebase, the tab label, the system prompt, the brief, the IA doc. *Health, Wealth, Wisdom* is the actual triad — three nouns, Benjamin Franklin's "healthy, wealthy, and wise" anchored as nouns. Mixing two nouns and an adjective in the tab strip will keep snagging. Cosmetic but pervasive — best done as one rename PR.

## Scope: which surfaces use the pattern

| Tab | Pattern | Notes |
|---|---|---|
| **Execute** | **Out of scope** | The daily action surface. Stays as-shipped (single column, practices rail, slim footer, native focus mode). Its AI bar explicitly *does not converse* — it captures, parses, mutates the task list, and stops. Different register. |
| **Plan** | **In scope** | Work coach (left: pipeline + goals + weekly review; right: coach that links 1–2 superordinate goals to daily tasks, gives feedback on what it notices). |
| **Health** | **In scope** | Health data view + evidence-based coach. |
| **Wealth** | **In scope** | Wealth data view + analytical/cautious coach. |
| **Wisdom** | **In scope** | Practice + reflection data view + Socratic coach (the existing Wisdom MVP becomes the coach half of this surface). |

**Four surfaces sharing one pattern. One surface (Execute) explicitly outside it.**

## The pattern

```
┌────────────────────────────────────────────────────────────┐
│  [Top bar — constant chrome]                               │
│  ARCA  Execute  Plan  Health  Wealth  Wisdom               │
├──────────────────────────┬─────────────────────────────────┤
│                          │                                 │
│   DATA VIEW (~50%)       │   COACH (~50%)                  │
│                          │                                 │
│   Header eyebrow         │   Mark + Domain · Last spoke    │
│   Domain title           │   ─────────────                 │
│                          │                                 │
│   Domain visuals         │   Conversation thread           │
│   (charts, lists,        │   (Fraunces serif for coach,    │
│    trends, summaries)    │    Inter for user, paper-2      │
│                          │    bubbles)                     │
│   Domain actions         │   Inline propose-and-accept     │
│   (drilldowns, filters,  │   cards for state mutations     │
│    toggles)              │                                 │
│                          │                                 │
│                          │   Composer pinned at bottom     │
│                          │   ⌘+ / ⌘− / ⌘0 zoom (coach     │
│                          │   text only)                    │
└──────────────────────────┴─────────────────────────────────┘
```

**Data left, coach right.** Reading left-to-right, you encounter the picture first, then talk about it. Familiar from desktop reference patterns (file → discussion).

**Half-and-half by default.** Resizable later if needed; 50/50 is the right starting point.

**Both panels share domain context.** When the coach mentions "Tuesday's gym session," the user can see it on the left. When the user clicks a transaction on the left, the coach can pick it up as context.

**No drawer.** The drawer pattern is gone for these four surfaces. The coach is a permanent peer, not a slide-out tool.

## What's shared (write once, instantiate four times)

The shared infrastructure already exists in fragments — this brief asks Claude Design to define the *shape* of the shared shell so engineering can refactor toward it.

### 1. Coach UI shell (consistent across all four domains)

- Mark (32px) + Domain name (Fraunces, 1.1rem) + last-spoke caption (mono, low contrast)
- Clear conversation control (current pattern: two-click confirm, soft red wash on armed state)
- Scrollable conversation thread, max-width ~720px, paper ground
- User bubbles right-aligned, paper-2 background, Inter
- Coach lines left-aligned, Fraunces serif, transparent background
- Inline `propose_*` cards for state mutations (the Wisdom MVP propose-practice card is the template)
- Composer pinned at bottom: textarea (autosize, max 240px), bronze send arrow
- ⌘+ / ⌘− / ⌘0 zoom shortcuts scoped to the conversation thread only (chrome stays constant)
- Persisted conversation list per domain (multi-conversation: see "Cross-conversation memory" below)

### 2. Coach state model

```js
state.coaches = {
  plan:    { conversations: [...], currentId, /* prefs */ },
  health:  { conversations: [...], currentId, /* prefs */ },
  wealth:  { conversations: [...], currentId, /* prefs */ },
  wisdom:  { conversations: [...], currentId, /* prefs */ },
}
```

Each conversation: `{ id, started_at, last_message_at, messages, topic_summary, practices_discussed (or domain-specific tags), proposals_accepted, proposals_dismissed }`.

Consolidates the four current ad-hoc message stores (`wealthCoachMessages`, `healthCoachMessages`, `planCoachMessages`, `wiseConversation`) into one symmetric tree. Migration is mechanical.

### 3. Tonal manifesto (shared spine, tunable per domain)

Same constraints across the four domains:
- Curiosity over prescription. The coach observes, asks, reframes, offers.
- Adherence/data is information, not the target.
- Never silently mutates state. Every change goes through a review-and-accept card.
- Forbidden phrases (across all coaches): *"you should"*, *"get back on track"*, *"commit to"*, *"let's try harder"*. (Wealth has additional forbidden phrases around financial advice; documented in the existing wealth coach prompt and stays.)
- Keep-it-tight: 2–4 sentences default. Long when exploring, short when deciding.

Per-domain register (the part that changes):
- **Plan** — strategic, accountable, kindly direct. *"Three of your top-five tasks today are admin-shaped. You said this week was about shipping the manuscript — does the day match?"*
- **Health** — evidence-based, gentle with the body. *"Sleep dropped under 6 hours twice this week. Your deep-work ratio dropped on those days too. Worth noticing."*
- **Wealth** — analytical, scrupulously non-prescriptive about decisions. *"Your portfolio is 72% equities. Is that the allocation you intended, or has it drifted there?"*
- **Wisdom** — Socratic, reflective, often answers a question with a better question. (The existing Wisdom MVP register is the reference.)

### 4. Cross-conversation memory

Each domain holds a list of past conversations. Two ways the past returns:

- **In the coach context.** When the user starts a new conversation that mentions a topic discussed before, the system prompt includes a brief summary of the relevant past conversation (topic_summary + the last 2–3 messages) so the coach can say *"we talked about this three weeks ago — here's what came of it."* User-controllable (a "memory" toggle that defaults on but can be turned off per conversation).
- **In the data view.** A small "past conversations on this topic" affordance — when looking at a practice or an account or a goal, the user can see "3 conversations about this" and click through.

### 5. Proposal pattern

Coach can propose a state change. User reviews, edits, accepts or dismisses. Every domain has its own proposal types but uses the same UI shape (the existing Wisdom propose-practice card is the template):

- **Plan** — propose adding a goal, splitting a goal into commitments, retiring a stale goal, moving a task between stages
- **Health** — propose logging a workout, adjusting a target (5 → 3 sessions/week), suggesting a rest day
- **Wealth** — propose recategorising a transaction, adding a manual entry, updating a property estimate (this already partially exists in the current wealth coach action JSON)
- **Wisdom** — propose adding/editing/pausing/retiring a practice (current MVP)

Hard rule, repeated: **no silent state mutation, ever.** Every change goes through a card with explicit user click on the bronze accept button.

### 6. The conversations sidebar (within each domain)

Inside each tab, a small affordance lets the user:
- See past conversations grouped by recency (Today, This week, Earlier)
- Click any past one to continue it
- Start a new conversation
- Delete a conversation

Open question for Claude Design: where does this live within the half-screen layout? Possible spots:
- A small dropdown at the top of the coach column ("Last spoke" → click to expand into a list)
- A skinny strip on the inside edge of the coach column
- A dedicated "history" affordance reached by clicking the mark / eyebrow

Whichever earns its place visually without crowding the conversation.

## What's domain-specific

### Per-domain data view (the right-half visualisations)

This is the **biggest open design problem in this brief.** Each domain needs a canonical data view that:
- Reads as moleskin (parchment, ink, bronze, Fraunces, JetBrains Mono) — not as a generic dashboard.
- Is glanceable but interactive (click a thing → drill in or pass to coach as context).
- Resists the urge to be a chart-graveyard.

Sketches of what each domain probably wants — *please argue with these*:

#### Plan (work)
- Pipeline summary at top: counts by stage (Backlog / Next Up / Today / Done), maybe a small horizontal bar.
- Goals: 1–2 superordinate goals shown as headline + a strip of recent commitments + closure ratio. The user explicitly wants the coach to help link the 1–2 superordinate goals to daily tasks, so this view should make those goals impossible to miss.
- Weekly review: deep-ratio strip, total hours, tasks closed (the existing review numbers, redesigned).
- Optional: a "what changed since last conversation" delta — what tasks closed, what's been planned.

#### Health
- Sleep: 7-day strip (hours per night, with a calm reference band).
- Exercise: this week's sessions with type / duration / one-line note. Progressive overload for tracked lifts as a quiet number-and-arrow.
- Energy: self-report from daily logs as a 7-day strip.
- Optional: weight trend if the user is tracking. Heart rate / vitals when iPhone Health import lands.
- The Health view should prominently surface the privacy badge + local-AI option (per the IA doc — health is the most sensitive domain).

#### Wealth
- Net worth headline (one number, Fraunces, no chrome).
- Account balances at a glance (a small list, not a giant table).
- Spend categories this period (calm bar, top categories only).
- Holdings if portfolio is non-trivial.
- Recent unusual transactions ("ten largest this week" or "spending spike on Tuesday").
- Period filters: month / quarter / FY (per the IA doc).

#### Wisdom
- Practices: list with 7-day adherence strips (the rail of dots Wisdom-side, but bigger and labelled).
- Recent reflections: pulled from practice logs that have free-text notes.
- "Question of the week" — a calm AI-derived prompt the user can click into to start a conversation with.
- Books in flight (from reading practice).
- Conversation history on the current topic when relevant.

### Per-domain coach scope

- Each domain coach is **constrained to its own room** in the system prompt. Plan coach doesn't talk about portfolio. Wealth coach doesn't talk about meditation. Cross-domain links happen only at the data-context layer (Phase 3+ per the IA doc), and even then through structured signal-passing, not free-form gossip.
- Each domain coach can **route** to other surfaces. *"That sounds work-shaped — Plan tab might be a better room for it."*

### Per-domain proposal schemas

Different `propose_*` blocks per domain (listed above). Same card shape (editable fields, accept/dismiss buttons). Engineering implements one card-rendering helper, four schema definitions.

## The hard design problems

These are the ones I'd love Claude Design to think hardest about.

1. **Moleskin-aesthetic data visualisations.** Most chart libraries default to a "dashboard" register that fights parchment. What does a calm, paper-ink-bronze chart actually look like? Sparse strokes? Hand-drawn-feeling axes? Numbers as the figure with the chart as the ground? Or charts as quiet historical records — like marginalia in a notebook?

2. **The data + coach split that doesn't feel like two apps.** The two halves should feel like one room, not a chart on the left and a chat on the right pasted together. Possible glue:
    - A subtle continuous header strip across the top of both halves (same paper, same eyebrow type, only the title changes).
    - Coach references something in the data view → that thing softly highlights for ~2 seconds. Click an element in the data → it appears as a quote/reference in the coach context.
    - Same vertical rhythm and breathing room across both halves.

3. **The 50/50 line at narrower widths.** What happens at 1100px? At 900px? Does the data view stack above the coach? Does one collapse into a tab? Different domains might want different answers.

4. **Mobile collapse pattern.** When this lands on iOS, we need a coherent translation. Likely a top-tabs-or-toggle between "Data" and "Coach" within each domain, plus a subtle "you have new conversation context" indicator. CD should sketch the mobile shape alongside the desktop pattern, even if mobile lands later.

5. **The conversation history affordance within a domain.** As above — where does it live? It should feel like a notebook's table of contents, not a CRM history pane.

6. **The Question of the Week** (Wisdom) and equivalents in Plan/Health/Wealth. Should every domain have an AI-derived prompt of the period that pulls the user back in? Or is that decoration?

## What Execute keeps doing (out of scope, important to name)

Execute does NOT get a coach in this pattern. Its AI bar explicitly captures and mutates the task list — it does not converse. The user's own articulation: *"the AI tab there just adds or deletes tasks — it explicitly won't engage in conversation in that tab."*

This is load-bearing: Execute is the *doing* surface. Conversation lives elsewhere. Mixing them undermines both. This non-scope should be visible in the brief so CD doesn't accidentally redesign it into the pattern.

## What we already have (so it doesn't get re-designed)

- **`HEALTHY_WEALTHY_WISE_IA.md`** — the IA. Read it. Don't re-litigate the routing or the personalities.
- **Identity v1** — parchment / ink / bronze tokens, mark, type system. Locked.
- **Desktop v3** — Execute layout, practices rail, native focus mode. Locked.
- **Wisdom coach (current "Wise")** — system prompt, propose-and-accept card, data-aware starters, ⌘+ zoom on the conversation column, two-click clear. **This becomes the coach half of the Wisdom domain.** Don't redesign — port.
- **Existing drawer coaches** for Plan, Health, Wealth — system prompts, message renderers, action JSON parsers. The plumbing migrates; the surface gets replaced.

## What we want from Claude Design

1. **A canonical mockup of the pattern** — pick one domain (probably Wisdom or Plan, since their data is most-defined) and design the full half-and-half surface end-to-end. From the mockup we can extrapolate the others.
2. **Sketches of the four data views** — annotated, not pixel-perfect. Show the glanceable visualisations that fit each domain in the moleskin aesthetic.
3. **A position on the data viz idiom** — what does a parchment chart look like? Don't just decorate Recharts; argue for an aesthetic.
4. **The conversation-history affordance** — where it lives, what it looks like at rest, what it looks like expanded.
5. **The mobile collapse pattern** — even at sketch-level. We'd rather see one bad iOS layout than zero.
6. **A list of things considered and rejected** — same as v3. The cuts are as informative as the choices.
7. **Open questions for engineering** — anything that depends on data we don't have yet, performance constraints, or cross-domain coupling that needs spec'ing.

## What to push back on

- **If the half-and-half model is wrong** — say so. Maybe the data wants more space and the coach less. Maybe the pattern shouldn't apply uniformly to all four domains. Maybe Plan should look completely different from Wealth. We hold the IA, you hold the form.
- **If "data view" is the wrong noun** — argue for a better one. *Picture? Surface? Record? Ledger?* Different domains might want different language.
- **If Wisdom doesn't fit the pattern** — say so. Wisdom's data is the *thinnest* of the four (mostly practice adherence + recent notes). It might want a different ratio (60/40 in favour of coach), or a different layout entirely.
- **If the conversation-history affordance is fighting the moleskin idiom** — kill it. We'd rather lose easy past-conversation access than make the surface feel like a CRM.
- **If you want a sibling brief** for the data viz idiom as its own piece, ask for it. This brief carries it as one of seven concerns; it might deserve its own room.

## Phasing (engineering's view, useful for CD to know)

- **Phase 1** — Wisdom rename + storage migration to the unified `state.coaches` model + the conversations sidebar. Half-day to a day.
- **Phase 2** — Build the half-and-half pattern as a generic shell (`<DomainSurface dataView={...} coach={...}>`-style component) and instantiate Wisdom in it. ~2 days.
- **Phase 3** — Port the existing Plan / Health / Wealth drawer coaches into the pattern. Each ~1 day given the shell exists.
- **Phase 4** — Domain-specific data views. The longest phase. Health and Wealth have richer data; Wisdom and Plan are quicker.
- **Phase 5** — Cross-conversation memory + cross-domain references (the "your sleep dropped on the days your deep-work ratio dropped" intelligence the IA doc anticipates).
- **Phase 6** — Mobile parity per the iOS work cadence.

## Success looks like

A user opens the desktop on a quiet evening. They click Health. The right half of the screen shows their week — sleep, exercise, energy — in a register that reads like a doctor's notebook, not a Garmin dashboard. The left coach half says *"Sleep dropped under 6 hours twice this week. Want to look at why?"* The user types back. The conversation goes somewhere. They click Wealth. Same shape, different room. Same calm.

The opposite of how lifestyle/finance/health-tracker apps usually feel. Familiar enough to navigate without thinking, distinct enough per domain that the user can tell where they are.

— Julian (with Claude Code)
