# Lighter 設置

設置 Lighter 永續 DEX 的說明。

## 推薦碼

如果您是 Lighter 的新使用者，使用我的推薦碼註冊帳戶。
您將獲得交易手續費折扣。

* 點擊註冊: {{REFERRAL_LINK}}

## 生產環境

Lighter 是基於以太坊 Layer 2 (L2) 的 zk-rollup 協議。

### 如何查找 L1_ADDRESS

您的 L1 地址是連接到 Lighter 的以太坊錢包地址。您也可以透過以下方式查找：
1. 從 API 金鑰查找：在 Lighter 建立 API 金鑰時，它會綁定您的錢包地址
2. 從私鑰派生：如果您有私鑰，可以使用以下方式取得地址：
```python
from eth_account import Account
acct = Account.from_key("0xYOUR_PRIVATE_KEY")
print(acct.address)
```

地址以 0x 開頭，共 42 個字元（例如 0x1234...abcd）。

### 如何查找 account_index

取得地址後，查詢：
```
https://mainnet.zklighter.elliot.ai/api/v1/accountsByL1Address?l1_address=YOUR_ADDRESS
```

回應將顯示您的 sub_accounts[].index 值。

### API 金鑰

如果您有帳戶，可以生成 API 金鑰。API 文件可在此處找到。

### 存款

存款以建立帳戶。

## 錢包連接

連接您的錢包並配置 perp DEX 設定。

------------------------------------------------------------------------

## 測試網

Lighter 是基於以太坊 Layer 2 (L2) 的 zk-rollup 協議，其測試網環境主要錨定以太坊生態系統。

### 應該使用哪個鏈？

您應該使用 `Arbitrum One` / `Arbitrum Sepolia`（測試網）。

`Arbitrum Sepolia（Arbitrum 的測試網版本）`

### 在哪裡取得測試 USDC？

由於 Lighter 使用 USDC 作為永續合約的主要保證金，您需要"模擬"或"測試網"USDC。最可靠的來源包括：

- Circle 官方水龍頭：前往 faucet.circle.com，從網路下拉選單中選擇 Ethereum Sepolia，輸入您的錢包地址。您通常每 2 小時可以領取 20 USDC。
- Lighter App Drip：當您將錢包連接到 Lighter 測試網應用時，存款介面通常有一個"水龍頭"或"鑄造"按鈕。

------------------------------------------------------------------------

## 注意事項與最佳實踐

-   DEX 交易涉及智慧合約風險 --- 請確保您了解風險。
-   切勿在程式碼儲存庫中暴露您的私鑰。

::: warning
永續合約交易涉及高風險。請確保您了解風險。
:::
