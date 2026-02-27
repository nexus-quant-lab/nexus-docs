# Operations Guide

## Adding a New Documentation Page

### 1. Create the markdown file

Create a new `.md` file in the appropriate folder:
- Getting Started: `docs/getting-started/`
- Installation: `docs/installation/`
- CEX: `docs/cex/`
- DEX: `docs/dex/`
- Other: `docs/other/`
- Blog: `docs/blog/posts/`

### 2. Add frontmatter

At the top of the file, add:

```yaml
---
title: Page Title
description: Page description
---
```

### 3. Update sidebar in config.mjs

Edit `docs/.vitepress/config.mjs`:

Find the relevant section and add your new page:

```javascript
{
  text: 'Section Name',
  collapsed: false,
  items: [
    { text: 'Page Name', link: '/path/to/page' },
    // Add your new page here
    { text: 'New Page', link: '/path/to/new-page' }
  ]
}
```

### 4. Multi-language support

For Traditional Chinese, also add to `docs/zh-tw/` folder and update the `/zh-tw/` sidebar section in config.mjs.

For Simplified Chinese, add to `docs/zh-cn/` folder and update the `/zh-cn/` sidebar section.

---

## Adding a New Blog Post

### 1. Create the post file

Create a new `.md` file in `docs/blog/posts/`

### 2. Add frontmatter

```yaml
---
title: Your Post Title
date: 2025-02-27
tags: [tag1, tag2]
categories: [Category]
description: Brief description
---
```

### 3. Update blog index

Edit `docs/blog/index.md` to add your post to the posts list.

### 4. Update tags/categories (optional)

If using new tags/categories, create:
- `docs/blog/tags/newtag/index.md`
- `docs/blog/categories/newcategory/index.md`

### 5. Multi-language

Also add to `docs/zh-tw/blog/posts/` and `docs/zh-cn/blog/posts/`

---

## Deleting a Page

1. Delete the `.md` file
2. Remove the entry from `config.mjs` sidebar
3. Rebuild: `npm run docs:dev` or `npm run docs:build`

---

## Running the Project

```bash
# Development (with hot reload)
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

---

## Project Structure

```
docs/
├── .vitepress/
│   ├── config.mjs      # Main configuration
│   └── theme/          # Theme customizations
├── blog/
│   ├── posts/          # Blog posts
│   ├── tags/          # Tag index pages
│   └── categories/    # Category index pages
├── cex/               # CEX documentation
├── dex/               # DEX documentation
├── perp-dex/          # Perpetual DEX docs
├── getting-started/   # Getting started guide
├── installation/      # Installation guide
├── other/             # Other pages (FAQ, etc.)
├── zh-tw/            # Traditional Chinese version
└── zh-cn/            # Simplified Chinese version
```

---

## URLs

- English: `http://localhost:5173/`
- 繁體中文: `http://localhost:5173/zh-tw/`
- 简体中文: `http://localhost:5173/zh-cn/`
- Blog: `http://localhost:5173/blog/`
