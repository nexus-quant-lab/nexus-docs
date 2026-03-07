# Guide: Spot Margin Trading with CCXT Async

This document covers the implementation of spot leverage (margin) orders, Unified Trading Account (UTA) logic, debt management, and risk ratios across multiple exchanges using Python `ccxt.async_support`.

---

## 1. Key Parameters for CCXT Async Margin
To place a spot margin order, you typically need to specify three things in your params dictionary:

* `marginMode`: Set this to 'cross' or 'isolated'.

* `type`: While you use a spot symbol (e.g., BTC/USDT), some exchanges require the order type to be explicitly set to 'margin' or for you to use a specific margin-enabled endpoint.

* `leverage`: The multiplier (e.g., 3). Note that for some exchanges, you must call set_leverage() **before** placing the order, while others allow it within the create_order params.

### Implementation Example (Async)

```python
import asyncio
import ccxt.async_support as ccxt

async def place_margin_order():
    exchange = ccxt.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'options': {'defaultType': 'spot'} # Ensure we are in spot context
    })

    symbol = 'BTC/USDT'
    side = 'buy'
    amount = 0.01
    
    params = {
        'marginMode': 'isolated', # or 'cross'
        'leverage': 3,
    }

    try:
        # 1. Set leverage first (required by some exchanges like Binance/Bybit)
        await exchange.set_leverage(3, symbol, params)
        
        # 2. Place the order
        order = await exchange.create_market_order(symbol, side, amount, params)
        print(f"Order Successful: {order['id']}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await exchange.close()

asyncio.run(place_margin_order())
```

## 2. What else is required?

Beyond the parameters, there are structural requirements you cannot ignore:

* Account Transfer: You must manually transfer funds from your "Spot" wallet to your "Margin" (Cross or Isolated) wallet before the order will execute. Use exchange.transfer().

* Borrowing Logic: Some exchanges require you to borrow the funds before the trade, while others (like Binance) offer a "borrow-on-the-fly" feature if you add {'sideEffect': 'MARGIN_BUY'} to your params.

* Base vs. Quote: Remember that when you go "short" on spot margin, you are actually borrowing the Base asset (e.g., BTC) and selling it for the Quote (e.g., USDT).

## 3. Managing Leverage Risk

Leverage is a "double-edged sword" that amplifies both gains and losses. Here is how to manage it programmatically:

| Strategy               | CCXT Implementation                                                                 |
|------------------------|--------------------------------------------------------------------------------------|
| Position Sizing        | Never risk more than 1–2% of your total equity on a single trade. Calculate `amount` based on your stop-loss distance. |
| Automated Stop-Loss    | Always place a `STOP_LOSS_LIMIT` order immediately after your entry order.         |
| Liquidation Monitoring | Regularly fetch `fetch_balance()` and check the `health factor` or `liquidation price` returned in the exchange-specific `info`. |
| De-leveraging          | Use lower leverage (e.g., 2x or 3x) for spot margin. 10x+ is extremely dangerous in volatile crypto markets. |


## 1. Placing Margin Orders (Universal Function)

When using a **Unified Trading Account (UTA)** — offered by exchanges like `Bybit`, `OKX`, and `Binance` — you generally do not need to manually transfer funds between spot and margin wallets. The system treats your total collateral as a single pool to back your leveraged positions.

However, CCXT's implementation of "Spot Margin" is not perfectly unified across all exchanges. Each requires slightly different params or method calls to trigger the borrowing mechanism.

To place a margin order, you must handle exchange-specific flags (e.g., `sideEffect` for Binance, `marginMode` for OKX/Bybit). In UTA accounts, manual transfers are usually unnecessary.

### The `place_margin_order` Implementation

