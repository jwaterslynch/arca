# CryptoPro Feature Audit + Crypto Asset Class Build Spec

> **Purpose:** Document CryptoPro's crypto portfolio features, then spec what to build as a first-class crypto asset class inside Arca's Wealth tab.
>
> **Audited:** 10 March 2026 — App Store listing, marketing screenshots, review sites
>
> **Note:** CryptoPro is an Apple-native app (iOS/macOS/watchOS), not a web dashboard. Audit is based on App Store screenshots, feature descriptions, and the marketing site.

---

## Part 1: CryptoPro Feature Audit

### 1.1 Core Concept

CryptoPro is a privacy-first crypto portfolio tracker. Key value props: 10,000+ assets tracked, 400+ exchange data sources, local-only data storage (no server-side accounts), automatic wallet/exchange sync via API keys or wallet addresses.

### 1.2 Navigation Structure

From the screenshots, CryptoPro uses a **five-tab** bottom nav (iOS) / top nav (Mac):

| Tab | Purpose |
|-----|---------|
| **Portfolio** | Holdings list with total value, profit/loss, equity chart |
| **Crypto** | Full market price list (all 10,000+ coins), searchable |
| **News** | Aggregated crypto news, filterable by coin |
| **Alerts** | Price alert configuration |
| **Settings** | Preferences, sync, security |

### 1.3 Portfolio View (the key screen)

**Header section:**
- Portfolio name ("Main Portfolio")
- Total portfolio value in chosen fiat currency (e.g. "28,349.12 USD")
- 24h gain shown as percentage badge (+69%) in green
- Swipeable summary stats: High, Low, Profit, Cost, Count, Fiat

**Summary stats observed:**

| Metric | Example | Notes |
|--------|---------|-------|
| Value $ | 28,349.12 | Current market value |
| 24h gain | +69% | Period return, green/red coloured |
| High | 28,349.12 | All-time or period high |
| Low | 9,999.99 | All-time or period low |
| Profit | 26,829.12 | Unrealised gain (value − cost) |
| Cost | 1,520.00 | Total cost basis |
| Count | 16 | Number of holdings |
| Fiat | 520.12 | Cash/stablecoin component |

**Date range presets:** 1H, 1D, 1W, 1M, 3M, 1Y, 2Y, ALL

**Portfolio equity chart:** Line chart showing portfolio value over selected time range. Green line. Shows high/low markers.

**Holdings list:**
Each row shows:
- Coin icon + symbol (e.g. Bitcoin logo + "Bitcoin")
- Units held (e.g. "0.300979 BTC")
- Current price with multiplier (× 56,715)
- Total value in fiat (17.07K USD)
- 24h change % (+0.12% green, or red if negative)

### 1.4 Market/Crypto View

- Full list of all available coins
- Header bar: Mkt cap, Vol, Dom %, Gas (Ethereum gas)
- Each row: rank number, coin icon, ticker, name, sparkline chart, price, 24h change %
- Searchable
- Sortable by market cap (default), price, volume, change

### 1.5 Coin Detail View

When tapping a coin (e.g. BTC):
- Large coin icon + name + exchange selector dropdown
- Current price in chosen fiat
- 24h change ($ and %)
- Key stats: Mkt cap, Supply, Max supply, Vol, Rank
- "Portfolio USD >" link showing your position
- Interactive price chart with time range selectors
- Toggle between Price and Volume views
- Drawing tools (trend lines, etc.)
- News feed filtered to that coin

### 1.6 Key CryptoPro Patterns

**What's good:**
1. **24h change as primary metric** — crypto moves fast, 24h is the default period
2. **Sparkline per row** — tiny inline chart showing recent price trend
3. **Cost basis tracking** — shows Profit and Cost separately
4. **Market stats in header** — total market cap, volume, BTC dominance gives market context
5. **Fiat balance tracked separately** — stablecoins/cash shown as distinct from crypto holdings
6. **Exchange-specific prices** — can view price on a specific exchange, not just global average
7. **Count metric** — simple "you hold 16 assets" is a nice overview stat
8. **Wallet/exchange auto-sync** — API keys or wallet address for automatic import (premium feature)
9. **Privacy-first** — all data local, no accounts, encrypted iCloud backup

**What's less relevant for us:**
1. 10,000+ coin coverage — we only need the coins Jules holds
2. Apple Watch/widgets — not applicable to Tauri desktop
3. Drawing tools on charts — overkill for a personal dashboard
4. Exchange-specific prices — CoinGecko global average is fine for our purposes
5. News aggregation — not in our scope (yet)

---

## Part 2: What to Build — Crypto as First-Class Asset in Wealth Tab

### Design Philosophy

We already have the `crypto` asset_type in our holdings model and CoinGecko is specced as our price provider. What's missing is **crypto-aware UX** — the current holdings table treats BTC the same as CBA.AX. Crypto has different display conventions, faster price movement, and different metrics that matter.

