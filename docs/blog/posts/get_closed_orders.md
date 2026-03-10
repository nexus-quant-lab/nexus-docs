# `get_closed_orders` — Design & Implementation Summary

A generic async helper that fetches closed orders across multiple crypto exchanges using **ccxt async**, without requiring callers to know any exchange-specific API details.

---

## Core Idea: One Config Dict, Many Exchanges

All exchange differences are captured up-front in a single dictionary `EXCHANGE_CONFIG`. At runtime, every function simply looks up the current exchange's entry and acts on what it finds — no `if exchange == "bybit"` branches scattered through the code.

```python
EXCHANGE_CONFIG: dict[str, dict] = {
    "binance"    : {"max_days": 90,  "max_limit": 1000, "style": "startTime_endTime"},
    "bybit"      : {"max_days": 7,   "max_limit": 50,   "style": "startTime_endTime"},
    "okx"        : {"max_days": 90,  "max_limit": 100,  "style": "after_before"},
    "gateio"     : {"max_days": 30,  "max_limit": 1000, "style": "from_to"},
    "bitget"     : {"max_days": 90,  "max_limit": 100,  "style": "startTime_endTime"},
    "bingx"      : {"max_days": 7,   "max_limit": 1000, "style": "startTimestamp_endTimestamp"},
    "mexc"       : {"max_days": 90,  "max_limit": 1000, "style": "startTime_endTime"},
    "kucoin"     : {"max_days": 7,   "max_limit": 500,  "style": "startAt_endAt_sec"},
    "hyperliquid": {"max_days": 180, "max_limit": 2000, "style": "startTime_endTime"},
    "aevo"       : {"max_days": 30,  "max_limit": 500,  "style": "startTime_endTime"},
    "alpaca"     : {"max_days": 365, "max_limit": 500,  "style": "after_until_iso"},
    "bitopro"    : {"max_days": 60,  "max_limit": 1000, "style": "startTimestamp_endTimestamp"},
}

DEFAULT_CONFIG = {"max_days": 30, "max_limit": 100, "style": "startTime_endTime"}
```

Each entry has exactly three fields:

| Field | Purpose |
|---|---|
| `max_days` | Maximum time window the exchange accepts per request |
| `max_limit` | Maximum page size the exchange accepts per request |
| `style` | Which parameter names and timestamp format to use |

Adding a new exchange means adding one line to this dict — nothing else changes.

---

## Timestamp Styles

Different exchanges use wildly different parameter names and units for time ranges. The `style` field maps to one of six translation rules applied in `_build_params()`:

| Style | Key names | Unit | Exchanges |
|---|---|---|---|
| `startTime_endTime` | `startTime`, `endTime` | milliseconds | Binance, Bybit, Bitget, MEXC, Hyperliquid, Aevo |
| `startTimestamp_endTimestamp` | `startTimestamp`, `endTimestamp` | milliseconds | BingX, BitoPro |
| `after_before` | `after`, `before` | milliseconds | OKX |
| `from_to` | `from`, `to` | **seconds** | Gate.io |
| `startAt_endAt_sec` | `startAt`, `endAt` | **seconds** | KuCoin |
| `after_until_iso` | `after`, `until` | **ISO 8601 string** | Alpaca |

`_build_params()` reads the style from the config dict and injects the correct keys into the `params` dict before every API call. The caller never sees any of this.

---

## Automatic Date-Range Chunking

Some exchanges cap how many days a single request can span (e.g. Bybit: 7 days, KuCoin: 7 days, BingX: 7 days). If the caller requests a 30-day window on Bybit, `get_closed_orders` automatically splits it into 5 sequential chunks of 7 days each.

```
total_window = endTime - startTime
num_chunks   = ceil(total_window / (max_days × 86_400_000 ms))
```

Each chunk is fetched independently and the results are concatenated, deduplicated by order ID, and sorted oldest-first before being returned.

---

## Automatic Pagination Within Each Chunk

Within a single time chunk, `_fetch_chunk()` loops using a sliding cursor:

1. Call `fetch_closed_orders` with the current `since` cursor and the exchange's `max_limit` page size.
2. If the response is smaller than a full page → no more data, stop.
3. Otherwise advance the cursor to `last_order_timestamp + 1` ms and repeat.
4. Stop early if the caller's `limit` has been reached.

A safety guard prevents infinite loops when an exchange returns a full page but makes no timestamp progress.

---

## `NotSupported` Fallback

If an exchange does not implement `fetch_closed_orders`, ccxt raises `NotSupported`. The code catches this and falls back to `fetch_orders`, then filters the result to `status == "closed"` locally.

---

## Public Interface

```python
async def get_closed_orders(
    exchange  : ccxt.Exchange,
    symbol    : str | None = None,   # e.g. "BTC/USDT" — None means all symbols
    startTime : int | None = None,   # ms UTC, default: 24 h ago
    endTime   : int | None = None,   # ms UTC, default: now
    limit     : int = 500,
    params    : dict | None = None,  # pass-through for anything not covered
) -> list[dict]:                     # unified ccxt order dicts, oldest-first
```

The caller only ever thinks in milliseconds UTC. All exchange-specific translation happens internally.

---

## Data Flow

```
get_closed_orders(exchange, symbol, startTime, endTime, limit, params)
        │
        ├─ look up EXCHANGE_CONFIG[exchange.id]
        ├─ split window into N chunks of ≤ max_days
        │
        └─ for each chunk:
                _fetch_chunk(since_ms, until_ms, ...)
                        │
                        └─ loop:
                                _build_params()  ← injects correct key names & units
                                fetch_closed_orders() or fetch_orders() fallback
                                filter to window, advance cursor
                                break when page < max_limit or limit reached
        │
        └─ deduplicate by order ID → sort oldest-first → return[:limit]
```

---

## Adding a New Exchange

1. Look up the exchange's API docs for: max query window in days, max page size, and timestamp parameter names/format.
2. Add one entry to `EXCHANGE_CONFIG`. If the parameter style doesn't exist yet, add a new `elif` branch in `_build_params()`.
3. Done — chunking, pagination, and translation all work automatically.
