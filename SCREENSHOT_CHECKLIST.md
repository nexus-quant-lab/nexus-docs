# Screenshot Checklist

## 使用方式

截圖後直接**覆蓋** `docs/public/images/` 裡的同名 placeholder 檔案即可，不需要改任何 markdown。

所有 `![](...)` 已寫好在三語（en / zh-tw / zh-cn）文件中，build 也已通過。

---

## 快速總覽

| 類型 | 數量 | 說明 |
|------|------|------|
| 📷 直接截圖 | 13 張 | 自家 UI，截完放進去就好 |
| ✏️ 需要標註 | 6 張 | 第三方介面，需加紅框/箭頭引導讀者 |
| 🚫 尚無 placeholder | 6 張 | 選配項，需要時再截再加 |
| **合計** | **25 張** | |

---

## ✏️ 需要標註的截圖（6 張）

這些是 Binance / TradingView 的後台，畫面選項多，需要加紅框或箭頭讓讀者一眼找到目標。

| # | 檔案路徑 | 標註說明 |
|---|---------|---------|
| 2 | `images/exchanges/binance-api-management.png` | **紅框**圈出右上角選單中的「API Management」項目（選單項目很多容易找不到） |
| 3 | `images/exchanges/binance-create-api.png` | **箭頭**指向「Create API」按鈕 |
| 4 | `images/exchanges/binance-api-key-secret.png` | **標示**哪個是 API Key、哪個是 Secret（兩個欄位長很像）；**模糊處理**實際數值 |
| 5 | `images/exchanges/binance-api-permissions.png` | **紅框**圈出要勾選的項目（Spot、Futures）；❌ **叉掉** Withdrawal 選項表示不要勾 |
| 8 | `images/strategies/tradingview-alert-webhook.png` | **箭頭**指向 Notifications tab 裡的「Webhook URL」輸入欄位（TradingView 的 dialog 欄位很多） |
| 9 | `images/strategies/tradingview-alert-json.png` | **紅框**圈出 Message 文字輸入區（讓讀者知道 JSON 貼在哪裡） |

> 💡 **標註工具建議**：macOS Preview → Markup（紅框 + 箭頭），或 CleanShot X / Shottr 等截圖工具都有內建標註。

---

## 📷 直接截圖（13 張）

自家 NexusQuant UI，label 清楚不需要額外標註，截完覆蓋即可。

| # | 檔案路徑 | 截什麼 | 頁面路徑 |
|---|---------|--------|---------|
| 1 | `images/getting-started/exchange-config.png` | 交易所配置頁面總覽 | `/exchanges` |
| 6 | `images/exchanges/nexusquant-add-binance.png` | 新增交易所 dialog（選 Binance） | `/exchanges` → 點新增 |
| 7 | `images/strategies/nexusquant-webhook-url.png` | Webhook 頁面顯示 URL + passphrase | `/webhook` → 展開某策略 |
| 10 | `images/strategies/nexusquant-webhook-sltp.png` | 策略設定中的 SL/TP 開關和百分比欄位 | `/webhook` → 編輯策略 |
| 12 | `images/strategies/nexusquant-dca-setup.png` | 智能定投策略設定表單 | `/dca` → 建立策略 |
| 13 | `images/strategies/nexusquant-dca-dashboard.png` | DCA 儀表板：ahr999 圖表 + 投資記錄 | `/dca` |
| 14 | `images/dashboard/nexusquant-dashboard.png` | Dashboard：6 個統計卡片 + NAV 曲線 | `/dashboard` |
| 16 | `images/trading/nexusquant-positions.png` | 持倉頁面：統計卡片 + 持倉表格 | `/positions` |
| 17 | `images/trading/nexusquant-trades.png` | 交易記錄：篩選列 + 歷史表格 | `/trades` |
| 26 | `images/strategies/nexusquant-funding-history.png` | 資金費率套利：歷史趨勢圖表與數據分析 | `/funding-arbitrage` → 點擊圖表圖示 |
| 27 | `images/settings/nexusquant-telegram-setup.png` | 個人資料：Telegram Chat ID 輸入框與說明 | `/profile` |
| 18 | `images/settings/nexusquant-exchanges-list.png` | 交易所列表（有卡片、延遲數值） | `/exchanges` |
| 20 | `images/settings/nexusquant-subscription.png` | 訂閱方案：月 vs 年卡片 + 付款按鈕 | `/subscription` |
| 21 | `images/auth/nexusquant-register.png` | 註冊頁面表單 | `/auth/register` |
| 22 | `images/auth/nexusquant-google-signin.png` | 註冊頁 Google Sign-In 按鈕 | `/auth/register`（同上，可裁切按鈕區域） |

---

## 🚫 尚無 placeholder 的選配截圖（6 張）

這些目前文件中**沒有** `![](...)` 引用，需要時再截圖、加 placeholder、加 markdown 引用。

| # | 建議檔名 | 說明 |
|---|---------|------|
| 11 | `images/strategies/nexusquant-webhook-create.png` | 建立 Webhook 策略的完整表單 |
| 15 | `images/dashboard/nexusquant-dashboard-testnet.png` | Dashboard Testnet 模式（黃色 chip） |
| 19 | `images/settings/nexusquant-profile.png` | 個人資料頁面 |
| 23 | `images/exchanges/okx-api-setup.png` | OKX API Key 設定步驟 |
| 24 | `images/exchanges/bybit-api-setup.png` | Bybit API Key 設定步驟 |
| 25 | `images/exchanges/bitget-api-setup.png` | Bitget API Key 設定步驟 |

---

## 建議截圖順序

### 第一批：NexusQuant 自有頁面（13 張 📷）

全部都是自己平台的 UI，登入後逐頁截：

```
/auth/register        → #21, #22
/exchanges            → #1, #6, #18
/webhook              → #7, #10
/dca                  → #12, #13
/dashboard            → #14
/positions            → #16
/trades               → #17
/subscription         → #20
```

### 第二批：第三方介面（6 張 ✏️）

需要登入 Binance + TradingView，截完後加標註：

```
Binance 後台          → #2, #3, #4, #5
TradingView 警報      → #8, #9
```

### 第三批：選配（6 張 🚫）

有空再補，不影響文件完整性。

---

## 截圖小提醒

- **解析度**：建議用 Retina 螢幕截圖（2x），圖片會更清晰
- **視窗寬度**：約 1200-1400px 寬，太寬圖片在文件裡會太小
- **深色/淺色**：建議統一用淺色模式，文件閱讀體驗較一致
- **敏感資訊**：API Key、Secret、錢包地址、Email 務必模糊處理
- **格式**：PNG 最佳，截圖工具預設通常就是 PNG