### 2.1 Crypto-Specific Display Conventions

| Convention | Stocks (Sharesight-style) | Crypto (CryptoPro-style) |
|-----------|---------------------------|--------------------------|
| Price precision | 2 decimal places ($51.23) | Variable — BTC: 2dp ($56,715), small-caps: 6-8dp ($0.00001234) |
| Primary change period | Since purchase (annualised) | 24h change |
| Sparkline | Not common | Expected — tiny inline price chart |
| Units display | Whole numbers (1,653 shares) | Fractional (0.300979 BTC) |
| Market context | Less important | BTC dominance, total market cap, gas fees |
| Icon | Company logo | Coin icon (standard, available from CoinGecko) |

**Build: Smart price formatting**

```js
function formatCryptoPrice(priceMinor, quoteCurrency) {
  const price = priceMinor / 100;
  if (price >= 1000) return formatCurrency(priceMinor, quoteCurrency);     // $56,715.00
  if (price >= 1)    return formatCurrency(priceMinor, quoteCurrency);     // $0.43
  if (price >= 0.01) return `$${price.toFixed(4)}`;                        // $0.0043
  return `$${price.toFixed(8)}`;                                            // $0.00001234
}
```

**Build: Smart units formatting**

```js
function formatCryptoUnits(units) {
  if (units >= 1000) return units.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (units >= 1)    return units.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return units.toLocaleString(undefined, { maximumFractionDigits: 8 });
}
```

### 2.2 24h Change Column

CryptoPro's primary metric is 24h change. For crypto holdings, this is more useful than "since purchase" return because crypto is so volatile.

**Build:**
- Extend price_quotes to store `price_24h_ago_minor` (CoinGecko provides 24h change data in its response)
- Compute `change24hPct` per holding
- Display as green/red badge: "+2.3%" or "-1.5%"
- In the holdings table, crypto rows show 24h change; stock rows show total gain/loss

**Data model addition to price_quote:**
```js
price_quote = {
  // ... existing fields ...
  price_24h_change_pct: null,    // number, e.g. 2.3 or -1.5 (from CoinGecko)
}
```

CoinGecko's `/simple/price` endpoint supports `include_24hr_change=true` — we just need to pass this parameter and store the result.

### 2.3 Coin Icons

CryptoPro shows coin logos for every holding. This adds significant visual quality.

**Build:**
- CoinGecko provides icon URLs in its coin list data
- Store icon URL in holding or in a lightweight coin metadata cache
- Display as small (24×24) image next to the holding symbol in the table
- Fallback: coloured circle with first letter of symbol (like our current approach for stocks)

**Data model addition to holding:**
```js
holding = {
  // ... existing fields ...
  icon_url: null,    // string URL from CoinGecko, or null for manual/stock holdings
}
```

**Fetch strategy:** When adding a crypto holding, look up the coin on CoinGecko's `/coins/list` and grab the `image.thumb` URL. Cache it. Don't re-fetch every time.

### 2.4 Portfolio Summary — Crypto Section

When crypto holdings exist, the Portfolio subtab should show a **crypto summary card** alongside the existing overview.

**Build:**
```
┌─────────────────────────────────────────────┐
│  Crypto Portfolio                            │
│  $12,450.00        +3.2% (24h)              │
│  3 assets  ·  Cost: $8,200.00  ·  Profit: $4,250.00  │
└─────────────────────────────────────────────┘
```

This is a filtered view of `getPortfolioSnapshot()` — sum only holdings where `asset_type === "crypto"`.

**Functions:**
```js
function getCryptoSnapshot() {
  const snapshot = getPortfolioSnapshot();
  const cryptoHoldings = snapshot.holdingViews.filter(h => h.assetType === "crypto");
  return {
    holdingViews: cryptoHoldings,
    totalMarketValueMinor: cryptoHoldings.reduce((s, h) => s + h.marketValueMinor, 0),
    totalCostBasisMinor: cryptoHoldings.reduce((s, h) => s + h.costBasisMinor, 0),
    count: cryptoHoldings.length,
    avg24hChangePct: weightedAvg24hChange(cryptoHoldings)
  };
}
```

### 2.5 Market Context Bar (Lightweight)

CryptoPro shows total market cap, 24h volume, and BTC dominance at the top. This gives useful market context.

**Build (minimal version):**
- Fetch from CoinGecko `/global` endpoint (one call, returns all three stats)
- Show as a subtle bar above the holdings table when crypto assets exist:
  `Mkt: $2.1T  ·  Vol: $74B  ·  BTC Dom: 51%`
- Cache aggressively (TTL: 30 minutes)
- Show only when user has crypto holdings

**Data model:**
```js
state.wealth.crypto_market = {
  total_market_cap_usd: null,
  total_volume_24h_usd: null,
  btc_dominance_pct: null,
  fetched_at: null
}
```

