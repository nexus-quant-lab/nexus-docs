---
layout: page
title: 部落格
description: 最新的交易與程式設計文章
---

<script setup>
import { ref } from 'vue'

const posts = ref([
  {
    title: '演算法交易入門',
    url: '/zh-tw/blog/posts/algorithmic-trading-intro',
    date: '2025-02-27',
    tags: ['交易', '演算法'],
    categories: ['交易'],
    excerpt: '學習演算法交易的基礎知識及如何開始。'
  },
  {
    title: '使用 Python 構建交易機器人',
    url: '/zh-tw/blog/posts/trading-bot-python',
    date: '2025-02-20',
    tags: ['程式設計', 'python', '交易'],
    categories: ['程式設計', '交易'],
    excerpt: '逐步指南教你構建第一個交易機器人。'
  },
  {
    title: '了解市場數據 API',
    url: '/zh-tw/blog/posts/market-data-apis',
    date: '2025-02-13',
    tags: ['程式設計', 'api'],
    categories: ['程式設計'],
    excerpt: '學習如何從各交易所獲取和處理市場數據。'
  }
])
</script>

# 部落格

最新的交易與程式設計文章。

## 最新文章

<div class="posts-list">
  <div v-for="post in posts" :key="post.url" class="post-item">
    <a :href="post.url" class="post-title">{{ post.title }}</a>
    <div class="post-meta">
      <span class="post-date">{{ post.date }}</span>
      <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
    </div>
    <p class="post-excerpt">{{ post.excerpt }}</p>
  </div>
</div>

## 標籤

- [交易](/zh-tw/blog/tags/trading/)
- [程式設計](/zh-tw/blog/tags/programming/)
- [演算法](/zh-tw/blog/tags/algorithms/)
- [Python](/zh-tw/blog/tags/python/)
- [API](/zh-tw/blog/tags/api/)

## 分類

- [交易](/zh-tw/blog/categories/trading/)
- [程式設計](/zh-tw/blog/categories/programming/)

<style>
.posts-list {
  margin-top: 1rem;
}

.post-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-item:last-child {
  border-bottom: none;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-brand);
  text-decoration: none;
}

.post-title:hover {
  text-decoration: underline;
}

.post-meta {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.post-tag {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 0.75rem;
}

.post-excerpt {
  margin: 0.5rem 0 0;
  color: var(--vp-c-text-2);
}
</style>
