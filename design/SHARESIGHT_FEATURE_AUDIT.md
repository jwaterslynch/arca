# Sharesight Feature Audit

> **Purpose:** Document Sharesight's portfolio tracking features and UX patterns as a reference template for Arca's Wealth module.
>
> **Audited:** 10 March 2026 — Free tier, single ASX-only portfolio

---

## 1. Information Architecture

Sharesight uses a **five-tab** top-level navigation:

| Tab | Purpose |
|-----|---------|
| **Investments** | Portfolio overview — the main dashboard |
| **Tasks** | Pending actions (unconfirmed dividends, corporate actions) |
| **Tools** | Analytical reports (performance, allocation, contribution) |
| **Tax** | Tax-specific reports (CGT, taxable income, historical cost) |
| **Settings** | Portfolio config (name, tax residency, FY end, integrations, labels, cash accounts) |

Each holding also has its own detail page with sub-tabs: Summary, Trades & income, Notes & files, News, Edit holding.

**Key insight:** Sharesight separates *viewing* (Investments), *acting* (Tasks), *analysing* (Tools/Tax), and *configuring* (Settings). This is a good pattern for Arca — our current single Portfolio subtab tries to do everything at once.

---

## 2. Investments Tab (Main Dashboard)

### 2.1 Controls Bar

- **Date range:** Quick presets (Today, 7D, 12M, YTD, FY, All) plus custom date picker with start/end dates
- **Group by:** Market, Currency, Sector classification, Industry classification, Investment type, Country, Do not group, Manage Custom Groups
- **Toggles:** "Include closed positions" checkbox, "Show graph" checkbox
- **Actions:** "Share checker" button, "+ Add investment" button

### 2.2 Summary Metric Cards

Five cards displayed in a horizontal row:

| Metric | Display format | Example |
|--------|---------------|---------|
| Portfolio value | Absolute $ | AU$301,971.90 |
| Capital gain | % p.a. + absolute $ | 13.82% p.a. / $58,101.20 |
| Income | % p.a. + absolute $ | 6.64% p.a. / $27,905.52 |
| Currency gain | % p.a. + absolute $ | 0.00% p.a. / $0.00 |
| Total return | % p.a. + absolute $ | 20.46% p.a. / $86,006.72 |

**Pattern:** Every return metric shows both annualised % *and* absolute $. This dual display is very useful and we should adopt it.

### 2.3 Portfolio Chart

- **Chart type dropdown:** "Value - Stacked" (area chart showing per-holding contribution over time)
- Subtitle shows context: "Since first purchase | Grouped by Market | Open and closed positions"
- Time axis auto-scales to date range selection
- Y-axis shows AUD values (50k, 100k, 150k, etc.)

### 2.4 Benchmark Performance

- Paid feature — compare portfolio return against an index-tracking ETF or other instrument
- Prominent upsell CTA on free tier

### 2.5 Holdings Table

**Default visible columns:**

| Column | Sortable | Description |
|--------|----------|-------------|
| Logo + Ticker (e.g. "BHP \| ASX") | Yes | Company logo icon, ticker link, full name below |
| Price | Yes | Current market price in local currency |
| Quantity | Yes | Number of units held |
| Value | Yes | Current market value (price × qty) |
| Capital gains | Yes | Unrealised gain/loss — **red for negative** |
| Income | Yes | Dividends received in period |
| Currency | Yes | FX gain/loss (0.00 for single-currency) |
| Return | Yes | Total return = capital + income + currency |

**Hidden columns available via "Edit table":**
- Label
- Average buy price

**Table features:**
- **Percentages toggle** — switches Capital gains, Income, Currency, Return columns from absolute $ to annualised % p.a.
- **Edit table dropdown** — checkboxes to show/hide columns, drag handles to reorder, "Reset to default" button
- **Totals row** at bottom with portfolio-wide sums
- **Badge numbers** (orange circles) on each holding row — these are unconfirmed transaction counts
- **"Delisted" tag** shown on delisted securities (e.g. VUK)
- Each holding row is clickable → navigates to holding detail page

---

## 3. Holding Detail Page

### 3.1 Summary Sub-tab

