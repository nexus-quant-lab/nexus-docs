# Binance Setup

Instructions for setting up binance API.

There are three kind of API Keys in Binance.
For real trading, you need `Production API Keys`. To demo trading spot, you need `Demo Spot API Keys`, 

1. Production (Live Binance) API Keys
2. Demo Spot API Keys
3. Demo Futures API Keys

## Referral
If you are new to Binance, and register your account using my referral link.
You will get trading fee 10% off, and after sending your UID, you can add up one
month free subscription.

* Click to register: https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=zh-TC&ref=GRO_28502_CA8R1

## 1. Production (Live Binance API Keys)

These are real API keys used for live trading in Spot and Futures
accounts.

### Steps:

1.  Go to https://www.binance.com and log in.
2.  Ensure:
    -   2FA is enabled (Google Authenticator / SMS)
    -   Identity verification is complete
3.  Click profile icon (top right) → **API Management**
4.  Click **Create API**
5.  Enter a label (e.g., `prod-spot`, `prod-futures`)
6.  Complete security verification
7.  Save the **API Key** and **Secret** (Secret is shown only once)
8.  Set permissions:
    -   Enable Spot & Margin Trading if needed
    -   Enable Futures if needed
    -   Set IP whitelist (recommended)

------------------------------------------------------------------------

## 2. Demo Spot API Keys

Binance Demo Trading simulates Spot trading using virtual funds.

### Steps:

1.  Log in to Binance
2.  Enter **Demo Trading** mode (via web/app)
3.  Go to **API Management** inside Demo Trading
4.  Click **Create API**
5.  Name it (e.g., `demo-spot`)
6.  Complete 2FA verification
7.  Save the API Key and Secret


------------------------------------------------------------------------

## 3. Demo Futures API Keys

Demo Futures simulates USDⓈ-M and COIN-M futures trading.

### Steps:

1.  Log in to Binance Demo Trading
2.  Switch to **Futures Demo**
3.  Go to **API Management**
4.  Click **Create API**
5.  Name it (e.g., `demo-futures`)
6.  Complete verification
7.  Save API Key and Secret

------------------------------------------------------------------------

## Notes & Best Practices

-   Production keys trade real funds --- secure them properly.
-   Demo keys only work with demo tradings.
-   Never expose API Secret in code repositories.


::: warning
Do not enable withdrawal permissions for API keys.
:::

