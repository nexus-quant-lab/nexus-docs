# `create_margin_order` — Spot Margin Orders Across Exchanges

Places a spot margin order (cross or isolated) across multiple exchanges. The caller always passes the same three logical parameters — `margin_mode`, `loan_type`, and `params` — and the function injects the correct exchange-specific keys before calling `create_order`.

---

## Why a Separate Function?

For plain spot orders you call `ccxt.create_order()` directly. For margin orders, every exchange expects completely different params to route to its margin endpoint:

| Exchange | What it needs |
|---|---|
| Binance | `{'type': 'margin', 'sideEffectType': 'MARGIN_BUY'}` |
| Bybit | `{'category': 'spot', 'marginMode': 'cross'}` |
| OKX | `{'tdMode': 'cross', 'marginMode': 'cross', 'quickMgnType': 'auto_borrow'}` |
| Bitget | `{'marginMode': 'cross', 'loanType': 'auto_borrow'}` |
| KuCoin | `{'marginMode': 'cross', 'autoBorrow': True, 'autoRepay': False}` |
| Gate.io | `{'marginMode': 'cross_margin'}` |

`create_margin_order()` reads all of this from `EXCHANGE_MARGIN_CONFIG` at runtime and the caller never touches these keys.

---

## Public Interface

```python
async def create_margin_order(
    exchange    : ccxt.Exchange,
    symbol      : str,                         # e.g. "BTC/USDT"
    order_type  : str,                         # "limit" | "market"
    side        : str,                         # "buy" | "sell"
    amount      : float,
    price       : float | None = None,         # required for limit orders
    margin_mode : Literal["cross","isolated"] = "cross",
    loan_type   : Literal["auto_borrow","auto_repay","normal"] = "auto_borrow",
    params      : dict | None = None,          # extra params, applied last
) -> dict                                      # unified ccxt order dict
```

Two convenience wrappers are provided:

```python
await create_margin_limit_order(exchange, symbol, side, amount, price, margin_mode, loan_type)
await create_margin_market_order(exchange, symbol, side, amount, margin_mode, loan_type)
```

---

## Parameters

### `margin_mode`

| Value | Behaviour |
|---|---|
| `"cross"` | Shared margin pool across all pairs. One position's losses draw from the whole account. |
| `"isolated"` | Margin ring-fenced to this symbol only. Max loss = collateral assigned to this pair. |

### `loan_type`

Controls automatic borrowing and repayment. Not all exchanges expose this — see the config table.

| Value | Meaning |
|---|---|
| `"auto_borrow"` | Exchange borrows automatically when your balance is insufficient |
| `"auto_repay"` | Exchange repays the loan automatically when the position is closed |
| `"normal"` | No automatic action; you must borrow and repay manually |

### `params`

Forwarded verbatim, applied **last** — overrides anything the config injects. Use for `timeInForce`, `clientOrderId`, `postOnly`, leverage, etc.

---

## Exchange Support Matrix

| Exchange | Cross | Isolated | `loan_type` supported | Notes |
|---|---|---|---|---|
| **Binance** | ✅ | ✅ | ✅ (`sideEffectType`) | Routes to `/sapi/v1/margin/order` when `type='margin'` is present |
| **Bybit** | ✅ | ✅ | ❌ (auto-handled) | `category='spot'` always required |
| **OKX** | ✅ | ✅ | ✅ (`quickMgnType`) | Unified Account; `tdMode` controls mode |
| **Gate.io** | ✅ | ✅ | ❌ | `marginMode='cross_margin'` or `'isolated_margin'` |
| **Bitget** | ✅ | ✅ | ✅ (`loanType`) | Matches docstring example exactly |
| **BingX** | ✅ | ❌ | ❌ | Cross only |
| **MEXC** | ✅ | ✅ | ❌ | Standard `marginMode` param |
| **KuCoin** | ✅ | ✅ | ✅ (`autoBorrow`/`autoRepay`) | Two separate booleans instead of one key |
| **Alpaca** | ✅ | ❌ | ❌ | Reg-T cross margin only |
| **Hyperliquid** | ❌ | ❌ | — | Raises `MarginNotSupportedError` |
| **Aevo** | ❌ | ❌ | — | Raises `MarginNotSupportedError` |
| **BitoPro** | ❌ | ❌ | — | Raises `MarginNotSupportedError` |

---

## Config Dict

`EXCHANGE_MARGIN_CONFIG` is the single source of truth. Each entry has six fields:

```python
EXCHANGE_MARGIN_CONFIG = {
    "bitget": {
        "supported_modes" : ["cross", "isolated"],
        "cross_params"    : {"marginMode": "cross",    "loanType": "normal"},
        "isolated_params" : {"marginMode": "isolated", "loanType": "normal"},
        "loan_type_key"   : "loanType",
        "loan_type_map"   : {
            "auto_borrow": "auto_borrow",
            "auto_repay" : "auto_repay",
            "normal"     : "normal",
        },
        "endpoint_style"  : "unified",
        "notes"           : "Bitget loanType: 'auto_borrow' | 'auto_repay' | 'normal'.",
    },
    "kucoin": {
        "supported_modes" : ["cross", "isolated"],
        "cross_params"    : {"marginMode": "cross"},
        "isolated_params" : {"marginMode": "isolated"},
        "loan_type_key"   : "_kucoin_loan",            # ← special virtual key
        "loan_type_map"   : {
            "auto_borrow": {"autoBorrow": True,  "autoRepay": False},
            "auto_repay" : {"autoBorrow": False, "autoRepay": True},
            "normal"     : {"autoBorrow": False, "autoRepay": False},
        },
        ...
    },
    ...
}
```