- **Header:** Logo, Ticker | Market, Full company name, breadcrumb nav
- **Current value card** (right side): Price × Qty = Total
- **Price comparison widget** (right side): horizontal bar showing current price vs target price, with "Add target price" option
- **Summary metrics:** Total return, Capital gain, Dividends — each as % p.a. + absolute $
- **Price chart:** Graph type selector (Graph Price), date range selector, "Include closed positions" toggle

### 3.2 Trades & Income Sub-tab

Two tables:

**All trades & adjustments:**
| Column | Description |
|--------|-------------|
| Date | Trade date |
| Type | Opening balance, Buy, Sell, etc. |
| Quantity | Units traded |
| Price | Trade price |
| Fees | Brokerage fees, with separate cost base column |
| Value | Total trade value |
| Status | Confirmed / Unconfirmed |

**All dividends:**
| Column | Description |
|--------|-------------|
| Date paid | Payment date |
| Amount per share | Per-share dividend |
| Gross payment | Total gross |
| Cost base adj. | DRP cost base adjustment |
| Franking credits | Australian tax credits |
| Net payment | After-tax amount |
| Reinvested | Yes/No flag |
| Status | Confirmed / Unconfirmed / Pending payment |

**Key pattern:** Sharesight auto-detects corporate actions (dividends, splits, name changes) and presents them as "Tasks" requiring user confirmation. This is their killer workflow — the user doesn't have to manually enter dividends.

### 3.3 Notes & Files Sub-tab
- Attach notes and documents to individual holdings

### 3.4 News Sub-tab
- Shows relevant news articles for the holding

### 3.5 Edit Holding
- Modify holding details, change market, etc.

---

## 4. Tasks Tab

- **Confirm transactions** — the main workflow
- Lists all unconfirmed automatic transactions grouped by holding
- Each transaction can be individually confirmed or edited
- Bulk "Select all" + "Confirm transactions" buttons at bottom
- Filter by: search (investment name), registry

**Why this matters for Arca:** When we build CSV import, we should adopt a similar confirmation workflow. Imported transactions should be "pending" until the user confirms them.

---

## 5. Tools Tab

### 5.1 Performance Reports

| Tool | Description |
|------|-------------|
| **Performance** | Total portfolio returns over any date range, with/without sold shares |
| **Sold securities** | Return on each sold holding in selected period |
| **Multi-currency valuation** | Holdings by investment type, country, market over any period/currency |
| **Multi-period** | Compare returns across different time periods (e.g. 1Y vs 3Y vs 5Y) |
| **Calendar** | Timeline of upcoming portfolio events and key dates |
| **Future income** | Expected upcoming dividends and interest payments |
| **Contribution analysis** | How each holding contributed to overall portfolio performance |

### 5.2 Asset Allocation Reports

| Tool | Description |
|------|-------------|
| **Exposure** | Industry/sector/investment type exposure (looks through ETFs) |
| **Drawdown risk** | Performance vs maximum drawdown analysis |
| **Diversity** | Portfolio diversity across sectors, types, countries, markets |

---

## 6. Tax Tab

| Tool | Description |
|------|-------------|
| **Australian capital gains tax** | CGT calculation from tax perspective |
| **All trades** | Trade listing for selected date range |
| **Taxable income** | Dividend/interest totals for tax purposes |
| **Historical cost** | Opening/closing balances at cost price with closing market value |
| **Unrealised capital gains tax** | CGT scenario analysis as at any date |

**Key insight:** Tax reporting is a major value-add. For Arca's Coach subtab, we should consider surfacing simple tax-relevant summaries (total dividends received, estimated CGT liability).

---

## 7. Settings

### 7.1 Portfolio Settings
- Portfolio name
- External identifier (tax entity ID)
- Tax residency (Australia)
- Financial year end date (30th Jun)
- Performance calculation method (Simple / Money-weighted)

### 7.2 Connection Settings
- **Integrations** — broker connections for auto-import
- **Trade confirmation emails** — forward broker emails for auto-parsing
- **Xero settings** — accounting software integration

### 7.3 Other Settings
- Alerts
- Sharing (read-only portfolio sharing)
- Labels (custom tags for holdings)
- Cash accounts

---

## 8. UX Patterns Worth Adopting

### 8.1 Must-Have for Arca

