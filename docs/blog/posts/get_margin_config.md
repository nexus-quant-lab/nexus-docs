# `get_margin_config`

Read the live margin configuration for a symbol and return ready-to-use `params` dicts for every ccxt order operation.

```python
cfg = await get_margin_config(exchange, "BTC/USDT")

orders    = await exchange.fetch_orders("BTC/USDT",      params=cfg.fetch_orders)
open_ord  = await exchange.fetch_open_orders("BTC/USDT", params=cfg.fetch_open_orders)
one_order = await exchange.fetch_order(id, "BTC/USDT",   params=cfg.fetch_order)
await exchange.cancel_order(id, "BTC/USDT",              params=cfg.cancel_order)
await exchange.cancel_all_orders("BTC/USDT",             params=cfg.cancel_all_orders)
trades    = await exchange.fetch_my_trades("BTC/USDT",   params=cfg.fetch_my_trades)
```

---

## Why this exists

Each exchange routes margin order operations differently depending on whether the account is cross or isolated. Getting the params wrong causes **silent misbehaviour** — the calls succeed but act on the wrong account:

- **Binance** silently returns cross-account data when `isIsolated='TRUE'` is missing, even if you are trading isolated
- **Bybit** spot margin requires `isLeverage=1` on every order, fetch, and cancel call — without it Bybit treats the request as a regular spot call
- **Other exchanges** reject or misroute calls if `marginMode` is absent

This function detects the current mode live from the exchange and returns a `MarginConfig` with the exact params each ccxt method needs, eliminating the per-call lookup.

---

## Signature

```python
async def get_margin_config(
    exchange: ccxt.Exchange,
    symbol  : str,
) -> MarginConfig
```

| Parameter  | Type              | Description                                      |
|------------|-------------------|--------------------------------------------------|
| `exchange` | `ccxt.Exchange`   | Initialised async exchange instance (see Notes)  |
| `symbol`   | `str`             | Unified margin symbol, e.g. `"BTC/USDT"`         |

---

## Returns — `MarginConfig`

| Field              | Type              | Description                                                      |
|--------------------|-------------------|------------------------------------------------------------------|
| `.symbol`          | `str`             | Unified symbol, e.g. `"BTC/USDT"`                               |
| `.margin_mode`     | `'cross'\|'isolated'` | Resolved margin mode                                         |
| `.leverage`        | `int`             | Current leverage (1 if not exposed by the detection endpoint)    |
| `.create_order`    | `dict`            | Params for `create_order()`                                      |
| `.fetch_order`     | `dict`            | Params for `fetch_order()`                                       |
| `.fetch_orders`    | `dict`            | Params for `fetch_orders()` / `fetch_closed_orders()`            |
| `.fetch_open_orders` | `dict`          | Params for `fetch_open_orders()`                                 |
| `.cancel_order`    | `dict`            | Params for `cancel_order()`                                      |
| `.cancel_all_orders` | `dict`          | Params for `cancel_all_orders()`                                 |
| `.fetch_my_trades` | `dict`            | Params for `fetch_my_trades()`                                   |
| `.raw`             | `dict`            | Raw detection response for debugging                             |

---

## Usage

Call once per symbol at startup (or before any trading session). Merge the returned params dicts with your own extra params using `**` unpacking:

```python
cfg = await get_margin_config(exchange, "BTC/USDT")

# Place a margin order
order = await exchange.create_order(
    "BTC/USDT", "limit", "buy", amount, price,
    params={**cfg.create_order, "timeInForce": "GTC"},
)

# Fetch order history
orders = await exchange.fetch_orders("BTC/USDT", params=cfg.fetch_orders)

# Fetch and cancel a specific order
order = await exchange.fetch_order(order_id, "BTC/USDT", params=cfg.fetch_order)
await exchange.cancel_order(order_id, "BTC/USDT", params=cfg.cancel_order)

# Trade history
trades = await exchange.fetch_my_trades("BTC/USDT", params=cfg.fetch_my_trades)

# Inspect what was resolved
print(cfg.margin_mode)   # 'cross' or 'isolated'
print(cfg.leverage)      # e.g. 5
```

---

## Exchange setup

Each exchange requires the right `defaultType` so ccxt routes to the margin endpoints:

| Exchange | `defaultType`   | Notes                                    |
|----------|-----------------|------------------------------------------|
| Binance  | `'margin'`      | Required for all margin endpoints        |
| Bybit    | `'spot'`        | UTA spot margin only                     |
| OKX      | *(not required)* | Unified account handles margin natively |
| Gate.io  | `'margin'`      |                                          |
| Bitget   | `'spot'`        | For spot margin                          |
| BingX    | `'spot'`        |                                          |
| MEXC     | `'spot'`        |                                          |
| KuCoin   | `'margin'`      |                                          |

```python
# Binance
exchange = ccxt.binance({
    "apiKey": "...", "secret": "...",
    "options": {"defaultType": "margin"},
})

# Bybit (UTA spot margin)
exchange = ccxt.bybit({
    "apiKey": "...", "secret": "...",
    "options": {"defaultType": "spot"},
})

# OKX
exchange = ccxt.okx({
    "apiKey": "...", "secret": "...", "password": "...",
})
```

