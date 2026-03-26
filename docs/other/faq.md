# Frequently Asked Questions

## Getting Started

### How do I get started?
See the [Quick Start](/getting-started/quick-start) guide. You'll need to create an account, connect an exchange, and choose a strategy.

### Which exchange should I use?
It depends on your strategy. For **funding rate arbitrage**, you need an exchange with futures support (Binance, OKX, Bybit). For **smart DCA**, any exchange with good BTC liquidity works. See the [exchange comparison table](/getting-started/quick-start#which-exchange-should-i-choose).

### How do I set up API keys?
Each exchange has different steps. See the [Exchange Setup](/exchange-setup) page for general guidance, or check the specific exchange guide (e.g., [Binance](/cex/binance), [OKX](/cex/okx)).

### Do I need to enable futures/margin on my exchange account?
Only if you plan to use **funding rate arbitrage** or trade futures via **webhook signals**. Smart DCA only requires spot trading permission.

## API Key & Security

### Is my API key secure?
API keys are encrypted on the server and never stored in plain text. We strongly recommend:
- **Enabling IP whitelist** on the exchange side
- **Only enabling trading permissions** — never enable withdrawal
- Using a **separate API key** just for NexusQuant

### Can NexusQuant withdraw my funds?
No. NexusQuant only uses trading API permissions. It cannot transfer, withdraw, or move your funds. Your assets always remain in your exchange account.

### What permissions should I enable for my API key?
| Strategy | Required Permissions |
|----------|---------------------|
| Funding Arbitrage | Spot Trading + Futures Trading |
| Webhook Signals | Spot Trading (+ Futures if trading futures) |
| Smart DCA | Spot Trading |

## Trading Strategies

### What is funding rate arbitrage?
A market-neutral strategy that earns yield from perpetual contract funding rates by hedging with spot positions. See the [full guide](/strategies/funding-arbitrage).

### What is ahr999 and how does it work?
ahr999 measures Bitcoin's relative value. When it's low (< 0.45), BTC is cheap — buy more. When high (> 1.2), stop buying. See the [Smart DCA guide](/strategies/smart-dca).

### How do I connect TradingView to NexusQuant?
Set up a webhook alert in TradingView pointing to your NexusQuant webhook URL, with a JSON payload containing your passphrase and trade details. See the [Webhook guide](/strategies/webhook).

### What JSON format does the webhook expect?
```json
{
  "passphrase": "your-passphrase",
  "action": "buy",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```
See the [full payload reference](/strategies/webhook#payload-fields).

### Can I use Pine Script variables in webhook alerts?
Yes. Use placeholders like `{{strategy.order.action}}`, `{{ticker}}`, and `{{strategy.order.contracts}}`. See the [Pine Script section](/strategies/webhook#using-pine-script-variables).

## Troubleshooting

### My webhook signal isn't being received
1. Verify your webhook URL is correct in TradingView
2. Ensure the TradingView alert is **active** (not expired)
3. Check that your NexusQuant subscription supports webhook automation

### My orders are failing
1. Check your exchange connection (Settings → Exchange → test with `⟳`)
2. Verify you have sufficient balance
3. Ensure the symbol format is correct (use `BTC/USDT`, not `BTCUSDT`)
4. Check if the exchange is under maintenance

### The ahr999 value seems wrong
The indicator uses real-time price data from your connected exchange. Values may differ slightly from other sources due to price differences between exchanges.

## Account & Billing

### Is there a free plan?
Yes. The free plan includes exchange monitoring, basic webhook receiving, and ahr999 indicator viewing. Automated execution requires a paid plan.

### How do I upgrade my plan?
Go to **Settings** → **Subscription** to view available plans and upgrade.
