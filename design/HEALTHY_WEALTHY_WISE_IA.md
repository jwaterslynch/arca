# Healthy, Wealthy, Wise — Information Architecture

> **Status:** Design proposal
> **Date:** 13 March 2026
> **Purpose:** Map how PPP Flow evolves from a productivity tool into an integrated life operating system with three companion domains.

---

## 1. The Organising Principle

PPP Flow has two layers:

**Layer 1 — The Operating System** (daily rhythm)
Execute and Plan are where you *do things*: manage tasks, run focus sessions, track time, review the week. This is the productivity spine. It stays fast, minimal, and action-oriented.

**Layer 2 — The Life Dashboards** (reflection + coaching)
Health, Wealth, and Wise are where you *understand things*: see data, spot patterns, get coached, make decisions. They are data-rich, reflective, and AI-assisted. They don't compete with Execute for screen time — they inform it.

The relationship between the layers:

```
                    ┌─────────────────────────────────┐
                    │       EXECUTE  /  PLAN           │
                    │   tasks · focus · time · review   │
                    │   life practices (daily checks)   │
                    └──────────┬──────────┬────────────┘
                               │          │
              ┌────────────────┼──────────┼────────────────┐
              │                │          │                │
        ┌─────▼─────┐   ┌─────▼─────┐   ┌▼────────────┐  │
        │  HEALTH   │   │  WEALTH   │   │    WISE      │  │
        │           │   │           │   │              │  │
        │ exercise  │   │ net worth │   │ meditation   │  │
        │ nutrition │   │ cash flow │   │ reading      │  │
        │ sleep     │   │ portfolio │   │ languages    │  │
        │ vitals    │   │ property  │   │ philosophy   │  │
        │ energy    │   │ super     │   │ relationships│  │
        │           │   │ crypto    │   │ creativity   │  │
        └───────────┘   └───────────┘   └──────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Tasks & Practices  │
                    │   pushed back to     │
                    │   Execute / Plan     │
                    └─────────────────────┘
```

Data flows **down** from Execute (daily logs, time tracking, task completions) into the dashboards. Actions flow **up** from the dashboards (create a task, add a practice, set a commitment) back into Execute/Plan.

---

## 2. Current State → Future State

### Top-Level Navigation

**Current (3 tabs):**
```
[ Execute ]  [ Plan ]  [ Wealth ]
```

**Proposed (5 tabs):**
```
[ Execute ]  [ Plan ]  [ Health ]  [ Wealth ]  [ Wise ]
```

### What Moves Where

| Current Location | Feature | Future Location | Notes |
|---|---|---|---|
| Execute tab | Hero timer, Today tasks, AI bar | **Execute** (unchanged) | Core productivity loop stays put |
| Execute sidebar | Life Practices checklist | **Execute** (unchanged) | Daily check-ins stay on the daily surface |
| Plan > Pipeline | Goals, commitments, backlog | **Plan** (unchanged) | Strategic planning stays put |
| Plan > Review | Week stats, deep work ratio, time by category | **Plan > Review** (unchanged) | Work/productivity review stays here |
| Plan > Review | Practice streaks (28-day) | **Plan > Review** (unchanged) | Quick visual stays in weekly review |
| Plan > Review | Practice detail + coaching | **Moves to Health/Wise** | Detailed practice data and AI coaching moves to the relevant domain tab |
| Plan > AI Workspace | AI chat for planning | **Plan** (unchanged) | Planning AI stays with planning |
| Wealth tab | Net worth, portfolio, cash flow | **Wealth** (unchanged) | Already in the right place |

### The Key Redistribution: Practice Coaching

The current practice coaching system (gym coach, music coach, meditation coach, etc.) lives inside Plan > Review. In the new model:

- **Execute** keeps the daily checkbox/log for all practices (lightweight, action-oriented)
- **Health** gets the detailed coaching for gym, exercise, nutrition, sleep
- **Wise** gets the detailed coaching for meditation, reading, languages, music, philosophy
- **Plan > Review** keeps the streak visualisation and weekly summary stats

The practice data model doesn't change — `state.life_practices` stays unified. The coaching UI just renders in the appropriate domain tab instead of all being crammed into Review.

---

## 3. Tab Specifications

### 3.1 Execute (unchanged)

**Purpose:** Daily action surface. What am I doing right now?

**Subtabs:** None (flat surface)

