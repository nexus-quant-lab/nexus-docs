# 快速開始

三步驟開始使用 NexusQuant。

## 步驟一：建立帳號

1. 前往 [NexusQuant](https://nexusquant.io)，點擊 **免費註冊**
2. 輸入電子郵件並設定密碼
3. 驗證電子郵件

## 步驟二：連接交易所

1. 前往 **設定** → **交易所配置**
2. 選擇你的交易所（例如 Binance、OKX、Bybit）
3. 填入 **API Key** 和 **Secret**
4. 點擊 **儲存**，然後用 `⟳` 按鈕測試連線延遲

![NexusQuant 交易所配置頁面](/images/getting-started/exchange-config.png)

::: warning API Key 安全提醒
- 在交易所端 **開啟 IP 白名單**
- **只開啟交易權限** — 絕對不要開啟提幣權限
- 各交易所的詳細設定步驟請參考 [交易所設定](/zh-tw/exchange-setup)
:::

### 該選擇哪個交易所？

| 使用場景 | 建議交易所 |
|---------|-----------|
| 資金費率套利 | Binance、OKX、Bybit（需支援合約） |
| Webhook 訊號交易 | 任何支援現貨/合約的交易所 |
| 智能定投（BTC） | Binance、OKX（BTC 流動性佳） |

## 步驟三：選擇並啟動策略

NexusQuant 提供三大核心策略：

### 資金費率套利
透過現貨 + 永續合約對沖，賺取低風險費率收益。適合追求穩定被動收入的用戶。
→ [完整指南](/zh-tw/strategies/funding-arbitrage)

### Webhook 訊號自動化
串接 TradingView 警報自動執行交易。適合使用技術分析的交易者。
→ [完整指南](/zh-tw/strategies/webhook)

### ahr999 智能定投
基於 ahr999 指標的比特幣價值投資策略。適合長期累積 BTC 的用戶。
→ [完整指南](/zh-tw/strategies/smart-dca)

## 支援的交易所

### 中心化交易所 (CEX)

| 交易所 | 現貨 | 現貨槓桿 | 合約 | 測試網 |
|--------|------|---------|------|--------|
| [Binance](/zh-tw/cex/binance) | ✓ | ✓ | ✓ | ✓ |
| [Bybit](/zh-tw/cex/bybit) | ✓ | ✓ | ✓ | ✓ |
| [OKX](/zh-tw/cex/okx) | ✓ | ✓ | ✓ | ✓ |
| [Gate](/zh-tw/cex/gate) | ✓ | ✓ | ✓ | ✓ |
| [Bitget](/zh-tw/cex/bitget) | ✓ | ✓ | ✓ | ✓ |
| [MEXC](/zh-tw/cex/mexc) | ✓ | ✓ | ✓ | ✓ |
| [HTX](/zh-tw/cex/htx) | ✓ | ✓ | ✓ | ✓ |
| [KuCoin](/zh-tw/cex/kucoin) | ✓ | ✓ | ✓ | ✓ |
| [Coinbase](/zh-tw/cex/coinbase) | ✓ | - | - | - |
| [Maicoin Max](/zh-tw/cex/max) | ✓ | - | - | - |
| [BitoPro](/zh-tw/cex/bitopro) | ✓ | - | - | - |

### 去中心化交易所 (DEX)

| 交易所 | 永續 | 測試網 |
|--------|------|--------|
| [Hyperliquid](/zh-tw/dex/hyperliquid) | ✓ | - |
| [Lighter](/zh-tw/dex/lighter) | ✓ | ✓ |
| [Backpack](/zh-tw/dex/backpack) | ✓ | - |
| [BloFin](/zh-tw/dex/blofin) | ✓ | - |
| [Apex Omni](/zh-tw/dex/apex-omni) | ✓ | - |
| [Aster](/zh-tw/dex/aster) | ✓ | - |
| [Pacifica](/zh-tw/dex/pacifica) | ✓ | - |
| [Paradex](/zh-tw/dex/paradex) | ✓ | - |
| [StandX](/zh-tw/dex/standx) | ✓ | - |
| [Extended](/zh-tw/dex/extended) | ✓ | - |

## 接下來

- [交易所設定指南](/zh-tw/exchange-setup) — 各交易所 API Key 詳細設定步驟
- [設定頁面](/zh-tw/other/settings-page) — 風控、通知等配置
- [常見問題](/zh-tw/other/faq) — 常見問題與疑難排解
