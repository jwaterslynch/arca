# UniSuper UI Patterns — Ideas for Arca

> **Purpose:** Document useful UI patterns observed in UniSuper's member portal that could enhance Arca's Wealth tab.
>
> **Source:** memberonline.unisuper.com.au (logged in as Julian Waters-Lynch, 12 March 2026)
>
> **Depends on:** WEALTH_SHARESIGHT_BUILD_PLAN.md, UNISUPER_HOLDINGS.md

---

## 1. Cumulative % Return Chart

**What UniSuper does:**
The Investment Performance page shows a line chart of cumulative percentage return over time for each investment option. Jules's view shows two lines — High Growth and Sustainable High Growth — plotted on the same chart so you can visually compare how each option performed.

The Y-axis is percentage return (not dollar value), which makes it easy to compare options regardless of how much money is in each one. The chart showed FYTD performance from July 2025 to March 2026, ranging from 0% to roughly +8%.

**Date range presets:** FYTD, 1M, 3M, 1Y, 3Y, 5Y, 10Y — selectable via horizontal pill buttons above the chart.

**CSV download:** A "Download daily cumulative rates" button exports the raw data, which means UniSuper stores daily cumulative return data for each option.

**How to adopt in Arca:**

This maps to **Phase 3b (Portfolio Snapshots)** from the Sharesight build plan. The key insight is that a percentage-based return chart is more useful than a raw dollar chart for comparing investments of different sizes.

Build steps:
- Store daily or weekly portfolio snapshots as cumulative % return (not just dollar value)
- For each holding or group, compute: `((currentValue - startValue) / startValue) * 100`
- Render as multi-line chart where each holding/group gets its own line
- Add date range preset pills: 1M, 3M, 1Y, YTD, FY, All
- Initially useful for comparing asset types (crypto vs stocks vs property) or individual holdings

**Where it fits:** New component in Portfolio subtab, below the summary cards. Show only when 30+ days of snapshot data exists.

**Estimated effort:** 0.5 sessions (once snapshot collection from Phase 3b is running)

---

## 2. Transaction Category Summary Cards

**What UniSuper does:**
The Transactions page shows a row of category summary cards at the top, each displaying a category name and total for the selected period:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Contributions &  │  │ Investment       │  │ Administration   │
│ roll-ins         │  │ returns          │  │ fee              │
│                  │  │                  │  │                  │
│ $0.00            │  │ $4,939.20        │  │ -$56.00          │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

These give an instant high-level breakdown of what happened in the period before the user even looks at individual transactions. Negative values (fees) are visually distinct.

**How to adopt in Arca:**

This maps to the **Cash Flow subtab** (already built in Phase 0). Currently the Cash Flow view shows individual transactions in a list. Adding category summary cards above the transaction list would give users an instant snapshot of their financial activity.

Suggested categories for Arca:
- **Income** — salary, dividends, interest (sum of positive non-transfer transactions)
- **Spending** — expenses, bills, subscriptions (sum of negative non-transfer transactions)
- **Investments** — buy/sell activity, super contributions (transfers to/from portfolio)
- **Net cash flow** — income minus spending

Build steps:
- Aggregate transactions by category for the selected period
- Render 3–4 summary cards above the transaction list
- Colour-code: green for positive, red for negative
- Cards are purely derived from existing transaction data — no new data model needed

**Where it fits:** Enhancement to existing Cash Flow subtab rendering.

**Estimated effort:** 0.5 sessions

---

## 3. Financial Year Tab Selectors

**What UniSuper does:**
Transactions can be filtered by financial year using prominent tab buttons: **This FY** | **Last FY** | **Pick date range**

This is simpler than Sharesight's date range presets (Today, 7D, 12M, YTD, FY, All) but highly effective for Australian users because so much financial activity is organised around the 1 Jul – 30 Jun financial year.

**How to adopt in Arca:**

When we build date range presets (currently deferred to after Phase 2b per the build plan), include FY-aware presets. Specifically:

- **This FY** — 1 Jul of current FY to today
- **Last FY** — 1 Jul to 30 Jun of the previous financial year
- **YTD** — 1 Jan to today (calendar year)
- **Custom** — date picker

The Australian financial year runs July to June, so:
```js
function getCurrentFYStart() {
  const now = new Date();
  const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(year, 6, 1); // 1 July
}

function getLastFYRange() {
  const thisStart = getCurrentFYStart();
  const lastStart = new Date(thisStart.getFullYear() - 1, 6, 1);
  const lastEnd = new Date(thisStart.getFullYear(), 5, 30); // 30 June
  return { start: lastStart, end: lastEnd };
}
```