**Contains:**
- Hero timer with Pomodoro
- AI inline bar (brain dump, quick task creation)
- Today task list (max 5)
- Life Practices sidebar (daily check-ins for ALL practices — health, wise, and work)
- Quick stats (time today, deep ratio, tasks closed, hours this week)

**Does NOT contain:** Detailed analytics, coaching conversations, financial data, health trends.

**Pushes to:** Tasks and practice logs flow into Plan, Health, Wealth, and Wise for analysis.

---

### 3.2 Plan (minor changes)

**Purpose:** Strategic planning and work review. Am I spending time on the right things?

**Subtabs:**
- **Pipeline** — goals, commitments, task backlog (unchanged)
- **Review** — weekly work stats, practice streaks, time by category (simplified)
- **AI Workspace** — planning-focused AI chat (unchanged)

**What changes:**
- Review tab gets slightly lighter: practice detail cards with full coaching UI move to Health/Wise. Review keeps the 28-day streak grid and weekly summary row per practice (enough to spot "I missed gym 3 days this week" without drilling into coaching).
- The AI Workspace remains the general-purpose planning assistant. Domain-specific coaching (health coach, music coach) moves to domain tabs.

---

### 3.3 Health (new)

**Purpose:** Physical wellbeing dashboard. How is my body doing?

**Subtabs:**
- **Overview** — health summary, recent activity, sleep trend, energy rating
- **Exercise** — detailed gym/running/sport tracking with coaching
- **Nutrition** — meal logging, macros, hydration (future)
- **Sleep** — sleep duration, quality, patterns (future — iPhone Health integration)
- **Vitals** — weight, resting heart rate, blood pressure (future — iPhone Health integration)

#### Overview Subtab
Summary cards showing current state across all health dimensions:
- Sleep last night (hours, quality if available)
- Exercise this week (sessions, total time, type breakdown)
- Energy trend (self-reported via daily log)
- Streak/consistency (days this week with at least one health practice logged)
- Weight trend (if tracking)

#### Exercise Subtab
This is where the current gym/exercise practice coaching moves to. It gets its own full-width surface with:
- **Log history** — structured entries from `state.life_practices` where `coach_key` is `gym`
- **Progressive overload tracking** — weight/reps trends for key lifts
- **AI coach** — domain-specific exercise coaching (currently in Review, moves here)
- **Push to Execute** — "Add gym session to Today" button creates a task

#### Data Sources (phased)
- **Phase 1:** Manual logging via existing practice entries (already works)
- **Phase 2:** Import from Apple Health / Google Fit via mobile companion (steps, heart rate, sleep, workouts)
- **Phase 3:** Direct HealthKit integration via Tauri iOS companion app

#### AI Coaching Personality
The Health AI coach is **evidence-based and practical**. It reads your exercise logs, sleep data, and energy ratings. It notices patterns ("you've done 3 upper body sessions this week but no cardio"), suggests adjustments ("consider a rest day — you've had 5 consecutive training days"), and correlates across dimensions ("your deep focus time drops when you sleep under 6 hours").

#### Privacy Note
Health data is the most sensitive category. The Ollama/local AI option is especially important here. The Health tab should surface the privacy badge prominently and recommend local AI for users who are uncomfortable sending health data to cloud providers.

---

### 3.4 Wealth (exists, evolving)

**Purpose:** Financial clarity. What do I own, what do I owe, where is my money going?

**Subtabs:** Overview, Portfolio, Cash Flow (already built)

**Planned additions** (from existing build plan):
- Crypto as asset class (CryptoPro-inspired)
- Superannuation tracking (UniSuper pattern)
- Trade history and dividends
- Holding detail drill-down
- Cumulative % return chart (UniSuper-inspired)
- Category summary cards for cash flow
- FY-aware date presets

**AI Coaching Personality:**
The Wealth AI coach is **analytical and cautious**. It never gives financial advice — it surfaces patterns, asks questions, and helps with analysis. "Your portfolio is 72% equities — is that the allocation you intended?" not "You should diversify."

---

### 3.5 Wise (new)

**Purpose:** Inner development dashboard. Am I growing as a person?

This is the hardest tab to design because wisdom doesn't metric the way health and wealth do. The approach: track the *inputs* (time spent, consistency, depth) and let the AI coaching handle the *reflection*.

**Subtabs:**
- **Overview** — practice summary, reading log, recent reflections
- **Practices** — detailed view of all non-health, non-work life practices with coaching
- **Reading** — book log, reading pace, notes (dedicated surface)
- **Journal** — reflections, insights, questions (future)

