# CCXT Unified Order Constants: Status, Type, Side, and Time-in-Force

If you've worked with multiple crypto exchanges, you've probably hit the inconsistency wall — one exchange says `"cancelled"`, another says `"canceled"`, a third returns `"CANCELED"`, and side values range from `"buy"` to `"Buy"` to `"BUY"`. CCXT's unified API normalizes these differences, but it doesn't provide importable constant classes. This post documents the exact string values you can rely on, and how to wrap them cleanly in your own codebase.

---

## Does CCXT Provide Enum Classes?

**No.** CCXT does not ship built-in enum or constant classes for `OrderStatus`, `OrderType`, `OrderSide`, `PositionSide`, or `TimeInForce` in Python. These are raw strings internally, with TypeScript-side `Literal` type hints only. You're expected to use the strings directly — which is why defining your own constants is a good idea.

---

## OrderStatus — 5 Unified Values

| Value | Meaning |
|---|---|
| `open` | Active — unfilled or partially filled but still live |
| `closed` | Fully filled (`filled == amount`) |
| `canceled` | Cancelled by user — **single `l`**, American spelling |
| `expired` | Order expired (e.g. day orders, GTD) |
| `rejected` | Rejected by the exchange |

### ⚠️ Spelling Gotcha

CCXT uses **`"canceled"`** (American English, one `l`). This trips up a lot of developers coming from exchanges that return `"cancelled"`.

### What About "Partially Filled"?

There is intentionally **no `partially_filled` status**. The reason: a partial fill is ambiguous — it could mean the order is still live and accumulating fills, or it was cancelled after a partial fill. Instead, CCXT encodes this state via the `filled` field:

```python
# Partially filled and still active:
order['status'] == 'open' and order['filled'] > 0

# Partially filled then cancelled:
order['status'] == 'canceled' and order['filled'] > 0
```

---

## OrderType — Standard Values

```python
'market'
'limit'
'limit_maker'          # Post-only limit
'stop'
'stop_limit'
'stop_market'
'take_profit'
'take_profit_limit'
'take_profit_market'
```

> **Note:** Conditional order types like `stop`, `take_profit`, etc. are increasingly exchange-specific. Some exchanges require these to be passed via the `params` dict rather than as the primary `type` argument. Always check the exchange's CCXT docs.

---

## OrderSide — 2 Unified Values

| Value | Meaning |
|---|---|
| `buy` | Buy order |
| `sell` | Sell order |

Always **lowercase**. Exchanges that return `'Buy'`/`'Sell'` or `'BUY'`/`'SELL'` are normalized by CCXT automatically.

---

## PositionSide — For Futures / Hedge Mode

| Value | Meaning |
|---|---|
| `long` | Long position |
| `short` | Short position |

Used in the `side` field of **position structures** (not order structures). Also passed as `positionSide` / `posSide` when placing orders in **hedge mode** on exchanges like Binance Futures or Bybit.

```python
# One-way mode: just use OrderSide
exchange.create_order(symbol, 'limit', 'buy', amount, price)

# Hedge mode: specify positionSide via params
exchange.create_order(symbol, 'limit', 'buy', amount, price, params={
    'positionSide': 'long'   # or 'short'
})
```

> **Note:** In one-way mode, `PositionSide` is inferred from `OrderSide`. Hedge mode requires it to be explicit.

---

## TimeInForce — Standard Values

| Value | Full Name | Meaning |
|---|---|---|
| `GTC` | Good Till Canceled | Default; stays open until filled or manually cancelled |
| `IOC` | Immediate Or Cancel | Fill what's possible immediately; cancel the rest |
| `FOK` | Fill Or Kill | Must fill entirely at once or cancel completely |
| `PO` | Post Only | Maker-only; rejected if it would execute as a taker |
| `GTD` | Good Till Date | Expires at a specified timestamp (limited support) |

Support varies by exchange. You can check an exchange's supported TIF types at runtime:

```python
exchange.features['createOrder']['timeInForce']
# e.g. {'GTC': True, 'IOC': True, 'FOK': True, 'PO': True, 'GTD': False}
```

---

## Recommended: Define Your Own Constants

Since CCXT provides no enum classes, wrap the strings yourself to avoid magic string bugs:

