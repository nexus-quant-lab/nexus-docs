-----

title: 用 Python 监控 Hyperliquid 巨鲸 + 市场信号，Telegram 实时推送
description: 从零构建一个 Hyperliquid 链上监控系统，覆盖巨鲸大额交易、强平清算、资金费率极端、OI 暴增四大信号，并通过 Telegram Bot 实时推送警报。
date: 2025-03-01
author: Claude × Hyperliquid
tags:

- Hyperliquid
- Python
- WebSocket
- DeFi
- Trading
- Telegram Bot
- On-chain Analytics
  head:
- - meta
  - name: og:title
    content: 用 Python 监控 Hyperliquid 巨鲸 + 市场信号
- - meta
  - name: og:description
    content: 覆盖巨鲸交易、强平清算、资金费率极端、OI 暴增，四大信号 + 多信号共振，Telegram 实时推送。

-----

# 用 Python 监控 Hyperliquid 巨鲸 + 市场信号，Telegram 实时推送

> 本文记录了一次完整的 AI 辅助开发过程：从需求出发，逐步构建一个生产级别的链上监控系统。

[[toc]]

-----

## 背景与需求

Hyperliquid 是目前链上衍生品交易量最大的去中心化永续合约交易所。巨鲸的大额交易往往是市场方向的先行指标。我们的目标是：

**当 Hyperliquid 上单笔交易超过 $1,000,000 时，通过 Telegram 实时推送警报。**

随着需求深入，最终扩展为四大信号的综合监控系统。

-----

## 技术选型

### 为什么用 `websockets` 而不是 `aiohttp` 做 WebSocket？

这是开发中遇到的第一个架构问题。

|                  |`websockets`  |`aiohttp`|
|------------------|--------------|---------|
|**WebSocket 质量**  |⭐⭐⭐⭐⭐ 专为 WS 设计|⭐⭐⭐ 附属功能 |
|**HTTP 请求**       |❌ 不支持         |✅ 支持     |
|**Ping/Keepalive**|内置，可精细配置      |需手动处理    |
|**WS 专属异常**       |丰富的类型         |较为泛化     |
|**性能**            |更轻量           |稍重       |

**结论：两者各司其职，不需要二选一。**

```
websockets  →  Hyperliquid WS 数据流（专用，ping/close 控制更精细）
aiohttp     →  Telegram HTTP 调用（ClientSession 复用，连接池支持）
```

`aiohttp.ClientSession` 以单例模式复用，避免每次发送 Telegram 消息都创建新连接的开销。

-----

## 如何找到已知巨鲸地址？

在写代码之前，需要先收集监控目标。以下是最实用的几个来源：

### Hyperliquid 原生资源

