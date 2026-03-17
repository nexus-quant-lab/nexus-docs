# `init_exchange_config` — Exchange Setup by Market Type

Configures an exchange for a specific `(symbol, market_type)` by calling `set_position_mode`, `set_margin_mode`, and `set_leverage` in the correct order with the correct params. Call once at bot startup for every symbol you intend to trade.

---

## Public Interface

```python
async def init_exchange_config(
    exchange      : ccxt.Exchange,
    symbol        : str,
    market_type   : Literal["spot", "margin", "swap"],
    leverage      : float = 1.0,
    margin_mode   : Literal["cross", "isolated"] = "cross",
    position_mode : Literal["one_way", "hedge"]  = "one_way",
    params        : dict | None = None,
) -> None
```

---

## What Each `market_type` Configures

| Step | `spot` | `margin` | `swap` |
|---|---|---|---|
| `set_position_mode` | ❌ | ❌ | ✅ (if exchange supports it) |
| `set_margin_mode` | ❌ | ❌ | ✅ (if exchange supports it) |
| `set_leverage` | ❌ | ✅ | ✅ |

**Swap step order is fixed**: `set_position_mode` → `set_margin_mode` → `set_leverage`. This order is required — most exchanges reject `set_margin_mode` before `set_position_mode`, and reject `set_leverage` before margin mode is set.

### Matching Bitget's own example

```python
# SPOT — nothing needed
await init_exchange_config(exchange, "BTC/USDT", "spot")

# MARGIN — set_leverage only, marginMode injected automatically
await init_exchange_config(exchange, "BTC/USDT", "margin",
                           leverage=5, margin_mode="cross")

# SWAP — full setup in one call
await init_exchange_config(exchange, "BTC/USDT:USDT", "swap",
                           leverage=10, margin_mode="cross", position_mode="one_way")
```

---

## Exchange Config Dict

`EXCHANGE_INIT_CONFIG` is the single source of truth. Each entry has nine fields:

| Field | Purpose |
|---|---|
| `supports_position_mode` | Whether `set_position_mode()` is called |
| `supports_margin_mode` | Whether `set_margin_mode()` is called |
| `supports_leverage` | Whether `set_leverage()` is called |
| `position_mode_scope` | `"symbol"` passes the symbol; `"account"` passes `None` (Binance, OKX — position mode is account-wide) |
| `position_mode_params` | Extra params merged into `set_position_mode()` |
| `margin_mode_params` | Extra params merged into `set_margin_mode()` |
| `leverage_swap_params` | Extra params merged into `set_leverage()` for swap |
| `leverage_margin_params` | Extra params merged into `set_leverage()` for margin |
| `hedge_isolated_leverage` | `True` = call `set_leverage` twice with `holdSide='long'` then `'short'` (Bitget only) |

---

## Exchange Support Matrix

| Exchange | `set_position_mode` | `set_margin_mode` | `set_leverage` | Notes |
|---|---|---|---|---|
| **Binance USDM** | ✅ account-wide | ✅ | ✅ | Rejected if open positions exist |
| **Bybit** | ✅ per-symbol | ✅ | ✅ | `category='linear'` on every call |
| **OKX** | ✅ account-wide | ✅ | ✅ | Unified Account |
| **Gate.io** | ✅ per-symbol | ✅ | ✅ | `settle='usdt'` on every call |
| **Bitget** | ✅ per-symbol | ✅ | ✅ | Isolated + hedge → two `set_leverage` calls |
| **BingX** | ✅ per-symbol | ✅ | ✅ | — |
| **MEXC** | ❌ always one-way | ✅ | ✅ | Position mode not supported |
| **KuCoin Futures** | ❌ always one-way | ✅ | ✅ | Position mode not supported |
| **Hyperliquid** | ❌ | ❌ | ✅ | Leverage only |
| **Aevo** | ❌ | ❌ | ❌ | No setup needed |
| **Alpaca** | ❌ | ❌ | ❌ | No setup needed |
| **BitoPro** | ❌ | ❌ | ❌ | No setup needed |

---

## Error Handling

| Step | On failure |
|---|---|
| `set_position_mode` | Logged as warning, execution continues. Exchanges often error when the setting is already correct. |
| `set_margin_mode` | Logged as warning, execution continues. Same reason. |
| `set_leverage` | **Re-raised.** Wrong leverage = wrong position sizing. Must be correct. |

---

## Bitget: Isolated + Hedge

The only case requiring two `set_leverage` calls. Triggered automatically when `margin_mode="isolated"` and `position_mode="hedge"` on Bitget:

```python
# What happens internally:
await exchange.set_leverage(5, "BTC/USDT:USDT", params={..., "holdSide": "long"})
await exchange.set_leverage(5, "BTC/USDT:USDT", params={..., "holdSide": "short"})
```

No special handling needed from the caller — just pass the normal arguments.

---

## Startup Pattern

```python
# At bot startup, call for every symbol × market_type you trade
symbols_to_init = [
    ("BTC/USDT",      "spot",   {}),
    ("BTC/USDT:USDT", "swap",   {"leverage": 10, "margin_mode": "cross"}),
    ("ETH/USDT:USDT", "swap",   {"leverage": 5,  "margin_mode": "isolated"}),
    ("BTC/USDT",      "margin", {"leverage": 5,  "margin_mode": "cross"}),
]

for symbol, market_type, kwargs in symbols_to_init:
    await init_exchange_config(exchange, symbol, market_type, **kwargs)
```

---

## Relationship to Other Functions

```
init_exchange_config()        ← call first at startup
        ↓
create_margin_order()         ← margin orders (injects per-order borrow params)
place_bracket_order()         ← swap entry + TP + SL
place_trailing_order()        ← swap trailing stop on open position
```

`init_exchange_config` sets account/symbol-level config once. The order functions handle per-order params independently — they don't call `init_exchange_config` themselves.
