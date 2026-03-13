# Wealth Module — Sharesight-Informed Build Plan

> **Purpose:** Extend the existing build spec with features learned from auditing Sharesight.
> Maps each adoptable Sharesight pattern to a concrete build phase for PPP Flow.
>
> **Depends on:** WEALTH_BUILD_SPEC_v2.md (the engineering spec), SHARESIGHT_FEATURE_AUDIT.md (the audit)
>
> **Date:** 10 March 2026

---

## Current State

| Phase | Status | What shipped |
|-------|--------|-------------|
| Phase 0 | Done | Tab skeleton, manual accounts/transactions, net worth, cash flow |
| Phase 1a | Done | Portfolio model, holdings, manual pricing, allocation bars |
| Phase 1b | Done | Live price feeds (CoinGecko, Yahoo, frankfurter.app) |
| Phase 2 | Specced | Property records + estimator |
| Phase 2a | Specced | CSV watch folder import |

Everything below is **new work** informed by the Sharesight audit. It slots into and extends the existing sequence.

---

## Phase 1b — Live Price Feeds (shipped, no further changes)

**Build:** Tauri fetch bridge, CoinGecko adapter, Yahoo adapter, frankfurter.app adapter, refresh orchestration, stale/fresh UI.

No Sharesight-specific changes. Proceed as specced in WEALTH_BUILD_SPEC_v2.md §5–8.

**Sharesight-informed addition already adopted:** quote freshness is shown inline on the holding row (e.g. "CoinGecko · 3m ago") rather than as a detached status indicator.

---

## Phase 1c — Portfolio UX Polish (NEW — Sharesight-informed)

This phase takes the existing Phase 1a holdings table and brings it closer to Sharesight's UX quality. No new data model work — purely rendering and interaction improvements.

### 1c.1 Dual Display ($ + simple %)

**What Sharesight does:** Every return metric shows both percentage and absolute $. A "Percentages" toggle switches the holdings table columns.

**Build:**
- Add a `Percentages` toggle (boolean, stored in `state.wealth.display_percentages`)
- When ON: gain/loss views show simple total return % instead of $
- Simple return % = `((marketValue - costBasis) / costBasis) * 100`
- Summary cards already show absolute $; when toggle is ON, show simple return % for unrealised gain/loss
- Do not add annualised return yet

**Functions:**
```js
simpleReturnPct(costBasisMinor, marketValueMinor)
// Returns: number (percentage, e.g. 13.82)
// Uses simple total return: ((market - cost) / cost) * 100
// Edge cases: cost = 0 → return null
```

### 1c.2 Negative Values in Red

**What Sharesight does:** Capital losses and negative total returns render in red.

**Build:**
- Add negative-value styling in portfolio summary and holdings rows using the existing danger color
- Apply conditionally in `renderPortfolio()` when gain/loss < 0
- Apply to both $ and % views

### 1c.3 Sortable Holdings Table

**What Sharesight does:** Every column header is clickable to sort ascending/descending.

**Build:**
- Add `state.wealth.holdings_sort = { key: "marketValueMinor", dir: "desc" }`
- Column headers get click handlers that toggle sort
- Sort indicator (▲/▼) on active column
- `sortHoldingViews(holdingViews, sortKey, sortDir)` — pure function, sorts a copy

### 1c.4 Deferred: Date Range Presets

**What Sharesight does:** Today, 7D, 12M, YTD, FY, All — controls which time window is used for return calculations.

**Decision:** do not build this in Phase 1c.

**Reason:** date-range and annualised performance become misleading before `Phase 2b` adds real trade history and computed cost basis.

**Move to:** after `Phase 2b`, when returns can be grounded in trades instead of `added_at`.

### 1c.5 Summary Cards Rework

**What Sharesight does:** Five cards — Portfolio value, Capital gain, Income, Currency gain, Total return.

**Build for now (3 cards — we lack income and currency data):**

| Card | Source |
|------|--------|
| Portfolio value | `getPortfolioSnapshot().totalMarketValueMinor` |
| Unrealised gain/loss | `snapshot.unrealizedGainLossMinor` (toggle between $ and simple %) |
| Net worth (incl. accounts) | `wealthNetWorthCalc().net` |

Later when we have dividends → add Income card. When we have FX holdings → add Currency gain card.

### 1c.6 Holdings Row Badges

**What Sharesight does:** Orange badge with count of unconfirmed transactions per holding.

**Build:** Not yet needed — we have no transaction confirmation workflow. Add this in Phase 2a when CSV import ships.

### Estimated effort: 1–2 sessions

---

## Phase 2a — CSV Watch Folder Import (already specced, with additions)

Proceed as specced in WEALTH_BUILD_SPEC_v2.md §13. Add these Sharesight-informed enhancements:

### 2a+ Confirmation Workflow

**What Sharesight does:** Auto-detected transactions (dividends, corporate actions) go into a "Tasks" queue. User must explicitly confirm or edit before they become permanent.