### 2.6 CoinGecko Adapter Enhancements

Our build spec already has a CoinGecko adapter planned (Phase 1b). Here's what needs extending for crypto-first UX:

| Endpoint | Purpose | Already specced? |
|----------|---------|-----------------|
| `/simple/price` | Current prices + 24h change | Yes (add `include_24hr_change=true`) |
| `/coins/list` | Coin IDs, names, icons | No — add for icon/search |
| `/global` | Market cap, volume, BTC dominance | No — add for market context |

**Recommended CoinGecko calls per refresh cycle:**
1. `/simple/price?ids=bitcoin,ethereum,...&vs_currencies=aud&include_24hr_change=true` — prices + 24h (already planned)
2. `/global` — market context (new, once per 30 min)
3. `/coins/list` — coin metadata (new, once per session or on "add holding")

All three should go through the Tauri fetch bridge.

### 2.7 "Add Crypto Holding" Flow Improvements

Currently our "Add Holding" modal requires the user to type `provider_symbol` (e.g. "bitcoin"). This is error-prone. CryptoPro has a searchable coin picker.

**Build:**
- When `asset_type === "crypto"` is selected, show a **search-as-you-type** coin picker
- Source: CoinGecko `/coins/list` (cached locally)
- User types "BTC" or "Bitcoin" → auto-matches → fills in:
  - `display_symbol`: "BTC"
  - `provider_symbol`: "bitcoin"
  - `name`: "Bitcoin"
  - `icon_url`: from CoinGecko
  - `provider`: "coingecko"
- User then just enters: units and cost basis
- Much less friction than manually typing provider symbols

**Implementation:**
```js
// Cached coin list (fetched once, stored in memory or state)
let coinGeckoList = null;

async function fetchCoinList() {
  if (coinGeckoList) return coinGeckoList;
  coinGeckoList = await invoke("wealth_http_fetch", {
    request_type: "coin_list"
  });
  return coinGeckoList;
}

function searchCoins(query) {
  const q = query.toLowerCase();
  return coinGeckoList.filter(c =>
    c.symbol.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.id.toLowerCase().includes(q)
  ).slice(0, 10);  // top 10 matches
}
```

---

## Part 3: Build Sequence

All of the above fits cleanly into the existing phase structure. Here's where each piece lands:

### Phase 1b (Live Price Feeds — already specced)

Add to the existing CoinGecko adapter work:

| Addition | Effort |
|----------|--------|
| Pass `include_24hr_change=true` to `/simple/price` | Trivial — one query param |
| Store `price_24h_change_pct` in quote cache | Trivial — one field |
| Add `/global` call for market context | Small — new endpoint, same adapter pattern |
| Add `/coins/list` call for coin metadata/search | Small — new endpoint, cache in memory |

### Phase 1c (Portfolio UX Polish — already specced)

Add to the rendering work:

| Addition | Effort |
|----------|--------|
| `formatCryptoPrice()` smart decimal formatting | Small |
| `formatCryptoUnits()` smart units formatting | Small |
| 24h change column for crypto rows (green/red badge) | Small |
| Coin icons from CoinGecko (with fallback) | Medium — image loading, caching, fallback |
| Crypto summary card in Portfolio subtab | Small |
| Market context bar (`Mkt · Vol · BTC Dom`) | Small |
| Search-as-you-type coin picker in Add Holding modal | Medium — needs autocomplete UI |

### Estimated Total Additional Effort

About **1 extra session** on top of the already-planned Phase 1b + 1c work. Most of these are small incremental additions to things we're already building.

---

## Part 4: What We're NOT Building from CryptoPro

| Feature | Why not |
|---------|---------|
| Exchange-specific prices | CoinGecko global average is sufficient |
| Wallet address auto-sync | Requires blockchain node/API integration |
| Exchange API key sync | Security risk, out of scope |
| Candlestick charts | Overkill — simple line chart is enough |
| Drawing tools (trend lines) | Trading tool, not personal dashboard |
| News aggregation | Not in wealth module scope |
| Price alerts/notifications | Tauri desktop doesn't have push notifications in the same way |
| Apple Watch / widgets | Platform-specific, not applicable |
| 10,000+ coin coverage | We track what the user holds, not the whole market |

---

## Summary

CryptoPro confirms that crypto needs three things our current holdings table lacks:

1. **Smart number formatting** — variable decimal places for prices and fractional units
2. **24h change as primary metric** — crypto-native users think in 24h periods, not annualised returns
3. **Coin search + icons** — visual quality and reduced friction when adding holdings

Plus two nice-to-haves:

4. **Market context bar** — total market cap, volume, BTC dominance (one API call)
5. **Crypto summary card** — filtered portfolio view for just crypto assets

All of this layers cleanly onto Phases 1b and 1c with minimal extra effort.
