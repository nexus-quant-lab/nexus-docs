# Alpaca Setup

Instructions for setting up Alpaca API.

## Referral

If you are new to Alpaca, and register your account using my referral link.
You will get trading fee discount.

* Click to register: {{REFERRAL_LINK}}

## Production

Alpaca is a commission-free trading API for stocks and crypto.

### Steps:

1.  Go to https://alpaca.markets and log in.
2.  Ensure:
    -   2FA is enabled
    -   Identity verification is complete
3.  Go to **API** → **Paper Trading** or **Live Trading**
4.  Click **Create New Key**
5.  Enter a label (e.g., `prod`)
6.  Save the **API Key** and **Secret Key**
7.  Set permissions as needed

------------------------------------------------------------------------

## Notes & Best Practices

-   Production keys trade real funds --- secure them properly.
-   Paper trading keys can be used for testing without real risk.
-   Never expose API Secret in code repositories.
-   Alpaca offers both paper (testnet) and live trading.

::: warning
Do not enable withdrawal permissions for API keys.
:::
