# Async Factory Pattern in Python
## Using `@classmethod create()` for Async Initialization

---

## 📌 Problem

In Python:

- `__init__()` **cannot be async**
- You cannot `await` inside `__init__`
- Objects are created synchronously

This creates a problem when your class needs to:

- Connect to an exchange
- Open a database connection
- Load markets
- Authenticate
- Perform any async setup

Example of what **does NOT work**:

```python
class MyClient:
    async def __init__(self):   # ❌ Not allowed
        await self.connect()
```

Python does not allow async constructors.

---

## ✅ Solution: Async Factory Method Pattern

Use a `@classmethod` called `create()`.

This method:

1. Creates the instance
2. Runs async initialization
3. Returns a fully initialized object

---

## 🏗 Basic Pattern

```python
class MyClient:

    def __init__(self, config):
        self.config = config
        self.connection = None

    async def connect(self):
        self.connection = await some_async_connect()

    @classmethod
    async def create(cls, config):
        self = cls(config)      # Step 1: create instance
        await self.connect()    # Step 2: async setup
        return self             # Step 3: return ready object
```

---

## 🚀 Usage

Instead of:

```python
client = MyClient(config)
await client.connect()
```

Use:

```python
client = await MyClient.create(config)
```

After this line:

- The object is fully initialized
- Async setup is complete
- Safe to use immediately

---

## 🔥 Why This Pattern Is Better

### 1️⃣ Prevents Half-Initialized Objects

Without factory:

```python
client = MyClient(config)
# connection is still None here
```

With factory:

```python
client = await MyClient.create(config)
# connection is ready
```

---

### 2️⃣ Impossible to Forget Initialization

Without factory, this bug is common:

```python
client = MyClient(config)
await client.fetch_data()  # 💥 connection not ready
```

Factory pattern eliminates this risk.

---

### 3️⃣ Cleaner Lifecycle Control

The lifecycle becomes:

```python
client = await MyClient.create(config)
await client.do_work()
```

Initialization is guaranteed before usage.

---

## 🧠 Why Use `cls` Instead of Hardcoding Class Name?

Inside `@classmethod`:

- `cls` refers to the class itself
- Using `cls()` supports inheritance

Example:

```python
class Base:
    @classmethod
    async def create(cls):
        return cls()

class Child(Base):
    pass

obj = await Child.create()
```

Because we used `cls`, `obj` will be a `Child`, not a `Base`.
This makes the pattern extensible and future-proof.

---

## 🛠 Optional: Raise Instead of Returning False

If your async setup can fail, prefer raising exceptions:

```python
@classmethod
async def create(cls, config):
    self = cls(config)
    await self.connect()   # let it raise on failure
    return self
```

This keeps error handling explicit and clean.

---

## 🆚 Why Not Use `async with`?

`async with` calls:

- `__aenter__`
- `__aexit__`

But it requires:

```python
async with MyClient(...) as client:
```

If you need a long-lived object (e.g., trading bot client),
the factory pattern is more appropriate.

---

## 🧩 When to Use This Pattern

Use async factory pattern when your class needs to:

- Connect to exchanges (ccxt async)
- Open WebSocket connections
- Connect to databases
- Authenticate with APIs
- Load markets before trading
- Perform any required async setup

---

## 🏁 Final Summary

Because Python constructors cannot be async:

> The correct and Pythonic way to perform async initialization
> is to use an async `@classmethod create()` factory method.

### Final Template

```python
class MyClass:

    def __init__(self, ...):
        ...

    async def _async_init(self):
        ...

    @classmethod
    async def create(cls, ...):
        self = cls(...)
        await self._async_init()
        return self
```

Usage:

```python
obj = await MyClass.create(...)
```

Clean. Safe. Production-ready.

