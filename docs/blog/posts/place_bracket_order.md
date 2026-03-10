# `place_bracket_order` — Limit Entry with TP and SL

Places a swap/futures limit entry order together with a Take-Profit and a Stop-Loss order across multiple exchanges. Returns a unified `BracketResult` regardless of exchange so downstream code never branches on how each exchange links TP/SL to the entry.

---

## Public Interface

```python
async def place_bracket_order(
    exchange    : ccxt.Exchange,
    symbol      : str,                   # e.g. "BTC/USDT:USDT"
    side        : str,                   # "buy" (long) | "sell" (short)
    amount      : float,                 # base asset qty
    entry_price : float,                 # limit entry price
    tp_price    : float | None = None,   # absolute TP trigger price
    sl_price    : float | None = None,   # absolute SL trigger price
    tp_pct      : float | None = None,   # TP as % distance from entry
    sl_pct      : float | None = None,   # SL as % distance from entry
    params      : dict | None = None,    # extra params forwarded to all orders
) -> BracketResult
```

**Returns** `BracketResult(entry, tp, sl)` — three ccxt order dicts.

> For Binance futures use `ccxt.async_support.binanceusdm`.
> For KuCoin futures use `ccxt.async_support.kucoinfutures`.

---

## Output: `BracketResult`

```python
@dataclass
class BracketResult:
    entry : dict   # ccxt order dict for the limit entry
    tp    : dict   # ccxt order dict for the TP leg
    sl    : dict   # ccxt order dict for the SL leg
```

For **attached-tier** exchanges, TP and SL have no independent order IDs on the exchange side — they live inside the entry order. In this case `tp.id` and `sl.id` are `None` and both dicts carry `"_attached": True`. All other fields (`symbol`, `side`, `price`, `amount`, `status`) are populated so the shape is always consistent.

---

## TP/SL Price Resolution

Absolute prices take priority over percentage offsets. Both can be passed at the same time — the absolute value wins.

| Parameter | Long (`"buy"`) | Short (`"sell"`) |
|---|---|---|
| `tp_pct = 2.0` | `entry × 1.02` | `entry × 0.98` |
| `sl_pct = 1.0` | `entry × 0.99` | `entry × 1.01` |

Sanity checks are enforced before any order is placed:

- **Long**: `sl < entry < tp` — raises `ValueError` immediately if violated.
- **Short**: `tp < entry < sl` — raises `ValueError` immediately if violated.

---

## Two-Tier Architecture

The config dict `EXCHANGE_BRACKET_CONFIG` assigns every exchange to one of two tiers based on whether TP/SL can be embedded in the entry order body.

### Tier 1 — Attached (1 round-trip, server-side linked)

TP and SL are sent inside the entry order's `params`. The exchange links them atomically.

| Exchange | TP param | SL param | Notes |
|---|---|---|---|
| **Bybit** | `takeProfit` | `stopLoss` | Flat keys + `tpslMode="Full"` |
| **OKX** | `takeProfitPrice` | `stopLossPrice` | ccxt unified keys; translated internally |
| **Bitget** | `presetStopSurplusPrice` | `presetStopLossPrice` | Preset on entry order |
| **BingX** | Nested `TAKE_PROFIT_MARKET` dict | Nested `STOP_MARKET` dict | Sub-dict structure |

### Tier 2 — Sequential (3 round-trips, best-effort)

Entry is placed first. Then TP and SL are placed as separate reduce-only orders. If either fails, `BracketOrderError` is raised — the entry is **left open**.

| Exchange | TP order type | SL order type |
|---|---|---|
| **Binance (USDM)** | `TAKE_PROFIT_MARKET` | `STOP_MARKET` |
| **Gate.io** | `limit` | `limit` |
| **MEXC** | `TAKE_PROFIT_MARKET` | `STOP_MARKET` |
| **KuCoin Futures** | `limit` | `limit` |
| **Hyperliquid** | `limit` | `stop` |
| **Aevo** | `limit` | `stop_loss` |
| **Alpaca** | `limit` | `stop` |
| **BitoPro** | `limit` | `stop_limit` |

