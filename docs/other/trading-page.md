# Positions & Trades

Monitor your active positions and review trade history from the **Positions** and **Trades** pages.

## Positions Page

![Positions page](/images/trading/nexusquant-positions.png)

The Positions page shows all your currently open positions across connected exchanges.

### Overview Cards

At the top of the page, you'll see summary statistics:
- **Active Positions** — Total number of open positions
- **Total Unrealized P&L** — Combined floating profit/loss across all positions
- **Total Position Value** — Sum of all position sizes in USDT

### Position Table

Each position displays:

| Column | Description |
|--------|-------------|
| Symbol | Trading pair (e.g., BTC/USDT) |
| Side | Long or Short |
| Size | Position quantity |
| Entry Price | Average entry price |
| Current Price | Real-time market price |
| Unrealized P&L | Floating profit/loss |
| Strategy | Which strategy opened this position (Webhook / Arbitrage) |

### Actions

- **Close Position** — Manually close a position at market price
- **Refresh** — Reload position data from the exchange

::: warning
Closing a position here sends a market order to your exchange. Use during active market hours for best fills.
:::

## Trades Page

![Trades page](/images/trading/nexusquant-trades.png)

The Trades page shows your complete trade history, including executed and closed trades.

### Filtering

Use the filter bar to narrow results:
- **Symbol** — Search by trading pair
- **Strategy Type** — Filter by Webhook, DCA, or Arbitrage
- **Side** — Buy or Sell only
- **Date Range** — Custom time period

### Trade Details

Each trade record includes:

| Column | Description |
|--------|-------------|
| Time | Execution timestamp |
| Symbol | Trading pair |
| Side | Buy or Sell |
| Price | Execution price |
| Quantity | Order quantity |
| Fee | Trading fee charged |
| Realized P&L | Profit or loss (for closing trades) |
| Strategy | Source strategy |

### Exporting

Trade data can be refreshed on-demand. For detailed trade records, refer to your exchange's native trade history.
