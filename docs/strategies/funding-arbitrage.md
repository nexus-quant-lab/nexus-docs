# Funding Rate Arbitrage

Funding rate arbitrage is a **market-neutral strategy** that earns yield from perpetual contract funding rates while hedging price risk.

## How It Works

1. **Open a spot long position** (buy the asset)
2. **Open a perpetual short position** (same size, same asset)
3. **Collect funding rate payments** every 8 hours (when the rate is positive)
4. **Close both positions** when the opportunity diminishes

Since you hold equal long and short positions, price movements cancel out — your profit comes purely from funding rates.

## When Is Funding Rate Positive?

Funding rates are positive when the market is **bullish** — traders are paying a premium to hold long perpetual positions. As the arbitrageur, you collect this premium by being short on perps while hedging with a spot long.

## Core Advantages of NexusQuant

### Visualized Historical Data Analysis
NexusQuant provides powerful **Funding Rate Historical Charts**, allowing you to make more informed decisions:
- **Historical Rate Trends**: View rate fluctuations from the past 12 hours to 7 days, helping you avoid entering positions when rates are about to drop.
- **Spread Analysis**: Visualize the rate difference between different exchanges to identify the most stable and profitable hedging pairs at a glance.
- **Key Data Summaries**: Automatically calculate average spread, max/min spread, and volatility to help you assess strategy stability.

This allows you to move beyond simply "looking at numbers" to "analyzing trends," significantly reducing the risk of being stuck in positions when rates turn negative.

![Funding Rate History and Spread Analysis Chart](/images/strategies/nexusquant-funding-history.png)

## Setup in NexusQuant

### Prerequisites
- An exchange that supports both **spot and perpetual futures** (Binance, OKX, Bybit recommended)
- Sufficient balance in both spot and futures accounts
- API key with **spot + futures trading permissions**

### Steps

1. Go to **Dashboard** → **Funding Arbitrage**
2. Select the trading pair (e.g., BTC/USDT)
3. Set your position size
4. Configure entry threshold (minimum funding rate to enter)
5. Click **Start Strategy**

### Key Parameters

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| Entry Threshold | Minimum annualized funding rate to open position | > 10% APR |
| Position Size | Amount per hedge pair | Based on your risk tolerance |
| Max Positions | Maximum concurrent arbitrage pairs | 3-5 |
| Exit Threshold | Close when rate drops below this | < 5% APR |

## Risk Considerations

::: warning
While this is a low-risk strategy, it is **not risk-free**.
:::

- **Execution gap**: Spot and futures orders may not fill at exactly the same time/price
- **Funding rate reversal**: Rates can turn negative, costing you money
- **Liquidation risk**: If your futures margin is insufficient, the short position could be liquidated
- **Exchange risk**: Counterparty risk with the exchange itself

## Tips

- Start with a small position to test the flow
- Monitor the funding rate trend — avoid entering when rates are declining
- Keep extra margin in your futures account to prevent liquidation
- Use exchanges with the lowest trading fees to maximize net yield
