---
title: 了解市場數據 API
date: 2025-02-13
tags: [程式設計, api]
categories: [程式設計]
description: 學習如何從各交易所獲取和處理市場數據。
---

# 了解市場數據 API

市場數據 API 對於演算法交易至關重要。學習如何有效地獲取和處理數據。

## 什麼是 API？

API（應用程式介面）允許您的程式碼與交易所通訊。

## 常見數據類型

### 報價數據
當前價格和 24 小時統計：
- 最新價格
- 24 小時最高/最低
- 24 小時成交量
- 買入/賣出價格

### 訂單簿
不同價格水準的待處理訂單。

### 交易歷史
最近執行的交易。

### OHLCV 數據
用於圖表的開盤、最高、最低、收盤、成交量數據。

## 使用 CCXT 庫

CCXT 為 100 多個交易所提供統一介面：

```python
import ccxt

# 初始化交易所
binance = ccxt.binance()

# 獲取報價
ticker = binance.fetch_ticker('BTC/USDT')
print(f"BTC 價格: {ticker['last']}")

# 獲取 OHLCV
ohlcv = binance.fetch_ohlcv('BTC/USDT', '1h', limit=100)
```

## 速率限制

大多數交易所限制 API 請求。務必：
- 請求之間實施延遲
- 可能的情況下快取數據
- 使用 Websocket 饋送獲取即時數據

## 數據存儲

用於分析，將數據存儲在：
- **CSV 檔案** - 簡單、可移植
- **Parquet** - 快速、壓縮
- **SQLite** - 可查詢
- **PostgreSQL** - 生產資料庫

## 最佳實踐

1. 始終使用生產 API 進行即時交易
2. 實施適當的錯誤處理
3. 記錄所有 API 回應以進行調試
4. 監控速率限制使用情況
5. 快取經常訪問的數據

::: warning
保持您的 API 金鑰安全。切勿將其提交到版本控制。
:::
