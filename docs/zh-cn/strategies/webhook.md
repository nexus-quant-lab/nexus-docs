# Webhook 信号自动化

将 TradingView 警报串接 NexusQuant，当你的技术分析条件触发时自动执行交易。

## 运作原理

1. 你在 TradingView 创建**警报**，设定交易条件
2. 条件触发时，TradingView 发送 **Webhook**（HTTP 请求）到 NexusQuant
3. NexusQuant **验证** passphrase 和信号格式
4. NexusQuant 在你连接的交易所**执行交易**

## 在 TradingView 中设定

### 步骤一：获取 Webhook URL

1. 在 NexusQuant 前往 **控制台** → **Webhook**
2. 复制你的 Webhook URL（格式：`https://api.nexusquant.io/api/v1/webhook/signal`）
3. 记下你的 **passphrase**（用于安全验证）

### 步骤二：创建 TradingView 警报

1. 打开 TradingView，设定你的图表/指标
2. 点击**警报**（钟表图标）→ **创建警报**
3. 设定触发条件（例如 RSI 跌破 30）
4. 在**通知**分页，勾选 **Webhook URL**
5. 粘贴 NexusQuant 的 webhook URL
6. 在**消息**栏位，输入 JSON 格式的信号内容（见下方）

### 步骤三：设定 JSON 信号格式

警报消息必须是有效的 JSON，格式如下：

#### 买入信号示例

```json
{
  "passphrase": "your-passphrase-here",
  "action": "buy",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```

#### 卖出信号示例

```json
{
  "passphrase": "your-passphrase-here",
  "action": "sell",
  "symbol": "BTC/USDT",
  "order_type": "market",
  "quantity": "0.01"
}
```

#### 平仓信号示例

```json
{
  "passphrase": "your-passphrase-here",
  "action": "close",
  "symbol": "BTC/USDT"
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `passphrase` | 是 | 安全验证码（必须与 NexusQuant 设定一致） |
| `action` | 是 | `buy`（买入）、`sell`（卖出）或 `close`（平仓） |
| `symbol` | 是 | 交易对（例如 `BTC/USDT`、`ETH/USDT`） |
| `order_type` | 否 | `market`（市价，默认）或 `limit`（限价） |
| `quantity` | 否 | 订单数量，`close` 动作可省略 |
| `price` | 否 | `order_type` 为 `limit` 时必填 |

<div v-pre>

## 搭配 Pine Script 变量

你可以在警报消息中使用 TradingView Pine Script 变量来创建动态信号：

```json
{
  "passphrase": "your-passphrase-here",
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "order_type": "market",
  "quantity": "{{strategy.order.contracts}}"
}
```

### 常用 Pine Script 占位符

| 占位符 | 说明 |
|--------|------|
| `{{strategy.order.action}}` | `buy` 或 `sell` |
| `{{strategy.order.contracts}}` | 合约/股数数量 |
| `{{ticker}}` | 商品代码（例如 `BTCUSDT`） |
| `{{close}}` | 当前收盘价 |
| `{{time}}` | 警报触发时间 |
| `{{strategy.position_size}}` | 当前持仓大小 |

</div>

::: tip
请确认 `symbol` 格式与 NexusQuant 要求的一致。例如使用 `BTC/USDT` 而非 `BTCUSDT`。你可能需要调整 <code v-pre>{{ticker}}</code> 变量的格式。
:::

## 安全机制

- **Passphrase 验证**：每个 webhook 请求必须包含正确的 passphrase
- **信号验证**：NexusQuant 在执行前会验证 JSON 格式
- **冲突检测**：系统会在下单前检查是否有冲突的持仓
- **频率限制**：防止重复信号快速连发

## 信号历史

所有接收到的信号都会记录在 **控制台** → **Webhook** → **信号历史**，包含：
- 时间戳
- 信号内容
- 执行状态（成功/失败/拒绝）
- 订单详情（若已执行）

## 疑难排解

| 问题 | 解决方式 |
|------|---------|
| 信号未收到 | 确认 webhook URL 正确、TradingView 警报已启用 |
| 「passphrase 无效」 | 确认 TradingView 和 NexusQuant 的 passphrase 一致 |
| 「JSON 格式无效」 | 用 JSON 验证器检查你的信号格式 |
| 订单未执行 | 检查交易所连线、余额和交易对格式 |