- **Hyperliquid 排行榜** — [app.hyperliquid.xyz/leaderboard](https://app.hyperliquid.xyz/leaderboard)  
  按 PnL 或交易量排序，点击地址可查看历史。
- **Hypurrscan** — [hypurrscan.io](https://hypurrscan.io)  
  Hyperliquid 专用区块浏览器，实时展示大额交易和巨鲸动态。
- **HyperDash** — [hyperdash.info](https://hyperdash.info)  
  分析仪表盘，含排行榜和顶级钱包追踪。

### 链上分析平台

- **Nansen** — 标注 “Smart Money”、“Whale” 等钱包标签，已覆盖 Hyperliquid。
- **Arkham Intelligence** — 识别并标注链上钱包，包含 Hyperliquid 交易者。
- **Dune Analytics** — 社区构建的 Hyperliquid 巨鲸追踪仪表盘。

### Twitter / X（最实用）

搜索关键词：`hyperliquid whale`、`hyperliquid big trade`、`$HYPE whale`  
关注账号：**@lookonchain**、**@OnchainLens**

### 小技巧

将 `WHALE_ADDRESSES` 留空，监控**所有地址**的大额交易，反而是发现新巨鲸的好方法。

-----

## 系统架构

整个系统通过**单个 WebSocket 连接**订阅 Hyperliquid 的多个频道，实现四大信号的并发监控：

```
Hyperliquid WSS
      │
      ├── trades              → 🐋 巨鲸交易检测
      ├── liquidations        → 💥 大额强平检测
      ├── activeFundingRates  → 📈 资金费率极端
      └── activeAssetCtx      → 📊 OI 暴增检测
                                      │
                                信号聚合 + 共振检测
                                      │
                                Telegram Bot 推送
```

-----

## 四大监控信号

### 信号一：🐋 巨鲸大额交易

**触发条件：** 单笔交易金额 > $1,000,000（可配置）

**原理：** 通过订阅 `trades` 频道，实时计算每笔交易的 USD 价值（数量 × 价格）。对已知地址显示名称标签，未知地址显示缩写。

**警报示例：**

```
🐋🌟 巨鲸交易 / Whale Trade
━━━━━━━━━━━━━━━━━━
📌 代币: BTC
📊 方向: 🟢 买入 BUY
💰 价值: $2,345,678.00
📦 数量: 23.4568 BTC
💵 价格: $99,999.99
👤 地址: 🏷️ James Wynn
         0x1d45e0a13...
🕐 时间: 2025-03-01 10:30:00 UTC
🔗 查看地址
```

### 信号二：💥 大额强平清算

**触发条件：** 单笔清算金额 > $500,000（可配置）

**原理：** 订阅 `liquidations` 频道。大额清算往往引发连锁反应，是方向性信号。

**警报示例：**

```
💥 大额强平 / Large Liquidation
━━━━━━━━━━━━━━━━━━
📌 代币: ETH
📊 被清仓: 🟢 多单 LONG
💰 价值: $1,230,000.00
💵 价格: $3,450.00
🕐 时间: 2025-03-01 10:31:00 UTC
```

### 信号三：📈 资金费率极端

**触发条件：**

- 资金费率 > **+0.10%** / 8h（多头严重拥挤）
- 资金费率 < **-0.05%** / 8h（空头严重拥挤）

**原理：** 费率极端代表仓位严重偏向一侧，往往是均值回归的前兆。当费率从正常水平越过阈值时触发（避免重复推送）。

**信号含义：**

- 高正费率 → 多头过热，注意回调
- 深度负费率 → 空头过拥，警惕空头回踩

### 信号四：📊 持仓量（OI）暴增

**触发条件：** 1小时内 OI 变化幅度 > **15%**（可配置）

**原理：** OI 快速增加意味着新资金大量涌入，是方向性确认信号。OI 快速下降则可能是清算潮或主动减仓。

-----

## 核心特性：🔥 多信号共振

**这是系统最有价值的功能。**

当同一个币对在 **5 分钟内**触发 2 个以上信号时，每条警报末尾自动追加共振提示：

```
🔥 多信号共振 HIGH CONVICTION!
   🐋 巨鲸买卖 + 💥 大额清算 + 📈 费率极端
```

**逻辑：**

- 巨鲸买 $2M BTC
- 同时 BTC 资金费率变为深度负值
- 同时 BTC OI 暴增 20%

三个信号叠加 = **高置信度方向信号**，远比单一信号可靠。

-----

## 已知地址名称簿

代码内置了可扩展的地址名称映射，支持三种方式添加：

### 方式一：直接编辑代码

```python
WHALE_NAMES: dict[str, str] = {
    "0x1d45e0a13d7b25e95dee3dcf9a36f0c5a75e5e23": "James Wynn",
    "0x28c6c06298d514db089934071355e5743bf21d60": "Binance Hot Wallet",
    "0xa7efae728d369143b7fb408e78b7aaef94e29e30": "Wintermute",
    # 添加你自己的地址
    "0xYOUR_ADDRESS": "Your Label",
}
```

### 方式二：环境变量（无需改代码）

```bash
CUSTOM_WHALE_NAMES=0xabc123:Alice the Whale,0xdef456:Bob Trader
```

### 显示效果对比

**已知地址：**

```
👤 地址: 🏷️ James Wynn
         0x1d45e0a13d7b25...
```

**未知地址：**

```
👤 地址: 0x1d45...e23
```

-----

## 快速开始

### 1. 安装依赖

```bash
pip install websockets aiohttp python-dotenv
```

### 2. 配置 `.env`

```bash
cp .env.example .env
```

编辑 `.env`：

```dotenv
# Telegram（必填）
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_CHAT_ID=123456789

# 信号阈值（可选，以下为默认值）
ALERT_THRESHOLD_USD=1000000       # 巨鲸交易阈值
LIQUIDATION_THRESHOLD_USD=500000  # 强平清算阈值
FUNDING_RATE_HIGH=0.001           # 资金费率上限 (+0.10%/8h)
FUNDING_RATE_LOW=-0.0005          # 资金费率下限 (-0.05%/8h)
OI_SPIKE_PCT=15                   # OI 暴增阈值 (%)
OI_CHECK_WINDOW_SEC=3600          # OI 统计窗口 (秒)

# 地址过滤（留空 = 监控所有地址）
WHALE_ADDRESSES=0xabc...,0xdef...

# 自定义名称
CUSTOM_WHALE_NAMES=0xabc:Alice,0xdef:Bob
```

**获取 Telegram Bot Token：**

1. 打开 Telegram，搜索 `@BotFather`
1. 发送 `/newbot`，完成创建，复制 Token

**获取 Chat ID：**

- 个人：搜索 `@userinfobot`，发送 `/start`
- 群组：加入群组后访问 `https://api.telegram.org/bot<TOKEN>/getUpdates`

### 3. 运行

```bash
python hyperliquid_whale_monitor.py
```

启动后会发送一条 Telegram 确认消息：

```
🚀 Hyperliquid 监控已启动 / Monitor Started
━━━━━━━━━━━━━━━━━━
🐋 巨鲸交易阈值: $1,000,000
💥 清算警报阈值: $500,000
📈 资金费率警报: >0.10% 或 <-0.05%
📊 OI 暴增阈值:  15% / 60min
🎯 监控范围: 全部地址  |  🪙 20 币对
```

-----

## 完整代码

```python
"""
Hyperliquid 巨鲸 + 市场变化监控器
监控信号:
  🐋 巨鲸大额交易  (单笔 > $1,000,000)
  💥 大额强平清算  (单笔 > $500,000)
  📈 资金费率极端  (> +0.10% 或 < -0.05% per 8h)
  📊 持仓量暴增    (1小时内 OI 增幅 > 15%)
  🔥 多信号共振    (多个信号同时触发)
"""

import asyncio, json, logging, os, time
from collections import defaultdict, deque
from datetime import datetime
import aiohttp, websockets
from dotenv import load_dotenv

load_dotenv()

# ── 配置 ──────────────────────────────────────
TELEGRAM_BOT_TOKEN        = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID          = os.getenv("TELEGRAM_CHAT_ID")
HYPERLIQUID_WS_URL        = "wss://api.hyperliquid.xyz/ws"
WHALE_TRADE_THRESHOLD_USD = float(os.getenv("ALERT_THRESHOLD_USD",      "1000000"))
LIQUIDATION_THRESHOLD_USD = float(os.getenv("LIQUIDATION_THRESHOLD_USD", "500000"))
FUNDING_RATE_HIGH         = float(os.getenv("FUNDING_RATE_HIGH",         "0.001"))
FUNDING_RATE_LOW          = float(os.getenv("FUNDING_RATE_LOW",         "-0.0005"))
OI_SPIKE_PCT              = float(os.getenv("OI_SPIKE_PCT",             "15.0"))
OI_CHECK_WINDOW_SEC       = int(os.getenv("OI_CHECK_WINDOW_SEC",        "3600"))
WHALE_ADDRESSES           = [a.strip() for a in os.getenv("WHALE_ADDRESSES","").split(",") if a.strip()]
COINS = ["BTC","ETH","SOL","ARB","OP","AVAX","DOGE","WIF","PEPE",
         "BNB","XRP","LINK","UNI","AAVE","SUI","TIA","INJ","SEI","APT","MATIC"]

# ── 地址名称簿 ────────────────────────────────
WHALE_NAMES = {
    "0x1d45e0a13d7b25e95dee3dcf9a36f0c5a75e5e23": "James Wynn",
    "0x28c6c06298d514db089934071355e5743bf21d60": "Binance Hot Wallet",
    "0xa7efae728d369143b7fb408e78b7aaef94e29e30": "Wintermute",
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "Vitalik Buterin",
    # 添加更多...
}

# ── 状态 ──────────────────────────────────────
oi_history     = defaultdict(lambda: deque(maxlen=120))
funding_cache  = {}
recent_signals = defaultdict(lambda: deque(maxlen=20))
sent_alerts    = set()
CONFLUENCE_WIN = 300  # 5 分钟共振窗口
```

> 完整代码请下载本文附带的 `hyperliquid_whale_monitor.py` 文件。

-----

## 监控的 20 个交易对

|类别     |币对                       |
|-------|-------------------------|
|主流     |BTC, ETH, BNB, XRP       |
|Layer 2|ARB, OP, MATIC           |
|Layer 1|SOL, AVAX, SUI, APT, SEI |
|DeFi   |LINK, UNI, AAVE, INJ, TIA|
|Meme   |DOGE, WIF, PEPE          |

如需添加更多币对，修改代码中的 `COINS` 列表即可。

-----

## 注意事项与扩展方向

### 防重复机制

每条警报有唯一 ID，系统缓存最近 2000 条已发送警报，避免同一事件重复推送。

### 资金费率防刷机制

只在费率**穿越阈值那一刻**触发（从正常变为极端），而不是每次收到更新都推送。

### 进一步扩展

- **Order Book 监控**：订阅 `l2Book` 频道，检测巨型挂单的出现和消失
- **Fear & Greed Index**：集成 [alternative.me API](https://alternative.me/crypto/fear-and-greed-index/)，极值时推送
- **交易所净流入**：通过 CryptoQuant API 监控大额存款到 CEX（往往预示抛售）
- **价差监控**：当永续合约价格偏离指数价格 > 0.3% 时，意味着短期均值回归机会

-----

## 总结

|信号     |含义    |操作参考   |
|-------|------|-------|
|🐋 巨鲸大买 |聪明钱看多 |关注多头机会 |
|🐋 巨鲸大卖 |聪明钱减仓 |注意回调风险 |
|💥 多单清算 |下行动能释放|可能是底部信号|
|💥 空单清算 |上行动能释放|可能是顶部信号|
|📈 费率极高 |多头拥挤  |警惕多头陷阱 |
|📈 费率极低 |空头拥挤  |警惕空头陷阱 |
|📊 OI 暴增|新资金涌入 |确认突破方向 |
|🔥 多信号共振|高置信度信号|重点关注   |


> **风险提示：** 链上信号仅供参考，不构成投资建议。加密市场波动剧烈，请做好风险管理。