#### Overview Subtab
Summary of the inner life:
- Practices active and consistency this week/month
- Current book (from reading practice logs)
- Recent AI coaching insights (pulled from coaching conversations)
- "Question of the week" — AI-generated reflective prompt based on current practice patterns

#### Practices Subtab
This is where the current meditation, music, language, and reading practice coaching moves to. Each practice gets a detail card with:
- **History** — structured entries with domain-specific metrics
- **Trends** — streak, consistency, depth indicators
- **AI coach** — domain-specific coaching (meditation coach notices "you've been consistent but haven't increased duration in 3 weeks — want to try extending by 2 minutes?")
- **Push to Execute** — "Add 20min meditation to Today" creates a task or practice reminder

#### Reading Subtab
A dedicated reading tracker that aggregates from the reading practice logs:
- Current book (extracted from log entries)
- Pages/sessions this week
- Books completed (manual log)
- Reading pace trend
- AI coaching: "You started 3 books this month but haven't finished any — want to focus on one?"

#### Practices Covered by Wise
Any practice where `coach_key` is NOT `gym`/exercise-related and `kind` is NOT `work_domain`:
- Meditation / mindfulness
- Reading
- Music (piano, guitar, etc.)
- Languages (Arabic, Spanish, etc.)
- Journaling / writing (personal)
- Philosophy / study
- Relationships / social
- Any user-defined practice that doesn't fit health or work

#### AI Coaching Personality
The Wise AI coach is **Socratic and reflective**. It asks more questions than it answers. It notices patterns in consistency and depth. It doesn't prescribe — it prompts reflection. "You've been meditating daily but your journal entries mention feeling scattered. What do you think is behind that?" It can reference across domains: "Your Arabic practice dropped off when your gym sessions increased — are you trading one for the other, or is something else going on?"

---

## 4. Cross-Domain Intelligence

The most powerful thing about having Health, Wealth, and Wise in one app is **correlation across domains**. The AI coaches should eventually be able to see the full picture:

| Signal | Source | Insight |
|---|---|---|
| Sleep < 6 hours | Health | "Your deep focus time dropped 40% on days after short sleep" (from Execute) |
| Gym skipped 3 days | Health | "Last time you skipped gym for a week, your meditation streak also broke" (from Wise) |
| Large unexpected expense | Wealth | "Your spending spiked this week — want to review whether it changes your savings runway?" |
| Reading streak broken | Wise | "You haven't read in 8 days. Your last entry said you were enjoying the book — what happened?" |
| Portfolio down 5% | Wealth | "Market is down but your allocation hasn't changed. Review, or stay the course?" |

This cross-domain awareness is a Phase 3+ feature. Initially each tab's AI coach only sees its own domain data. Over time, the system prompt can optionally include a cross-domain summary.

---

## 5. Practice Domain Routing

When a practice is created or edited, it needs to be routed to the correct domain tab for detailed coaching. The routing logic extends the existing `inferPracticeCoachKey()`:

```
coach_key          →  Domain Tab    →  Coaching Surface
────────────────────────────────────────────────────────
gym                →  Health        →  Exercise subtab
exercise           →  Health        →  Exercise subtab
running            →  Health        →  Exercise subtab
nutrition          →  Health        →  Nutrition subtab
sleep              →  Health        →  Sleep subtab
────────────────────────────────────────────────────────
meditation         →  Wise          →  Practices subtab
reading            →  Wise          →  Reading subtab
music              →  Wise          →  Practices subtab
language           →  Wise          →  Practices subtab
philosophy         →  Wise          →  Practices subtab
journal            →  Wise          →  Journal subtab
────────────────────────────────────────────────────────
research           →  Plan/Review   →  Work domain (stays)
revenue            →  Plan/Review   →  Work domain (stays)
────────────────────────────────────────────────────────
(unknown)          →  Wise          →  Practices subtab (default)
```

The routing is purely for UI placement — the underlying data model stays unified in `state.life_practices`.

---

## 6. Tab Navigation Design

With 5 tabs, the top navigation needs to scale. Options:

**Option A: Icon tabs with labels** (recommended)
```
[ ▶ Execute ]  [ 📋 Plan ]  [ 💪 Health ]  [ 💰 Wealth ]  [ 🧠 Wise ]
```
Icons help scannability. Labels prevent ambiguity. Works at current app widths.

**Option B: Collapsible groups**
```
[ Execute ]  [ Plan ]  [ ─── Life ▾ ── ]
                         Health | Wealth | Wise
```
Groups Health/Wealth/Wise under a "Life" dropdown. Saves horizontal space but adds a click. Probably unnecessary at 5 tabs.

