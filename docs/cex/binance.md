# Binance Setup

There are three kinds of API Keys in Binance. For real trading, you need **Production API Keys**. For demo trading, use Demo Spot or Demo Futures keys.

1. Production (Live Binance) API Keys
2. Demo Spot API Keys
3. Demo Futures API Keys

## Referral

If you are new to Binance, register using the referral link below to get **10% off trading fees**. After sending your UID, you can get one month free subscription.

- [Register with referral](https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=zh-TC&ref=GRO_28502_CA8R1)

---

## 1. Production (Live Binance API Keys)

These are real API keys used for live trading in Spot and Futures accounts.

### Steps

1. Go to [binance.com](https://www.binance.com) and log in
2. Ensure **2FA** is enabled and **identity verification** is complete
3. Click profile icon (top right) → **API Management**

![Binance API Management menu](/images/exchanges/binance-api-management.png)

4. Click **Create API**

![Binance Create API button](/images/exchanges/binance-create-api.png)

5. Enter a label (e.g., `nexusquant-prod`)
6. Complete security verification (2FA)
7. Save the **API Key** and **Secret** (Secret is shown only once!)

![Binance API Key and Secret](/images/exchanges/binance-api-key-secret.png)

8. Set permissions:
   - ✅ Enable **Spot & Margin Trading**
   - ✅ Enable **Futures** (if using funding arbitrage)
   - ✅ Set **IP whitelist** (recommended)
   - ❌ Do NOT enable **Withdrawals**

![Binance API permissions](/images/exchanges/binance-api-permissions.png)

### Add to NexusQuant

1. Go to NexusQuant **Settings** → **Exchange Configuration**
2. Select **Binance**
3. Paste your API Key and Secret
4. Click **Save**
5. Click `⟳` to test the connection — aim for < 150ms latency

![NexusQuant add Binance](/images/exchanges/nexusquant-add-binance.png)

---

## 2. Demo Spot API Keys

Binance Demo Trading simulates Spot trading using virtual funds.

### Steps

1. Log in to [Binance Demo Trading](https://demo.binance.com)
2. Enter **Demo Trading** mode (via web/app)
3. Go to **API Management** inside Demo Trading
4. Click **Create API**
5. Name it (e.g., `nexusquant-demo-spot`)
6. Complete 2FA verification
7. Save the API Key and Secret

---

## 3. Demo Futures API Keys

Demo Futures simulates USDⓈ-M and COIN-M futures trading.

### Steps

1. Log in to [Binance Demo Trading](https://www.binance.com)
2. Switch to **Futures Demo**
3. Go to **API Management**
4. Click **Create API**
5. Name it (e.g., `nexusquant-demo-futures`)
6. Complete verification
7. Save API Key and Secret

---

## Notes & Best Practices

- Production keys trade **real funds** — secure them properly
- Demo keys only work within demo trading mode
- Never expose API Secret in code or screenshots
- Use a **separate API key** for NexusQuant (don't share with other bots)

::: danger
Do NOT enable withdrawal permissions for API keys. NexusQuant only needs trading permissions.
:::

::: tip
Recommended: Set an IP whitelist on your API key for extra security. You can find your server IP in NexusQuant Settings.
:::
