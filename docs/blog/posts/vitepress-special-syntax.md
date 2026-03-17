---
title: VitePress Special Syntax Reference
description: A complete guide to VitePress-specific markdown syntax — containers, code blocks, badges, frontmatter, and more.
date: 2025-01-01
tags:
  - vitepress
  - markdown
  - documentation
outline: deep
---

# VitePress Special Syntax Reference

VitePress extends standard Markdown with a rich set of features designed for technical documentation. This guide covers every special syntax available so you can write expressive, well-structured docs.

---

## Custom Containers

Custom containers draw the reader's attention to important content. VitePress ships with five built-in types.

::: info
Use `info` for neutral supplementary context that doesn't require action.
:::

::: tip
Use `tip` for helpful suggestions, shortcuts, or best practices.
:::

::: warning
Use `warning` for things the reader should be careful about.
:::

::: danger
Use `danger` for breaking changes, destructive actions, or critical errors.
:::

::: details Click to expand
Use `details` for collapsible content — changelogs, verbose examples, or optional deep-dives.
:::

**Syntax:**

```md
::: info
Neutral note.
:::

::: tip
Helpful suggestion.
:::

::: warning
Watch out for this.
:::

::: danger
Critical warning.
:::

::: details Click to expand
Hidden content revealed on click.
:::
```

### Custom Titles

Every container type accepts a custom title on the same line:

```md
::: warning Bitget API Note
This endpoint requires a passphrase in addition to the API key and secret.
:::

::: details See full response example
{
  "code": "00000",
  "data": { ... }
}
:::
```

---

## Code Blocks

### Syntax Highlighting

Specify the language after the opening fence for syntax highlighting:

````md
```python
def greet(name: str) -> str:
    return f"Hello, {name}"
```
````

### Line Highlighting

Highlight specific lines to draw attention to them:

````md
```python{2,4-6}
exchange = ccxt.bitget({
    'apiKey': 'YOUR_KEY',        # line 2 highlighted
    'secret': 'YOUR_SECRET',
    'options': {                 # lines 4-6 highlighted
        'defaultType': 'swap',
        'hedged': False,
    },
})
```
````

### Line Numbers

````md
```python:line-numbers
import ccxt

exchange = ccxt.bitget({
    'apiKey': 'KEY',
    'secret': 'SECRET',
})
```
````

### Starting Line Number

````md
```python:line-numbers=42
# this block starts numbering from line 42
def place_order():
    pass
```
````

### Focus Lines

Blurs all lines except the focused one, directing the reader's eye:

````md
```python
exchange = ccxt.bitget({...})
exchange.load_markets()
exchange.set_leverage(10, 'BTC/USDT:USDT')  # [!code focus]
order = exchange.create_order(...)
```
````

### Diff Highlighting

Show what was removed and added:

````md
```python
exchange.create_order(
    'BTC/USDT:USDT', 'limit', 'buy', 0.002, 66990.2,
    params={
        'positionSide': 'long',   # [!code --]
        'tradeSide': 'open',      # [!code ++]
        'marginMode': 'cross',
    }
)
```
````

### Error and Warning Highlights

````md
```python
exchange.options['hedged'] = None    # [!code error]
exchange.options['hedged'] = False   # [!code warning]
```
````

### Code Block Title

Display a filename or label above the code block:

````md
```python [config.py]
API_KEY = 'YOUR_KEY'
SECRET  = 'YOUR_SECRET'
```
````

---

## Code Groups

Render multiple related code blocks as tabs — ideal for showing the same concept in multiple languages or configurations.

::: code-group

```python [Python]
order = exchange.create_order(
    'BTC/USDT:USDT', 'limit', 'buy', 0.002, 66990.2,
    params={'tradeSide': 'open', 'marginMode': 'cross'}
)
```

```javascript [JavaScript]
const order = await exchange.createOrder(
  'BTC/USDT:USDT', 'limit', 'buy', 0.002, 66990.2,
  { tradeSide: 'open', marginMode: 'cross' }
)
```

```typescript [TypeScript]
const order: Order = await exchange.createOrder(
  'BTC/USDT:USDT', 'limit', 'buy', 0.002, 66990.2,
  { tradeSide: 'open', marginMode: 'cross' }
)
```

:::

**Syntax:**

````md
::: code-group

```python [Python]
# python code
```

```javascript [JavaScript]
// javascript code
```

:::
````

---

## File Includes

Import the full content of another file directly into the page:

```md
<!--@include: ./snippets/installation.md-->
```

Import only a specific line range (lines 3 to 10):