**Option C: Sidebar navigation**
Move all tabs to a left sidebar. More scalable long-term but changes the entire app layout. Too disruptive for now.

**Recommendation:** Option A. Five tabs is fine — it's the same as Sharesight's nav (Investments, Tasks, Tools, Tax, Settings). Add tasteful icons. If we later add a 6th tab, revisit.

---

## 7. Mobile Companion Implications

The iPhone companion app becomes significantly more important with Health:

| Feature | Mobile Role | Desktop Role |
|---|---|---|
| Practice check-ins | Primary surface (quick taps) | Also available |
| Exercise logging | Primary (at the gym) | Review and coaching |
| Meal/nutrition logging | Primary (at meals) | Review and coaching |
| Sleep data | Auto-import from HealthKit | Display and analysis |
| Steps/heart rate | Auto-import from HealthKit | Display and analysis |
| Financial transactions | View only | Primary management |
| AI coaching | Quick questions | Deep conversations |
| Task management | Quick add/complete | Full pipeline |

The mobile app should prioritise Health logging and practice check-ins. The desktop app should prioritise analysis, coaching, and detailed configuration.

---

## 8. Build Sequence

| Phase | What | Effort | Dependencies |
|---|---|---|---|
| **Now** | Continue Wealth build (Phases 2a–3b) | In progress | — |
| **H1** | Add Health tab skeleton (Overview + Exercise) | 2 sessions | Existing practice data |
| **H2** | Move gym/exercise coaching from Review to Health | 1 session | H1 |
| **H3** | Add Wise tab skeleton (Overview + Practices + Reading) | 2 sessions | Existing practice data |
| **H4** | Move meditation/reading/music/language coaching from Review to Wise | 1 session | H3 |
| **H5** | Simplify Plan > Review (remove migrated coaching, keep streaks) | 1 session | H2, H4 |
| **H6** | Add tab icons and 5-tab navigation polish | 0.5 sessions | H1, H3 |
| **H7** | Health: nutrition subtab (manual logging) | 2 sessions | H1 |
| **H8** | Health: sleep subtab (manual + HealthKit prep) | 2 sessions | H1 |
| **H9** | Wise: journal subtab | 2 sessions | H3 |
| **H10** | Cross-domain AI awareness (system prompt enrichment) | 1 session | H2, H4 |
| **H11** | Mobile companion: HealthKit integration | 3+ sessions | Mobile app, H8 |

Phases H1–H6 can be done with existing data — no new backend, no new data model. It's primarily a UI redistribution + new tab shells. The practice coaching code already exists; it just needs to render in the right tab.

---

## 9. Data Model Impact

**Minimal.** The key insight is that `state.life_practices` already holds all practice data with domain routing via `coach_key`. The new tabs are primarily new *views* of existing data, not new data stores.

New state additions (future):

```javascript
state.health = {
  // Phase H7+
  nutrition_log: [],        // manual meal entries
  sleep_log: [],            // manual or HealthKit-imported sleep records
  vitals_log: [],           // weight, resting HR, BP
  healthkit_sync: {         // HealthKit integration metadata
    last_sync: null,
    enabled_types: []
  }
};

// state.life_practices — unchanged, already covers exercise, meditation, reading, etc.
// state.wealth — unchanged, already covers finances

// No new top-level state for Wise — it reads from state.life_practices
// where coach_key is in the "wise" domain set
```

---

## 10. Naming: "Wise" vs Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Wise** | Completes "Healthy, Wealthy, Wise" triad. Immediately understood. Classic. | Might feel presumptuous ("am I wise?") |
| **Mind** | Broader. Health=Body, Mind=Mental, Wealth=Money. | Overlaps with meditation (which is mind-body). Doesn't capture reading/languages/philosophy well. |
| **Growth** | Action-oriented. | Generic. Every tab is about growth. |
| **Inner** | Captures the personal/reflective nature. | Slightly vague. |
| **Practice** | Honest — it's about practices. | Already used for life practices. Confusing. |
| **Life** | Broad umbrella. | Too broad — the whole app is about life. |

**Recommendation:** "Wise" — it's the strongest because it completes the well-known triad. The slight awkwardness of "am I wise?" is actually a feature — it frames the tab as an aspiration, not a claim. And it immediately communicates what the product is about when someone sees "Healthy, Wealthy, Wise" in a screenshot or demo.

---

*Architecture proposed 13 March 2026. No code changes — design document only.*
