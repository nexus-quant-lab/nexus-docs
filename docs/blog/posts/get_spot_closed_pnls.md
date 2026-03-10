# `get_spot_closed_pnls` — Spot Realized PnL via AVCO

Fetches spot trade history across multiple exchanges and computes realized PnL using the **Average Cost (AVCO)** method. Output schema matches Bybit's `private_get_v5_position_closed_pnl()` — the same canonical dict as `get_closed_pnls.py` — so downstream code handles one format for both spot and swap.

---

## Public Interface

```python
async def get_spot_closed_pnls(
    exchange  : ccxt.Exchange,
    symbol    : str,                 # e.g. "BTC/USDT"
    startTime : int | None = None,   # ms UTC, default: 24 h ago
    endTime   : int | None = None,   # ms UTC, default: now
    limit     : int = 500,           # max PnL records (sell events) returned
    params    : dict | None = None,  # extra params forwarded to fetch_my_trades
) -> list[dict]
```

**Returns** one record per sell trade that has a tracked cost basis, sorted oldest-first.

> `limit` caps PnL records (sell events), not raw trades. Internally all trades in the window are fetched to ensure the AVCO state is complete before any sells are processed.

---

## Output Schema

All numeric fields are strings to match Bybit's native format. Two extra fields are added for spot-specific transparency.

| Field | Type | Description |
|---|---|---|
| `symbol` | str | Raw exchange symbol, e.g. `BTCUSDT` |
| `orderId` | str | Sell trade or order ID that triggered the close |
| `side` | str | Always `Sell` for a realized spot PnL event |
| `qty` | str | Sell qty in base asset |
| `orderPrice` | str | Sell price |
| `orderType` | str | `Market` or `Limit` |
| `execType` | str | Always `Trade` |
| `closedSize` | str | Same as `qty` |
| `cumEntryValue` | str | `sell_qty × avg_entry_price` (cost basis consumed) |
| `avgEntryPrice` | str | AVCO entry price at time of sell |
| `cumExitValue` | str | `sell_qty × sell_price` |
| `avgExitPrice` | str | Sell price |
| `closedPnl` | str | Net PnL after fees |
| `openFee` | str | Proportional buy-side fee allocated to this close |
| `closeFee` | str | Sell-side fee |
| `leverage` | str | Always `"1"` for spot |
| `createdTime` | str | Sell trade timestamp (ms) |
| `updatedTime` | str | Sell trade timestamp (ms) |
| `_exchange` | str | Exchange ID tag for debugging |
| `_dustSnapped` | bool | `True` if cost basis was reset to zero after this sell |

---

## AVCO Algorithm

AVCO (Average Cost) maintains a running weighted-average entry price across all open buy lots. It is the same method used natively by Bybit, OKX, and Bitget for their own closed-PnL reporting.

**State per symbol**

```
open_qty         float  – total base qty currently held
avg_entry_price  float  – weighted average cost of open_qty
total_buy_fee    float  – accumulated buy fees in quote currency
```

**On each BUY trade**

```
total_cost       = open_qty × avg_entry_price + buy_qty × buy_price
open_qty        += buy_qty
avg_entry_price  = total_cost / open_qty
total_buy_fee   += buy_fee_quote
```

**On each SELL trade**

```
open_fee_alloc  = total_buy_fee × (sell_qty / open_qty)   # proportional share
cum_entry_value = sell_qty × avg_entry_price
cum_exit_value  = sell_qty × sell_price
gross_pnl       = cum_exit_value − cum_entry_value
net_pnl         = gross_pnl − open_fee_alloc − close_fee
open_qty       -= sell_qty
total_buy_fee  -= open_fee_alloc
→ emit one canonical PnL record
```

**Dust snap (after every sell)**

```
if 0 < open_qty < market["limits"]["amount"]["min"]:
    open_qty        = 0.0
    avg_entry_price = 0.0
    total_buy_fee   = 0.0   ← cost basis fully reset
```

This prevents sub-minimum residual amounts from polluting the cost basis of future buys on the same symbol.

---

## Fee Handling

Fees are always normalised to quote currency before being applied.

| Fee currency | Treatment |
|---|---|
| Quote asset (e.g. USDT) | Used directly |
| Base asset (e.g. BTC) | Converted to quote using the trade price |
| Third currency (e.g. BNB discount on Binance) | Approximated as zero (no live conversion rate available) |

---

## Exchange Config Dict

`EXCHANGE_SPOT_CONFIG` drives trade fetching. Each entry has four fields:

| Field | Purpose |
|---|---|
| `max_days` | Maximum calendar-day span per `fetch_my_trades` call |
| `max_limit` | Maximum trades per page |
| `time_style` | Timestamp param naming/format convention |
| `extra` | Static params always merged into every request |

| Exchange | `max_days` | `max_limit` | `time_style` | `extra` |
|---|---|---|---|---|
| Binance | 30 | 1000 | `startTime_endTime_ms` | — |
| Bybit | 7 | 50 | `startTime_endTime_ms` | `category=spot` |
| OKX | 90 | 100 | `before_after_ms` | `instType=SPOT` |
| Gate.io | 30 | 1000 | `from_to_sec` | — |
| Bitget | 90 | 100 | `startTime_endTime_ms` | — |
| BingX | 7 | 1000 | `startTimestamp_endTimestamp_ms` | — |
| MEXC | 90 | 1000 | `startTime_endTime_ms` | — |
| KuCoin | 7 | 500 | `startAt_endAt_ms` | — |
| Hyperliquid | 180 | 2000 | `startTime_endTime_ms` | — |
| Aevo | 30 | 500 | `startTime_endTime_ms` | — |
| Alpaca | 365 | 500 | `after_until_iso` | — |
| BitoPro | 60 | 1000 | `startTimestamp_endTimestamp_ms` | — |

---

## Data Flow

```
get_spot_closed_pnls(exchange, symbol, startTime, endTime, limit, params)
│
├─ load_markets()  →  read min_order_amount
├─ split window into N chunks  (ceil(total_ms / max_days_ms))
│
└─ for each chunk:
        _fetch_trades_chunk()
              └─ fetch_my_trades() loop with sliding timestamp cursor
                 until page < max_limit or window exhausted
│
├─ deduplicate by trade ID, sort oldest-first
│
└─ _compute_avco_pnl(trades, min_order_amount)
        │
        └─ walk trades chronologically:
               buy  → absorb_buy()   update avg_entry_price
               sell → consume_sell() emit PnL record + dust snap
        │
        └─ return PnL records[:limit]
```

---

## Key Limitations

**History window**: buys executed before `startTime` are not visible in the trade history, so AVCO starts from zero at `startTime`. For positions held for months, pass a `startTime` that covers all prior buys or use `get_spot_position()` instead, which uses a configurable `trade_lookback_days`.

**Third-currency fees**: Binance BNB discounts are approximated as zero because converting BNB→USDT requires a live market price. Pass pre-converted values via `params` if precision is required.

**Sells with no open position**: if a sell trade appears before any buy in the window (position opened before `startTime`), it is silently skipped.