```md
<!--@include: ./snippets/installation.md{3,10}-->
```

::: tip
File includes are resolved at build time. The path must be relative to the current file.
:::

---

## Badges

Inline badges are useful for labeling API stability, feature status, or version info next to headings or text.

```md
## create_order <Badge type="tip" text="stable" />
## fetch_balance <Badge type="info" text="v4.2+" />
## set_position_mode <Badge type="warning" text="deprecated" />
## create_market_order <Badge type="danger" text="removed" />
```

**Renders as:**

| Badge type | Typical use |
|---|---|
| `tip` (green) | Stable, recommended |
| `info` (blue) | Neutral info, version tags |
| `warning` (yellow) | Deprecated, use with caution |
| `danger` (red) | Removed, breaking |

---

## Frontmatter

Frontmatter is YAML at the top of any `.md` file that controls page behaviour and metadata.

```yaml
---
title: Page Title
description: Used for SEO and social sharing previews.

# Table of contents depth in the right sidebar
# 'deep' shows h2 + h3; default shows h2 only
outline: deep

# Show the "Last Updated" timestamp at the bottom
lastUpdated: true

# Hide the right sidebar entirely
aside: false

# Page layout
layout: doc        # doc | home | page

# Disable prev/next navigation
prev: false
next:
  text: 'Next Article'
  link: /guide/next-article

# Tags (used by custom theme plugins)
tags:
  - vitepress
  - markdown
---
```

---

## Home Page Layout

The `home` layout renders a full landing page from frontmatter alone — no body content needed.

```yaml
---
layout: home

hero:
  name: My Project
  text: Fast, minimal documentation.
  tagline: Built with VitePress.
  image:
    src: /logo.png
    alt: Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/my/repo

features:
  - icon: ⚡
    title: Lightning Fast
    details: Instant hot reload and optimised static builds.
  - icon: 🛠️
    title: Simple Config
    details: Zero boilerplate — just write Markdown.
  - icon: 🎨
    title: Themeable
    details: Full Vue component support inside your docs.
---
```

---

## Markdown Extensions

### Custom Heading Anchors

Override the auto-generated anchor ID for a heading:

```md
## My Long Heading Title {#short-id}
```

Linking to it:

```md
[Jump to section](#short-id)
```

### External Link Attributes

Control how external links open:

```md
[Bitget API Docs](https://www.bitget.com/api-doc){target="_blank" rel="noopener"}
```

### Image with Tooltip

The image title attribute renders as a tooltip on hover:

```md
![Architecture diagram](./diagram.png "System architecture overview")
```

### Image Size (via HTML)

Standard Markdown doesn't support sizing — use an inline HTML tag:

```md
<img src="./diagram.png" alt="Diagram" width="600" />
```

---

## Emoji

VitePress supports GitHub-style emoji shortcodes:

```md
:white_check_mark: Supported
:x: Not supported
:warning: Deprecated
:bulb: Tip
:rocket: New
```

Renders as: ✅ ❌ ⚠️ 💡 🚀

---

## Tables

Standard Markdown tables with column alignment:

```md
| Left aligned | Centered | Right aligned |
|:---|:---:|---:|
| Spot | `BTC/USDT` | No setup needed |
| Margin | `BTC/USDT` | `marginMode` in params |
| Swap | `BTC/USDT:USDT` | Full setup required |
```

---

## Math (KaTeX)

::: info
Requires the `markdown-it-mathjax3` or `markdown-it-katex` plugin. Enable in `config.ts` first.
:::

Inline math:

```md
The formula is $E = mc^2$ where $c$ is the speed of light.
```

Block math:

```md
$$
P = \frac{size \times price}{leverage}
$$
```

---

## Summary

| Feature | Syntax |
|---|---|
| Info container | `::: info` |
| Tip container | `::: tip` |
| Warning container | `::: warning` |
| Danger container | `::: danger` |
| Collapsible block | `::: details` |
| Custom container title | `::: warning My Title` |
| Line highlight | ` ```js{1,3-5} ` |
| Line numbers | ` ```js:line-numbers ` |
| Focus line | `// [!code focus]` |
| Diff line | `// [!code --]` / `// [!code ++]` |
| Error/warning line | `// [!code error]` / `// [!code warning]` |
| Code block title | ` ```js [filename.js] ` |
| Code groups (tabs) | `::: code-group` |
| File include | `<!--@include: ./file.md-->` |
| Badge | `<Badge type="tip" text="stable" />` |
| Custom anchor | `## Heading {#custom-id}` |
| Home layout | `layout: home` in frontmatter |
