# Whale Trade Trend Indicator

A rolling 5-minute trend engine built on top of the multi-exchange whale monitor. It processes every whale trade (≥ $1M) from Binance, Bybit, OKX, Bitget, Gate.io, Hyperliquid, and Aster — and delivers two types of Telegram output: a **periodic summary** and a real-time **trend flip alert**.

---

## Indicators

### 1. Cumulative Volume Delta (CVD)

The primary directional signal. Measures net USD dollar flow over the rolling 5-minute window.

```
CVD = Σ buy_value − Σ sell_value
```

| CVD | Meaning |
|---|---|
| Strongly positive | Whales net buying — bullish pressure |
| Near zero | Balanced — no clear direction |
| Strongly negative | Whales net selling — bearish pressure |

A visual ASCII bar is included in every summary to show the buy/sell split at a glance:

```
买卖压力 [███████░░░]   ← 70% buy pressure
```

---

### 2. Buy/Sell Pressure Ratio

Trade *count* split, independent of size. Catches scenarios where many smaller whale trades dominate without a single large outlier skewing CVD.

```
Buy Ratio = buy_count / total_count
```

| Ratio | Signal |
|---|---|
| ≥ 65% | 🟢 Bullish pressure |
| 35–65% | ⚪ Neutral |
| ≤ 35% | 🔴 Bearish pressure |

---

### 3. Whale Sentiment Score

A composite score from **−100 to +100** combining four sub-signals with fixed weights:

| Component | Weight | Description |
|---|---|---|
| CVD Ratio | 40% | `cvd / total_value` — how skewed dollar flow is |
| Buy Ratio | 30% | Count ratio scaled to −1..+1 |
| Exchange Divergence | 20% | CEX vs DEX agreement — same direction reinforces signal |
| Size Skew | 10% | Avg buy trade size vs avg sell trade size |

**Score interpretation:**

| Score | Emoji | Meaning |
|---|---|---|
| ≥ +60 | 🔥 | Extreme bullish conviction |
| +30 to +60 | 🟢 | Bullish |
| +10 to +30 | 🟡 | Mild bullish |
| −10 to +10 | ⚪ | Neutral |
| −30 to −10 | 🟠 | Mild bearish |
| −60 to −30 | 🔴 | Bearish |
| < −60 | 💀 | Extreme bearish conviction |

---

### 4. Price Impact (Avg Trade Size)

Tracks the average USD value per whale trade in the window. Rising average sizes suggest escalating conviction; falling averages suggest whale activity is tapering off.

```
Avg Trade Size = total_value / trade_count
```

---

### 5. Exchange Divergence (CEX vs DEX)

Breaks down buy/sell flow separately for centralised exchanges (Binance, Bybit, OKX, Bitget, Gate.io) and decentralised venues (Hyperliquid, Aster).

- **Agreement** — both CEX and DEX lean the same way → high confidence signal
- **Divergence** — CEX buying while DEX selling (or vice versa) → reduced confidence, watch for volatility

---

## Trend Classification

A trend label is assigned per coin per window using two simultaneous conditions:

| Trend | Conditions |
|---|---|
| `BULLISH` | Buy ratio ≥ 60% **AND** CVD ≥ +$200K |
| `BEARISH` | Buy ratio ≤ 40% **AND** CVD ≤ −$200K |
| `NEUTRAL` | Neither condition met |

Requiring *both* CVD and ratio to confirm prevents false signals from a single large outlier trade.

---

## Alert Types

### 📊 5-Minute Summary

Sent automatically every 5 minutes for each coin with at least 3 whale trades in the window.

```
📊 Whale Trend [5m]: BTC
━━━━━━━━━━━━━━━━━━
📈 Trend:   BULLISH
🔥 Score:   +72 / 100

📈 CVD:  +$12.40M
   买卖压力 [███████░░░]
   🟢 Buy  71%  $18.20M
   🔴 Sell 29%  $5.80M

⚖️ Exchange:
   CEX  🟢 Buy $14.10M / Sell $3.20M
   DEX  🟢 Buy $4.10M  / Sell $2.60M

🔢 34 trades  (avg $706K ea)
🕐 5min  |  2026-03-08 14:35 UTC
```

---

### ⚡ Trend Flip Alert

Fires **immediately** when the trend direction changes, subject to two guards:

- Score must shift by ≥ 20 points from the previous reading
- 2-minute cooldown between flip alerts per coin (prevents spam on choppy markets)

```
⚡ Trend FLIP: BTC
━━━━━━━━━━━━━━━━━━
➡️ NEUTRAL  →  📈 BULLISH

🔥 Score:  +72
📈 CVD:    +$12.40M
⚖️ Buy/Sell: 71% / 29%

💡 鲸鱼净买入持续增强，可能预示短期价格上涨
🕐 2026-03-08 14:33 UTC
```

---

## Configuration Reference

All thresholds are constants at the top of `whale_trend.py`:

| Constant | Default | Description |
|---|---|---|
| `WINDOW_SEC` | `300` (5 min) | Rolling window size |
| `SUMMARY_INTERVAL` | `300` (5 min) | How often summaries are sent |
| `MIN_TRADES` | `3` | Minimum trades required to emit any signal |
| `FLIP_CONFIRM_RATIO` | `0.60` | Buy ratio threshold for BULLISH/BEARISH label |
| `FLIP_MIN_CVD` | `$200,000` | Minimum absolute CVD to confirm a trend |
| `SCORE_FLIP_THRESH` | `20` | Score delta required to fire a flip alert |

---

## Integration (3-line summary)

```python
# 1. Import
from whale_trend import trend_engine

# 2. Feed every qualifying whale trade
trend_engine.ingest(coin, side, usd_value, exchange_name)

# 3. Check for flip after each ingest (real-time)
await trend_engine.check_flip(coin, send_telegram)

# 4. Register the background scheduler in main()
asyncio.create_task(trend_engine.run_scheduler(send_telegram))
```

See `whale_trend.py` docstring for the exact insertion points in `process_trade()`, `process_ccxt_trade()`, and `process_aster_trade()`.

---

## Limitations

- **No price feed** — the engine works purely from whale trade flow; it has no direct price data. CVD direction does not guarantee price direction.
- **Threshold sensitivity** — `FLIP_MIN_CVD = $200K` may be too low for BTC during high-volume sessions and too high for smaller coins like LINK. Consider per-symbol thresholds if needed.
- **5-minute lag** — summary signals are trailing by definition. The flip alert partially mitigates this but still requires ≥ 3 trades to compute.
- **CEX trade cost field** — `process_ccxt_trade` relies on CCXT's `cost` field for USD value. If an exchange returns 0 cost, that trade is silently skipped.
