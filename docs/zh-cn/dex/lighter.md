# Lighter 设置

设置 Lighter 永续 DEX 的说明。

## 推荐码

如果您是 Lighter 的新用户，使用我的推荐码注册账户。
您将获得交易手续费折扣。

* 点击注册: {{REFERRAL_LINK}}

## 生产环境

Lighter 是基于以太坊 Layer 2 (L2) 的 zk-rollup 协议。

### 如何查找 L1_ADDRESS

您的 L1 地址是连接到 Lighter 的以太坊钱包地址。您也可以通过以下方式查找：
1. 从 API 密钥查找：在 Lighter 创建 API 密钥时，它会绑定您的钱包地址
2. 从私钥派生：如果您有私钥，可以使用以下方式获取地址：
```python
from eth_account import Account
acct = Account.from_key("0xYOUR_PRIVATE_KEY")
print(acct.address)
```

地址以 0x 开头，共 42 个字符（例如 0x1234...abcd）。

### 如何查找 account_index

获取地址后，查询：
```
https://mainnet.zklighter.elliot.ai/api/v1/accountsByL1Address?l1_address=YOUR_ADDRESS
```

响应将显示您的 sub_accounts[].index 值。

### API 密钥

如果您有账户，可以生成 API 密钥。API 文档可在此处找到。

### 存款

存款以创建账户。

## 钱包连接

连接您的钱包并配置 perp DEX 设定。

------------------------------------------------------------------------

## 测试网

Lighter 是基于以太坊 Layer 2 (L2) 的 zk-rollup 协议，其测试网环境主要锚定以太坊生态系统。

### 应该使用哪个链？

您应该使用 `Arbitrum One` / `Arbitrum Sepolia`（测试网）。

`Arbitrum Sepolia（Arbitrum 的测试网版本）`

### 在哪里获取测试 USDC？

由于 Lighter 使用 USDC 作为永续合约的主要保证金，您需要"模拟"或"测试网"USDC。最可靠的来源包括：

- Circle 官方水龙头：前往 faucet.circle.com，从网络下拉菜单中选择 Ethereum Sepolia，输入您的钱包地址。您通常每 2 小时可以领取 20 USDC。
- Lighter App Drip：当您将钱包连接到 Lighter 测试网应用时，存款界面通常有一个"水龙头"或"铸造"按钮。

------------------------------------------------------------------------

## 注意事项与最佳实践

-   DEX 交易涉及智能合约风险 --- 请确保您了解风险。
-   切勿在代码仓库中暴露您的私钥。

::: warning
永续合约交易涉及高风险。请确保您了解风险。
:::
