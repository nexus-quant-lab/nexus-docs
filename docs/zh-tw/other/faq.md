# 常見問題

## 入門

### 如何開始使用？
請參考[快速開始](/zh-tw/getting-started/quick-start)指南。你需要建立帳號、連接交易所、選擇策略。

### 該選擇哪個交易所？
取決於你的策略。**資金費率套利**需要支援合約的交易所（Binance、OKX、Bybit）。**智能定投**只需要 BTC 流動性好的交易所。詳見[交易所對照表](/zh-tw/getting-started/quick-start#該選擇哪個交易所)。

### 如何設定 API Key？
每個交易所步驟不同，請參考[交易所設定](/zh-tw/exchange-setup)頁面的總覽，或查看各交易所的專屬指南（如 [Binance](/zh-tw/cex/binance)、[OKX](/zh-tw/cex/okx)）。

### 我需要開通合約/槓桿功能嗎？
只有使用**資金費率套利**或透過 **Webhook** 交易合約時才需要。智能定投只需要現貨交易權限。

## API Key 與安全

### 我的 API Key 安全嗎？
API Key 在伺服器端加密儲存，不會以明文保存。我們強烈建議：
- 在交易所端**開啟 IP 白名單**
- **只開啟交易權限** — 絕對不要開啟提幣權限
- 為 NexusQuant 使用**獨立的 API Key**

### NexusQuant 可以提取我的資產嗎？
不可以。NexusQuant 只使用交易 API 權限，無法轉帳、提幣或移動你的資產。你的資金始終保留在你的交易所帳戶中。

### 我該開啟哪些 API 權限？
| 策略 | 所需權限 |
|------|---------|
| 資金費率套利 | 現貨交易 + 合約交易 |
| Webhook 訊號 | 現貨交易（交易合約需加開合約權限） |
| 智能定投 | 現貨交易 |

## 交易策略

### 什麼是資金費率套利？
一種市場中性策略，透過現貨多頭對沖永續合約空頭來賺取資金費率收益。詳見[完整指南](/zh-tw/strategies/funding-arbitrage)。

### ahr999 是什麼？怎麼運作？
ahr999 衡量比特幣的相對價值。數值低（< 0.45）代表便宜，應加大買入；數值高（> 1.2）代表高估，停止買入。詳見[智能定投指南](/zh-tw/strategies/smart-dca)。

### 如何將 TradingView 串接 NexusQuant？
在 TradingView 建立 Webhook 警報，指向你的 NexusQuant webhook URL，搭配包含 passphrase 和交易細節的 JSON 訊號。詳見 [Webhook 指南](/zh-tw/strategies/webhook)。

### Webhook 需要什麼 JSON 格式？
```json
{
  "passphrase": "your-passphrase",
  "action": "buy",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```
完整欄位說明請見 [Webhook 指南](/zh-tw/strategies/webhook#欄位說明)。

### 可以在 Webhook 中使用 Pine Script 變數嗎？
可以。使用 `{{strategy.order.action}}`、`{{ticker}}`、`{{strategy.order.contracts}}` 等佔位符。詳見 [Pine Script 章節](/zh-tw/strategies/webhook#搭配-pine-script-變數)。

## 疑難排解

### Webhook 訊號沒有收到
1. 確認 TradingView 中的 webhook URL 正確
2. 確認 TradingView 警報為**啟用**狀態（未過期）
3. 確認你的方案支援 webhook 自動化功能

### 訂單執行失敗
1. 檢查交易所連線（設定 → 交易所 → 用 `⟳` 測試）
2. 確認帳戶餘額充足
3. 確認交易對格式正確（使用 `BTC/USDT` 而非 `BTCUSDT`）
4. 確認交易所是否在維護中

### ahr999 數值看起來不對
指標使用你連接的交易所即時價格計算。與其他來源可能有些微差異，這是交易所之間價格差造成的。

## 帳號與方案

### 有免費方案嗎？
有。免費方案包含交易所監控、基礎 webhook 接收、ahr999 指標查看。自動化執行需要付費方案。

### 如何升級方案？
前往**設定** → **訂閱方案**查看可用方案並升級。
