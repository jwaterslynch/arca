# UniSuper — Superannuation Holdings

> **Source:** UniSuper Member Online (memberonline.unisuper.com.au)
> **Member:** Julian Maurice Waters-Lynch — Member #13810618
> **Account type:** Accumulation 1
> **Extracted:** 12 March 2026

---

## Account Summary

| Field | Value |
|-------|-------|
| Estimated balance | $218,591.87 |
| Balance date | 12 March 2026 |
| Account type | Accumulation 1 |

---

## Investment Options

Your super is split 50/50 across two managed options:

| Option | Amount | Allocation (%) |
|--------|--------|----------------|
| High Growth | $110,980 | 50.77 |
| Sustainable High Growth | $107,612 | 49.23 |

Future contribution strategy: 50% High Growth / 50% Sustainable High Growth
Future rollover strategy: 50% High Growth / 50% Sustainable High Growth

---

## Asset Class Allocation (blended across both options)

| Asset class | Allocation (%) |
|-------------|----------------|
| International Shares | 53.97 |
| Australian Shares | 39.02 |
| Infrastructure & Private Equity | 5.49 |
| Property | 1.52 |

Indicative as at: 12 March 2026

---

## Top 20 Underlying Holdings

These are the major individual securities held *within* the two managed options. This is an indicative listing (as at 30 September 2025) and represents the direct physical holdings across both options combined. It is not a complete list.

| Rank | Holding | Amount (AUD) | Market | Ticker (estimated) |
|------|---------|-------------|--------|---------------------|
| 1 | Commonwealth Bank of Australia | $7,863 | ASX | CBA.AX |
| 2 | NVIDIA Corp | $6,336 | NASDAQ | NVDA |
| 3 | Microsoft Corp | $5,680 | NASDAQ | MSFT |
| 4 | Apple Inc | $4,264 | NASDAQ | AAPL |
| 5 | National Australia Bank Ltd | $4,143 | ASX | NAB.AX |
| 6 | Westpac Banking Corp | $3,706 | ASX | WBC.AX |
| 7 | CSL Ltd | $3,484 | ASX | CSL.AX |
| 8 | Tribeca Alpha Plus Fund Class B | $3,329 | Managed Fund | — |
| 9 | Goodman Group | $3,158 | ASX | GMG.AX |
| 10 | Alphabet Inc | $3,054 | NASDAQ | GOOGL |
| 11 | Amazon.com Inc | $2,943 | NASDAQ | AMZN |
| 12 | Macquarie Bank Ltd | $2,724 | ASX | MQG.AX |
| 13 | ANZ Banking Group | $2,721 | ASX | ANZ.AX |
| 14 | BHP Group Ltd | $2,553 | ASX | BHP.AX |
| 15 | Broadcom Inc | $2,290 | NASDAQ | AVGO |
| 16 | Wesfarmers Ltd | $2,072 | ASX | WES.AX |
| 17 | Meta Platforms Inc | $1,856 | NASDAQ | META |
| 18 | Transurban Chesapeake (US Tollroads) | $1,856 | ASX/Infrastructure | TCL.AX |
| 19 | Telstra Corp Ltd | $1,507 | ASX | TLS.AX |
| 20 | Regal Aust Small Comp Trust | $1,443 | Managed Fund | — |

**Total of top 20:** $66,982
**Remainder (not listed):** $151,610 (across hundreds of smaller holdings, bonds, infrastructure, property, cash)

---

## How to Track in PPP Flow Wealth Tab

### Option A — Track as two managed fund holdings (recommended)

Since you don't directly own these shares, the cleanest approach is to track the two UniSuper options as holdings:

```
Holding 1:
  display_symbol: "UniSuper HG"
  name: "UniSuper High Growth"
  asset_type: "etf"           # closest match — it's a pooled managed fund
  provider: "manual"          # no live price feed available
  units: 1                    # treat as 1 unit = current value
  cost_basis_minor: ???       # total contributions to this option (from statements)
  market_value_minor: 11098000  # $110,980.00

Holding 2:
  display_symbol: "UniSuper SHG"
  name: "UniSuper Sustainable High Growth"
  asset_type: "etf"
  provider: "manual"
  units: 1
  cost_basis_minor: ???
  market_value_minor: 10761200  # $107,612.00
```

**Updating:** Manual price update monthly (log in, check balance, update values).

**Performance tracking:** UniSuper publishes daily cumulative return data as a downloadable CSV. We could potentially parse this to compute returns without needing live prices.

### Option B — Track underlying shares individually (not recommended)

We *could* create 20 individual holdings with estimated units (value ÷ current share price), but:
1. The amounts are indicative, not exact (UniSuper rounds them)
2. They're lagged (the latest data shown is from 30 Sep 2025)
3. You don't actually control these positions — they change as the fund rebalances
4. Many holdings are managed funds (Tribeca, Regal) with no public price

### Option C — Track via published fund returns (future enhancement)

UniSuper publishes daily unit prices / cumulative returns for each option. A future PPP Flow enhancement could:
1. Fetch daily unit prices from UniSuper's public performance page
2. Track your super value as: `units_held × current_unit_price`
3. This is how super funds actually work internally

UniSuper's public performance data is available at:
https://www.unisuper.com.au/investments/investment-options/accumulation-investment-performance

This could be scraped or parsed if they offer a CSV/API. They do offer a CSV download from the member portal.

---

## Notes

- The holdings data is indicative only (lagged to 30 Sep 2025)
- Actual current allocations may differ due to market movements and fund rebalancing
- The top 20 covers ~$67k of the $219k total — the remaining ~$152k is in hundreds of smaller positions, bonds, infrastructure, property, and cash
- UniSuper does not offer an API for member data
- Cost basis for super is complex (contributions span many years, include employer contributions, insurance deductions, etc.)
