# PPP Flow Wealth Build Spec (v2)

Date: 2026-03-09  
Status: Build spec - not yet implemented  
Owner: Product + Engineering  
Supersedes: `Wealth Tab Build Plan.docx` as implementation source

## 1) Purpose
This document is the engineering build spec for the next Wealth module phases after Phase 0.

Phase 0 already shipped:
- top-level `Wealth` tab
- `Overview` and `Cash Flow` subtabs
- manual account entry
- manual transaction entry
- simple net worth and monthly cash flow rendering

This v2 spec tightens the next phases by:
1. correcting schema decisions
2. making backend/API prerequisites explicit
3. defining safer sequencing
4. adding confidence and freshness rules
5. reducing false precision in property estimates

High-level product intent still lives in:
- [WEALTH_MODULE_PRD_v1.md](/Users/julianwaterslynch/Workspace/PPP%20Operating%20System/09_Productization/ppp-flow-desktop/design/WEALTH_MODULE_PRD_v1.md)

## 2) Scope of This Spec
This spec covers:
1. Portfolio valuation with live price feeds
2. Property estimate support
3. Data model extensions required for both
4. Rendering and refresh behavior

This spec does not cover:
1. bank/open-banking integrations
2. brokerage account APIs
3. AI wealth coach implementation
4. PDF/CSV import pipeline
5. tax logic

## 3) Design Constraints
1. `Wealth` remains a separate top-level module.
2. Existing `Execute` and `Review` flows must not become slower or visually noisier.
3. All financial data stays under `state.wealth`.
4. New features must degrade safely when offline or when prices are stale.
5. Estimates must present freshness and confidence, not false certainty.

## 4) Corrected Data Model

### 4.1 Money Representation
Use integer minor units for stored amounts.

Rule:
1. Store AUD values as integer cents, not floats.
2. Store foreign-currency cash balances in minor units of that currency plus explicit currency code.
3. Convert to display strings only in formatting functions.

Examples:
```js
// Good
opening_balance_minor: 15050 // AUD 150.50
amount_minor: 999 // AUD 9.99

// Do not store
opening_balance: 150.5
amount: 9.99
```

Migration note:
Phase 0 currently stores floats. Before live portfolio logic is added, migrate Wealth money fields to minor units.

### 4.2 Wealth State Extension
Extend `state.wealth` with:

```js
state.wealth = {
  accounts: [],
  transactions: [],
  currency: "AUD",

  holdings: [],
  price_quotes: {},
  fx_quotes: {},
  properties: [],
  property_estimates: {}
}
```

### 4.3 Holdings
Do not overload a single `ticker` field.

Use:
```js
holding = {
  id,
  account_id,
  asset_type,          // stock | etf | crypto | cash_fx
  display_symbol,      // what user sees: BTC, ETH, CBA.AX, VAS.AX
  provider_symbol,     // lookup key: bitcoin, ethereum, CBA.AX
  provider,            // coingecko | yahoo | manual
  name,
  units,               // may remain float for shares/crypto quantity
  cost_basis_minor,    // AUD cents
  quote_currency,      // AUD | USD | EUR | ...
  added_at
}
```

Rationale:
1. `BTC` is not the same as `bitcoin`
2. providers use different identifiers
3. the app needs both user-facing and provider-facing forms

### 4.4 Price Quotes
Use a normalized quote cache, not only a generic `price_cache`.

```js
price_quote = {
  provider_symbol,
  provider,            // coingecko | yahoo | manual
  price_minor_aud,     // AUD cents
  quote_currency,      // original provider currency
  source_price_raw,    // numeric source price before conversion
  fetched_at,
  stale_after_ms,
  stale,               // boolean derived on read/render
  error                // null | string
}
```

Store under:
```js
state.wealth.price_quotes[provider + ":" + provider_symbol] = price_quote
```

### 4.5 FX Quotes
```js
fx_quote = {
  base_currency,
  quote_currency,
  rate_numerator,
  rate_denominator,
  fetched_at,
  stale_after_ms,
  stale,
  source
}
```

Implementation note:
Do not use raw floats as canonical conversion state if avoidable. If the provider returns a float rate, store the raw rate for diagnostics but convert deterministically when computing AUD values.

### 4.6 Properties
```js
property = {
  id,
  label,
  address,
  property_type,       // house | apartment | townhouse | land | other
  bedrooms,
  land_sqm,
  purchase_price_minor,
  purchase_date,
  region_code,
  manual_estimate_minor,   // optional
  comparables: [],
  created_at,
  updated_at
}

comparable = {
  id,
  address,
  sold_price_minor,
  sold_date,
  bedrooms,
  distance_km,
  notes
}
```

### 4.7 Property Estimate Output
Do not render only a single value.

