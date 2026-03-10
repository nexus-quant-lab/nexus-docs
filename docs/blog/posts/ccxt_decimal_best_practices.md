# Decimal Best Practices for CCXT Trading Bots

## Why Use Decimal Instead of Float

Cryptocurrency exchanges require **exact precision** for:

-   price
-   order size
-   fee calculations
-   PnL calculations

Python `float` introduces rounding errors:

``` python
0.1 + 0.2 = 0.30000000000000004
```

In trading bots this can cause:

-   rejected orders
-   wrong position size
-   incorrect PnL
-   precision violations

Therefore **always use `Decimal` for trading math**.

------------------------------------------------------------------------

# Core Design Rule

**Rule #1: Convert everything to Decimal immediately**

Bad:

``` python
price = ticker["last"]
cost = price * amount
```

Good:

``` python
price = D(ticker["last"])
amount = D(order_size)
cost = price * amount
```

------------------------------------------------------------------------

# Safe Decimal Helper

Create a single helper function and use it everywhere.

``` python
from decimal import Decimal, getcontext

getcontext().prec = 28

def D(x):
    if isinstance(x, Decimal):
        return x
    return Decimal(str(x))
```

This protects against:

-   float precision errors
-   repeated Decimal wrapping
-   inconsistent conversions

------------------------------------------------------------------------

# Rule #2: Never Construct Decimal from Float

Bad:

``` python
Decimal(0.1)
```

Good:

``` python
Decimal("0.1")
```

Best:

``` python
D(0.1)
```

------------------------------------------------------------------------

# Rule #3: Convert Exchange Data Immediately

CCXT returns floats and strings.

Always convert right away.

Bad:

``` python
ticker = exchange.fetch_ticker(symbol)
price = ticker["last"]
```

Good:

``` python
ticker = exchange.fetch_ticker(symbol)
price = D(ticker["last"])
```

------------------------------------------------------------------------

# Rule #4: Keep Everything Decimal Internally

Once inside your strategy:

-   balances
-   prices
-   quantities
-   pnl

should **all remain Decimal**.

Bad:

``` python
profit = float(exit_price - entry_price)
```

Good:

``` python
profit = exit_price - entry_price
```

------------------------------------------------------------------------

# Rule #5: Convert to String Only When Sending Orders

Exchanges often expect string precision.

``` python
exchange.create_limit_buy_order(
    symbol,
    str(amount),
    str(price)
)
```

Never convert back to float.

------------------------------------------------------------------------

# Rule #6: Quantize to Exchange Precision

Each market has precision limits.

Example:

``` python
def quantize(value, step):
    return (value // step) * step
```

Example usage:

``` python
amount = quantize(D("0.123456"), D("0.001"))
```

------------------------------------------------------------------------

# Example Trading Flow

``` python
ticker = exchange.fetch_ticker(symbol)

price = D(ticker["last"])
balance = D(account["USDT"]["free"])

order_size = balance * D("0.01")

order_size = quantize(order_size, D("0.001"))

exchange.create_limit_buy_order(
    symbol,
    str(order_size),
    str(price)
)
```

------------------------------------------------------------------------

# Recommended Project Structure

    bot/
    │
    ├── decimal_utils.py
    ├── strategy.py
    ├── exchange.py
    └── main.py

`decimal_utils.py`

``` python
from decimal import Decimal, getcontext

getcontext().prec = 28

def D(x):
    if isinstance(x, Decimal):
        return x
    return Decimal(str(x))
```

------------------------------------------------------------------------

# Summary

Golden rules:

1.  Convert everything using `D()` immediately
2.  Never create Decimal from float
3.  Keep all math in Decimal
4.  Quantize before sending orders
5.  Convert to string only when calling CCXT

Following these rules prevents **95% of precision bugs in trading
bots**.
