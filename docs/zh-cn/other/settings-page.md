# 设置页面

从设置区域管理交易所连接、个人资料与订阅方案。

## 交易所设置

![交易所列表页面](/images/settings/nexusquant-exchanges-list.png)

前往 **交易所** 管理你的 API 连接。

### 添加交易所

1. 点击 **添加交易所**
2. 从下拉菜单选择交易所（Binance、OKX、Bybit 等）
3. 填写以下字段：

| 字段 | 说明 |
|------|------|
| 账户名称 | 用来标识此连接的标签（例如「Binance 主账户」） |
| API Key | 交易所 API 密钥 |
| Secret | 交易所 API 私��� |
| Passphrase | 部分交易所需要（如 OKX、Bitget） |
| Testnet | 开启后使用交易所的测试网环境 |

4. 点击 **保存**

### 测试连接

保存后，通过交易所卡片上的 `⋮` 菜单选择 **测试连接** 来验证：
- API 密钥是否有效
- 与交易所的网络延迟

::: tip
建议延迟控制在 **150ms** 以下。延迟过高可能在市价单时产生滑点。
:::

### 交易所数量限制

| 方案 | 最多交易所数量 |
|------|--------------|
| 免费 | 1 个 |
| Pro | 无限制 |

## 个人资料

前往 **个人资料** 管理账户信息。

### 可编辑字段

- **电子邮箱** — 更新你的电子邮件地址
- **Telegram Chat ID** — 输入你的 Telegram Chat ID 以接收交易与策略执行通知。

::: tip 如何设置 Telegram 通知？
1. 在 Telegram 搜索并点击官方机器人 [@nexus_quant_message_bot](https://t.me/nexus_quant_message_bot) (示例名称)
2. **务必先点击「Start」或发送任何消息给机器人**，否则系统将无法主动发送通知给你。
3. 获取你的 `Chat ID` 并填入此处。
:::

![Telegram 通知设置与 Chat ID 填写](/images/settings/nexusquant-telegram-setup.png)

### 密码管理

- 点击 **更改密码** 来更新密码
- 需要输入当前密码进行验证

### 账户信息（只读）

- 用户名
- 订阅方案（免费 / Pro）
- 账户创建日期

## 订阅与推广

NexusQuant 提供灵活的订阅方案与具吸引力的推广奖励。

- [订阅方案详细说明](./subscription) — 了解免费与 Pro 方案的功能差异与付款方式。
- [推广计划](./affiliate) — 分享 NexusQuant 并赚取高额 USDT 佣金。