---

## Per-exchange details

### Binance

**Detection:** `GET /sapi/v1/margin/isolated/account?symbols=BTCUSDT`

If the symbol appears in the response with `enabled: true` → isolated. Otherwise → cross. This is per-symbol: a single Binance account can have `BTC/USDT` in cross and `ETH/USDT` in isolated simultaneously.

| Mode     | Injected params                                          |
|----------|----------------------------------------------------------|
| cross    | `{'marginMode': 'cross'}`                                |
| isolated | `{'marginMode': 'isolated', 'isIsolated': 'TRUE'}`       |

Both keys are required for isolated. `isIsolated: 'TRUE'` is the raw Binance API param that routes the request to the isolated margin endpoint. Without it, Binance silently returns cross-account data on every read call.

Leverage is not exposed by the isolated account endpoint and defaults to `1`. Set leverage explicitly with `init_exchange_config`.

---

### Bybit (UTA spot margin)

**Detection:** `GET /v5/account/info` → `result.marginMode`

| Raw value         | Resolved mode |
|-------------------|---------------|
| `ISOLATED_MARGIN` | `isolated`    |
| `REGULAR_MARGIN`  | `cross`       |

Bybit spot margin mode is **account-wide**, not per-symbol. The mode is set once at the account level and applies to all spot margin trading.

| Mode         | Injected params      |
|--------------|----------------------|
| cross        | `{'isLeverage': 1}`  |
| isolated     | `{'isLeverage': 1}`  |

`isLeverage=1` is injected into **all operations** regardless of cross/isolated mode. This flag is what tells Bybit the request is a margin spot order rather than a plain spot order. Without it:
- `create_order` posts to the regular spot account
- `fetch_orders` / `fetch_open_orders` return regular spot orders only
- `cancel_order` may fail to find the order

`marginMode` is **not** passed as a per-order param on Bybit — the exchange infers it from the account setting. The resolved mode is still available on `cfg.margin_mode` for your own logic.

---

### OKX

**Detection:** `fetch_positions([symbol])` → `pos['marginMode']`

Leverage is read from `pos['leverage']`.

| Mode     | Injected params (all ops)      |
|----------|--------------------------------|
| cross    | `{'marginMode': 'cross'}`      |
| isolated | `{'marginMode': 'isolated'}`   |

If no open position exists (flat account), defaults to `cross` / leverage `1`.

---

### Gate.io

**Detection:** `fetch_positions([symbol], params={'settle': 'usdt'})`

`settle: 'usdt'` is required; Gate.io returns an error without it.

| Mode     | Injected params (all ops)      |
|----------|--------------------------------|
| cross    | `{'marginMode': 'cross'}`      |
| isolated | `{'marginMode': 'isolated'}`   |

---

### Bitget

**Detection:** `fetch_positions([symbol], params={'productType': 'USDT-FUTURES'})`

Reads `pos['marginMode']` or `pos['info']['marginMode']`. Note Bitget uses `'crossed'` (not `'cross'`) in the raw response — this is normalised to `'cross'` in `margin_mode`.

| Mode     | Injected params (all ops)      |
|----------|--------------------------------|
| cross    | `{'marginMode': 'cross'}`      |
| isolated | `{'marginMode': 'isolated'}`   |

---

### BingX / MEXC / KuCoin

**Detection:** `fetch_positions([symbol])`

All three use the generic `fetch_positions` strategy with no extra params.

| Mode     | Injected params (all ops)      |
|----------|--------------------------------|
| cross    | `{'marginMode': 'cross'}`      |
| isolated | `{'marginMode': 'isolated'}`   |

---

## Fallback for unrecognised exchanges

For any exchange not in the dispatch table, the function falls back to `fetch_positions` detection with standard `marginMode` params — the same strategy as BingX / MEXC / KuCoin.

---

## Design decisions

**Per-symbol detection for Binance.** Binance is the only exchange that supports a mixed-mode margin account (some symbols in cross, others in isolated on the same account). The detection therefore queries the isolated account endpoint per-symbol on every call, rather than caching an account-level setting.

**Account-level detection for Bybit.** Bybit UTA spot margin mode is a global account setting — it cannot be set per-symbol. `GET /v5/account/info` is the canonical way to read it.

**Uniform params for all operations.** The same params dict is used for `create_order`, `fetch_order`, `fetch_orders`, `fetch_open_orders`, `cancel_order`, `cancel_all_orders`, and `fetch_my_trades`. This is intentional — all seven ccxt margin endpoints on these exchanges use the same routing params, so there is no benefit to differentiating them.

**No caching.** The function makes a live API call on every invocation. The caller decides how often to refresh (e.g. once at startup, or before each trading session). This matches the pattern of `get_swap_config` and `init_exchange_config` in this codebase.

**Leverage defaults to 1 when unavailable.** Binance does not expose leverage in the isolated account endpoint. Bybit does not expose leverage in account info. In both cases `1` is returned as a safe default. Use `init_exchange_config` to set leverage explicitly before trading.