```python
class OrderStatus:
    OPEN     = 'open'
    CLOSED   = 'closed'
    CANCELED = 'canceled'   # single 'l'
    EXPIRED  = 'expired'
    REJECTED = 'rejected'


class OrderType:
    MARKET             = 'market'
    LIMIT              = 'limit'
    LIMIT_MAKER        = 'limit_maker'
    STOP               = 'stop'
    STOP_LIMIT         = 'stop_limit'
    STOP_MARKET        = 'stop_market'
    TAKE_PROFIT        = 'take_profit'
    TAKE_PROFIT_LIMIT  = 'take_profit_limit'
    TAKE_PROFIT_MARKET = 'take_profit_market'


class TimeInForce:
    GTC = 'GTC'   # Good Till Canceled (default)
    IOC = 'IOC'   # Immediate Or Cancel
    FOK = 'FOK'   # Fill Or Kill
    PO  = 'PO'    # Post Only
    GTD = 'GTD'   # Good Till Date


class OrderSide:
    BUY  = 'buy'
    SELL = 'sell'


class PositionSide:
    LONG  = 'long'
    SHORT = 'short'
```

---

## Mapping From Exchange-Specific Values

If you're building on top of a raw exchange integration (or maintaining legacy code), here's a quick mapping of common exchange-native values to their CCXT equivalents:

| Raw Exchange Value | CCXT Unified Value | Notes |
|---|---|---|
| `Buy`, `BUY` | `buy` | Side normalization |
| `Sell`, `SELL` | `sell` | Side normalization |
| `NEW`, `new` | `open` | Bybit, Binance |
| `PARTIALLY_FILLED` | `open` | Binance — check `filled > 0` |
| `FILLED` | `closed` | Binance |
| `CANCELED`, `CANCELLED` | `canceled` | Varies by exchange |
| `DEACTIVATED` | `expired` or `canceled` | HTX (Huobi) |
| `SUBMITTED` | `open` or `triggered` | HTX plan orders |
| `TRIGGERED` | `open` | Conditional orders post-trigger |

---

## Fetching Fee Rates

There are three sources of fee rates in CCXT, each with different trade-offs.

### 1. `market['maker']` / `market['taker']` — from `load_markets()`

```python
exchange.load_markets()
market = exchange.market('BTC/USDT')

maker = market['maker']   # e.g. 0.001 = 0.1%
taker = market['taker']   # e.g. 0.002 = 0.2%
```

Free and requires no API key, but returns the **exchange default** — it does not reflect your VIP level or volume tier discounts.

### 2. `fetch_trading_fee(symbol)` — account-specific, single market

```python
fee = await exchange.fetch_trading_fee('BTC/USDT')
# {'symbol': 'BTC/USDT', 'maker': 0.001, 'taker': 0.001, 'info': {...}}
```

Requires an API key and returns your **actual account rates**. Not all exchanges support this — check `exchange.has['fetchTradingFee']` first. Always validate the result as some exchanges return `None` even when the method exists.

### 3. `fetch_trading_fees()` — account-specific, all markets

```python
fees = await exchange.fetch_trading_fees()
# {'BTC/USDT': {'maker': 0.001, 'taker': 0.001}, ...}
```

Most accurate, but expensive. **Cache the result** — do not call this per order.

### Best Practice: Layered Fallback

```python
async def get_fee_rate(exchange, symbol):
    """Get maker/taker rates with graceful fallback."""

    # 1. Try account-specific (most accurate, one API call)
    if exchange.has.get('fetchTradingFee'):
        try:
            fee = await exchange.fetch_trading_fee(symbol)
            if fee.get('maker') is not None:
                return fee['maker'], fee['taker']
        except Exception:
            pass

    # 2. Fall back to market default (no API key needed)
    market = exchange.market(symbol)
    if market.get('maker') is not None:
        return market['maker'], market['taker']

    # 3. Fall back to exchange-level defaults
    return exchange.fees['trading']['maker'], exchange.fees['trading']['taker']
```

---

## Bybit: `fetch_trading_fee` and the `category` Parameter

Bybit's V5 API requires a `category` parameter (`linear`, `spot`, `inverse`, `option`) on private endpoints. Without it, `fetch_trading_fee` throws:

```
BadRequest('bybit {"retCode":10001,"retMsg":"","result":{},...}')
```

### Fix: Pass `category` explicitly

```python
fee = await exchange.fetch_trading_fee(
    'BTC/USDT:USDT',
    params={'category': 'linear'}
)
```

### Or set `defaultType` on the exchange instance

```python
exchange = ccxt.bybit({
    'apiKey': '...',
    'secret': '...',
    'options': {
        'defaultType': 'swap',   # instructs ccxt to use 'linear' for perpetuals
    }
})
```

### Bybit Category Mapping

