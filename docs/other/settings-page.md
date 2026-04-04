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
- **Telegram Chat ID** — Enter your Telegram chat ID to receive trade notifications

### Password Management

- Click **Change Password** to update your password
- You'll need to enter your current password for verification

### Account Info (Read-only)

- Username
- Subscription tier (Free / Pro)
- Account creation date

## Subscription

![Subscription page](/images/settings/nexusquant-subscription.png)

Navigate to **Subscription** to view or upgrade your plan.

### Available Plans

| | Free | Pro Monthly | Pro Yearly |
|---|------|------------|------------|
| Price | $0 | $29 USDT/mo | $290 USDT/yr (save ~17%) |
| Exchanges | 1 | Unlimited | Unlimited |
| Strategies | 1 per type | Unlimited | Unlimited |
| Webhook Automation | Basic | Full (SL/TP, templates) | Full (SL/TP, templates) |
| Smart DCA | View only | Auto-execute | Auto-execute |

### Payment

NexusQuant accepts cryptocurrency payments via NOWPayments, supporting 350+ cryptocurrencies.

1. Select a plan (Monthly or Yearly)
2. Click **Pay with Crypto**
3. Complete payment on the NOWPayments checkout page
4. Your subscription activates automatically after confirmation

::: info Referral Discount
Users who registered with a referral code receive **10% off** their first subscription.
:::
