# Bybit Setup

Instructions for setting up Bybit API.

## Referral

If you are new to Bybit, and register your account using my referral link.
You will get trading fee discount, and after sending your UID, you can add up one
month free subscription.

* Click to register: {{REFERRAL_LINK}}

## 1. Production

These are real API keys used for live trading in Spot and Derivatives accounts.

### Steps:

1.  Go to https://www.bybit.com and log in.
2.  Ensure:
    -   2FA is enabled (Google Authenticator / SMS)
    -   Identity verification is complete
3.  Click profile icon (top right) → **Account & Security** → **API Management**
4.  Click **Create API Key**
5.  Enter a label (e.g., `prod-spot`, `prod-derivatives`)
6.  Complete security verification
7.  Save the **API Key** and **Secret** (Secret is shown only once)
8.  Set permissions:
    -   Enable Spot if needed
    -   Enable Derivatives if needed
    -   Set IP whitelist (recommended)

------------------------------------------------------------------------

## 2. Testnet

Bybit Testnet simulates trading using virtual funds.

### Steps:

1.  Go to https://testnet.bybit.com
2.  Log in with your testnet account (create one if needed)
3.  Go to **API Management**
4.  Click **Create API Key**
5.  Name it (e.g., `testnet-spot`)
6.  Complete 2FA verification
7.  Save the API Key and Secret

------------------------------------------------------------------------

## Notes & Best Practices

-   Production keys trade real funds --- secure them properly.
-   Testnet keys only work with testnet trading.
-   Never expose API Secret in code repositories.

::: warning
Do not enable withdrawal permissions for API keys.
:::
