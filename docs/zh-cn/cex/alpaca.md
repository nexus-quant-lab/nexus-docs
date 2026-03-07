# Alpaca 设置

设置 Alpaca API 的说明。

## 推荐码

如果您是 Alpaca 的新用户，使用我的推荐码注册账户。
您将获得交易手续费折扣。

* 点击注册: {{REFERRAL_LINK}}

## 生产环境

Alpaca 是一个免佣金的股票和加密货币交易 API。

### 步骤：

1.  前往 https://alpaca.markets 并登录。
2.  确保：
    -   已启用 2FA
    -   身份验证已完成
3.  前往 **API** → **Paper Trading** 或 **Live Trading**
4.  点击 **Create New Key**
5.  输入标签（例如 `prod`）
6.  保存 **API Key** 和 **Secret Key**
7.  根据需要设置权限

------------------------------------------------------------------------

## 注意事项与最佳实践

-   生产密钥交易真实资金 --- 请妥善保管。
-   Paper trading 密钥可用于测试，无需承担真实风险。
-   切勿在代码仓库中暴露 API 密钥。
-   Alpaca 提供 Paper（模拟盘）和 Live 交易。

::: warning
请勿为 API 密钥启用提现权限。
:::
