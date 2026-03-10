# `get_spot_position` — Current Spot Position with AVCO Entry Price

Returns the current spot holding for a symbol as `{"size": float, "entryPrice": float}`, mirroring the position format used by swap/futures APIs. Balance is read from the exchange wallet; entry price is reconstructed from trade history using AVCO — exactly the same algorithm as `get_spot_closed_pnls.py`.

---

## Public Interface

```python
async def get_spot_position(
    exchange     : ccxt.Exchange,
    symbol       : str,                    # e.g. "BTC/USDT"
    account_type : str = "default",        # see account-type table below
    params       : dict | None = None,     # extra params forwarded to fetch_my_trades
) -> dict[str, float]
```

**Returns**

```python
{"size": float, "entryPrice": float}
```

| Field | Description |
|---|---|
| `size` | Current base-asset balance. `0.0` if below `min_order_amount` (dust snap). |
| `entryPrice` | AVCO average entry price. `0.0` if size is zero, or if trade history is insufficient to reconstruct the cost basis (see sanity check below). |

---

## Call Flow

```
1. load_markets()
        └─ read market["limits"]["amount"]["min"]  →  min_order_amount

2. _fetch_base_balance()
        └─ query the correct wallet for the base asset  →  size

3. Dust snap
        if size < min_order_amount:
            return {"size": 0.0, "entryPrice": 0.0}

4. _calculate_entry_price()
        └─ fetch trade history over trade_lookback_days
        └─ AVCO walk (buys absorb, sells consume + dust snap)
        └─ sanity check: AVCO qty vs actual wallet qty
        └─ return avg_entry_price

5. return {"size": size, "entryPrice": avg_entry_price}
```

---

## Account-Type Support

Several exchanges expose multiple wallets under the same API key (a "classic" and a "unified" account). The `account_type` parameter selects which wallet is queried for the balance. The config dict maps each label to the exact params injected into `fetch_balance`.

| Exchange | `account_type` values | Default | Mechanism |
|---|---|---|---|
| **Bybit** | `"unified"`, `"classic"` | `"unified"` | `{"accountType": "UNIFIED"}` or `{"accountType": "SPOT"}` injected into `fetch_balance` |
| **OKX** | `"unified"`, `"funding"` | `"unified"` | Unified → standard `fetch_balance`; funding → `private_get_asset_balances` (different endpoint) |
| **KuCoin** | `"trade"`, `"main"` | `"trade"` | `{"type": "trade"}` or `{"type": "main"}` injected into `fetch_balance` |
| **Others** | `"default"` | `"default"` | Single wallet; no extra params needed |

---

## Exchange Config Dict

`EXCHANGE_SPOT_POSITION_CONFIG` is the single source of truth for all exchange differences. Each entry has seven fields:

| Field | Purpose |
|---|---|
| `max_days` | Maximum calendar-day span per `fetch_my_trades` call |
| `max_limit` | Maximum trades per page |
| `time_style` | Timestamp param naming/format convention |
| `trade_extra` | Static params always merged into `fetch_my_trades` |
| `balance_style` | Which wallet-fetch strategy to use (`standard`, `bybit`, `okx`, `kucoin`) |
| `account_types` | Maps label strings → params dict injected into `fetch_balance` |
| `trade_lookback_days` | How far back to walk trades for AVCO entry price reconstruction |

| Exchange | `max_days` | `max_limit` | `balance_style` | `trade_lookback_days` | Account types |
|---|---|---|---|---|---|
| Binance | 30 | 1000 | standard | 90 | default |
| Bybit | 7 | 50 | bybit | 90 | unified, classic |
| OKX | 90 | 100 | okx | 90 | unified, funding |
| Gate.io | 30 | 1000 | standard | 60 | default |
| Bitget | 90 | 100 | standard | 90 | default |
| BingX | 7 | 1000 | standard | 30 | default |
| MEXC | 90 | 1000 | standard | 90 | default |
| KuCoin | 7 | 500 | kucoin | 30 | trade, main |
| Hyperliquid | 180 | 2000 | standard | 180 | default |
| Aevo | 30 | 500 | standard | 30 | default |
| Alpaca | 365 | 500 | standard | 365 | default |
| BitoPro | 60 | 1000 | standard | 60 | default |

---

## AVCO Entry Price Reconstruction

`_calculate_entry_price()` walks trade history from `trade_lookback_days` ago to now, applying the same AVCO state machine as `get_spot_closed_pnls.py`:

- **Buys** → update `open_qty` and `avg_entry_price` via weighted average.
- **Sells** → reduce `open_qty`; apply dust snap if remainder < `min_order_amount`.
- Whatever `avg_entry_price` remains in state after all trades = the entry price for the current holding.

**Sanity check**: after the walk, if the AVCO `open_qty` diverges from the actual wallet balance by more than 5×, `entryPrice` is returned as `0.0`. This signals that the lookback window doesn't cover the full position history. Increase `trade_lookback_days` in the config to improve coverage.

---

## Dust Snap

Applied in two places:

**On balance read** — if the wallet balance is below `market["limits"]["amount"]["min"]`, the function returns immediately with `{"size": 0.0, "entryPrice": 0.0}`. No trade history is fetched.

**Inside AVCO walk** — after each sell reduces `open_qty`, if the remainder is below `min_order_amount`, the entire state (`open_qty`, `avg_entry_price`, `total_buy_fee`) is reset to zero. This prevents sub-minimum residual amounts from polluting the cost basis of subsequent buys.

---

## Usage Examples

```python
# Bybit Unified Trading Account
pos = await get_spot_position(
    exchange     = bybit,
    symbol       = "BTC/USDT",
    account_type = "unified",
)
# → {"size": 0.015, "entryPrice": 62450.3}

# Bybit Classic Spot Wallet
pos = await get_spot_position(
    exchange     = bybit,
    symbol       = "BTC/USDT",
    account_type = "classic",
)

# OKX Funding Wallet
pos = await get_spot_position(
    exchange     = okx,
    symbol       = "ETH/USDT",
    account_type = "funding",
)

# KuCoin Trade Account
pos = await get_spot_position(
    exchange     = kucoin,
    symbol       = "SOL/USDT",
    account_type = "trade",
)

# Binance (single account type)
pos = await get_spot_position(
    exchange = binance,
    symbol   = "BTC/USDT",
)
# → {"size": 0.0, "entryPrice": 0.0}  if balance is below min_order_amount
```

---

## Relationship to Other Functions

| Function | What it does |
|---|---|
| `get_spot_position` | **Current** holding: live balance + AVCO entry price |
| `get_spot_closed_pnls` | **Historical** PnL: one record per past sell event with realized PnL |
| `get_closed_pnls` | **Swap/futures** historical PnL: uses native exchange position-history endpoints |

The AVCO state machine in `get_spot_position` and `get_spot_closed_pnls` is identical. The difference is that `get_spot_position` stops the walk at "now" and reads the remaining state, while `get_spot_closed_pnls` emits a PnL record on every sell event throughout the walk.
