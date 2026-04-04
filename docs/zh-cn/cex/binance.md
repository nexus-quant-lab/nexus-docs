# Binance 币安设置指南

设置币安 API 的说明步骤。

币安共有三种 API 密钥。
进行真实交易需要 `正式生产环境 API 密钥`。若要演示现货交易，则需要 `现货模拟交易 API 密钥`。

1. 正式生产环境 (实盘币安) API 密钥
2. 现货模拟交易 API 密钥
3. 合约模拟交易 API 密钥

## 推荐链接
如果您是币安新用户，使用我的推荐链接注册账号：
您将获得 10% 的交易手续费折扣，并在发送您的 UID 后，可额外获得一个月的免费订阅。

* 点击注册：https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=zh-TC&ref=GRO_28502_CA8R1

## 1. 正式生产环境 (实盘币安 API 密钥)

这些是用于现货和合约账户实盘交易的真实 API 密钥。

### 步骤：

1. 前往 https://www.binance.com 并登录。
2. 确保：
    - 已启用双重身份验证 (2FA，如 Google 验证器 / 短信)。
    - 已完成身份认证 (KYC)。
3. 点击右上角个人资料图标 → **API 管理**。

![Binance API 管理入口](/images/exchanges/binance-api-management.png)

4. 点击 **创建 API**。

![Binance 创建 API 按钮](/images/exchanges/binance-create-api.png)
5. 输入标签名称 (例如：`prod-spot`、`prod-futures`)。
6. 完成安全验证。
7. 保存 **API Key** 和 **Secret** (Secret 仅显示一次)。

![Binance API Key 和 Secret](/images/exchanges/binance-api-key-secret.png)

8. 设置权限：
    - 根据需要勾选“启用现货及杠杆交易”。
    - 根据需要勾选“启用合约”。
    - 设置 IP 白名单 (强烈建议)。

![Binance API 权限设置](/images/exchanges/binance-api-permissions.png)

### 添加到 NexusQuant

1. 前往 NexusQuant **交易所** 页面
2. 点击 **添加交易所**，选择 **Binance**
3. 粘贴 API Key 和 Secret
4. 点击 **保存**
5. 点击 `⟳` 测试连接 — 建议延迟低于 150ms

![NexusQuant 添加 Binance](/images/exchanges/nexusquant-add-binance.png)

------------------------------------------------------------------------

## 2. 现货模拟交易 API 密钥

币安模拟交易使用虚拟资金模拟现货交易。

### 步骤：

1. 登录币安模拟环境 (https://demo.binance.com)。
2. 进入 **模拟交易** 模式 (通过网页或 App)。
3. 在模拟交易界面中前往 **API 管理**。
4. 点击 **创建 API**。
5. 命名 (例如：`demo-spot`)。
6. 完成 2FA 验证。
7. 保存 API Key 和 Secret。

------------------------------------------------------------------------

## 3. 合约模拟交易 API 密钥

合约模拟交易提供 USDⓈ-M 和 COIN-M 合约交易模拟。

### 步骤：

1. 登录币安模拟交易 (https://www.binance.com)。
2. 切换至 **合约模拟交易**。
3. 前往 **API 管理**。
4. 点击 **创建 API**。
5. 命名 (例如：`demo-futures`)。
6. 完成验证。
7. 保存 API Key 和 Secret。

------------------------------------------------------------------------

## 注意事项与最佳实践

- 正式密钥涉及真实资金交易 —— 请妥善保管。
- 模拟密钥仅适用于模拟交易环境。
- 切勿在代码仓库中泄露 API Secret。

::: warning 警告
请勿为 API 密钥开启“提现”权限。
:::