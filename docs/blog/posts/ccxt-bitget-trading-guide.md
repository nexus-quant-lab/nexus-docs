---
title: CCXT Bitget Trading Guide — Spot, Margin & Swap
description: A practical guide to placing orders on Bitget using ccxt, covering demo accounts, swap one-way mode, and spot/margin differences.
date: 2025-01-01
tags:
  - ccxt
  - bitget
  - python
  - trading
  - crypto
---

# CCXT Bitget Trading Guide — Spot, Margin & Swap

A battle-tested reference for connecting to Bitget via `ccxt` in Python — covering demo (simulated) accounts, swap/futures order placement in one-way mode, and the key differences between spot, margin, and swap trading.

---

## 1. Connecting to the Bitget Demo (Simulated) Account

Bitget's demo environment is **not** a standard sandbox. It uses separate API keys and requires an explicit flag in ccxt options.

```python
import ccxt

exchange = ccxt.bitget({
    'apiKey': 'YOUR_DEMO_API_KEY',   # must be from the demo account
    'secret': 'YOUR_SECRET',
    'password': 'YOUR_PASSPHRASE',   # Bitget always requires a passphrase
    'options': {
        'defaultType': 'swap',       # or 'spot'
        'broker': 'simulate',        # ← routes requests to the demo environment
    },
})
```

::: warning Common Error: `40099 exchange environment is incorrect`
This means your API key belongs to one environment (demo or live) but the request is being routed to the other. Always generate API keys **from within** the simulated trading interface.
:::

---

## 2. Placing Swap (Futures) Orders — One-Way Mode

### The Core Problem

When `hedged` is `None` or unconfigured, ccxt defaults to sending `positionSide: 'long'/'short'` — which Bitget **rejects** for one-way (unilateral) accounts with error:

> `40774: The order type for unilateral position must also be the unilateral position type.`

### The Fix: Use `tradeSide`

Bitget's API V2 one-way mode uses `tradeSide: open/close` instead of `positionSide`.

```python
exchange = ccxt.bitget({
    'apiKey': 'KEY', 'secret': 'SECRET', 'password': 'PASS',
    'options': {
        'defaultType': 'swap',
        'hedged': False,         # ← explicitly declare one-way mode
        'broker': 'simulate',    # if using demo
    },
})

exchange.load_markets()

# One-time account setup
exchange.set_position_mode(False, 'BTC/USDT:USDT')   # one-way mode
exchange.set_margin_mode('cross', 'BTC/USDT:USDT')
exchange.set_leverage(10, 'BTC/USDT:USDT')
```

### Order Placement Cheat Sheet

| Intent | `side` | `tradeSide` |
|---|---|---|
| Open Long | `buy` | `open` |
| Open Short | `sell` | `open` |
| Close Long | `sell` | `close` |
| Close Short | `buy` | `close` |

```python
# Open Long
exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.002, 66990.2,
    params={'tradeSide': 'open', 'marginMode': 'cross'})

# Open Short
exchange.create_order('BTC/USDT:USDT', 'limit', 'sell', 0.002, 66990.2,
    params={'tradeSide': 'open', 'marginMode': 'cross'})

# Close Long
exchange.create_order('BTC/USDT:USDT', 'limit', 'sell', 0.002, 66990.2,
    params={'tradeSide': 'close', 'marginMode': 'cross', 'reduceOnly': True})

# Close Short
exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.002, 66990.2,
    params={'tradeSide': 'close', 'marginMode': 'cross', 'reduceOnly': True})
```

### Checking Position Mode Programmatically

```python
mode = exchange.fetch_position_mode(symbol='BTC/USDT:USDT')
is_hedged = mode['hedged']

exchange.options['hedged'] = is_hedged
print(f"Account is in {'hedge' if is_hedged else 'one-way'} mode")
```

---

## 3. Spot vs Margin vs Swap — Full Comparison

### Exchange Initialization

```python
# Spot
spot = ccxt.bitget({..., 'options': {'defaultType': 'spot'}})

# Margin (cross or isolated) — still uses defaultType: 'spot'
margin = ccxt.bitget({..., 'options': {'defaultType': 'spot'}})

# Swap
swap = ccxt.bitget({..., 'options': {'defaultType': 'swap', 'hedged': False}})
```

::: tip Symbol Format Matters
- Spot & Margin: `'BTC/USDT'`
- Swap / Futures: `'BTC/USDT:USDT'` ← the `:USDT` suffix is required
:::

### `create_order()` Parameters

```python
# ── SPOT ──────────────────────────────────────────────────────
# No extra params needed
exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 66000)

# ── MARGIN CROSS ──────────────────────────────────────────────
# marginMode in params is what routes the call to the margin API
exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 66000,
    params={
        'marginMode': 'cross',
        'loanType': 'auto_borrow',   # auto_borrow | auto_repay | normal
    })

# ── MARGIN ISOLATED ───────────────────────────────────────────
exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 66000,
    params={
        'marginMode': 'isolated',
        'loanType': 'auto_borrow',
    })

# ── SWAP (one-way) ────────────────────────────────────────────
exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.002, 66000,
    params={
        'marginMode': 'cross',
        'tradeSide': 'open',
    })
```

### Pre-Order Setup Requirements

| Market | `set_position_mode` | `set_margin_mode` | `set_leverage` |
|---|---|---|---|
| Spot | ✗ | ✗ | ✗ |
| Margin | ✗ | ✗ | ✓ (with `marginMode` param) |
| Swap | ✓ | ✓ | ✓ |

```python
# Margin — leverage only
exchange.set_leverage(5, 'BTC/USDT', params={'marginMode': 'cross'})

# Swap — full setup
exchange.set_position_mode(False, 'BTC/USDT:USDT')
exchange.set_margin_mode('cross', 'BTC/USDT:USDT')
exchange.set_leverage(10, 'BTC/USDT:USDT')
```

### Fetching Balances

```python
exchange.fetch_balance()                                              # spot
exchange.fetch_balance(params={'marginMode': 'cross'})               # margin cross
exchange.fetch_balance(params={'marginMode': 'isolated',             # margin isolated
                               'symbol': 'BTC/USDT'})
exchange.fetch_balance(params={'type': 'swap'})                      # swap
```

---

## 4. Debugging Tips

**Enable verbose mode** to inspect the raw request/response and verify exactly what params ccxt is sending:

```python
exchange.verbose = True
order = exchange.create_order(...)
exchange.verbose = False
```

**Always upgrade ccxt** — Bitget V2 support and demo account handling have improved significantly in recent versions:

```bash
pip install ccxt --upgrade
```

---

## 5. Quick Reference: `loanType` for Margin

| Value | Behaviour |
|---|---|
| `normal` | No automatic borrowing or repayment |
| `auto_borrow` | Borrow automatically when funds are insufficient |
| `auto_repay` | Repay automatically after the position is closed |

---

## Summary

The three most common pitfalls with Bitget + ccxt are:

1. **Demo account error `40099`** — use `broker: 'simulate'` in options and ensure your API keys were generated inside the demo interface.
2. **Swap error `40774` (unilateral position type)** — set `hedged: False` and pass `tradeSide: 'open'/'close'` in order params instead of relying on `positionSide`.
3. **Margin orders going to spot** — always pass `marginMode: 'cross'/'isolated'` in the order params; this is what ccxt uses to route to the margin API endpoint.
