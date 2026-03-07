# Alpaca 設置

設置 Alpaca API 的說明。

## 推薦碼

如果您是 Alpaca 的新使用者，使用我的推薦碼註冊帳戶。
您將獲得交易手續費折扣。

* 點擊註冊: {{REFERRAL_LINK}}

## 生產環境

Alpaca 是一個免佣金的股票和加密貨幣交易 API。

### 步驟：

1.  前往 https://alpaca.markets 並登入。
2.  確保：
    -   已啟用 2FA
    -   身份驗證已完成
3.  前往 **API** → **Paper Trading** 或 **Live Trading**
4.  點擊 **Create New Key**
5.  輸入標籤（例如 `prod`）
6.  儲存 **API Key** 和 **Secret Key**
7.  根據需要設定權限

------------------------------------------------------------------------

## 注意事項與最佳實踐

-   生產金鑰交易真實資金 --- 請妥善保管。
-   Paper trading 金鑰可用於測試，無需承擔真實風險。
-   切勿在程式碼儲存庫中暴露 API 金鑰。
-   Alpaca 提供 Paper（模擬盤）和 Live 交易。

::: warning
請勿為 API 金鑰啟用提現權限。
:::
