import { defineConfig } from 'vitepress'

const cexItems = [
  { text: 'Binance', link: '/cex/binance' },
  { text: 'Coinbase', link: '/cex/coinbase' },
  { text: 'Bybit', link: '/cex/bybit' },
  { text: 'OKX', link: '/cex/okx' },
  { text: 'Bitget', link: '/cex/bitget' },
  { text: 'Gate', link: '/cex/gate' },
  { text: 'KuCoin', link: '/cex/kucoin' },
  { text: 'HTX', link: '/cex/htx' },
  { text: 'MEXC', link: '/cex/mexc' },
]

const dexItems = [
  { text: 'Backpack', link: '/dex/backpack' },
  { text: 'Blofin', link: '/dex/blofin' },
  { text: 'Hyperliquid', link: '/dex/hyperliquid' },
  { text: 'Lighter', link: '/dex/lighter' },
  { text: 'Pacifica', link: '/dex/pacifica' },
  { text: 'Paradex', link: '/dex/paradex' },
  { text: 'StandX', link: '/dex/standx' },
  { text: 'Aster', link: '/dex/aster' },
  { text: 'Extended', link: '/dex/extended' },
  { text: 'Apex Omni', link: '/dex/apex-omni' },
]

function withPrefix (items, prefix) {
  return items.map(item => ({
    ...item,
    link: `${prefix}${item.link}`,
  }))
}

function makeSidebar (prefix = '') {
  return [
    {
      text: prefix ? (prefix === '/zh-tw' ? '開始使用' : '开始使用') : 'Getting Started',
      collapsed: false,
      items: [
        { text: prefix ? '快速開始' : 'Quick Start', link: `${prefix}/getting-started/quick-start` },
        { text: prefix ? (prefix === '/zh-tw' ? '註冊帳號' : '注册账号') : 'Registration', link: `${prefix}/registeration/registration` },
        { text: prefix ? (prefix === '/zh-tw' ? '交易所設定' : '交易所设定') : 'Exchange Setup', link: `${prefix}/exchange-setup` },
      ],
    },
    {
      text: prefix ? (prefix === '/zh-tw' ? '策略指南' : '策略指南') : 'Strategy Guides',
      collapsed: false,
      items: [
        { text: prefix ? (prefix === '/zh-tw' ? '資金費率套利' : '资金费率套利') : 'Funding Rate Arbitrage', link: `${prefix}/strategies/funding-arbitrage` },
        { text: prefix ? 'Webhook' : 'Webhook Signals', link: `${prefix}/strategies/webhook` },
        { text: prefix ? (prefix === '/zh-tw' ? 'ahr999 智能定投' : 'ahr999 智能定投') : 'Smart DCA (ahr999)', link: `${prefix}/strategies/smart-dca` },
      ],
    },
    {
      text: 'CEX',
      collapsed: true,
      items: prefix ? withPrefix(cexItems, prefix) : cexItems,
    },
    {
      text: 'DEX',
      collapsed: true,
      items: prefix ? withPrefix(dexItems, prefix) : dexItems,
    },
    {
      text: prefix ? (prefix === '/zh-tw' ? '其他' : '其他') : 'Other',
      collapsed: true,
      items: [
        { text: prefix ? (prefix === '/zh-tw' ? '設定說明' : '设置说明') : 'Settings', link: `${prefix}/other/settings-page` },
        { text: prefix ? (prefix === '/zh-tw' ? '持倉與交易記錄' : '持仓与交易记录') : 'Positions & Trades', link: `${prefix}/other/trading-page` },
        { text: prefix ? (prefix === '/zh-tw' ? '下單操作' : '下单操作') : 'Order Operations', link: `${prefix}/other/order-operations` },
        { text: prefix ? (prefix === '/zh-tw' ? '風險提示' : '风险提示') : 'Risk Warning', link: `${prefix}/other/risk-warning` },
        { text: prefix ? (prefix === '/zh-tw' ? '常見問題' : '常见问题') : 'FAQ', link: `${prefix}/other/faq` },
      ],
    },
    // {
    //   text: prefix ? (prefix === '/zh-tw' ? '部落格' : '博客') : 'Blog',
    //   collapsed: true,
    //   items: [
    //     { text: prefix ? (prefix === '/zh-tw' ? '所有文章' : '所有文章') : 'All Posts', link: `${prefix}/blog/` },
    //     { text: prefix ? (prefix === '/zh-tw' ? '標籤' : '标签') : 'Tags', link: `${prefix}/blog/tags/` },
    //     { text: prefix ? (prefix === '/zh-tw' ? '分類' : '分类') : 'Categories', link: `${prefix}/blog/categories/` },
    //   ],
    // },
  ]
}

export default defineConfig({
  base: '/nexus-docs/',
  title: 'NexusQuant Docs',
  description: 'Multi-strategy crypto quantitative trading platform documentation',
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'NexusQuant Docs',
      description: 'Multi-strategy crypto quantitative trading platform documentation',
    },
    'zh-tw': {
      label: '繁體中文',
      lang: 'zh-TW',
      title: 'NexusQuant 文件',
      description: '多策略加密貨幣量化交易平台文件',
    },
    'zh-cn': {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'NexusQuant 文档',
      description: '多策略加密货币量化交易平台文档',
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/getting-started/quick-start' },
      { text: 'Strategies', link: '/strategies/funding-arbitrage' },
    ],
    sidebar: {
      '/': makeSidebar(),
      '/zh-tw/': makeSidebar('/zh-tw'),
      '/zh-cn/': makeSidebar('/zh-cn'),
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nexus-quant-lab/nexus-docs' },
    ],
    footer: {
      message: 'Released under the CC BY-NC-ND 4.0 License.',
      copyright: 'Copyright © 2025-2026 NexusQuant',
    },
    outline: {
      level: [2, 3],
    },
  },
})
