# Webhook 訊號自動化

將 TradingView 警報串接 NexusQuant，當你的技術分析條件觸發時自動執行交易。

## 運作原理

1. 你在 TradingView 建立**警報**，設定交易條件
2. 條件觸發時，TradingView 發送 **Webhook**（HTTP 請求）到 NexusQuant
3. NexusQuant **驗證** passphrase 和訊號格式
4. NexusQuant 在你連接的交易所**執行交易**

## 在 TradingView 中設定

### 步驟一：取得 Webhook URL

1. 在 NexusQuant 前往 **控制台** → **Webhook**
2. 複製你的 Webhook URL（格式：`https://api.nexusquant.io/api/v1/webhook/signal`）
3. 記下你的 **passphrase**（用於安全驗證）

![NexusQuant Webhook URL 和 passphrase](/images/strategies/nexusquant-webhook-url.png)

### 步驟二：建立 TradingView 警報

1. 開啟 TradingView，設定你的圖表/指標
2. 點擊**警報**（鐘錶圖示）→ **建立警報**
3. 設定觸發條件（例如 RSI 跌破 30）
4. 在**通知**分頁，勾選 **Webhook URL**
5. 貼上 NexusQuant 的 webhook URL
6. 在**訊息**欄位，輸入 JSON 格式的訊號內容（見下方）

![TradingView 警報 Webhook URL 欄位](/images/strategies/tradingview-alert-webhook.png)

![TradingView 警報 JSON 訊息](/images/strategies/tradingview-alert-json.png)

### 步驟三：設定 JSON 訊號格式

警報訊息必須是有效的 JSON，格式如下：

#### 買入訊號範例

```json
{
  "passphrase": "your-passphrase-here",
  "action": "buy",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```

#### 賣出訊號範例

```json
{
  "passphrase": "your-passphrase-here",
  "action": "sell",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```

#### 平倉訊號範例

```json
{
  "passphrase": "your-passphrase-here",
  "action": "close",
  "symbol": "BTC/USDT"
}
```

### 欄位說明

| 欄位 | 必填 | 說明 |
|------|------|------|
| `passphrase` | 是 | 安全驗證碼（必須與 NexusQuant 設定一致） |
| `action` | 是 | `buy`（買入）、`sell`（賣出）或 `close`（平倉） |
| `symbol` | 是 | 交易對（例如 `BTC/USDT`、`ETH/USDT`） |
| `order_type` | 否 | `market`（市價，預設）或 `limit`（限價） |
| `quantity` | 否 | 訂單數量，`close` 動作可省略 |
| `price` | 否 | `order_type` 為 `limit` 時必填 |

<div v-pre>

## 搭配 Pine Script 變數

你可以在警報訊息中使用 TradingView Pine Script 變數來建立動態訊號：

```json
{
  "passphrase": "your-passphrase-here",
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "order_type": "market",
  "quantity": "{{strategy.order.contracts}}"
}
```

### 常用 Pine Script 佔位符

| 佔位符 | 說明 |
|--------|------|
| `{{strategy.order.action}}` | `buy` 或 `sell` |
| `{{strategy.order.contracts}}` | 合約/股數數量 |
| `{{ticker}}` | 商品代碼（例如 `BTCUSDT`） |
| `{{close}}` | 目前收盤價 |
| `{{time}}` | 警報觸發時間 |
| `{{strategy.position_size}}` | 目前持倉大小 |

</div>

::: tip
請確認 `symbol` 格式與 NexusQuant 要求的一致。例如使用 `BTC/USDT` 而非 `BTCUSDT`。你可能需要調整 <code v-pre>{{ticker}}</code> 變數的格式。
:::

## 止損與止盈（SL/TP）

NexusQuant 支援在 Webhook 策略上自動掛出 SL/TP 保護單。啟用後，開倉完成後會立即掛出保護訂單。

### 如何啟用

建立或編輯 Webhook 策略時，開啟 **啟用 SL/TP** 並設定：

![Webhook 策略 SL/TP 設定](/images/strategies/nexusquant-webhook-sltp.png)

| 參數 | 說明 | 範例 |
|------|------|------|
| 止損 % | 價格反向移動達此百分比時平倉 | 3.0（= -3%） |
| 止盈 % | 價格順向移動達此百分比時平倉 | 5.0（= +5%） |

### 運作方式

- **止損**：掛出條件單（觸發單）。當價格觸及止損位時，以市價平倉。
- **止盈**：在目標獲利價位掛出限價單。
- 兩者皆使用 `reduceOnly` 模式 — 只會平倉，不會反向開倉。
- SL/TP 價格根據進場價和設定的百分比自動計算。

### 範例

以 $100,000 開 **多倉**，止損 = 3%、止盈 = 5%：
- 止損觸發於 **$97,000**（市價賣出）
- 止盈掛單於 **$105,000**（限價賣出）

::: tip
強烈建議自動化策略啟用 SL/TP。未啟用時，持倉會一直保持到下一個訊號或手動操作。
:::

## 支援的動作

除了 `buy`、`sell` 和 `close`，合約交易還支援以下動作：

| 動作 | 行為 |
|------|------|
| `long` | 開合約多倉 |
| `short` | 開合約空倉 |
| `close_long` | 僅平多倉 |
| `close_short` | 僅平空倉 |

## 安全機制

- **Passphrase 驗證**：每個 webhook 請求必須包含正確的 passphrase
- **訊號驗證**：NexusQuant 在執行前會驗證 JSON 格式
- **衝突偵測**：系統會在下單前檢查是否有衝突的持倉
- **頻率限制**：防止重複訊號快速連發

## 訊號歷史

所有接收到的訊號都會記錄在 **控制台** → **Webhook** → **訊號歷史**，包含：
- 時間戳
- 訊號內容
- 執行狀態（成功/失敗/拒絕）
- 訂單詳情（若已執行）

## 疑難排解

| 問題 | 解決方式 |
|------|---------|
| 訊號未收到 | 確認 webhook URL 正確、TradingView 警報已啟用 |
| 「passphrase 無效」 | 確認 TradingView 和 NexusQuant 的 passphrase 一致 |
| 「JSON 格式無效」 | 用 JSON 驗證器檢查你的訊號格式 |
| 訂單未執行 | 檢查交易所連線、餘額和交易對格式 |
