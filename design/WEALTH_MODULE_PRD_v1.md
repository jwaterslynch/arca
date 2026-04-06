# Arca Wealth Module PRD (v1)

Date: 2026-03-09  
Status: Design spec - not yet building  
Owner: Product + Engineering

## 1) Product Thesis
Arca currently covers execution, review, and coaching for work and practices. The missing strategic layer is household finance.

The `Wealth` module should be a separate top-level tab, not an extension of `Execute` or a cluttered add-on to `Review`.

Its role is to give the user a clean, reality-based view of:
1. net worth
2. cash flow
3. portfolio allocation
4. capital deployment options

The module should support reflection and decision support, not payments, trading, or automated financial actions.

## 2) Goals
1. Show the user's household balance sheet clearly in one place.
2. Show cash flow and spending patterns in a way that supports better decisions.
3. Show portfolio allocation, concentration, liquidity, and runway.
4. Let the user discuss their financial state with an AI coach grounded in current data.
5. Keep the rest of Arca clean by isolating finance into its own module.

## 3) Non-Goals (v1)
1. No trade execution.
2. No bank transfer initiation.
3. No tax filing or formal tax advice.
4. No fully automated rebalancing.
5. No storing withdrawal-capable credentials or wallet private keys.
6. No financial advice posture; the module is decision support and analysis.

## 4) Module Boundary
`Wealth` is a separate top-level tab.

It should not:
1. add widgets to `Execute`
2. overload the current `Review` tab
3. slow down the current task/practice surfaces

Design rule:
1. `Execute` stays minimal and action-first
2. `Review` stays focused on work/practice reflection
3. `Wealth` handles finance, portfolio, and household planning

## 5) Information Architecture
Recommended sub-tabs inside `Wealth`:

1. `Overview`
2. `Cash Flow`
3. `Portfolio`
4. `Coach`

Optional later sub-tabs:
1. `Accounts`
2. `Documents`
3. `Settings / Connections`

## 6) Core User Stories
1. As a user, I can see my assets, liabilities, and net worth in one place.
2. As a user, I can see how my spending and savings are changing over time.
3. As a user, I can see my portfolio allocation across cash, shares, property, and crypto.
4. As a user, I can compare target allocation vs current allocation.
5. As a user, I can import statements or connect read-only financial accounts.
6. As a user, I can ask an AI coach what stands out, what is risky, and what options I have.
7. As a user, I can turn useful financial reflections into board tasks or commitments.

## 7) Core Concepts / Data Model
The wealth module should use its own state slice and backend schema.

Suggested top-level concepts:

1. `institution`
2. `account`
3. `holding`
4. `transaction`
5. `asset`
6. `liability`
7. `property`
8. `document`
9. `valuation_snapshot`
10. `allocation_target`
11. `wealth_ai_thread`
12. `wealth_ai_proposal`

### 7.1 Example Shapes

```js
institution = {
  id,
  name,
  type, // bank | broker | exchange | manual
  provider, // plaid | tink | salt_edge | coinbase | kraken | manual
  status,
  last_synced_at
}

account = {
  id,
  institution_id,
  name,
  kind, // checking | savings | brokerage | exchange | loan | mortgage | property_manual
  currency,
  balance,
  available_balance,
  is_manual,
  last_synced_at
}

holding = {
  id,
  account_id,
  symbol,
  name,
  asset_class, // equity | etf | bond | crypto | cash | property
  quantity,
  price,
  market_value,
  cost_basis,
  currency,
  as_of
}

transaction = {
  id,
  account_id,
  posted_at,
  amount,
  currency,
  direction, // inflow | outflow
  category,
  merchant,
  raw_name,
  source,
  notes
}

property = {
  id,
  name,
  address,
  ownership_pct,
  estimated_value,
  valuation_source, // manual | imported | external_estimate
  mortgage_balance,
  net_equity,
  updated_at
}

allocation_target = {
  id,
  name,
  cash_pct,
  equities_pct,
  property_pct,
  crypto_pct,
  alternatives_pct,
  notes
}
```

## 8) Feature Set

### 8.1 Overview
Purpose: a clean household balance sheet and strategic summary.

Primary elements:
1. Net worth headline
2. Assets vs liabilities headline cards
3. Allocation by asset class
4. Liquidity / cash runway card
5. Concentration risk card
6. Monthly change summary

Questions it should answer:
1. What do I own?
2. What do I owe?
3. How much is liquid?
4. How concentrated am I?
5. What changed recently?

### 8.2 Cash Flow
Purpose: money in, money out, and savings quality.

Primary elements:
1. Monthly inflow vs outflow bars
2. Savings rate trend
3. Spending by category
4. Recurring commitments / subscriptions
5. Large or unusual spend detection

Questions it should answer:
1. What is my real monthly burn?
2. Am I saving at the rate I think I am?
3. Which categories are driving leakage?
4. Are there recurring costs I should review?

### 8.3 Portfolio
Purpose: investment posture and capital allocation.