**Where it fits:** Phase 1c date range presets (deferred until after Phase 2b).

**Estimated effort:** Included in the existing date range work — just ensure FY presets are in the list.

---

## 4. Allocation Donut Charts

**What UniSuper does:**
The "Your investments" page shows three donut charts side by side:

1. **Existing balance** — how current money is split across options
2. **Future contribution strategy** — where new employer/member contributions will go
3. **Future rollover strategy** — where rollovers from other funds will go

Each donut shows the percentage split with a legend. For Jules this is 50/50 High Growth / Sustainable High Growth across all three.

The asset class breakdown also uses a pie chart: International Shares 53.97%, Australian Shares 39.02%, Infrastructure & Private Equity 5.49%, Property 1.52%.

**How to adopt in Arca:**

We currently show allocation as **horizontal stacked bars** (built in Phase 1a). Donut charts are a natural complement — they work better for showing a small number of categories (3–6 slices) while bars work better for many categories.

Suggested approach:
- **Portfolio subtab:** Show a donut chart for asset class allocation (crypto, stocks, property, super, cash) alongside the existing bars
- The donut provides a quick visual ratio; the bars provide detail per holding
- Use the donut as a compact summary widget, not a replacement for bars

Build steps:
- SVG donut chart component (pure CSS/SVG, no library needed)
- Input: array of `{ label, value, color }` segments
- Render as a ring with percentage labels
- Place above or beside the holdings table in Portfolio subtab

```js
function renderDonutChart(segments, size = 120) {
  // segments: [{ label: "Crypto", value: 12450, color: "#F7931A" }, ...]
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumulative = 0;

  return segments.map(seg => {
    const pct = seg.value / total;
    const startAngle = cumulative * 360;
    cumulative += pct;
    const endAngle = cumulative * 360;
    return { ...seg, pct, startAngle, endAngle };
  });
}
```

**Where it fits:** Phase 1c (Portfolio UX Polish) — alongside the existing allocation bars.

**Estimated effort:** 0.5 sessions

---

## 5. Investment Option Comparison View

**What UniSuper does:**
The performance chart overlays multiple investment options on a single chart, making it trivial to compare their returns over the same period. You can toggle options on/off.

**How to adopt in Arca:**

This is essentially the multi-line version of Pattern #1 above. Once we have cumulative return data, we can let users compare:
- Individual holdings against each other
- Asset classes against each other (e.g. "how did my crypto do vs my stocks this year?")
- Their portfolio vs a simple benchmark (e.g. a manually-entered index return)

The comparison view doesn't need its own phase — it's a rendering option on the cumulative return chart from Pattern #1.

**Where it fits:** Phase 3b extension — add toggle checkboxes to select which lines appear on the chart.

**Estimated effort:** Included in Pattern #1 effort.

---

## 6. Preserved / Non-Preserved Balance Breakdown

**What UniSuper does:**
The Balance Summary page shows the split between preserved and non-preserved super benefits. This is an Australian superannuation concept — preserved funds can't be accessed until retirement conditions are met, while non-preserved funds may be accessible earlier.

**How to adopt in Arca:**

This is specific to super fund tracking. If we implement **Option C** from UNISUPER_HOLDINGS.md (tracking super via published fund returns), we could show:
- Total super balance
- Preserved vs non-preserved split (manually entered, since this data isn't available via public APIs)
- A note about preservation rules and access conditions

For now, this is informational only. File under "nice to have" for the super tracking enhancement.

**Where it fits:** Future super-specific enhancement, not in current build plan.

---

## Summary: Patterns to Adopt

| Pattern | Priority | Maps to Phase | Effort |
|---------|----------|---------------|--------|
| Cumulative % return chart | High | 3b (Snapshots) | 0.5 sessions |
| Transaction category summary cards | Medium | Cash Flow enhancement | 0.5 sessions |
| Financial year tab selectors | Medium | 1c (Date range presets, deferred) | Included |
| Allocation donut charts | Low | 1c (UX Polish) | 0.5 sessions |
| Investment comparison overlay | Low | 3b extension | Included |
| Preserved/non-preserved split | Low | Future super enhancement | — |

### Recommended Priority

1. **Cumulative % return chart** — This is the highest-impact pattern. Once Phase 3b snapshot collection is running, this chart becomes the primary way to visualise portfolio performance over time. It's more useful than a raw dollar chart because it normalises for portfolio size.

2. **Transaction category cards** — Quick win that improves the existing Cash Flow subtab with zero new data model work.

3. **FY selectors + donut charts** — Nice polish items that slot into existing Phase 1c work.

---

*Patterns documented from UniSuper Member Online, 12 March 2026.*