```python
import asyncio
import ccxt.async_support as ccxt

class TradingBot:
    def __init__(self, exchange_id, api_key, secret):
        self.exchange_id = exchange_id
        # Initialize exchange with common options
        self.exchange = getattr(ccxt, exchange_id)({
            'apiKey': api_key,
            'secret': secret,
            'enableRateLimit': True,
        })

    async def place_margin_order(self, symbol, side, amount, leverage=3, margin_mode='cross'):
        """
        Universal wrapper for placing spot margin orders.
        """
        params = {}
        
        # 1. Exchange-Specific Parameter Mapping
        if self.exchange_id == 'binance':
            # Binance uses 'isIsolated' and 'sideEffect'
            params['isIsolated'] = 'TRUE' if margin_mode == 'isolated' else 'FALSE'
            params['sideEffect'] = 'MARGIN_BUY' if side == 'buy' else 'AUTO_BORROW_REPAY'
            
        elif self.exchange_id in ['bybit', 'okx']:
            # UTA accounts: marginMode is the primary trigger
            params['marginMode'] = margin_mode 
            params['leverage'] = leverage # OKX/Bybit UTA allow leverage in order params
            
        elif self.exchange_id == 'bitget':
            params['marginMode'] = margin_mode
            
        elif self.exchange_id == 'gateio':
            # Gate.io uses 'account' type to differentiate
            params['account'] = 'cross_margin' if margin_mode == 'cross' else 'isolated_margin'
            
        elif self.exchange_id == 'bitfinex':
            # Bitfinex uses a specific order type string
            type = 'market' # or 'limit'
            order_type = f'margin {type}'
            return await self.exchange.create_order(symbol, order_type, side, amount, None, params)

        elif self.exchange_id in ['kucoin', 'htx', 'mexc']:
            # These usually require setting a 'type' or 'method' in params
            params['type'] = 'margin'

        # 2. Pre-order Leverage Setup (Required for some exchanges)
        try:
            if hasattr(self.exchange, 'set_leverage'):
                await self.exchange.set_leverage(leverage, symbol, {'marginMode': margin_mode})
        except Exception as e:
            print(f"Leverage setup skipped or failed for {self.exchange_id}: {e}")

        # 3. Execute the Order
        try:
            order = await self.exchange.create_market_order(symbol, side, amount, params)
            print(f"[{self.exchange_id}] Margin order placed: {order['id']}")
            return order
        except Exception as e:
            print(f"[{self.exchange_id}] Order failed: {e}")
            raise

    async def close(self):
        await self.exchange.close()
```

---

## Key Differences in UTA vs. Standard

1. **Collateral Pool**: In UTA, your USDC/USDT/BTC balance is often automatically converted to a "USD Value" to support your margin. You don't call `transfer()`, but you must ensure **Cross Margin** is enabled in the exchange's web UI first.

2. **Auto-Borrow**: Most UTA exchanges (Bybit/OKX) use **Auto-Borrow**. If you buy $1000 of BTC but only have $500, the system creates a debt of $500 automatically.

3. **The "Settlement" Asset**: Even in UTA, if you are trading BTC/USDT, you usually need either BTC or USDT in the account to act as collateral.

## Managing Leverage Risk (The Health Factor)

In a margin account, your "Risk" is defined by your **Margin Ratio**. If this ratio hits the maintenance level, the exchange will liquidate your assets.

* **Logic**: `Risk = (Total Debt + Maintenance Margin) / Total Equity`.

* **Safety Buffer**: Keep your "Account Health" or "Margin Ratio" at least 2x away from the liquidation threshold.

