# Order Operations

NexusQuant executes orders on your behalf through connected exchanges. Here's how different order types and strategy actions work.

## Order Types

### Market Orders

Execute immediately at the best available price. This is the default for most strategy actions.

- **Pros**: Fast execution, guaranteed fill
- **Cons**: May experience slippage in low-liquidity markets

### Limit Orders

Place an order at a specific price. The order only fills when the market reaches your price.

- **Pros**: Precise entry/exit price, no slippage
- **Cons**: May not fill if market doesn't reach your price

::: tip
In Webhook signals, set `"order_type": "limit"` and include a `"price"` field to use limit orders.
:::

## Strategy-Specific Operations

### Webhook Signal Actions

| Action | Behavior |
|--------|----------|
| `buy` | Open a long position (spot buy or futures long) |
| `sell` | Open a short position or sell existing holdings |
| `long` | Open a futures long position |
| `short` | Open a futures short position |
| `close` | Close all positions for the given symbol |
| `close_long` | Close only the long position |
| `close_short` | Close only the short position |

### Stop Loss & Take Profit

When SL/TP is enabled on a Webhook strategy:
- **Stop Loss** — Automatically places a conditional order to limit downside. Triggers a market sell when price drops to the SL level.
- **Take Profit** — Places a limit sell order at your target profit price.

Both SL and TP orders use `reduceOnly` to ensure they only close existing positions.

Configure SL/TP percentages when creating or editing a Webhook strategy:
- **Stop Loss %** — e.g., 3.0 means close if price drops 3% from entry
- **Take Profit %** — e.g., 5.0 means close if price rises 5% from entry

### Smart DCA Orders

DCA orders are always **market buy** orders for BTC/USDT.


## Order Conflict Prevention

NexusQuant checks for conflicting positions before executing a new signal:
- A `buy` signal won't execute if you already have an open long position for the same symbol
- A `sell` signal won't execute if you already have an open short position

This prevents accidental double-entry from duplicate TradingView alerts.

## Rate Limiting

To prevent rapid-fire duplicate signals, the system applies rate limiting on webhook endpoints. If you receive a rate limit error, wait a few seconds before retrying.