```js
property_estimate = {
  property_id,
  estimated_value_minor,
  low_minor,
  high_minor,
  confidence,          // low | medium | high
  freshness_label,     // e.g. "ABS Dec 2025 · 2 comps"
  method,              // weighted_average
  breakdown: {
    signal_a_minor,
    signal_b_minor,
    signal_c_minor,
    weights: { a, b, c }
  },
  estimated_at
}
```

## 5) API / Backend Prerequisites
The previous plan treated Rust-side fetching as an implementation note. It is a prerequisite.

### 5.1 Required Before Live Feeds
One of the following must exist before price feeds ship:
1. a Tauri command that performs outbound HTTP fetches and returns normalized JSON, or
2. a local trusted proxy for dev-only browser mode

Recommendation:
Use a Tauri command for all Wealth HTTP requests.

Reasons:
1. avoids CORS problems
2. keeps API details out of renderer logic
3. centralizes rate limiting and error handling
4. matches the long-term security model better

Suggested command shape:
```rust
invoke("wealth_http_fetch", {
  request_type: "crypto_prices" | "stock_quote" | "fx_rates",
  symbols: [...],
  options: {...}
})
```

### 5.2 Dev/Prod Behavior
Renderer should never assume direct browser fetch is safe.

Rules:
1. use invoke bridge when available
2. in browser-only dev mode, clearly mark Wealth live feeds as unavailable unless a local proxy exists
3. do not silently fail into zero prices

## 6) Safer Phase Order

### Phase 1a: Portfolio Model + UI
Build:
1. holdings data model
2. quote cache model
3. `Portfolio` subtab shell
4. manual holding entry
5. manual per-holding override price entry
6. market value / gain-loss rendering

Why first:
1. validates portfolio UX without API dependency
2. proves the tab earns its space
3. lets the user use the feature immediately

### Phase 1b: Live Prices
Add:
1. CoinGecko crypto pricing
2. frankfurter FX conversion
3. Yahoo stock/ETF quote adapter
4. refresh orchestration
5. freshness display

Recommendation:
Ship 1a and 1b close together, but do not hard-couple them. The UI should remain usable with manual prices if feeds fail.

### Phase 2: Property Records
Build:
1. manual property records
2. comparable sales entry
3. static ABS-style growth lookup
4. estimator output with confidence/freshness/breakdown

Do not build property APIs yet.

## 7) Price Feed Strategy

### 7.1 Crypto - CoinGecko
Primary source:
- CoinGecko simple price endpoint

Use:
1. batched requests
2. provider symbol map for common assets
3. short TTL because crypto moves faster

Recommended TTL:
- 5 minutes

### 7.2 FX - frankfurter.app
Primary source:
- frankfurter.app

Use:
1. one request for needed currencies
2. long TTL
3. source/freshness display

Recommended TTL:
- 24 hours

### 7.3 Stocks / ETFs - Yahoo Adapter
Treat Yahoo as an adapter, not a foundational guarantee.

Primary source for v1:
- Yahoo Finance chart endpoint adapter

Fallback path:
- swap adapter implementation later if Yahoo breaks

Design rule:
1. all quote logic depends on `fetchStockQuote()`
2. nothing else in the module should know Yahoo-specific response shapes

Recommended TTL:
- 60 minutes

## 8) Price Refresh Rules
Refresh triggers:
1. user opens `Wealth` and a visible quote is stale
2. user presses `Refresh Prices`
3. optional timed poll only while `Wealth` is active

Rules:
1. stale prices render immediately with a stale badge
2. refresh is non-blocking
3. failures do not zero out last known prices
4. every row shows source + freshness

Freshness display examples:
1. `CoinGecko · 3m ago`
2. `Yahoo · 48m ago`
3. `Manual price · set today`
4. `Stale · last updated 7h ago`

## 9) Portfolio UI Spec
Add `Portfolio` between `Overview` and `Cash Flow`.

### 9.1 Portfolio Summary
Show:
1. total market value
2. total cost basis
3. unrealized gain/loss
4. allocation by asset type
5. stale quote warning count

### 9.2 Holdings Table
Columns:
1. symbol
2. name
3. asset type
4. units
5. current price
6. market value
7. cost basis
8. gain/loss
9. freshness/source

### 9.3 Add Holding Modal
Fields:
1. account
2. asset type
3. display symbol
4. provider symbol
5. name
6. units
7. cost basis
8. quote currency
9. provider

Validation:
1. required account
2. required symbols
3. positive units
4. non-negative cost basis

### 9.4 Manual Price Fallback
Each holding should support a manual price override for MVP robustness.

If live feed unavailable:
1. show manual price action
2. store it with source = `manual`
3. do not block portfolio usage

