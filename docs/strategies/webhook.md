# Webhook Signal Automation

Connect your TradingView alerts to NexusQuant and auto-execute trades when your technical analysis conditions are met.

## How It Works

1. You create an **alert** in TradingView with your trading conditions
2. TradingView sends a **webhook** (HTTP request) to NexusQuant when triggered
3. NexusQuant **verifies** the passphrase and signal format
4. NexusQuant **executes** the trade on your connected exchange

## Setup in TradingView

### Step 1: Get Your Webhook URL

1. Go to **Dashboard** → **Webhook** in NexusQuant
2. Copy your unique Webhook URL (format: `https://api.nexusquant.io/api/v1/webhook/signal`)
3. Note your **passphrase** (used for security verification)

### Step 2: Create a TradingView Alert

1. Open TradingView and set up your chart/indicator
2. Click **Alert** (clock icon) → **Create Alert**
3. Set your conditions (e.g., RSI crosses below 30)
4. In the **Notifications** tab, check **Webhook URL**
5. Paste your NexusQuant webhook URL
6. In the **Message** field, enter the JSON payload (see below)

### Step 3: Configure the JSON Payload

The alert message must be valid JSON with the following format:

#### Buy Signal Example

```json
{
  "passphrase": "your-passphrase-here",
  "action": "buy",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```

#### Sell Signal Example

```json
{
  "passphrase": "your-passphrase-here",
  "action": "sell",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```

#### Close Position Example

```json
{
  "passphrase": "your-passphrase-here",
  "action": "close",
  "symbol": "BTC/USDT"
}
```

### Payload Fields

| Field | Required | Description |
|-------|----------|-------------|
| `passphrase` | Yes | Your security passphrase (must match NexusQuant setting) |
| `action` | Yes | `buy`, `sell`, or `close` |
| `symbol` | Yes | Trading pair (e.g., `BTC/USDT`, `ETH/USDT`) |
| `order_type` | No | `market` (default) or `limit` |
| `quantity` | No | Order quantity. Omit for `close` action |
| `price` | No | Required if `order_type` is `limit` |

<div v-pre>

## Using Pine Script Variables

You can use TradingView Pine Script variables in the alert message to create dynamic signals:

```json
{
  "passphrase": "your-passphrase-here",
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "order_type": "market",
  "quantity": "{{strategy.order.contracts}}"
}
```

### Common Pine Script Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{strategy.order.action}}` | `buy` or `sell` |
| `{{strategy.order.contracts}}` | Number of contracts/shares |
| `{{ticker}}` | Symbol name (e.g., `BTCUSDT`) |
| `{{close}}` | Current close price |
| `{{time}}` | Alert trigger time |
| `{{strategy.position_size}}` | Current position size |

</div>

::: tip
Make sure the `symbol` format matches what NexusQuant expects. For example, use `BTC/USDT` not `BTCUSDT`. You may need to format the <code v-pre>{{ticker}}</code> variable accordingly.
:::

## Security

- **Passphrase verification**: Every webhook request must include the correct passphrase
- **Signal validation**: NexusQuant validates the JSON format before executing
- **Conflict detection**: The system checks for conflicting open positions before placing orders
- **Rate limiting**: Prevents rapid-fire duplicate signals

## Signal History

All received signals are logged in **Dashboard** → **Webhook** → **Signal History**, including:
- Timestamp
- Signal payload
- Execution status (success/failed/rejected)
- Order details (if executed)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Signal not received | Check webhook URL is correct, TradingView alert is active |
| "Invalid passphrase" | Verify passphrase matches between TradingView and NexusQuant |
| "Invalid JSON" | Validate your JSON payload format (use a JSON validator) |
| Order not executed | Check exchange connection, balance, and symbol format |