* **Automatic Repay**: If your code sells a leveraged position, ensure you check if the exchange requires a specific parameter (like Binance's `AUTO_REPAY`) to clear the debt immediately, otherwise, you will continue to accrue interest on the borrowed funds even after the trade is closed.

## Updated TradingBot with Repay Logic and Debt Checking

Adding a debt-check and auto-repay functionality is critical because, in spot margin, **closing a position does not always clear the loan**. If you don't repay, you will continue to accrue hourly interest even if you have no active trade.

In Unified Trading Accounts (UTA) like Bybit or OKX, "repay" often happens automatically when you trade back into the borrowed asset, but for others (Binance, KuCoin), you must explicitly flag the order.

### Implementation

```python
import asyncio
import ccxt.async_support as ccxt

class TradingBot:
    def __init__(self, exchange_id, api_key, secret):
        self.exchange_id = exchange_id
        self.exchange = getattr(ccxt, exchange_id)({
            'apiKey': api_key,
            'secret': secret,
            'enableRateLimit': True,
            'options': {'defaultType': 'spot'} 
        })

    async def place_margin_order(self, symbol, side, amount, leverage=3, margin_mode='cross', repay=False):
        """
        Universal wrapper with 'AUTO_REPAY' logic.
        :param repay: If True, uses the exchange's mechanism to clear debt on sale/buyback.
        """
        params = {}
        
        # --- Exchange Specific Flags ---
        if self.exchange_id == 'binance':
            params['isIsolated'] = 'TRUE' if margin_mode == 'isolated' else 'FALSE'
            # 'MARGIN_BUY' to borrow, 'AUTO_REPAY' to close debt
            params['sideEffect'] = 'AUTO_REPAY' if repay else 'MARGIN_BUY'
            
        elif self.exchange_id in ['bybit', 'okx']:
            params['marginMode'] = margin_mode 
            # UTA handles repay automatically if you reduce the position/debt
            
        elif self.exchange_id == 'kucoin':
            # Kucoin requires 'auto_borrow' or 'auto_repay'
            params['marginModel'] = margin_mode
            params['autoRepay'] = 'true' if repay else 'false'

        elif self.exchange_id == 'bitget':
            params['marginMode'] = margin_mode

        # --- Pre-order Leverage Setup ---
        try:
            if hasattr(self.exchange, 'set_leverage'):
                await self.exchange.set_leverage(leverage, symbol, {'marginMode': margin_mode})
        except Exception as e:
            print(f"Leverage config info: {e}")

        # --- Execute Order ---
        try:
            return await self.exchange.create_market_order(symbol, side, amount, params)
        except Exception as e:
            print(f"Order failed: {e}")
            raise

    async def check_margin_debt(self, symbol=None):
        """
        Fetches current debt levels to monitor liquidation risk.
        """
        try:
            # Most CCXT exchanges return 'used' or 'info' fields containing debt
            balance = await self.exchange.fetch_balance({'type': 'margin'})
            
            debt_report = {}
            # Filter for assets where 'borrowed' or 'debt' > 0
            if 'info' in balance:
                # This part is highly exchange-specific in CCXT
                print(f"--- {self.exchange_id.upper()} DEBT REPORT ---")
                for asset, data in balance['total'].items():
                    free = balance['free'].get(asset, 0)
                    total = balance['total'].get(asset, 0)
                    debt = total - free # Simplistic debt calculation
                    if debt > 0:
                        debt_report[asset] = debt
                        print(f"Asset: {asset} | Debt: {debt}")
            
            return debt_report
        except Exception as e:
            print(f"Could not fetch debt: {e}")
            return None

    async def close(self):
        await self.exchange.close()
```

## Understanding the "Debt Loop"

When you trade with leverage, you are effectively entering a cycle of Borrowing → Trading → Repaying. If your code misses the "Repay" step, your profits will slowly be eaten by interest rates.

### How to Monitor Risk (The "Health Factor")
To manage risk effectively, you should monitor your **Margin Ratio** (or Risk Ratio).

* Safe Zone: Risk Ratio < 60%.
* Warning Zone: Risk Ratio 60%–80%.
* Liquidation Zone: Risk Ratio > 90% (Exchange starts closing your positions).

### Managing Risk Programmatically

1. **Dynamic Stop-Loss**: In margin trading, your "Zero" is not $0; it's your Liquidation Price. Your Stop-Loss should always be placed above the liquidation price (for longs) or below it (for shorts).

2. **Equity Check**: Before calling place_margin_order, run a check on your Total Collateral Value. If it has dropped by X% today, your script should "Kill-Switch" and stop opening new leveraged positions.

```
One question about the code: debt = total - free. I thought the open order used amount will also be part of the equation , please explain
```

You are absolutely right to catch that. My previous simplification (Total − Free) is only accurate if you have zero open orders.

In a live trading environment, your funds are generally split into three categories: **Free**, **Used (Locked)**, and **Total**.

## 1. The Real Balance Equation

The relationship between these values is:$$Total = Free + Used$$
* Free: Available to open new positions or withdraw.
* Used (Locked): Capital currently tied up in open limit orders or held as margin for active positions.
* Total: The sum of everything you own in that specific wallet.

The "Debt" factor is a separate liability. On most margin exchanges, "Debt" (or Borrowed) is an amount you owe, which is subtracted from your "Net Equity" to determine if you are at risk of liquidation.

## 2. Calculating Risk: Net Equity vs. Debt

To manage risk, you don't just look at "Used" funds; you look at **Net Equity**.$$Net\ Equity = Total\ Asset\ Value - Total\ Debt$$

If your $Net\ Equity$ drops near your **Maintenance Margin**, you get liquidated. Using "Used" funds in your calculation is important because it tells you how much of your collateral is "stuck" in orders that haven't filled yet.

## 3. Comprehensive Risk & Debt Function

Here is the updated function. It calculates your **Account Health Ratio** (Risk) across those specific exchanges.

### Updated Implementation
```python
async def get_account_health(self):
    """
    Calculates the actual Risk Ratio (Health Factor).
    Risk Ratio = (Total Liability / Total Asset Value) * 100
    """
    try:
        # Fetching margin-specific balance
        balance = await self.exchange.fetch_balance({'type': 'margin'})
        
        # CCXT 'total' is usually Assets. We need to find 'debt' in the 'info'
        total_assets_usd = 0
        total_debt_usd = 0
        
        # Exchange-specific parsing because 'info' varies wildly
        if self.exchange_id == 'binance':
            # Binance provides 'totalAssetOfBTC' and 'totalLiabilityOfBTC'
            total_assets_usd = float(balance['info']['totalAssetOfBTC'])
            total_debt_usd = float(balance['info']['totalLiabilityOfBTC'])
        
        elif self.exchange_id in ['okx', 'bybit']:
            # UTA accounts use 'mgnRatio' or 'equity'
            # OKX: 'mgnRatio' is actually (Equity / Maintenance Margin)
            details = balance['info']['data'][0]['details']
            # Logic here: aggregate debt across all UTA assets
            for asset in details:
                total_debt_usd += float(asset.get('liab', 0))
                total_assets_usd += float(asset.get('eq', 0))

        # Standard Calculation
        if total_assets_usd > 0:
            risk_ratio = (total_debt_usd / total_assets_usd) * 100
        else:
            risk_ratio = 0

        print(f"[{self.exchange_id}] Total Debt: {total_debt_usd} | Risk Ratio: {risk_ratio:.2f}%")
        
        return {
            'risk_ratio': risk_ratio,
            'is_danger': risk_ratio > 80, # Arbitrary threshold for safety
            'debt': total_debt_usd
        }

    except Exception as e:
        print(f"Error calculating health: {e}")
        return None
```

## 4. Summary of Margin Risk Management

When your bot is running, it should follow this logic flow before every trade:

1. Check Health: If risk_ratio > 70%, do not open new margin positions.

2. Check Debt: If debt > 0 and you have no active positions, call a "Repay" function immediately.

3. Check "Used": If Used is high, you have too many "ghost" limit orders open that are eating up your margin capacity.

## Next Step

Since you are using multiple exchanges (Binance, Bybit, OKX, etc.), would you like me to create a **Unified Repay Function** that automatically detects your debt in any currency and pays it off using your "Free" balance?

## Understanding the Balance Equation

In margin trading, your balances are categorized into:
1. Free: Available for new orders.
2. Used (Locked): Tied up in open limit orders or acting as active position margin.
3. Debt (Liability): The amount borrowed from the exchange.

The Risk Formula:$$Net\ Equity = Total\ Assets - Total\ Debt$$$$Risk\ Ratio = \left( \frac{Total\ Debt}{Total\ Assets} \right) \times 100$$

## Monitoring Health Factor

This function calculates the risk ratio to prevent liquidations.

```python
async def get_account_health(self):
        """
        Calculates the Risk Ratio. 
        Higher ratio = Closer to liquidation.
        """
        try:
            balance = await self.exchange.fetch_balance({'type': 'margin'})
            total_assets_usd = 0
            total_debt_usd = 0
            
            # Exchange-specific parsing for 'info'
            if self.exchange_id == 'binance':
                total_assets_usd = float(balance['info']['totalAssetOfBTC'])
                total_debt_usd = float(balance['info']['totalLiabilityOfBTC'])
            
            elif self.exchange_id in ['okx', 'bybit']:
                # Simplified UTA logic (Summing liabilities across sub-assets)
                if 'info' in balance and 'data' in balance['info']:
                    details = balance['info']['data'][0].get('details', [])
                    for asset in details:
                        total_debt_usd += float(asset.get('liab', 0))
                        total_assets_usd += float(asset.get('eq', 0))

            risk_ratio = (total_debt_usd / total_assets_usd * 100) if total_assets_usd > 0 else 0
            return {
                'risk_ratio': risk_ratio,
                'is_danger': risk_ratio > 80, 
                'total_debt': total_debt_usd
            }
        except Exception as e:
            print(f"Health check error: {e}")
            return None
```

## 3. Best Practices for Margin Bots

| Risk Control | Strategy |
| :--- | :--- |
| **Stop-Loss** | Always place a stop-loss higher (for longs) or lower (for shorts) than the **Liquidation Price**. |
| **Auto-Repay** | Use the `repay=True` flag when closing positions to stop interest accrual immediately. |
| **UTA Accounts** | Prefer Unified accounts (Bybit/OKX) to avoid the complexity of manual `transfer()` calls between wallets. |
| **Health Check** | Run `get_account_health()` before every trade. If `risk_ratio > 70%`, halt new entries. |