# Smart DCA (ahr999)

Smart DCA uses the **ahr999 indicator** to determine when and how much Bitcoin to buy. Instead of buying a fixed amount on a fixed schedule, it dynamically adjusts your investment based on Bitcoin's relative value.

## What is ahr999?

The ahr999 indicator measures Bitcoin's current price relative to:
- **200-day DCA cost** (your average cost if you bought daily for 200 days)
- **Fitted growth value** (Bitcoin's long-term logarithmic growth trend)

A lower ahr999 value means Bitcoin is **relatively cheap** compared to historical norms.

## Investment Zones

| ahr999 Value | Zone | Action | Multiplier |
|-------------|------|--------|------------|
| < 0.45 | Bottom-fishing | Aggressive buy | 3x base amount |
| 0.45 - 1.2 | DCA zone | Normal buy | 1x base amount |
| > 1.2 | Overvalued | Stop buying | 0x (hold/observe) |

### Example

If your base DCA amount is **$100/week**:
- ahr999 = 0.3 → Buy **$300** (bottom-fishing zone)
- ahr999 = 0.8 → Buy **$100** (normal DCA zone)
- ahr999 = 1.5 → Buy **$0** (wait, market overvalued)

## Setup in NexusQuant

### Prerequisites
- An exchange with good BTC/USDT liquidity (Binance, OKX recommended)
- API key with **spot trading permission**
- A clear budget for your DCA plan

### Steps

1. Go to **Dashboard** → **Smart DCA**
2. Select the exchange and trading pair (BTC/USDT)
3. Configure parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| Base Amount | Amount to invest per cycle in normal zone | $100 |
| Frequency | How often to buy | Weekly / Daily |
| Bottom Multiplier | Multiplier when ahr999 < 0.45 | 3x |
| DCA Multiplier | Multiplier when 0.45 ≤ ahr999 ≤ 1.2 | 1x |
| Stop Threshold | Stop buying when ahr999 exceeds this | 1.2 |

4. Click **Start Strategy**

![Smart DCA setup page](/images/strategies/nexusquant-dca-setup.png)

## How NexusQuant Calculates ahr999

The platform automatically fetches:
1. **BTC current price** from your connected exchange
2. **200-day moving average cost** (simulated daily DCA over 200 days)
3. **Fitted growth value** based on Bitcoin's historical logarithmic regression

The ahr999 value is updated in real-time on your dashboard.

## Slippage Protection

::: tip
NexusQuant includes built-in slippage protection for DCA orders.
:::

When placing buy orders, the system:
- Checks the **order book depth** before executing
- Splits large orders if liquidity is thin
- Sets a maximum slippage tolerance (configurable in settings)
- Cancels the order if slippage exceeds the threshold

## Viewing Performance

![Smart DCA dashboard](/images/strategies/nexusquant-dca-dashboard.png)

In the **Smart DCA** dashboard, you can see:
- Total invested amount
- Current BTC holdings
- Average buy price vs. current price
- Unrealized P&L
- ahr999 historical chart with your buy points marked

## Tips

- **Be patient**: DCA is a long-term strategy — the value comes from consistent buying over months and years
- **Don't override the indicator**: If ahr999 says stop, trust the data
- **Keep reserves**: Don't allocate all your funds — keep cash ready for bottom-fishing opportunities
- **Review monthly**: Check your average price and adjust the base amount if your financial situation changes
