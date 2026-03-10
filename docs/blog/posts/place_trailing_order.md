# `place_trailing_order` — Trailing Stop for Open Swap/Futures Positions

Places a trailing stop order that tracks the market price at a fixed distance. When the market retraces by the callback amount from the peak (long) or trough (short), the stop triggers and closes the position.

---

## Public Interface

```python
async def place_trailing_order(
    exchange         : ccxt.Exchange,
    symbol           : str,                   # e.g. "BTC/USDT:USDT"
    side             : str,                   # side of your OPEN POSITION: "buy" | "sell"
    amount           : float,                 # qty to protect
    callback_pct     : float | None = None,   # e.g. 1.5 → trail 1.5% from peak
    callback_abs     : float | None = None,   # e.g. 500 → trail $500 from peak
    activation_price : float | None = None,   # price at which trailing starts
    params           : dict | None = None,    # extra params forwarded verbatim
) -> TrailingResult
```

> `side` is the side of the **existing position**, not the closing order. A `"buy"` (long) position is protected by a trailing sell order; a `"sell"` (short) position by a trailing buy order. The function handles the direction flip internally.

---

## Output: `TrailingResult`

```python
@dataclass
class TrailingResult:
    order            : dict   # raw ccxt or exchange response dict
    activation_price : float  # 0.0 if activates immediately
    callback_value   : float  # the trailing distance used
    callback_type    : str    # "pct" | "absolute"
    _exchange        : str    # exchange id tag
```

---

## Callback Styles

Trailing distance can be expressed as a percentage or an absolute price distance. Not all exchanges support both.

| Exchange | `callback_pct` | `callback_abs` | Internal param | Notes |
|---|---|---|---|---|
| Binance USDM | ✅ | ❌ | `callbackRate` | Plain % value (1.5 = 1.5%). Min 0.1, max 5. |
| Bybit | ❌ | ✅ | `trailingStop` | Absolute price distance only |
| OKX | ✅ | ✅ | `callbackRatio` / `callbackSpread` | Ratio is decimal (1.5% → 0.015) |
| Bitget | ✅ | ❌ | `callbackRatio` | Decimal ratio (1.5% → 0.015) |
| BingX | ✅ | ❌ | `trailingStopRate` | Plain % value (1.5 = 1.5%) |
| Gate.io | ❌ | ✅ | `trailing_stop` | Absolute integer distance on open position |
| MEXC | ✅ | ❌ | `trailingStopRate` | Plain % value; applied to open position |
| KuCoin Futures | ✅ | ❌ | `trailingStopCallback` | Decimal ratio (1.5% → 0.015) |

The internal normalisation (`_pct_to_exchange()`) handles the plain-% vs decimal-ratio conversion automatically based on `exchange_id`. You always pass `callback_pct=1.5` for 1.5% regardless of exchange.

---

## Activation Price

When provided, trailing does not start until the market touches `activation_price`. After activation, the trailing distance locks onto the best price reached and follows it.

```
Long position, callback_pct=1.5, activation_price=62000:

  Market rises to 62000  →  trailing activates
  Market rises to 65000  →  trail stop = 65000 × (1 - 0.015) = 63,975
  Market drops to 63,975 →  TRIGGERED, position closed
```

If `activation_price` is omitted, trailing activates at the current market price.

---

## Three-Tier Architecture

The config dict `EXCHANGE_TRAILING_CONFIG` assigns every exchange to a tier.

### Tier 1 — Native Trailing Order (1 round-trip)

The exchange has a dedicated trailing order type. The function places it directly.

| Exchange | Order type | Mechanism |
|---|---|---|
| Binance USDM | `TRAILING_STOP_MARKET` | `create_order` with `callbackRate` |
| OKX | `move_order_stop` (algo) | `create_order`; algo endpoint handles trailing |
| Bitget | `track_plan` | Implicit `private_post_api_v2_mix_order_place_tpsl_order` |
| BingX | `TRAILING_STOP_MARKET` | `create_order` with `trailingStopRate` |
| Bybit | Position trading-stop | `private_post_v5_position_trading_stop` — applied to open position |

### Tier 2 — Position-Level TP/SL (requires open position)

These exchanges have no standalone trailing order type. Instead, trailing is set on the open position via a "set trading stop" or "change TPSL" endpoint. **An open position for the symbol must exist.**

| Exchange | Mechanism | Param |
|---|---|---|
| Gate.io | `futures_put_settle_positions_contract` | `trailing_stop` (absolute integer) |
| MEXC | `contract_post_position_change_tpsl` | `trailingStopRate` (plain %) |
| KuCoin Futures | `private_post_api_v1_stop_order` | `trailingStopCallback` (decimal ratio) |