| CCXT Symbol | Bybit `category` | Market Type |
|---|---|---|
| `BTC/USDT` | `spot` | Spot |
| `BTC/USDT:USDT` | `linear` | Linear perpetual (USDT-margined) |
| `BTC/USD:BTC` | `inverse` | Inverse perpetual (coin-margined) |
| `BTC/USDT:USDT-241229` | `linear` | Linear futures (dated) |
| `BTC/USDT:USDT-...-C/P` | `option` | Options |

### Recommended Bybit Helper

```python
BYBIT_CATEGORY_MAP = {
    'spot':   'spot',
    'swap':   'linear',
    'future': 'linear',
    'option': 'option',
}

async def get_bybit_fee_rate(exchange, symbol):
    market = exchange.market(symbol)
    category = BYBIT_CATEGORY_MAP.get(market['type'], 'linear')

    try:
        fee = await exchange.fetch_trading_fee(symbol, params={'category': category})
        if fee.get('maker') is not None:
            return fee['maker'], fee['taker']
    except Exception:
        pass

    # reliable fallback
    return market['maker'], market['taker']
```

---

## `create_order` with `postOnly` and `reduceOnly`

Both flags are passed via the `params` dict. They are not top-level arguments.

### `postOnly` — Ensure Maker Fill

```python
# ✅ Unified way — ccxt translates to exchange-specific format
order = await exchange.create_order(
    symbol, 'limit', 'buy', amount, price,
    params={'postOnly': True}
)

# Equivalent alternative via timeInForce
order = await exchange.create_order(
    symbol, 'limit', 'buy', amount, price,
    params={'timeInForce': 'PO'}
)
```

> Only valid with `limit` orders. Using with `market` will raise an error on most exchanges.

### `reduceOnly` — Close Position Only

```python
order = await exchange.create_order(
    symbol, 'market', 'sell', amount, None,
    params={'reduceOnly': True}
)
```

> Only applies to **futures/swap** symbols. Ignored or rejected on spot.

### Both Together — Close with Maker Limit

```python
order = await exchange.create_order(
    symbol   = 'BTC/USDT:USDT',
    type     = 'limit',
    side     = 'sell',
    amount   = amount,
    price    = price,
    params   = {
        'postOnly':   True,
        'reduceOnly': True,
    }
)
```

### Quick Reference

| Param | Order type | Market type | Purpose |
|---|---|---|---|
| `postOnly: True` | `limit` only | spot + futures | Ensure maker fill, reject if taker |
| `reduceOnly: True` | `market` or `limit` | futures only | Only reduce existing position, never open |

---

## Bybit: `postOnly` and `reduceOnly` Gotchas

Bybit translates these params differently under the hood:

| CCXT param | Bybit V5 raw param | Notes |
|---|---|---|
| `postOnly: True` | `timeInForce: 'PostOnly'` | CCXT handles translation automatically |
| `reduceOnly: True` | `reduceOnly: true` | Passed through directly |
| both together | limit + `PostOnly` + `reduceOnly` | Works on `linear`/`inverse`, not spot |

In **hedge mode**, also pass `positionIdx`:

```python
order = await exchange.create_order(
    symbol = 'BTC/USDT:USDT',
    type   = 'limit',
    side   = 'sell',
    amount = amount,
    price  = price,
    params = {
        'postOnly':    True,
        'reduceOnly':  True,
        'positionIdx': 1,   # 1 = long side, 2 = short side
    }
)
```

---

## Summary

CCXT normalizes order state into clean, predictable strings — but since there are no built-in constants, you need to define them yourself. The most common pitfalls are:

1. Using `"cancelled"` (double-l) instead of `"canceled"`
2. Expecting a `"partially_filled"` status — check `filled` instead
3. Using `"Buy"`/`"Sell"` (capitalized) instead of `"buy"`/`"sell"`
4. Confusing `OrderSide` (`buy`/`sell`) with `PositionSide` (`long`/`short`) in futures hedge mode
5. Assuming exotic order types (`stop`, `take_profit`) work uniformly across exchanges
6. Calling `fetch_trading_fees()` per order — cache it instead
7. On Bybit: forgetting to pass `category` param to `fetch_trading_fee` for non-spot symbols
8. Using `postOnly` with `market` orders — it's only valid for `limit`
9. Using `reduceOnly` on spot symbols — it's futures/swap only
10. On Bybit hedge mode: forgetting `positionIdx` alongside `reduceOnly`

Define the constant classes above once in your project and reference them everywhere. Your future self will thank you.
