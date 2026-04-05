# 設定頁面

從設定區域管理交易所連線、個人資料與訂閱方案。

## 交易所設定

![交易所列表頁面](/images/settings/nexusquant-exchanges-list.png)

前往 **交易所** 管理你的 API 連線。

### 新增交易所

1. 點擊 **新增交易所**
2. 從下拉選單選擇交易所（Binance、OKX、Bybit 等）
3. 填寫以下欄位：

| 欄位 | 說明 |
|------|------|
| 帳戶名稱 | 用來辨識此連線的標籤（例如「Binance 主帳戶」） |
| API Key | 交易所 API 金鑰 |
| Secret | 交易所 API 密鑰 |
| Passphrase | 部分交易所需要（如 OKX、Bitget） |
| Testnet | 開啟後使用交易所的測試網環境 |

4. 點擊 **儲存**

### 測試連線

儲存後，透過交易所卡片上的 `⋮` 選單選擇 **測試連線** 來驗證：
- API 金鑰是否有效
- 與交易所的網路延遲

::: tip
建議延遲控制在 **150ms** 以下。延遲過高可能在市價單時產生滑價。
:::

### 交易所數量限制

| 方案 | 最多交易所數量 |
|------|--------------|
| 免費 | 1 個 |
| Pro | 無限制 |

## 個人資料

前往 **個人資料** 管理帳戶資訊。

### 可編輯欄位

- **電子信箱** — 更新你的電子郵件地址
- **Telegram Chat ID** — 輸入你的 Telegram Chat ID 以接收交易與策略執行通知。

::: tip 如何設定 Telegram 通知？
1. 在 Telegram 搜尋並點擊官方機器人 [@nexus_quant_message_bot](https://t.me/nexus_quant_message_bot) (範例名稱)
2. **務必先點擊「Start」或傳送任何訊息給機器人**，否則系統將無法主動發送通知給你。
3. 取得你的 `Chat ID` 並填入此處。
:::

![Telegram 通知設定與 Chat ID 填寫](/images/settings/nexusquant-telegram-setup.png)

### 密碼管理

- 點擊 **更改密碼** 來更新密碼
- 需要輸入目前的密碼進行驗證

### 帳戶資訊（唯讀）

- 用戶名稱
- 訂閱方案（免費 / Pro）
- 帳戶建立日期

## 訂閱與推廣

NexusQuant 提供靈活的訂閱方案與具吸引力的推廣獎勵。

- [訂閱方案詳細說明](./subscription) — 了解免費與 Pro 方案的功能差異與付款方式。
- [推廣計畫](./affiliate) — 分享 NexusQuant 並賺取高額 USDT 佣金。