**Build:**
- Add `status` field to imported transactions: `"pending" | "confirmed"`
- New transactions from CSV import default to `status: "pending"`
- Pending transactions appear in transaction lists with a visual indicator (dashed border or muted color)
- Default headline totals stay confirmed-only
- Optional secondary copy can show "including pending" values, but pending data must not silently contaminate top-line numbers
- Add a "Pending imports" banner at top of Cash Flow subtab when pending count > 0
- User can confirm individually or bulk-confirm
- Add `confirmTransaction(txnId)` and `confirmAllPending(accountId)` functions

### 2a+ Import History View

**What Sharesight does:** Tasks tab shows history of all auto-detected events.

**Build:**
- Small "Import history" section in Wealth settings
- Shows: filename, date imported, transaction count, bank, status (all confirmed / X pending)
- Option to "undo import" (removes all transactions from that file, removes hash from imported_files[])

---

## Phase 2b — Trade History Model (NEW — addresses biggest Sharesight gap)

This is the most impactful new phase from the audit. Without individual trade records, we can't compute true returns, track cost basis per lot, or show trade history on a per-holding basis.

### Data Model

```js
trade = {
  id,
  holding_id,
  trade_type,       // "buy" | "sell" | "opening_balance" | "split" | "merger"
  trade_date,       // ISO date
  units,            // number of units (positive for buy, positive for sell — type determines direction)
  price_minor,      // price per unit in minor units
  fees_minor,       // brokerage/fees in minor units
  total_minor,      // (units × price) + fees, in minor units
  status,           // "confirmed" | "pending"
  notes,
  created_at,
  source            // "manual" | "csv_import" | "opening_balance"
}
```

Extend `state.wealth`:
```js
state.wealth.trades = []    // all trades across all holdings
```

### Behaviour Changes

1. **Cost basis becomes computed, not entered.** When a user adds a holding, they enter their first "buy" trade (or "opening balance"). Cost basis = sum of all buy trades for that holding.

2. **Units become computed.** Total units = sum of buys − sum of sells (adjusted for splits).

3. **Backward compatibility.** Existing holdings without trades get a synthetic "opening_balance" trade created from their current `units` and `cost_basis_minor`.

### Functions
```js
normalizeTrades(incoming)
addTrade(holdingId, tradeType, date, units, priceMinor, feesMinor)
deleteTrade(tradeId)
editTrade(tradeId, changes)
getTradesForHolding(holdingId)
computeHoldingUnits(holdingId)         // sum of buys - sum of sells
computeHoldingCostBasis(holdingId)     // sum of (buy units × buy price + fees)
migrateHoldingsToTrades()              // one-time migration for existing holdings
```

### UI
- Holding detail view (see Phase 3a) shows trade list
- "Add trade" modal: date, type, units, price, fees
- Edit/delete on each trade row

### Estimated effort: 1–2 sessions

---

## Phase 2c — Dividend Tracking (NEW — Sharesight's 2nd biggest feature)

Dividends are ~6.6% p.a. of your portfolio return. Without them, our "total return" metric significantly understates reality.

### Data Model

```js
dividend = {
  id,
  holding_id,
  date_paid,        // ISO date
  amount_per_unit,  // float (dividends are commonly expressed as decimal per share)
  gross_minor,      // total gross payment in minor units
  franking_minor,   // franking credits in minor units (AU-specific)
  net_minor,        // net payment in minor units
  reinvested,       // boolean — was this DRP'd?
  status,           // "confirmed" | "pending"
  source,           // "manual" | "csv_import" | "auto_detected"
  created_at
}
```

Extend `state.wealth`:
```js
state.wealth.dividends = []
```

### Behaviour Changes

1. **Total return = capital gain + income.** Summary card now shows:
   - Capital gain: (market value − cost basis) as % p.a. + $
   - Income: sum of dividends as % p.a. + $ (annualised against cost basis)
   - Total return: capital + income

2. **Per-holding income.** Each holding row gets an Income column showing dividends received for that holding.

3. **Franking credits.** Stored for tax-time reference. Not used in return calculations but displayed in holding detail.

### Functions
```js
normalizeDividends(incoming)
addDividend(holdingId, datePaid, grossMinor, frankingMinor, netMinor, reinvested)
deleteDividend(dividendId)
getDividendsForHolding(holdingId)
totalDividendIncome(holdingId, startDate, endDate)    // sum of net_minor in range
portfolioTotalIncome(startDate, endDate)              // sum across all holdings
incomeReturnPct(totalIncomeMinor, costBasisMinor, days)  // annualised income yield
```

### Future Enhancement
When CSV import detects transactions that look like dividends (keyword matching: "DIVIDEND", "DRP", "DISTRIBUTION"), auto-create dividend records with `status: "pending"` for user confirmation.

### Estimated effort: 1 session

---

## Phase 3a — Holding Detail View (NEW — Sharesight's drill-down pattern)

Currently we show a flat table. Sharesight lets you click into any holding to see its full story.

### UX