| Field | Purpose |
|---|---|
| `supported_modes` | Which margin modes this exchange accepts |
| `cross_params` | Base params injected for every cross order |
| `isolated_params` | Base params injected for every isolated order |
| `loan_type_key` | Exchange's param key for borrow mode (`""` = not supported) |
| `loan_type_map` | Maps unified `loan_type` string → exchange native value(s) |
| `endpoint_style` | `"unified"` = standard `create_order`; `"not_supported"` = raises error |
| `notes` | Exchange-specific caveats |

**KuCoin special case**: KuCoin uses two separate boolean params (`autoBorrow`, `autoRepay`) instead of a single key. The virtual key `"_kucoin_loan"` triggers a dict-merge branch in `_build_margin_params()` that expands the map value directly into the params dict.

---

## Param Build Order

```
1. Start with mode-specific base  (cross_params or isolated_params from config)
2. Inject loan type               (loan_type_key = loan_type_map[loan_type])
3. Merge caller's params          (override anything above)
→ pass to exchange.create_order(symbol, type, side, amount, price, merged_params)
```

This ensures the caller's explicit overrides always win, while sensible defaults from the config apply automatically.

---

## Error Handling

| Exception | When raised |
|---|---|
| `MarginNotSupportedError` | Exchange has no spot margin API |
| `IsolatedNotSupportedError` | Exchange supports cross but not isolated |
| `ValueError` | `margin_mode` is not `"cross"` or `"isolated"` |
| `ccxt.BaseError` | Raw exchange error (auth failure, insufficient balance, etc.) |

```python
try:
    order = await create_margin_order(
        exchange    = exchange,
        symbol      = "BTC/USDT",
        order_type  = "limit",
        side        = "buy",
        amount      = 0.001,
        price       = 66_000,
        margin_mode = "isolated",
        loan_type   = "auto_borrow",
    )

except IsolatedNotSupportedError:
    # Retry with cross instead
    order = await create_margin_order(..., margin_mode="cross")

except MarginNotSupportedError as e:
    print(f"Use create_order() for spot on this exchange: {e}")
```

---

## Data Flow

```
create_margin_order(exchange, symbol, order_type, side, amount, price,
                    margin_mode, loan_type, params)
│
├─ validate margin_mode            ("cross" | "isolated")
├─ load_markets()
├─ look up EXCHANGE_MARGIN_CONFIG[exchange.id]
│
├─ endpoint_style == "not_supported"  →  raise MarginNotSupportedError
├─ margin_mode not in supported_modes →  raise IsolatedNotSupportedError
│
├─ _build_margin_params()
│       ├─ base   = cross_params | isolated_params
│       ├─ inject loan type via loan_type_key / loan_type_map
│       └─ merge caller's params  (applied last, wins all conflicts)
│
└─ exchange.create_order(symbol, order_type, side, amount, price, merged_params)
        └─ returns unified ccxt order dict
```

---

## Usage Examples

```python
# Bitget — cross, auto-borrow  (matches the reference example)
order = await create_margin_limit_order(
    exchange    = bitget,
    symbol      = "BTC/USDT",
    side        = "buy",
    amount      = 0.001,
    price       = 66_000,
    margin_mode = "cross",
    loan_type   = "auto_borrow",
)

# Bitget — isolated, auto-borrow
order = await create_margin_limit_order(
    exchange    = bitget,
    symbol      = "BTC/USDT",
    side        = "buy",
    amount      = 0.001,
    price       = 66_000,
    margin_mode = "isolated",
    loan_type   = "auto_borrow",
)

# Binance — cross, auto-borrow
order = await create_margin_limit_order(
    exchange    = binance,
    symbol      = "BTC/USDT",
    side        = "buy",
    amount      = 0.001,
    price       = 66_000,
    margin_mode = "cross",
    loan_type   = "auto_borrow",
)

# OKX — cross market sell, extra timeInForce override
order = await create_margin_market_order(
    exchange    = okx,
    symbol      = "ETH/USDT",
    side        = "sell",
    amount      = 0.1,
    margin_mode = "cross",
    loan_type   = "auto_borrow",
    params      = {"timeInForce": "IOC"},
)

# KuCoin — isolated, auto-borrow + auto-repay
order = await create_margin_limit_order(
    exchange    = kucoin,
    symbol      = "SOL/USDT",
    side        = "buy",
    amount      = 1.0,
    price       = 150.0,
    margin_mode = "isolated",
    loan_type   = "auto_borrow",
    # KuCoin will send: autoBorrow=True, autoRepay=False
)
```

---

## Relationship to Other Order Functions

| Function | Market type | Borrow |
|---|---|---|
| `ccxt.create_order()` | Spot | None |
| `create_margin_order()` | Spot margin | Auto or manual |
| `place_bracket_order()` | Swap / futures | N/A (position margin) |
| `place_trailing_order()` | Swap / futures | N/A (position margin) |
