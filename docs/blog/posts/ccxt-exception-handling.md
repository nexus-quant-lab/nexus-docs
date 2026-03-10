---
title: Best Practices for Handling CCXT Exceptions in Async Python
description: A comprehensive guide to robust exception handling, retry logic, and circuit breakers when using CCXT in async Python trading systems.
date: 2025-03-07
tags: [python, ccxt, async, trading, exceptions]
---

# Best Practices for Handling CCXT Exceptions in Async Python

When building trading systems with [CCXT](https://github.com/ccxt/ccxt), robust exception handling is critical. Network hiccups, rate limits, and stale order states are facts of life — your code needs to handle them gracefully without disrupting program flow or, worse, creating duplicate orders.

This guide covers the patterns and practices that make the difference between a fragile script and a production-grade trading system.

---

## Exception Classification

The first step is understanding that not all exceptions are equal. They fall into four categories:

| Category | Exceptions | Action |
|---|---|---|
| **Retriable** | `NetworkError`, `ExchangeNotAvailable`, `DDoSProtection`, `RateLimitExceeded` | Retry with backoff |
| **Verify first** | `RequestTimeout` | Check exchange state, then decide |
| **Ignorable** (context-dependent) | `OrderNotFound`, `InvalidOrder` | Log and continue |
| **Fatal** | `AuthenticationError`, `InsufficientFunds`, `BadSymbol` | Raise immediately |

```python
from ccxt.base.errors import (
    AuthenticationError,
    BadSymbol,
    DDoSProtection,
    ExchangeError,
    ExchangeNotAvailable,
    InsufficientFunds,
    InvalidOrder,
    NetworkError,
    OrderNotFound,
    RateLimitExceeded,
    RequestTimeout,
)

RETRIABLE_EXCEPTIONS = (
    NetworkError,
    RequestTimeout,
    ExchangeNotAvailable,
    RateLimitExceeded,
)

FATAL_EXCEPTIONS = (
    AuthenticationError,
    BadSymbol,
    InsufficientFunds,
    InvalidOrder,
)
```

---

## Retry Decorator with Exponential Backoff

Wrap your async CCXT calls with a retry decorator that separates retriable from fatal errors:

```python
import asyncio
import logging
from functools import wraps

logger = logging.getLogger(__name__)

def ccxt_retry(
    max_retries: int = 5,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    backoff_factor: float = 2.0,
):
    """
    Decorator for async CCXT calls with exponential backoff.
    - Retries on RETRIABLE_EXCEPTIONS
    - Raises immediately on FATAL_EXCEPTIONS
    - Raises immediately on unknown ExchangeError (fail fast)
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            delay = base_delay
            last_exception = None

            for attempt in range(1, max_retries + 1):
                try:
                    return await func(*args, **kwargs)

                except FATAL_EXCEPTIONS as e:
                    logger.error(f"[{func.__name__}] Fatal error (no retry): {type(e).__name__}: {e}")
                    raise

                except OrderNotFound as e:
                    # Context-dependent: usually fatal for cancel/fetch,
                    # but may be transient during order propagation
                    logger.warning(f"[{func.__name__}] OrderNotFound: {e}")
                    raise

                except RETRIABLE_EXCEPTIONS as e:
                    last_exception = e
                    logger.warning(
                        f"[{func.__name__}] Retriable error "
                        f"(attempt {attempt}/{max_retries}): {type(e).__name__}: {e}"
                    )
                    if attempt == max_retries:
                        break

                    retry_after = getattr(e, "retry_after", None)
                    wait = retry_after if retry_after else min(delay, max_delay)

                    logger.info(f"[{func.__name__}] Retrying in {wait:.1f}s...")
                    await asyncio.sleep(wait)
                    delay *= backoff_factor

                except ExchangeError as e:
                    logger.error(f"[{func.__name__}] Unexpected ExchangeError: {type(e).__name__}: {e}")
                    raise

            raise last_exception

        return wrapper
    return decorator
```

Usage is clean — no `try/except` boilerplate in your business logic:

```python
@ccxt_retry(max_retries=5, base_delay=1.0, backoff_factor=2.0)
async def fetch_balance(exchange):
    return await exchange.fetch_balance()

@ccxt_retry(max_retries=3, base_delay=0.5)
async def fetch_ticker(exchange, symbol):
    return await exchange.fetch_ticker(symbol)
```

---

## Handling `cancel_order()` Without Disrupting Flow

`OrderNotFound` and `InvalidOrder` are **safe to ignore** in the context of `cancel_order()`. Both confirm the order is already gone — which is exactly what cancellation is trying to achieve.

```
OrderNotFound  → already filled, cancelled, or expired  → treat as success ✅
InvalidOrder   → in a non-cancellable state              → treat as success ✅
```

Use a structured outcome type to keep callers clean:

```python
from enum import Enum
from dataclasses import dataclass

class CancelResult(Enum):
    CANCELLED = "cancelled"
    NOT_FOUND = "not_found"
    INVALID   = "invalid_state"
    FAILED    = "failed"


@dataclass
class CancelOutcome:
    result: CancelResult
    order_id: str
    symbol: str
    raw: dict | None = None
    error: str | None = None

    @property
    def is_done(self) -> bool:
        """True if the order is confirmed gone, regardless of how."""
        return self.result in (
            CancelResult.CANCELLED,
            CancelResult.NOT_FOUND,
            CancelResult.INVALID,
        )


@ccxt_retry(max_retries=5, base_delay=1.0)
async def _cancel_order_raw(exchange, order_id: str, symbol: str) -> dict:
    return await exchange.cancel_order(order_id, symbol)


async def cancel_order_safe(exchange, order_id: str, symbol: str) -> CancelOutcome:
    try:
        raw = await _cancel_order_raw(exchange, order_id, symbol)
        logger.info(f"Cancelled order {order_id} ({symbol})")
        return CancelOutcome(CancelResult.CANCELLED, order_id, symbol, raw=raw)

    except OrderNotFound as e:
        logger.warning(f"Cancel skipped — order not found: {order_id} ({symbol}): {e}")
        return CancelOutcome(CancelResult.NOT_FOUND, order_id, symbol, error=str(e))

    except InvalidOrder as e:
        logger.warning(f"Cancel skipped — invalid order state: {order_id} ({symbol}): {e}")
        return CancelOutcome(CancelResult.INVALID, order_id, symbol, error=str(e))

    except Exception as e:
        logger.error(f"Cancel failed: {order_id} ({symbol}): {type(e).__name__}: {e}")
        return CancelOutcome(CancelResult.FAILED, order_id, symbol, error=str(e))
```

Callers simply check `is_done`:

```python
async def close_position(exchange, order_id: str, symbol: str):
    outcome = await cancel_order_safe(exchange, order_id, symbol)

    if outcome.is_done:
        await do_next_step()
    elif outcome.result == CancelResult.FAILED:
        await alert_or_escalate(outcome)


# Bulk cancel
async def cancel_all(exchange, open_orders: list[dict]):
    outcomes = await asyncio.gather(*[
        cancel_order_safe(exchange, o["id"], o["symbol"])
        for o in open_orders
    ])
    failed = [o for o in outcomes if o.result == CancelResult.FAILED]
    if failed:
        logger.error(f"{len(failed)} orders could not be cancelled")
```

---

## ⚠️ `RequestTimeout` on `create_order()` — The Most Dangerous Case

A timeout does **not** mean the order failed. The request may have reached the exchange and been processed. Blindly retrying `create_order()` after a timeout can result in **duplicate orders**.

Always verify before retrying:

```python
async def create_order_safe(exchange, symbol, order_type, side, amount, price=None):
    try:
        return await exchange.create_order(symbol, order_type, side, amount, price)

    except RequestTimeout:
        logger.critical("Timeout during create_order — checking for ghost order")
        await asyncio.sleep(2)

        open_orders = await exchange.fetch_open_orders(symbol)
        match = next((
            o for o in open_orders
            if o["side"] == side and o["amount"] == amount
        ), None)

        if match:
            logger.warning(f"Ghost order detected: {match['id']} — reusing it")
            return match  # Treat as successful creation

        raise  # Genuinely failed — safe to retry
```

---

## Centralised Exception Classifier

For larger systems, avoid scattering `isinstance` checks. Use a single policy map:

```python
from enum import Enum

class ExceptionSeverity(Enum):
    RETRIABLE = "retriable"
    IGNORABLE = "ignorable"
    FATAL     = "fatal"
    VERIFY    = "verify"


EXCEPTION_POLICY: dict[type, ExceptionSeverity] = {
    NetworkError:         ExceptionSeverity.RETRIABLE,
    ExchangeNotAvailable: ExceptionSeverity.RETRIABLE,
    DDoSProtection:       ExceptionSeverity.RETRIABLE,
    RateLimitExceeded:    ExceptionSeverity.RETRIABLE,
    RequestTimeout:       ExceptionSeverity.VERIFY,
    OrderNotFound:        ExceptionSeverity.IGNORABLE,
    AuthenticationError:  ExceptionSeverity.FATAL,
    InsufficientFunds:    ExceptionSeverity.FATAL,
    BadSymbol:            ExceptionSeverity.FATAL,
    InvalidOrder:         ExceptionSeverity.FATAL,
}

def classify(e: Exception) -> ExceptionSeverity:
    for exc_type, severity in EXCEPTION_POLICY.items():
        if isinstance(e, exc_type):
            return severity
    return ExceptionSeverity.FATAL  # Unknown = fail fast
```

---

## Circuit Breaker for Degraded Exchanges

Prevent your system from hammering an exchange that's clearly struggling:

```python
import time
from dataclasses import dataclass

@dataclass
class CircuitBreaker:
    failure_threshold: int = 5
    recovery_timeout: float = 60.0
    _failures: int = 0
    _opened_at: float | None = None

    @property
    def is_open(self) -> bool:
        if self._opened_at and (time.monotonic() - self._opened_at) > self.recovery_timeout:
            self.reset()  # Probe request
        return self._opened_at is not None

    def record_failure(self):
        self._failures += 1
        if self._failures >= self.failure_threshold:
            self._opened_at = time.monotonic()
            logger.error("Circuit breaker OPENED — exchange appears degraded")

    def record_success(self):
        self.reset()

    def reset(self):
        self._failures = 0
        self._opened_at = None


breaker = CircuitBreaker()

async def guarded_call(exchange, fn, *args, **kwargs):
    if breaker.is_open:
        raise ExchangeNotAvailable("Circuit breaker open — skipping request")
    try:
        result = await fn(*args, **kwargs)
        breaker.record_success()
        return result
    except RETRIABLE_EXCEPTIONS:
        breaker.record_failure()
        raise
```

---

## Reload Markets on `BadSymbol`

Symbol lists change over time. On `BadSymbol`, reload markets and retry once before giving up:

```python
async def refresh_and_retry(exchange, fn, *args, **kwargs):
    try:
        return await fn(*args, **kwargs)
    except BadSymbol:
        logger.warning("BadSymbol — reloading markets and retrying once")
        await exchange.load_markets(reload=True)
        return await fn(*args, **kwargs)  # One retry only
```

---

## Quick Reference

```
Exception                 Action
──────────────────────────────────────────────────────────────────
RequestTimeout            VERIFY exchange state first, then retry
ExchangeNotAvailable      Retry with long backoff + circuit breaker
DDoSProtection            Retry with very long backoff (30s+)
RateLimitExceeded         Honour retry-after header
OrderNotFound             Ignorable in cancel/fetch — fatal in create
InvalidOrder              Ignorable in cancel — fatal in create
InsufficientFunds         Fatal — alert immediately, check balance
AuthenticationError       Fatal — stop all operations, alert
BadSymbol                 Reload markets once, then retry
Unknown ExchangeError     Fatal — fail fast, needs investigation
```

---

## Key Takeaways

- **`RequestTimeout` ≠ failure.** Always verify exchange state before retrying anything that mutates state (orders, withdrawals).
- **`OrderNotFound` and `InvalidOrder` in `cancel_order()` are successes** — the order is gone, which is the goal.
- **Classify exceptions once** in a central policy map, not scattered across your codebase.
- **Use a circuit breaker** to protect against cascading failures when an exchange is degraded.
- **Exponential backoff with a cap** prevents thundering herd problems and runaway retry loops.
- **Unknown exceptions should fail fast** — swallowing unexpected errors silently is how bugs hide for months.