### Tier 3 — Not Supported

| Exchange | Reason |
|---|---|
| Hyperliquid | No trailing stop endpoint exposed via API |
| Aevo | No trailing stop endpoint exposed via API |
| Alpaca | Crypto futures trailing not available via API |
| BitoPro | No trailing stop endpoint available |

Raises `TrailingNotSupportedError` immediately with a clear message.

---

## Config Dict

```python
EXCHANGE_TRAILING_CONFIG = {
    "binanceusdm": {
        "tier"              : "native_trailing",
        "order_type"        : "TRAILING_STOP_MARKET",
        "callback_styles"   : ["pct"],
        "pct_key"           : "callbackRate",
        "activation_key"    : "activationPrice",
        "category_param"    : {},
        "notes"             : "callbackRate is plain %. Min 0.1, max 5.",
    },
    "bybit": {
        "tier"              : "native_trailing",
        "callback_styles"   : ["absolute"],
        "absolute_key"      : "trailingStop",
        "activation_key"    : "activePrice",
        "position_tpsl_fn"  : "private_post_v5_position_trading_stop",
        "category_param"    : {"category": "linear"},
    },
    "okx": {
        "tier"              : "native_trailing",
        "order_type"        : "move_order_stop",
        "callback_styles"   : ["pct", "absolute"],
        "pct_key"           : "callbackRatio",      # decimal: 0.015 = 1.5%
        "absolute_key"      : "callbackSpread",
        "activation_key"    : "activePx",
    },
    ...
}
```

Each entry has these fields:

| Field | Purpose |
|---|---|
| `tier` | `"native_trailing"`, `"position_tpsl"`, or `"not_supported"` |
| `callback_styles` | Which input styles the exchange accepts |
| `pct_key` / `absolute_key` | Param key names for each callback style |
| `activation_key` | Param key name for the activation price |
| `category_param` | Static params always merged into every call |
| `position_tpsl_fn` | Implicit ccxt endpoint name (position_tpsl tier) |
| `notes` | Caveats on value format, constraints, requirements |

---

## Error Handling

| Exception | When | What was placed |
|---|---|---|
| `ValueError` | Invalid input (no callback given, wrong style for exchange) | Nothing |
| `TrailingNotSupportedError` | Exchange in Tier 3 | Nothing |
| `TrailingOrderError` | API call failed after dispatch | `.cause` holds original exception |
| `ccxt.BaseError` | Low-level exchange error | Nothing or partial |

```python
try:
    result = await place_trailing_order(
        exchange     = exchange,
        symbol       = "BTC/USDT:USDT",
        side         = "buy",
        amount       = 0.01,
        callback_pct = 1.5,
    )
    print(f"Trailing set — callback: {result.callback_value}%")

except TrailingNotSupportedError as e:
    print(f"Exchange doesn't support trailing stops: {e}")

except ValueError as e:
    print(f"Wrong callback style for this exchange: {e}")

except TrailingOrderError as e:
    print(f"Placement failed: {e.cause}")
```

---

## Exchange-Specific Notes

**Bybit** — trailing is applied to the open position, not as a new order. `positionIdx=0` is used for one-way mode. For hedge mode, pass `params={"positionIdx": 1}` (long) or `{"positionIdx": 2}` (short).

**OKX** — uses the algo order endpoint (`/api/v5/trade/order-algo`). For futures in hedge mode, pass `params={"tdMode": "cross", "posSide": "long"}` or `"short"`. For net mode, `posSide="net"` (default).

**Bitget** — uses the plan order endpoint with `planType="track_plan"`. `callbackRatio` is a decimal ratio string (`"0.015"` for 1.5%).

**Gate.io** — `trailing_stop` must be an integer (rounds down). This endpoint modifies the open position's trailing distance directly, not an independent order.

**KuCoin Futures** — `amount` is interpreted as contract units (integers). KuCoin's trailing stop is tied to the stop order mechanism; `trailingStopCallback` is a decimal ratio.

---

## Relationship to `place_bracket_order`

| Function | When to use |
|---|---|
| `place_bracket_order` | Entry order + fixed TP + fixed SL placed together |
| `place_trailing_order` | Dynamic trailing stop on an ALREADY OPEN position |

These can be used together: place a bracket order when entering, then replace or supplement the static SL with a trailing stop once the position is in profit.

```python
# Enter with bracket
bracket = await place_bracket_order(exchange, symbol, "buy", 0.01, 60_000,
                                    tp_price=64_000, sl_price=59_000)

# Once price moves in your favour, switch to trailing
trailing = await place_trailing_order(exchange, symbol, "buy", 0.01,
                                      callback_pct=1.5, activation_price=62_000)
```
