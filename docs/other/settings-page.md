# Settings Page

Manage your exchange connections, profile, and subscription from the Settings area.

## Exchange Configuration

![Exchange list page](/images/settings/nexusquant-exchanges-list.png)

Navigate to **Exchanges** to manage your API connections.

### Adding an Exchange

1. Click **Add Exchange**
2. Select your exchange from the dropdown (Binance, OKX, Bybit, etc.)
3. Enter the following fields:

| Field | Description |
|-------|-------------|
| Account Name | A label to identify this connection (e.g., "Binance Main") |
| API Key | Your exchange API key |
| Secret | Your exchange API secret |
| Passphrase | Required for some exchanges (e.g., OKX, Bitget) |
| Testnet | Toggle on to use the exchange's testnet environment |

4. Click **Save**

### Testing Connectivity

After saving, use the **Test Connection** option (via the `⋮` menu on the exchange card) to verify:
- API key validity
- Network latency to the exchange

::: tip
Aim for latency under **150ms**. Higher latency may cause slippage on market orders.
:::

### Exchange Limits

| Plan | Max Exchanges |
|------|--------------|
| Free | 1 |
| Pro | Unlimited |

## Profile Settings

Navigate to **Profile** to manage your account information.

### Editable Fields

- **Email** — Update your email address
- **Telegram Chat ID** — Enter your Telegram chat ID to receive trade and strategy execution notifications.

::: tip How to setup Telegram notifications?
1. Search and click the official bot on Telegram [@nexus_quant_message_bot](https://t.me/nexus_quant_message_bot) (Example name)
2. **Make sure to click "Start" or send any message to the bot first**, otherwise the system will not be able to proactively send notifications to you.
3. Get your `Chat ID` and fill it in here.
:::

![Telegram Notification Settings and Chat ID](/images/settings/nexusquant-telegram-setup.png)

### Password Management

- Click **Change Password** to update your password
- You'll need to enter your current password for verification

### Account Info (Read-only)

- Username
- Subscription tier (Free / Pro)
- Account creation date

## Subscription & Affiliate

NexusQuant offers flexible subscription plans and an attractive affiliate program.

- [Detailed Subscription Plans](./subscription) — Compare Free and Pro features and learn how to subscribe.
- [Affiliate Program](./affiliate) — Share NexusQuant and earn USDT commissions.