1. **Dual display (% p.a. + absolute $)** — every return metric shows both. Our Percentages toggle should work similarly.

2. **Sortable columns with toggle** — users can sort by any column and switch between $ and % views.

3. **Date range presets** — Today, 7D, 12M, YTD, FY, All. These exact presets make sense for us.

4. **Confirmation workflow** — imported/detected transactions start as "pending" and require user confirmation. Critical for our CSV import feature.

5. **Holding detail drill-down** — click a holding to see its full history, trades, dividends, and per-holding performance.

6. **Negative values in red** — capital losses and negative returns are displayed in red. Simple but important.

7. **Company logos** — each holding shows a small logo icon. Adds visual polish.

### 8.2 Nice-to-Have (Later Phases)

1. **Group by dimensions** — Market, Sector, Industry, Type, Country, Currency, Custom. We could implement some of these in our allocation view.

2. **Benchmark comparison** — compare portfolio return vs an index. Would require tracking an index price series.

3. **Stacked area chart** — shows how each holding contributes to total portfolio value over time.

4. **Target price alerts** — set a target price and see where current price sits on a gauge.

5. **Future income projection** — predict upcoming dividends based on historical patterns.

### 8.3 Out of Scope for Arca

1. **Tax reports** — we're not an accounting tool, and tax rules are complex. Better to leave this to Sharesight.

2. **Broker integrations** — requires partnerships and compliance. CSV import is our ingestion model.

3. **Trade confirmation email parsing** — too fragile, too many broker formats.

4. **ETF look-through (Exposure tool)** — requires fund composition data feeds.

---

## 9. Data Model Comparison

| Concept | Sharesight | Arca (current) |
|---------|------------|-------------------|
| Portfolio | Named portfolio entity | `state.wealth.holdings[]` array |
| Holding | Ticker + Market + trades + dividends | `holding` object with display_symbol, provider_symbol, units, cost_basis_minor |
| Trade | Date, type, qty, price, fees, status | Not yet implemented (Phase 2+) |
| Dividend | Date, amount/share, gross, franking, net, reinvested | Not yet implemented |
| Price | Live feed (delayed) + target price | `price_quotes` keyed by provider:symbol |
| Quote freshness | "Updated at [timestamp]" label | `stale_after_ms` + `stale` boolean |
| Performance | Annualised return decomposed into capital + income + currency | `getPortfolioSnapshot()` has unrealizedGainLossMinor |
| Grouping | Market, Sector, Industry, Type, Country, Currency | `allocationByType` (asset_type only) |

### Key Gaps in Arca

1. **No trade history** — we store holdings but not individual buy/sell trades. This means we can't calculate true time-weighted returns or distinguish between lots.

2. **No dividend tracking** — dividends are a significant component of total return (~6.6% p.a. for Jules). Our income metric is currently zero.

3. **No annualised returns** — we show unrealised gain/loss but not annualised performance. This requires knowing purchase dates and applying CAGR or money-weighted return formulas.

4. **Single grouping dimension** — we only group by asset_type. Sharesight offers 7+ grouping dimensions.

5. **No confirmation workflow** — when we build CSV import, we need a "pending" state for imported data.

---

## 10. Recommended Priority for Arca Wealth

Based on this audit, here's what I'd prioritise next:

### Immediate (aligns with existing build spec)
- **Phase 1b:** Live price feeds (already specced) — gets us real-time portfolio value
- **Phase 2a:** CSV watch folder (already specced) — gets transaction data flowing in

### Short-term additions to consider
- **Trade history model** — extend holdings to track individual trades (date, qty, price, fees). This unlocks accurate cost basis and return calculations.
- **Dividend tracking** — either auto-detect from CSV or manual entry. Critical for true total return.
- **Annualised return calculation** — once we have trade dates, implement simple CAGR at minimum.
- **Confirmation workflow** — pending/confirmed status on imported transactions.

### Medium-term
- **Date range filtering** — add Sharesight-style presets to our Portfolio subtab
- **Percentage toggle** — switch between $ and % views in holdings table
- **Holding detail view** — click-through to see per-holding history and performance
- **Additional grouping dimensions** — sector, industry (would require a data enrichment source)

---

*This audit is a living document. Update as Sharesight evolves or as Arca's wealth features mature.*
