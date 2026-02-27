---
layout: page
title: 博客
description: 最新的交易与编程文章
---

<script setup>
import { ref } from 'vue'

const posts = ref([
  {
    title: '算法交易入门',
    url: '/zh-cn/blog/posts/algorithmic-trading-intro',
    date: '2025-02-27',
    tags: ['交易', '算法'],
    categories: ['交易'],
    excerpt: '学习算法交易的基础知识及如何开始。'
  },
  {
    title: '使用 Python 构建交易机器人',
    url: '/zh-cn/blog/posts/trading-bot-python',
    date: '2025-02-20',
    tags: ['编程', 'python', '交易'],
    categories: ['编程', '交易'],
    excerpt: '逐步指南教你构建第一个交易机器人。'
  },
  {
    title: '了解市场数据 API',
    url: '/zh-cn/blog/posts/market-data-apis',
    date: '2025-02-13',
    tags: ['编程', 'api'],
    categories: ['编程'],
    excerpt: '学习如何从各交易所获取和处理市场数据。'
  }
])
</script>

# 博客

最新的交易与编程文章。

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

## 标签

- [交易](/zh-cn/blog/tags/trading/)
- [编程](/zh-cn/blog/tags/programming/)
- [算法](/zh-cn/blog/tags/algorithms/)
- [Python](/zh-cn/blog/tags/python/)
- [API](/zh-cn/blog/tags/api/)

## 分类

- [交易](/zh-cn/blog/categories/trading/)
- [编程](/zh-cn/blog/categories/programming/)

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