Primary elements:
1. Allocation donut or treemap
2. Target vs actual allocation bars
3. Holdings table with concentration
4. Account-by-account breakdown
5. Property card(s)
6. Crypto exposure card

Questions it should answer:
1. Where is my capital allocated?
2. Where am I over- or underweight?
3. Am I too concentrated in one asset or theme?
4. How much deployable cash do I actually have?

### 8.4 Coach
Purpose: grounded financial reflection, not chat for its own sake.

Primary elements:
1. Current state summary
2. What stands out
3. Risks / imbalances
4. Scenarios
5. Recommended next actions
6. Proposal actions back into Arca

Questions it should answer:
1. What matters most right now?
2. What risks am I not seeing?
3. What changes would improve resilience or alignment?
4. What should I review, save, or allocate next?

## 9) Visual Design Direction
The module should use the same visual language as Arca:
1. calm
2. spacious
3. analytical
4. low-noise

It should not look like:
1. a trading terminal
2. a dense spreadsheet
3. a banking super-app

### 9.1 Recommended Visuals

`Overview`
1. 12-month net worth line
2. asset allocation donut
3. assets/liabilities cards
4. runway card
5. concentration card

`Cash Flow`
1. monthly inflow/outflow bars
2. stacked spending categories
3. savings rate sparkline
4. recurring spend table

`Portfolio`
1. target vs actual allocation bars
2. holdings concentration table
3. account breakdown cards
4. property equity cards

`Coach`
1. compact narrative summary
2. bullet observations
3. scenario cards
4. proposal actions

## 10) Ingestion Strategy
Do not start with live bank integrations.

Use a staged ingestion model:

### 10.1 Stage 1: Manual Entry
1. manual assets
2. manual liabilities
3. manual property estimates
4. manual allocation targets

Reason:
1. fastest to build
2. lowest operational risk
3. useful before any integration exists

### 10.2 Stage 2: Statement Import
1. CSV import for bank, brokerage, exchange exports
2. PDF import for statements where CSV is unavailable

Reason:
1. realistic coverage
2. avoids fragile credential flows
3. useful internationally

### 10.3 Stage 3: Read-Only API Connections
1. bank/open-banking
2. brokerage/investment aggregation
3. crypto exchange read-only APIs
4. public wallet addresses for on-chain holdings

### 10.4 Stage 4: Enrichment
1. merchant/category cleanup
2. recurring charge detection
3. property valuation enrichment
4. derived portfolio analytics

## 11) API / Integration Plan
Use only read-only or import-based integrations in early versions.

### 11.1 Banks / Cash Accounts
Europe candidate path:
1. Tink open banking
2. Salt Edge Open Banking Gateway

US/Canada candidate path:
1. Plaid Transactions
2. Plaid Investments for linked investment accounts

What we should ingest:
1. accounts
2. balances
3. transactions
4. account metadata

What we should avoid:
1. payment initiation
2. credential scraping if avoidable
3. direct handling of bank credentials in our app

### 11.2 Brokerage / Investments
Candidate path:
1. Plaid Investments where supported
2. CSV import fallback
3. later direct brokerage integrations if needed

What we should ingest:
1. holdings
2. securities metadata
3. investment transactions
4. market value snapshots

### 11.3 Crypto
Candidate path:
1. public wallet addresses for on-chain visibility
2. Coinbase read-only API keys
3. Kraken read-only API keys
4. CSV import fallback

What we should ingest:
1. balances
2. holdings
3. transaction history where available
4. cost basis inputs if possible

Security rule:
1. no trading permission
2. no withdrawal permission
3. no seed phrases
4. no private wallet keys

### 11.4 Property
MVP:
1. manual property record
2. user-entered valuation
3. mortgage balance
4. simple equity calculation

Later:
1. optional external valuation enrichment by region/provider

## 12) AI Coach Contract
The AI should not be “trained” by vague conversation. It should be grounded on a normalized snapshot of current state.

### 12.1 Wealth Context Payload

```json
{
  "as_of": "2026-03-09",
  "freshness": {
    "banks": "2026-03-08T18:10:00Z",
    "brokerage": "2026-03-09T06:30:00Z",
    "crypto": "2026-03-09T06:31:00Z",
    "property": "manual_estimate"
  },
  "balance_sheet": {
    "assets_total": 0,
    "liabilities_total": 0,
    "net_worth": 0,
    "by_asset_class": []
  },
  "cash_flow": {
    "monthly_income": 0,
    "monthly_spend": 0,
    "savings_rate": 0,
    "categories": [],
    "recurring": []
  },
  "portfolio": {
    "holdings": [],
    "allocation_current": [],
    "allocation_target": [],
    "concentration_flags": []
  },
  "assumptions": [],
  "missing_data": [],
  "source_documents": []
}
```

### 12.2 AI Responsibilities
The AI should:
1. describe the current picture clearly
2. separate facts from assumptions
3. identify concentration, liquidity, and spending risks
4. compare target vs actual allocation
5. propose scenarios, not commands
6. suggest next reviews, targets, or board actions