---

## Config Dict

```python
EXCHANGE_BRACKET_CONFIG = {
    "bybit": {
        "tier"          : "attached",
        "category_param": {"category": "linear"},
        "attached_keys" : {"tp_trigger": "takeProfit", "sl_trigger": "stopLoss", ...},
        "tpsl_mode"     : "Full",
        "reduce_only_key": "reduceOnly",
    },
    "binanceusdm": {
        "tier"          : "sequential",
        "category_param": {},
        "tp_order_type" : "TAKE_PROFIT_MARKET",
        "sl_order_type" : "STOP_MARKET",
        "reduce_only_key": "reduceOnly",
    },
    ...
}
```

Each entry has:

| Field | Purpose |
|---|---|
| `tier` | `"attached"` or `"sequential"` |
| `category_param` | Static params always merged into every order (e.g. `{"category": "linear"}`) |
| `attached_keys` | Exchange-specific param names for TP/SL trigger prices (attached tier only) |
| `tp_order_type` / `sl_order_type` | Order type strings for TP/SL orders (sequential tier only) |
| `reduce_only_key` | Param key name for the reduce-only flag (`"reduceOnly"` or `"reduce_only"`) |

---

## Failure Handling

If the **entry order fails**, a standard `ccxt.BaseError` propagates — nothing was placed.

If the **entry succeeds but TP/SL placement fails** (sequential tier only):

- The entry order is **left open** (no automatic cancellation).
- `BracketOrderError` is raised carrying:

```python
class BracketOrderError(Exception):
    entry_order : dict                        # the successful entry order
    tp_order    : dict | None                 # placed TP (None if it failed)
    sl_order    : dict | None                 # placed SL (None if it failed)
    errors      : list[tuple[str, Exception]] # [("TP", exc), ("SL", exc)]
```

**Recommended handling:**

```python
try:
    result = await place_bracket_order(exchange, symbol, ...)
except BracketOrderError as e:
    print(f"Entry {e.entry_order['id']} is open WITHOUT TP/SL — intervene manually!")
    for label, exc in e.errors:
        print(f"  {label} failed: {exc}")
except ValueError as e:
    print(f"Invalid price logic: {e}")   # nothing was placed
```

---

## Data Flow

```
place_bracket_order(exchange, symbol, side, amount, entry_price, ...)
│
├─ _resolve_prices()        validate + compute absolute tp/sl prices
├─ load_markets()           needed for price_to_precision()
├─ look up EXCHANGE_BRACKET_CONFIG[exchange.id]
│
├─ tier == "attached"
│       └─ _place_attached_*(exchange, ..., tp_price, sl_price)
│               └─ create_order(entry_params + tp/sl keys embedded)
│               └─ return BracketResult(entry, tp_placeholder, sl_placeholder)
│
└─ tier == "sequential"
        └─ _place_sequential(exchange, ...)
                ├─ create_order(entry)           ← raises ccxt.BaseError on fail
                ├─ create_order(TP, reduceOnly)  ← captured; stored in errors on fail
                ├─ create_order(SL, reduceOnly)  ← captured; stored in errors on fail
                └─ raise BracketOrderError if any errors, else return BracketResult
```

---

## Usage Examples

```python
# Long BTC — absolute prices
result = await place_bracket_order(
    exchange    = bybit,
    symbol      = "BTC/USDT:USDT",
    side        = "buy",
    amount      = 0.01,
    entry_price = 60_000,
    tp_price    = 62_000,
    sl_price    = 59_000,
)

# Short ETH — percentage offsets
result = await place_bracket_order(
    exchange    = bybit,
    symbol      = "ETH/USDT:USDT",
    side        = "sell",
    amount      = 0.1,
    entry_price = 3_000,
    tp_pct      = 3.0,    # TP at 3% below entry → 2910
    sl_pct      = 1.5,    # SL at 1.5% above entry → 3045
)

# Access results
print(result.entry["id"])
print(result.tp["price"])    # None if _attached: True
print(result.sl["price"])
```
