# Quick Start

Get up and running with NexusQuant in 3 steps.

## Step 1: Create Your Account

1. Go to [NexusQuant](https://nexusquant.io) and click **Register**
2. Enter your email and set a password
3. Verify your email address

## Step 2: Connect an Exchange

1. Navigate to **Settings** → **Exchange Configuration**
2. Select your exchange (e.g., Binance, OKX, Bybit)
3. Enter your **API Key** and **Secret**
4. Click **Save**, then use the `⟳` button to test connectivity

::: warning API Key Security
- **Enable IP whitelist** on the exchange side for your API key
- **Only enable trading permissions** — never enable withdrawal
- See [Exchange Setup](/exchange-setup) for detailed per-exchange guides
:::

### Which exchange should I choose?

| Use Case | Recommended Exchange |
|----------|---------------------|
| Funding Rate Arbitrage | Binance, OKX, Bybit (need futures support) |
| Webhook Signal Trading | Any exchange with spot/futures |
| Smart DCA (BTC) | Binance, OKX (good BTC liquidity) |

## Step 3: Choose and Activate a Strategy

NexusQuant offers three core strategies:

### Funding Rate Arbitrage
Earn low-risk yields by hedging spot + perpetual positions. Best for stable, passive income.
→ [Full Guide](/strategies/funding-arbitrage)

### Webhook Signal Automation
Connect TradingView alerts to auto-execute trades. Best for technical analysis traders.
→ [Full Guide](/strategies/webhook)

### Smart DCA (ahr999)
Data-driven Bitcoin value investing using the ahr999 indicator. Best for long-term BTC accumulation.
→ [Full Guide](/strategies/smart-dca)

## What's Next?

- [Exchange Setup Guides](/exchange-setup) — Detailed API key setup for each exchange
- [Settings Page](/other/settings-page) — Configure risk controls, notifications, and more
- [FAQ](/other/faq) — Common questions and troubleshooting