The AI should not:
1. place trades
2. transfer money
3. use certainty language when data is incomplete
4. present regulated financial advice as if it were authoritative
5. infer unavailable facts from weak signals

### 12.3 AI Output Shape

Recommended structure:
1. `Current picture`
2. `What stands out`
3. `Possible options`
4. `What to check next`
5. `Data limitations`

Example suggestions:
1. review cash buffer target
2. rebalance toward target allocation
3. set a board task to audit subscriptions
4. create a monthly commitment to review spending drift

### 12.4 Allowed Arca Actions
The coach can propose:
1. `task.create`
2. `task.update`
3. `commitment.create`
4. `commitment.update`
5. `wealth_target.create`
6. `wealth_target.update`
7. `wealth_note.create`

The coach should not have direct execution authority over money.

## 13) User Decision Support
The module should help the user answer:
1. How much cash should remain liquid?
2. How concentrated is the portfolio?
3. Is spending aligned with stated priorities?
4. Is there real excess capital available to deploy?
5. Is the household balance sheet getting stronger or weaker?
6. Which financial review action matters most this month?

Useful decision outputs:
1. scenario comparisons
2. allocation gap analysis
3. liquidity/runway view
4. spending leak identification
5. capital deployment options with assumptions

## 14) Security and Privacy Rules
This module carries higher sensitivity than the rest of Arca.

Rules:
1. use read-only integrations wherever possible
2. never request or store bank credentials directly in the app if an aggregator flow exists
3. never request or store crypto private keys / seed phrases
4. never use trade- or withdrawal-capable API keys for MVP
5. store secrets in OS keychain / secure backend secret management only
6. encrypt sensitive synced data at rest
7. attach source/freshness metadata to imported data
8. make document and connection deletion straightforward

## 15) Performance and Architecture
To avoid degrading the current app:
1. lazy-load the `Wealth` tab
2. keep wealth state separate from task/practice state
3. cache derived analytics
4. process imports asynchronously
5. do not let `Execute` depend on wealth data

Design rule:
1. same design system
2. separate module
3. separate state slice
4. separate AI context

## 16) Phased Roadmap

### Phase 0: Design Only
1. define module boundary
2. define data model
3. define AI guardrails
4. define import/security strategy

### Phase 1: Desktop MVP
1. add `Wealth` tab shell
2. manual asset/liability/property entry
3. net worth overview visuals
4. simple cash flow input/import
5. target allocation input

### Phase 2: Import MVP
1. CSV import
2. PDF statement parsing
3. normalized transaction/holding ingestion
4. data freshness indicators

### Phase 3: AI Wealth Coach
1. grounded AI summary
2. scenario analysis
3. board/commitment proposals
4. assumptions and missing-data handling

### Phase 4: Read-Only Integrations
1. open banking
2. read-only crypto exchange APIs
3. public wallet address ingestion
4. investment account ingestion

### Phase 5: Enrichment
1. recurring transaction detection
2. portfolio concentration analysis
3. better allocation analytics
4. property enrichment

## 17) MVP Acceptance Criteria
1. User can manually enter assets and liabilities and see net worth.
2. User can import at least one CSV statement and see categorized cash flow.
3. User can define a target allocation and compare it to current allocation.
4. User can ask the AI coach what stands out and receive grounded, source-aware observations.
5. User can turn at least one AI suggestion into a Arca task or commitment.
6. `Execute` remains visually and functionally unaffected.

## 18) Open Questions
1. Which regions matter most for bank connectivity first?
2. Should `Wealth` use the same provider settings as the rest of the app, or its own coach defaults?
3. How much document retention should be supported for imported statements?
4. Should property remain manual-only for a long time?
5. When do we introduce household/shared-entity support?

## 19) Recommendation
Build `Wealth` as a separate, read-only, decision-support module.

Do not:
1. turn Arca into a trading app
2. overload `Review`
3. widen scope before the current execution/practice loop is stable

Do:
1. start with manual entry + imports
2. normalize the financial state
3. let AI reason over current reality
4. keep all capital actions user-controlled

## 20) References
Official docs evaluated as candidate integration paths:

1. [Tink Developer Console](https://tink.com/open-banking-developer-console/)
2. [Salt Edge Open Banking Gateway Docs](https://docs.saltedge.com/v6/)
3. [Plaid Transactions Docs](https://plaid.com/docs/transactions/)
4. [Plaid Investments Docs](https://plaid.com/docs/investments/)
5. [Coinbase Advanced Trade Portfolios](https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/portfolios)
6. [Coinbase API Key Permissions](https://help.coinbase.com/en/exchange/managing-my-account/how-to-create-an-api-key)
7. [Kraken API Center](https://docs.kraken.com/api)
8. [Kraken Spot API Key Permissions](https://support.kraken.com/articles/360000919966-how-to-create-an-api-key)
