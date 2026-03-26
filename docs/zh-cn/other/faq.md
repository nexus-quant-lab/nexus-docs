# 常见问题

## 入门

### 如何开始使用？
请参考[快速开始](/zh-cn/getting-started/quick-start)指南。你需要创建账号、连接交易所、选择策略。

### 该选择哪个交易所？
取决于你的策略。**资金费率套利**需要支持合约的交易所（Binance、OKX、Bybit）。**智能定投**只需要 BTC 流动性好的交易所。详见[交易所对照表](/zh-cn/getting-started/quick-start#该选择哪个交易所)。

### 如何设定 API Key？
每个交易所步骤不同，请参考[交易所设定](/zh-cn/exchange-setup)页面的总览，或查看各交易所的专属指南（如 [Binance](/zh-cn/cex/binance)、[OKX](/zh-cn/cex/okx)）。

### 我需要开通合约/杠杆功能吗？
只有使用**资金费率套利**或通过 **Webhook** 交易合约时才需要。智能定投只需要现货交易权限。

## API Key 与安全

### 我的 API Key 安全吗？
API Key 在服务器端加密存储，不会以明文保存。我们强烈建议：
- 在交易所端**开启 IP 白名单**
- **只开启交易权限** — 绝对不要开启提币权限
- 为 NexusQuant 使用**独立的 API Key**

### NexusQuant 可以提取我的资产吗？
不可以。NexusQuant 只使用交易 API 权限，无法转账、提币或移动你的资产。你的资金始终保留在你的交易所账户中。

### 我该开启哪些 API 权限？
| 策略 | 所需权限 |
|------|---------|
| 资金费率套利 | 现货交易 + 合约交易 |
| Webhook 信号 | 现货交易（交易合约需加开合约权限） |
| 智能定投 | 现货交易 |

## 交易策略

### 什么是资金费率套利？
一种市场中性策略，通过现货多头对冲永续合约空头来赚取资金费率收益。详见[完整指南](/zh-cn/strategies/funding-arbitrage)。

### ahr999 是什么？怎么运作？
ahr999 衡量比特币的相对价值。数值低（< 0.45）代表便宜，应加大买入；数值高（> 1.2）代表高估，停止买入。详见[智能定投指南](/zh-cn/strategies/smart-dca)。

### 如何将 TradingView 串接 NexusQuant？
在 TradingView 创建 Webhook 警报，指向你的 NexusQuant webhook URL，搭配包含 passphrase 和交易细节的 JSON 信号。详见 [Webhook 指南](/zh-cn/strategies/webhook)。

### Webhook 需要什么 JSON 格式？
```json
{
  "passphrase": "your-passphrase",
  "action": "buy",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```
完整字段说明请见 [Webhook 指南](/zh-cn/strategies/webhook#字段说明)。

### 可以在 Webhook 中使用 Pine Script 变量吗？
<div v-pre>

可以。使用 `{{strategy.order.action}}`、`{{ticker}}`、`{{strategy.order.contracts}}` 等占位符。详见 [Pine Script 章节](/zh-cn/strategies/webhook#搭配-pine-script-变量)。

</div>

## 疑难排解

### Webhook 信号没有收到
1. 确认 TradingView 中的 webhook URL 正确
2. 确认 TradingView 警报为**启用**状态（未过期）
3. 确认你的方案支持 webhook 自动化功能

### 订单执行失败
1. 检查交易所连线（设置 → 交易所 → 用 `⟳` 测试）
2. 确认账户余额充足
3. 确认交易对格式正确（使用 `BTC/USDT` 而非 `BTCUSDT`）
4. 确认交易所是否在维护中

### ahr999 数值看起来不对
指标使用你连接的交易所实时价格计算。与其他来源可能有些微差异，这是交易所之间价格差造成的。

## 账号与方案

### 有免费方案吗？
有。免费方案包含交易所监控、基础 webhook 接收、ahr999 指标查看。自动化执行需要付费方案。

### 如何升级方案？
前往**设置** → **订阅方案**查看可用方案并升级。