## 10) Property Estimator Rules
The estimator should be presented as a household planning aid, not a valuation engine.

### 10.1 Signals
Use up to three signals:
1. growth-adjusted purchase price
2. comparable sales weighted average
3. optional manual/external estimate

### 10.2 Weighting
Default weights:
1. A = 0.3
2. B = 0.5
3. C = 0.2

If signal C missing:
1. renormalize A and B

If comparables missing:
1. fall back to A
2. show low confidence
3. prompt user to add comparables

### 10.3 Confidence Rules
Do not infer confidence from vibes. Use explicit rules.

Example heuristic:
- `High`
  - 3+ comparables
  - latest comparable <= 90 days
  - same bedroom count or adjusted comparables
  - regional growth data <= 6 months old
- `Medium`
  - 2 comparables or older data
  - manual estimate available
- `Low`
  - 0 to 1 comparable
  - old growth data
  - no manual estimate

### 10.4 Freshness Rules
Property cards should show:
1. last comparable recency
2. growth dataset vintage
3. date of last estimate

Example:
- `Medium confidence · 2 comps · ABS Dec 2025`

### 10.5 Accuracy Claims
Do not claim “within 5-10% of reality.”

Reason:
1. unvalidated
2. market-dependent
3. legally and product-wise unnecessary

## 11) Static Regional Growth Table
For Phase 2, ship a static lookup table in code or a checked-in JSON/JS constant.

Structure:
```js
REGIONAL_GROWTH = {
  "NSW_SYDNEY_INNER": {
    annual_growth_bps: 420,
    updated_at: "2025-12-31",
    source: "ABS 6416.0"
  }
}
```

Use basis points instead of floats where practical.

Fallback:
1. national median bucket
2. clear label that regional precision is unavailable

## 12) Functions to Build

### Phase 1a / 1b
```js
normalizeHoldings(incoming)
normalizePriceQuotes(incoming)
normalizeFxQuotes(incoming)

addHolding(...)
deleteHolding(...)
setManualHoldingPrice(...)

holdingMarketValueMinor(holding)
portfolioSummary()
renderPortfolio()

fetchCryptoPrices(providerSymbols)
fetchStockQuote(providerSymbol)
fetchFxRates(currencies)
refreshPriceQuotes()
quoteFreshnessLabel(quote)
```

### Phase 2
```js
normalizeProperties(incoming)
normalizePropertyEstimates(incoming)

addProperty(...)
deleteProperty(...)
addComparable(...)
deleteComparable(...)

getRegionalGrowthRate(regionCode)
recencyWeight(soldDate)
proximityWeight(distanceKm)
bedroomAdjustment(subjectBeds, compBeds)
estimatePropertyValue(propertyId)
refreshAllPropertyEstimates()
renderProperties()
```

## 13) Build Sequence
1. migrate Phase 0 money fields to integer minor units
2. extend `state.wealth` schema with holdings / quotes / properties
3. build Portfolio subtab UI with manual holdings
4. add manual price override path
5. add Tauri wealth fetch bridge
6. add CoinGecko adapter
7. add frankfurter adapter
8. add Yahoo stock adapter
9. add quote refresh orchestration and stale/fresh UI
10. add property records and comparable entry
11. add static regional growth table
12. add estimator with confidence/freshness/breakdown

## 14) Testing Guidance
Portfolio test set:
1. BTC
2. ETH
3. SOL
4. CBA.AX
5. VAS.AX
6. one USD cash balance

Property test set:
1. one property
2. three comparables with different recency and distance
3. one manual estimate

Edge cases:
1. stale quotes
2. missing FX
3. deleted holding with cached quote
4. missing comparables
5. negative net worth
6. archived accounts

## 15) Acceptance Criteria

### Portfolio
1. User can add a holding manually and see market value using a manual price.
2. User can refresh crypto and equity prices and see updated valuations.
3. Quotes show source and freshness.
4. If a source fails, the last known quote remains visible and marked stale.

### Property
1. User can create a property record.
2. User can add comparables.
3. App produces an estimated value with breakdown.
4. App shows confidence and freshness.
5. App never presents the estimate as a definitive valuation.

## 16) Architecture Notes
1. Keep all Wealth state under `state.wealth`.
2. Keep rendering additive; do not destabilize Phase 0 Overview/Cash Flow.
3. Use `escapeHtml()` for all user-provided strings.
4. Keep provider adapters swappable.
5. Renderer should not know provider-specific quirks beyond normalized output.
6. Manual fallback must always exist for prices and properties.

## 17) Recommendation
Treat this as the implementation source for the next Wealth phases.

Do not start coding from the `.docx`.
Use this file plus the higher-level PRD.
