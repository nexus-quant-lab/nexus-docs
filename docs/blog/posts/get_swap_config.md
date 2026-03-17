# `get_swap_config` — Read Live Swap Configuration

Reads the current `position_mode`, `margin_mode`, and `leverage` from the exchange for a given swap symbol, so you can pass the correct params to `create_order`.

```python
cfg = await get_swap_config(exchange, "BTC/USDT:USDT")
# SwapConfig(position_mode='one_way', margin_mode='cross', leverage=10)
```

---

## Public Interface

```python
async def get_swap_config(
    exchange : ccxt.Exchange,   # initialised async instance in swap/futures mode
    symbol   : str,             # e.g. "BTC/USDT:USDT"
) -> SwapConfig
```

```python
@dataclass
class SwapConfig:
    position_mode : Literal["one_way", "hedge"]
    margin_mode   : Literal["cross", "isolated"]
    leverage      : int
    raw           : dict   # raw API responses for debugging
```

---

## Per-Exchange Data Sources

Each exchange exposes the three config fields in a different place. This table documents the exact source confirmed from live raw API responses.

| Exchange | `position_mode` | `margin_mode` | `leverage` |
|---|---|---|---|
| **binanceusdm** | `fapi/v2/positionRisk` → `positionSide`<br>`BOTH` = one_way, `LONG`/`SHORT` = hedge | same response → `marginType` | same response → `leverage` |
| **bybit** | `fetch_positions` → `info.positionIdx`<br>`0` = one_way, `1`/`2` = hedge | unified `marginMode` | unified `leverage` |
| **okx** | `GET /api/v5/account/config` → `posMode`<br>`net_mode` = one_way, `long_short_mode` = hedge | `fetch_positions` → `info.mgnMode` | `fetch_positions` → `leverage`; fallback to `fetch_leverage` if position is flat (OKX returns `lever=''` for flat positions) |
| **gateio** | `fetch_positions` → `info.mode`<br>`single` = one_way, `dual_long`/`dual_short` = hedge | unified `marginMode` | unified `leverage` |
| **bitget** | `fetch_positions` → `info.posMode`<br>`one_way_mode` = one_way, `hedge_mode` = hedge | unified `marginMode` | unified `leverage` |
| **bingx** | `fetch_positions` → `info.positionMode`<br>`ONE_WAY` = one_way, `HEDGE` = hedge | unified `marginMode` | unified `leverage` |
| **mexc** | always `one_way` | unified `marginMode` | unified `leverage` |
| **kucoinfutures** | always `one_way` | unified `marginMode` | unified `leverage` |
| **hyperliquid** | always `one_way` | always `cross` | unified `leverage` |
| **aevo** | always `one_way` | always `cross` | always `1` |

---

## Why Not Use a Single Unified Call?

ccxt's unified `fetch_positions()` works well for margin and leverage, but **position mode is not in the unified position schema** — it is buried in `info.*` under different keys on every exchange. OKX goes further and stores it in a completely different endpoint (`/account/config`). The mapping table in `EXCHANGE_CONFIG` handles all of this in one place.

---

## Flat Account Behaviour

When there is no open position for the symbol, each exchange behaves differently:

| Exchange | Flat account behaviour |
|---|---|
| **binanceusdm** | V2 always returns a config record even with `positionAmt=0` — always works |
| **bybit** | Returns a zero-size record when queried by symbol — always works |
| **okx** | `position_mode` from account config always works; `leverage` falls back to `fetch_leverage` if `pos.lever == ''` |
| **others** | If `fetch_positions` returns empty list, falls back to `margin_mode='cross'`, `leverage=1` |

> **Note on Binance V2 vs V3:** Binance's newer `fapi/v3/positionRisk` only returns symbols with open positions or open orders — it does not return config for flat accounts. This function uses V2, which always returns config records.

---

## Config Table (`EXCHANGE_CONFIG`)

Adding a new exchange requires one dict entry with nine fields:

```python
"new_exchange": {
    "strategy"              : "fetch_positions",   # or "binance_v2_position_risk" / "okx_account_config"
    "fetch_params"          : {},                  # extra params for fetch_positions()
    "position_mode_fixed"   : None,                # set "one_way" if hedge is unsupported
    "pos_mode_field"        : "info.posMode",      # dot-path into position dict
    "pos_mode_hedge_values" : ["hedge_mode"],      # raw values that mean hedge
    "margin_mode_fixed"     : None,                # set "cross" if exchange only supports cross
    "margin_mode_field"     : "marginMode",        # dot-path for margin mode
    "leverage_fixed"        : None,                # set int if leverage is always fixed
    "leverage_field"        : "leverage",          # dot-path for leverage
},
```

---

## Typical Usage

```python
# Read config before placing a swap order
cfg = await get_swap_config(exchange, "BTC/USDT:USDT")

# Build create_order params based on what the account is actually set to
params = {}
if cfg.margin_mode == "isolated":
    params["marginMode"] = "isolated"
if cfg.position_mode == "hedge":
    params["positionSide"] = "LONG"   # or "SHORT" depending on direction

order = await exchange.create_order(
    symbol, "market", "buy", amount, params=params
)
```

---

## Relationship to `init_exchange_config`

```
init_exchange_config()   ← call once at startup to SET the config
        ↓
get_swap_config()        ← call before trading to READ the current config
        ↓
create_order()           ← use the config to build correct params
```

`init_exchange_config` sets the account/symbol config. `get_swap_config` reads it back so your order-placement code does not need to remember what was set — it just asks the exchange.
