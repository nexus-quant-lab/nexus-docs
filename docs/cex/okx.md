# OKX Setup

Instructions for setting up OKX API.

## Referral

If you are new to OKX, and register your account using my referral link.
You will get trading fee discount, and after sending your UID, you can add up one
month free subscription.

* Click to register: {{REFERRAL_LINK}}

## 1. Production

These are real API keys used for live trading in Spot and Futures accounts.

### Steps:

1.  Go to https://www.okx.com and log in.
2.  Ensure:
    -   2FA is enabled (Google Authenticator / SMS)
    -   Identity verification is complete
3.  Click profile icon (top right) → **Security Settings** → **API Management**
4.  Click **Create API Key**
5.  Enter a label (e.g., `prod-spot`, `prod-futures`)
6.  Complete security verification
7.  Save the **API Key**, **Secret**, and **Passphrase** (Secret is shown only once)
8.  Set permissions:
    -   Enable Spot & Margin Trading if needed
    -   Enable Futures if needed
    -   Set IP whitelist (recommended)

------------------------------------------------------------------------

## 2. Testnet

OKX using virtual funds.

 Testnet simulates trading### Steps:

1.  Go to https://www.okx.com/demo-trading
2.  Log in with your testnet account (create one if needed)
3.  Go to **API Management**
4.  Click **Create API Key**
5.  Name it (e.g., `testnet-spot`)
6.  Complete 2FA verification
7.  Save API Key, Secret, and Passphrase

------------------------------------------------------------------------

## Notes & Best Practices

-   Production keys trade real funds --- secure them properly.
-   Testnet keys only work with testnet trading.
-   Never expose API Secret in code repositories.

::: warning
Do not enable withdrawal permissions for API keys.
:::
