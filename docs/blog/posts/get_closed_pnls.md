# `get_closed_pnls` — Swap / Futures Closed PnL

Fetches closed swap and futures PnL records across multiple exchanges and returns every record in a single unified schema — matching Bybit's `private_get_v5_position_closed_pnl()` response — so downstream code never needs to branch on exchange.

---

## Public Interface

```python
async def get_closed_pnls(
    exchange  : ccxt.Exchange,
    symbol    : str | None = None,   # e.g. "BTC/USDT:USDT". None = all symbols
    startTime : int | None = None,   # ms UTC, default: 24 h ago
    endTime   : int | None = None,   # ms UTC, default: now
    limit     : int = 200,
    params    : dict | None = None,  # extra params forwarded verbatim
) -> list[dict]
```

**Returns** a list of canonical PnL dicts sorted oldest-first.

> For Binance futures use `ccxt.async_support.binanceusdm`.
> For KuCoin futures use `ccxt.async_support.kucoinfutures`.

---

## Output Schema

Every record mirrors Bybit's v5 closed-pnl list item exactly. All numeric fields are returned as strings (matching Bybit's native format).

| Field | Type | Description |
|---|---|---|
| `symbol` | str | Raw exchange symbol, e.g. `BTCUSDT` |
| `orderId` | str | Order or position ID |
| `side` | str | `Buy` or `Sell` |
| `qty` | str | Position qty closed |
| `orderPrice` | str | Order price |
| `orderType` | str | `Market` or `Limit` |
| `execType` | str | `Trade`, `Liquidation`, etc. |
| `closedSize` | str | Closed size (base asset) |
| `cumEntryValue` | str | Cost basis consumed (`closedSize × avgEntryPrice`) |
| `avgEntryPrice` | str | Average entry price |
| `cumExitValue` | str | Exit value (`closedSize × avgExitPrice`) |
| `avgExitPrice` | str | Average exit price |
| `closedPnl` | str | Net PnL (pre-fee where exchange doesn't provide it) |
| `openFee` | str | Opening-side trading fee |
| `closeFee` | str | Closing-side trading fee |
| `leverage` | str | Position leverage |
| `createdTime` | str | Open timestamp (ms) |
| `updatedTime` | str | Close timestamp (ms) |
| `_exchange` | str | Exchange ID tag for debugging |

---

## Exchange Config Dict

All exchange differences are captured in a single dict `EXCHANGE_PNL_CONFIG`. Every entry has five fields:

| Field | Purpose |
|---|---|
| `max_days` | Maximum calendar-day span the exchange accepts per request |
| `max_limit` | Maximum records per page |
| `strategy` | Which internal fetch branch to invoke |
| `time_style` | How timestamp params are named and formatted |
| `extra` | Static params always merged into every request |

```python
EXCHANGE_PNL_CONFIG = {
    "binanceusdm": {"max_days": 30,  "max_limit": 1000, "strategy": "binance_income",           "time_style": "startTime_endTime_ms",    "extra": {"incomeType": "REALIZED_PNL"}},
    "bybit"      : {"max_days": 7,   "max_limit": 100,  "strategy": "bybit_native",              "time_style": "startTime_endTime_ms",    "extra": {"category": "linear"}},
    "okx"        : {"max_days": 90,  "max_limit": 100,  "strategy": "okx_position_history",      "time_style": "before_after_ms",         "extra": {"instType": "SWAP"}},
    "gateio"     : {"max_days": 30,  "max_limit": 1000, "strategy": "gateio_trades",             "time_style": "from_to_sec",             "extra": {"settle": "usdt"}},
    "bitget"     : {"max_days": 90,  "max_limit": 100,  "strategy": "bitget_history_position",   "time_style": "startTime_endTime_ms",    "extra": {"productType": "USDT-FUTURES"}},
    "bingx"      : {"max_days": 7,   "max_limit": 1000, "strategy": "bingx_fullorder",           "time_style": "startTs_endTs_ms",        "extra": {}},
    "mexc"       : {"max_days": 90,  "max_limit": 1000, "strategy": "mexc_trades",               "time_style": "start_time_end_time_ms",  "extra": {}},
    "kucoinfutures":{"max_days": 7,  "max_limit": 200,  "strategy": "kucoin_history_positions",  "time_style": "startAt_endAt_ms",        "extra": {}},
    "hyperliquid": {"max_days": 180, "max_limit": 2000, "strategy": "hyperliquid_fills",         "time_style": "startTime_endTime_ms",    "extra": {}},
    "aevo"       : {"max_days": 30,  "max_limit": 500,  "strategy": "aevo_positions",            "time_style": "startTime_endTime_ms",    "extra": {}},
    "alpaca"     : {"strategy": "not_supported", ...},
    "bitopro"    : {"strategy": "not_supported", ...},
}
```

Adding a new exchange = adding one line to this dict. No other code changes.

---

## Timestamp Styles

| Style | Key names | Unit | Used by |
|---|---|---|---|
| `startTime_endTime_ms` | `startTime`, `endTime` | milliseconds | Binance, Bybit, Bitget, MEXC, Hyperliquid, Aevo |
| `before_after_ms` | `before` (newer), `after` (older) | milliseconds | OKX |
| `from_to_sec` | `from`, `to` | **seconds** | Gate.io |
| `startAt_endAt_ms` | `startAt`, `endAt` | milliseconds | KuCoin |
| `startTs_endTs_ms` | `startTs`, `endTs` | milliseconds | BingX |
| `start_time_end_time_ms` | `start_time`, `end_time` | milliseconds | MEXC |

---

## Strategy Tiers

| Tier | Exchanges | Mechanism |
|---|---|---|
| **Native closed-PnL** | Bybit | `private_get_v5_position_closed_pnl` — direct match to output schema |
| **Dedicated position-history endpoint** | OKX, Bitget, KuCoin, Binance | Exchange-specific implicit ccxt calls |
| **Trade-based derivation** | Gate.io, BingX, MEXC, Hyperliquid, Aevo | `fetch_my_trades` + filter non-zero `realizedPnl` from `info` |
| **Not supported (stub)** | Alpaca, BitoPro | Raises `NotImplementedError` with explanation |

---

## Normaliser Functions

Each strategy has its own `_norm_*` function that maps the raw exchange response to the canonical schema. A lookup table `_NORMALISERS` connects strategy name → normaliser so `get_closed_pnls()` always executes the same two lines regardless of exchange:

```python
normaliser = _NORMALISERS.get(cfg["strategy"], _norm_generic_trade)
normalised = [normaliser(r, exchange_id) for r in all_raw]
```

---

## Data Flow

```
get_closed_pnls(exchange, symbol, startTime, endTime, limit, params)
│
├─ look up EXCHANGE_PNL_CONFIG[exchange.id]
├─ split window into N chunks  (ceil(total_ms / max_days_ms))
│
└─ for each chunk:
        _fetch_pnl_chunk()  →  dispatch by cfg["strategy"]
              │
              ├─ bybit_native          : cursor-paginated via nextPageCursor
              ├─ binance_income        : timestamp-cursor pagination
              ├─ okx_position_history  : posId cursor pagination
              ├─ bitget_history_pos    : endId cursor pagination
              ├─ kucoin_history_pos    : page-number pagination
              └─ generic_trades        : timestamp-cursor via fetch_my_trades
│
├─ normalise all raw records  →  canonical schema
├─ deduplicate by (orderId, createdTime)
└─ sort ascending by createdTime  →  return[:limit]
```

---

## Adding a New Exchange

1. Look up: max query window in days, max page size, timestamp param names/format.
2. Add one entry to `EXCHANGE_PNL_CONFIG` with the appropriate `strategy`.
3. If the strategy doesn't exist yet, add a `_strategy_*` function and a `_norm_*` normaliser.
4. Register the normaliser in `_NORMALISERS`.
