# Risk Warning

::: danger Important
Cryptocurrency trading involves substantial risk of loss and is not suitable for all investors. Please read this page carefully before using NexusQuant.
:::

## General Risks

### Market Risk
Cryptocurrency prices are highly volatile. Prices can move 10-50% or more within a single day. Past performance does not guarantee future results.

### Liquidity Risk
Some trading pairs may have low liquidity, especially for smaller altcoins or during off-peak hours. This can lead to significant slippage on market orders.

### Leverage Risk
Futures trading with leverage amplifies both gains and losses. You can lose more than your initial margin. Funding rate arbitrage, while designed to be market-neutral, still carries execution risk if one leg fails.

### Technical Risk
- Exchange APIs may experience downtime or degraded performance
- Network latency may cause delays in order execution
- Software bugs may occur despite extensive testing

### Regulatory Risk
Cryptocurrency regulations vary by jurisdiction and are evolving. Certain exchanges or trading activities may be restricted in your region.

## Platform-Specific Risks

### Automated Trading
NexusQuant executes trades automatically based on your configured strategies. Once a strategy is active:
- Orders are placed without manual confirmation
- Market conditions can change between signal generation and execution
- System outages may prevent timely order placement or cancellation

### API Key Security
While NexusQuant encrypts API keys and never requests withdrawal permissions:
- You are responsible for securing your exchange account
- Enable IP whitelisting on your exchange for additional security
- Use a dedicated API key for NexusQuant, separate from other services

### Third-Party Dependencies
NexusQuant relies on:
- Exchange APIs for order execution and market data
- External data sources for indicator calculations (e.g., ahr999)
- Payment processors for subscription management

Service disruptions from any third party may impact platform functionality.

## Risk Management Best Practices

1. **Start with testnet** — Test your strategies on exchange testnets before using real funds
2. **Use stop losses** — Enable SL/TP on Webhook strategies to limit downside
3. **Size positions appropriately** — Never risk more than you can afford to lose on a single trade
4. **Monitor regularly** — Check your dashboard and trade history daily
5. **Diversify** — Don't concentrate all funds in a single strategy or trading pair
6. **Keep reserves** — Maintain sufficient margin to avoid liquidation on leveraged positions

## Disclaimer

NexusQuant is a trading automation tool. It does not provide financial advice, investment recommendations, or guarantees of profit. All trading decisions are ultimately your responsibility. By using NexusQuant, you acknowledge that you understand and accept these risks.
