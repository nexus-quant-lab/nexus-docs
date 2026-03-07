# 虛擬貨幣期現套利全攻略：從理論到 Python 自動化實作

這篇指南將帶你從零開始了解虛擬貨幣市場中最穩健的獲利方式——**期現套利 (Cash-and-Carry Arbitrage)**。我們不僅會討論理論，還會深入到如何使用 Python 與 CCXT 建立一個帶有 Telegram 通知功能的半自動套利機器人。

---

## 1. 什麼是期現套利？

期現套利的中心思想是利用**「期貨」與「現貨」之間的價差**，以及永續合約獨有的**「資金費率 (Funding Rate)」**來賺取相對穩定的收益。

### 核心公式
* **基差 (Basis)** = 期貨價格 - 現貨價格
* **年化收益率 (APY)** = 單次資金費率 $\times$ 每日結算次數 (通常為 3) $\times$ 365

---

## 2. 判斷套利機會的四個維度

要判斷一個套利機會是否「肥美」，你需要精算以下指標：

1.  **正向價差 (Positive Basis)**：期貨需高於現貨，且價差率需大於資金成本。
2.  **資金費率 (Funding Rate)**：單次費率建議 $> 0.01\%$。若達到 $0.03\% - 0.1\%$，則是極佳機會。
3.  **持有成本**：需扣除雙邊交易手續費（現貨約 $0.1\%$，合約約 $0.02\% - 0.05\%$）。
4.  **回本週期**：計算領幾次費率才能覆蓋手續費等摩擦成本。

---

## 3. 如何避免清算 (爆倉) 風險？

雖然套利是對沖交易，但合約端仍有清算風險。

### 策略 A：降低槓桿
將槓桿控制在 **1x - 3x** 之間。使用「全倉 (Cross Margin)」模式，並在合約帳戶留存 $20\%-30\%$ 的閒置資金作為緩衝。

### 策略 B：幣本位套利 (Coin-Margined) —— 最安全方案
* **原理**：使用該幣種作為保證金（例如持有一顆 BTC，同時在幣本位合約做空一顆 BTC）。
* **優勢**：幣價上漲時，保證金（現貨）價值同步增加，**理論上無強平價格**。這能讓你完全無視市場暴漲帶來的壓力。



---

## 4. 實戰：Python 與 CCXT 自動化監控

使用 `ccxt.async_support` 可以實現高效的非同步監控，同時監控 **Bybit** 與 **Gate.io** 的機會。

```python
import asyncio
import ccxt.async_support as ccxt

async def get_funding_info(exchange_id, symbol):
    exchange_class = getattr(ccxt, exchange_id)
    ex = exchange_class({'enableRateLimit': True})
    try:
        funding = await ex.fetch_funding_rate(symbol)
        rate = funding['fundingRate']
        return {
            'ex': exchange_id,
            'rate': f"{rate*100:.4f}%",
            'apy': f"{rate * 3 * 365 * 100:.2f}%"
        }
    finally:
        await ex.close()
