# 快速开始

三步骤开始使用 NexusQuant。

## 步骤一：创建账号

1. 前往 [NexusQuant](https://nexusquant.io)，点击 **免费注册**
2. 输入电子邮件并设定密码
3. 验证电子邮件

## 步骤二：连接交易所

1. 前往 **设置** → **交易所配置**
2. 选择你的交易所（例如 Binance、OKX、Bybit）
3. 填入 **API Key** 和 **Secret**
4. 点击 **保存**，然后用 `⟳` 按钮测试连线延迟

![NexusQuant 交易所配置页面](/images/getting-started/exchange-config.png)

::: warning API Key 安全提醒
- 在交易所端 **开启 IP 白名单**
- **只开启交易权限** — 绝对不要开启提币权限
- 各交易所的详细设定步骤请参考 [交易所设定](/zh-cn/exchange-setup)
:::

### 该选择哪个交易所？

| 使用场景 | 建议交易所 |
|---------|-----------|
| 资金费率套利 | Binance、OKX、Bybit（需支持合约） |
| Webhook 信号交易 | 任何支持现货/合约的交易所 |
| 智能定投（BTC） | Binance、OKX（BTC 流动性佳） |

## 步骤三：选择并启动策略

NexusQuant 提供三大核心策略：

### 资金费率套利
通过现货 + 永续合约对冲，赚取低风险费率收益。适合追求稳定被动收入的用户。
→ [完整指南](/zh-cn/strategies/funding-arbitrage)

### Webhook 信号自动化
串接 TradingView 警报自动执行交易。适合使用技术分析的交易者。
→ [完整指南](/zh-cn/strategies/webhook)

### ahr999 智能定投
基于 ahr999 指标的比特币价值投资策略。适合长期累积 BTC 的用户。
→ [完整指南](/zh-cn/strategies/smart-dca)

## 支持的交易所

### 中心化交易所 (CEX)

| 交易所 | 现货 | 合约 | 测试网 |
|--------|------|------|--------|
| [Binance](/zh-cn/cex/binance) | ✓ | ✓ | ✓ |
| [Bybit](/zh-cn/cex/bybit) | ✓ | ✓ | ✓ |
| [OKX](/zh-cn/cex/okx) | ✓ | ✓ | ✓ |
| [Gate](/zh-cn/cex/gate) | ✓ | ✓ | ✓ |
| [Bitget](/zh-cn/cex/bitget) | ✓ | ✓ | ✓ |
| [MEXC](/zh-cn/cex/mexc) | ✓ | ✓ | ✓ |
| [HTX](/zh-cn/cex/htx) | ✓ | ✓ | ✓ |
| [KuCoin](/zh-cn/cex/kucoin) | ✓ | ✓ | ✓ |
| [Coinbase](/zh-cn/cex/coinbase) | ✓ | - | - |
| [Maicoin Max](/zh-cn/cex/max) | ✓ | - | - |
| [BitoPro](/zh-cn/cex/bitopro) | ✓ | - | - |

### 去中心化交易所 (DEX)

| 交易所 | 永续 | 测试网 |
|--------|------|--------|
| [Hyperliquid](/zh-cn/dex/hyperliquid) | ✓ | - |
| [Lighter](/zh-cn/dex/lighter) | ✓ | ✓ |
| [Backpack](/zh-cn/dex/backpack) | ✓ | - |
| [BloFin](/zh-cn/dex/blofin) | ✓ | - |
| [Apex Omni](/zh-cn/dex/apex-omni) | ✓ | - |
| [Aster](/zh-cn/dex/aster) | ✓ | - |
| [Pacifica](/zh-cn/dex/pacifica) | ✓ | - |
| [Paradex](/zh-cn/dex/paradex) | ✓ | - |
| [StandX](/zh-cn/dex/standx) | ✓ | - |
| [Extended](/zh-cn/dex/extended) | ✓ | - |

## 接下来

- [交易所设定指南](/zh-cn/exchange-setup) — 各交易所 API Key 详细设定步骤
- [设置页面](/zh-cn/other/settings-page) — 风控、通知等配置
- [常见问题](/zh-cn/other/faq) — 常见问题与疑难排解
