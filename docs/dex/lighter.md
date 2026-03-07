# Lighter Setup

Instructions for setting up Lighter perpetual DEX.

## Referral

If you are new to Lighter, and register your account using my referral link.
You will get trading fee discount.

* Click to register: {{REFERRAL_LINK}}

## Production

Lighter is an Ethereum Layer 2 (L2) protocol utilizing zk-rollups.

### How to find L1_ADDRESS

Your L1 address is your Ethereum wallet address connected to Lighter. Or you can find it:
1. From API Key: When you create an API key in Lighter, it's tied to your wallet address
2. Derive from private key: If you have your private key, you can get the address using:
```python
from eth_account import Account
acct = Account.from_key("0xYOUR_PRIVATE_KEY")
print(acct.address)
```

The address starts with 0x and is 42 characters (e.g., 0x1234...abcd).

### How to find account_index

Once you have your address, query:
```
https://mainnet.zklighter.elliot.ai/api/v1/accountsByL1Address?l1_address=YOUR_ADDRESS
```

The response will show your sub_accounts[].index values.

### API Keys

You can generate keys if you have an account. The API documentation can be found here.

### Deposit

Deposit funds to create account.

## Wallet Connection

Connect your wallet and configure the perp DEX settings.

------------------------------------------------------------------------

## Testnet

Lighter is an Ethereum Layer 2 (L2) protocol utilizing zk-rollups, its testnet environment is primarily anchored to the Ethereum ecosystem.

### Which chain should you use?

You should use the `Arbitrum One` / `Arbitrum Sepolia` (testnet).

`Arbitrum Sepolia (the testnet version of Arbitrum)`

### Where to get Test USDC?

Since Lighter uses USDC as the primary margin for its perpetual contracts, you'll need "Mock" or "Testnet" USDC. The most reliable sources are:

- Circle's Official Faucet: Go to faucet.circle.com, select Ethereum Sepolia from the network dropdown, and enter your wallet address. You can usually claim 20 USDC every 2 hours.
- The Lighter App Drip: Often, when you connect your wallet to the Lighter Testnet App, there is a "Faucet" or "Mint" button directly in the deposit interface.

------------------------------------------------------------------------

## Notes & Best Practices

-   DEX trading involves smart contract risk --- ensure you understand the risks.
-   Never expose your private key in code repositories.

::: warning
Perpetual trading involves high risk. Make sure you understand the risks.
:::
