# Shiaoji (Sino) Setup

Instructions for setting up Shiaoji (Sino) API.

## Referral

If you are new to Shiaoji (Sino), and register your account using my referral link.
You will get trading fee discount.

* Click to register: {{REFERRAL_LINK}}

## Production

These are real API keys used for live trading in Spot accounts.

### Steps:

1.  Go to https://www.sinotrade.com.tw and log in.
2.  Ensure:
    -   2FA is enabled
    -   Identity verification is complete
3.  Go to **Settings** → **API Management**
4.  Click **Create API Key**
5.  Enter a label (e.g., `prod-spot`)
6.  Complete security verification
7.  Save the **API Key** and **Secret**
8.  Set IP whitelist (recommended)

------------------------------------------------------------------------

## Notes & Best Practices

-   Production keys trade real funds --- secure them properly.
-   Never expose API Secret in code repositories.
-   Shiaoji (Sino) does not offer a public testnet for API trading.

::: warning
Do not enable withdrawal permissions for API keys.
:::
