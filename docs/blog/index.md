---
layout: page
title: Blog
description: Latest articles on trading and programming
---

<script setup>
import { ref, computed } from 'vue'

const posts = ref([
  {
    title: 'Getting Started with algorithmic Trading',
    url: '/blog/posts/algorithmic-trading-intro',
    date: '2025-02-27',
    tags: ['trading', 'algorithms'],
    categories: ['Trading'],
    excerpt: 'Learn the basics of algorithmic trading and how to get started.'
  },
  {
    title: 'Building a Trading Bot with Python',
    url: '/blog/posts/trading-bot-python',
    date: '2025-02-20',
    tags: ['programming', 'python', 'trading'],
    categories: ['Programming', 'Trading'],
    excerpt: 'A step-by-step guide to building your first trading bot.'
  },
  {
    title: 'Understanding Market Data APIs',
    url: '/blog/posts/market-data-apis',
    date: '2025-02-13',
    tags: ['programming', 'api'],
    categories: ['Programming'],
    excerpt: 'Learn how to fetch and process market data from various exchanges.'
  }
])
</script>

# Blog

Latest articles on trading and programming.

## Recent Posts

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

## Tags

- [Trading](/blog/tags/trading/)
- [Programming](/blog/tags/programming/)
- [Algorithms](/blog/tags/algorithms/)
- [Python](/blog/tags/python/)
- [API](/blog/tags/api/)

## Categories

- [Trading](/blog/categories/trading/)
- [Programming](/blog/categories/programming/)

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
