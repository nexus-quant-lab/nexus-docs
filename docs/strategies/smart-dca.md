# Smart DCA (ahr999)

Smart DCA uses the **ahr999 indicator** to determine when and how much Bitcoin to buy. Instead of buying a fixed amount on a fixed schedule, it dynamically adjusts your investment based on Bitcoin's relative value.

## What is ahr999?

The ahr999 indicator measures Bitcoin's current price relative to:
- **200-day DCA cost** (your average cost if you bought daily for 200 days)
- **Fitted growth value** (Bitcoin's long-term logarithmic growth trend)

A lower ahr999 value means Bitcoin is **relatively cheap** compared to historical norms.

## Investment Multipliers

Instead of fixed amounts, NexusQuant uses a **dynamic linear multiplier** to optimize your entry price:

| ahr999 Value | Zone | Action | Multiplier (min to max) |
|-------------|------|--------|------------|
| < 0.45 | Bottom-fishing | Aggressive buy | **1.5x to 5.0x** |
| 0.45 - 1.2 | DCA zone | Normal buy | **0.5x to 1.5x** |
| > 1.2 | Overvalued | Stop buying | **0x** (hold/observe) |

### How it works
The system automatically calculates the multiplier based on the exact ahr999 value:
- **At ahr999 = 0.0**: The multiplier is **5.0x** (maximum bottom-fishing).
- **At ahr999 = 0.45**: The multiplier is **1.5x** (transition between zones).
- **At ahr999 = 1.2**: The multiplier is **0.1x** (minimal buy before stopping).

This ensures you buy significantly more when Bitcoin is deeply undervalued and gradually reduce your investment as it approaches the overvalued zone.

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

## Viewing Performance

![Smart DCA dashboard](/images/strategies/nexusquant-dca-dashboard.png)

In the **Smart DCA** dashboard, you can see:
- Total invested amount
- DCA BTC accumulated
- Average buy price vs. current price
- Unrealized P&L
- Buy count

## Tips

- **Be patient**: DCA is a long-term strategy — the value comes from consistent buying over months and years
- **Don't override the indicator**: If ahr999 says stop, trust the data
- **Keep reserves**: Don't allocate all your funds — keep cash ready for bottom-fishing opportunities
- **Review monthly**: Check your average price and adjust the base amount if your financial situation changes
