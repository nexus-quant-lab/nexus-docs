# 虛擬貨幣期現套利全攻略：從理論到 Python 自動化實作
<!-- https://gemini.google.com/share/continue/2c8078d4fc4c -->

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
```

## 5. 避開陷阱：錢包狀態檢查

在 Gate.io 等平台，高費率有時是因為「暫停充提」。這會導致該交易所變成孤島，平倉時會產生巨大損失。

### 程式化過濾邏輯
我們需要檢查幣種的 active 與 withdraw 狀態，確保不是因為「進得去、出不來」造成的虛高費率：

```python
async def is_wallet_healthy(exchange, code):
    currencies = await exchange.fetch_currencies()
    if code in currencies:
        info = currencies[code]
        if not info.get('deposit') or not info.get('withdraw'):
            return False, "充提暫停"
        return True, "正常"
    return False, "未知"
```

## 6. 半自動化：Telegram 確認下單機器人

為了安全起見，我們建議採用：程式監控 + 人工 Telegram 確認。

### 工作流程監控：

1. **監控**: 機器人 24 小時掃描，發現 $APY > 15\%$ 時發送訊息。
2. **通知**：Telegram 彈出訊息，顯示當前 APY、價差與「✅ 確認執行」按鈕。
3. **執行**：當你點擊按鈕，程式才會自動完成「劃轉、買入現貨、開立空單」。

## 7. 結論與建議

期現套利是加密貨幣市場中的「收租」策略。對於不同需求的投資者，建議如下：

* **穩健收租**：優先選擇 `Bybit` 進行主流幣（BTC/ETH）套利，流動性好且費率穩定。
* **狩獵暴利**：選擇 `Gate.i`o 監控熱門山寨幣，但務必加入**錢包狀態與價差過濾**代碼以避開陷阱。
* **新手起步** ：永遠使用 1x 幣本位 進行初次嘗試，這能讓你練習流程的同時，完全消除價格波動帶來的心理壓力。

----

想要獲取完整的 Telegram 機器人原始碼嗎？歡迎在下方留言或訂閱我的部落格！