Clicking a holding row in the Portfolio table opens a **detail panel** (inline expand or modal — not a separate page, since we're a single-file app).

### Detail Panel Contents

**Header:** Logo placeholder + display_symbol + name + current value

**Summary section:**
- Current value: price × units = total
- Total return: capital gain % p.a. + income % p.a. = total return % p.a.
- Cost basis: total invested

**Trades tab:** Table of all trades for this holding (from Phase 2b)
- Date, Type, Qty, Price, Fees, Value, Status

**Dividends tab:** Table of all dividends (from Phase 2c)
- Date paid, Amount/unit, Gross, Franking, Net, Reinvested

**Price chart (stretch):** Simple sparkline of price history. Would require storing historical quotes — skip for v1, show "price as of [date]" instead.

### Functions
```js
renderHoldingDetail(holdingId)
// Reads from holdings, trades, dividends, quotes
// Renders inline panel below the clicked row (accordion-style)
```

### Estimated effort: 1 session

---

## Phase 3b — Portfolio Chart (NEW — Sharesight's stacked area chart)

### What Sharesight Does
Stacked area chart showing how each holding contributes to total portfolio value over time.

### Simplified Version for PPP Flow
We won't have historical daily price data (we'd need to store snapshots). Instead:

**Option A — Monthly snapshots:** Each time the user opens Wealth, store a snapshot of portfolio value. Over months this builds a history.

```js
state.wealth.snapshots = [
  { date: "2026-03-10", total_minor: 30197190, by_holding: { "BHP": 8468319, ... } }
]
```

**Option B — Skip for now.** Show allocation pie/donut chart instead (we already have allocation bars). Add a proper time-series chart once we have 3+ months of snapshots.

**Recommendation:** Ship Option A (snapshot collection) silently, build the chart in a later phase once there's data to show.

### Estimated effort: 0.5 sessions (snapshot collection only)

---

## Updated Build Sequence

| Step | Phase | Description | Depends on | Effort |
|------|-------|-------------|-----------|--------|
| ~~1~~ | ~~0~~ | ~~Tab skeleton, manual entry, cash flow~~ | — | ~~Done~~ |
| ~~2~~ | ~~1a~~ | ~~Portfolio model, holdings, manual pricing~~ | ~~0~~ | ~~Done~~ |
| 3 | 1b | Live price feeds + Tauri bridge | 1a | 2 sessions |
| 4 | **1c** | **Portfolio UX polish** (dual display, sort, date range, red negatives) | 1a | 1–2 sessions |
| 5 | 2a+ | CSV import + confirmation workflow | 0, 1b (for Tauri bridge) | 2 sessions |
| 6 | **2b** | **Trade history model** + migration | 1a | 1–2 sessions |
| 7 | **2c** | **Dividend tracking** | 2b | 1 session |
| 8 | 2 | Property records + estimator | 0 | 2 sessions |
| 9 | **3a** | **Holding detail view** (drill-down) | 2b, 2c | 1 session |
| 10 | **3b** | **Portfolio snapshots** (background collection) | 1b | 0.5 sessions |

**Bold** = new phases from Sharesight audit.

### Recommended Order of Attack

**Steps 3 and 4 can be built in parallel** — 1b is backend/adapter work, 1c is frontend/rendering work. Neither depends on the other.

**Steps 5 and 6 are independent** — CSV import feeds cash flow, trade history feeds portfolio. Build whichever Codex or you prefer first.

**Step 7 (dividends) should follow step 6 (trades)** — same data model pattern, and dividends reference holdings.

**Step 8 (property) is independent** — can be built at any point. Lower priority since it's the hardest to validate.

**Steps 9 and 10 are polish** — build once the core data flows are working.

---

## What We're Explicitly NOT Building (from Sharesight)

| Feature | Why not |
|---------|---------|
| Tax reports (CGT, taxable income) | Complex AU tax rules; leave to Sharesight/accountant |
| Broker integrations | Partnership/compliance overhead; CSV is our model |
| Trade confirmation email parsing | Fragile; too many broker email formats |
| ETF look-through (exposure analysis) | Requires fund composition data feeds |
| Benchmark comparison | Requires index price history; low value for personal dashboard |
| Multi-portfolio support | Single portfolio is enough for personal use |
| Sharing / collaboration | Single-user app |
| Custom grouping dimensions (sector, industry) | Requires enrichment data source; asset_type grouping is sufficient for now |

---

## Summary

The Sharesight audit identified **6 concrete things** we should build that we weren't planning to:

1. **Dual % / $ display** — small effort, big readability win
2. **Sortable columns** — table QoL
3. **Date range presets** — scopes return calculations
4. **Trade history model** — unlocks accurate cost basis and returns
5. **Dividend tracking** — captures missing ~6.6% p.a. of your return
6. **Holding detail drill-down** — per-holding story view

And **2 patterns** to weave into existing planned work:

7. **Confirmation workflow** — add to CSV import (already specced)
8. **Red negative values** — trivial CSS, apply everywhere

Total additional effort estimate: ~5–7 sessions on top of the already-specced work.
