import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Nexus Docs",
  description: "Your Documentation",
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Nexus Docs',
      description: 'Your Documentation'
    },
    'zh-tw': {
      label: '繁體中文',
      lang: 'zh-TW',
      title: 'Nexus 文檔',
      description: '您的文檔',
      link: '/zh-tw/'
    },
    'zh-cn': {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Nexus 文档',
      description: '您的文档',
      link: '/zh-cn/'
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/quick-start' },
      { text: 'Blog', link: '/blog/' },
      { text: '繁體中文', link: '/zh-tw/' },
      { text: '简体中文', link: '/zh-cn/' }
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Quick Start', link: '/getting-started/quick-start' },
            { text: 'Installation', link: '/registeration/registration' }
          ]
        },
        {
          text: 'CEX',
          collapsed: false,
          items: [
            { text: 'Binance', link: '/cex/binance' },
            { text: 'Coinbase', link: '/cex/coinbase' },
            { text: 'Bybit', link: '/cex/bybit' },
            { text: 'OKX', link: '/cex/okx' },
            { text: 'Bitget', link: '/cex/bitget' },
            { text: 'Gate', link: '/cex/gate' },
            { text: 'KuCoin', link: '/cex/kucoin' },
            { text: 'HTX', link: '/cex/htx' },
            { text: 'MEXC', link: '/cex/mexc' }
          ]
        },
        {
          text: 'DEX',
          collapsed: false,
          items: [
            { text: 'Backpack', link: '/dex/backpack' },
            { text: 'Blofin', link: '/dex/blofin' },
            { text: 'Hyperliquid', link: '/dex/hyperliquid' },
            { text: 'Lighter', link: '/dex/lighter' },
            { text: 'Pacifica', link: '/dex/pacifica' },
            { text: 'Paradex', link: '/dex/paradex' },
            { text: 'StandX', link: '/dex/standx' },
            { text: 'Aster', link: '/dex/aster' },
            { text: 'Extended', link: '/dex/extended' },
            { text: 'Apex Omni', link: '/dex/apex-omni' }
          ]
        },
        {
          text: 'Other',
          collapsed: false,
          items: [
            { text: 'Settings Page', link: '/other/settings-page' },
            { text: 'Trading Page', link: '/other/trading-page' },
            { text: 'Order Operations', link: '/other/order-operations' },
            { text: 'Risk Warning', link: '/other/risk-warning' },
            { text: 'FAQ', link: '/other/faq' }
          ]
        },
        {
          text: 'Blog',
          collapsed: false,
          items: [
            { text: 'All Posts', link: '/blog/' },
            { text: 'Tags', link: '/blog/tags/' },
            { text: 'Categories', link: '/blog/categories/' }
          ]
        }
      ],
      '/zh-tw/': [
        {
          text: '開始使用',
          collapsed: false,
          items: [
            { text: '快速開始', link: '/zh-tw/getting-started/quick-start' },
            { text: '安裝部署', link: '/zh-tw/registeration/registration' }
          ]
        },
        {
          text: 'CEX',
          collapsed: false,
          items: [
            { text: 'Binance', link: '/zh-tw/cex/binance' },
            { text: 'Coinbase', link: '/zh-tw/cex/coinbase' },
            { text: 'Bybit', link: '/zh-tw/cex/bybit' },
            { text: 'OKX', link: '/zh-tw/cex/okx' },
            { text: 'Bitget', link: '/zh-tw/cex/bitget' },
            { text: 'Gate', link: '/zh-tw/cex/gate' },
            { text: 'KuCoin', link: '/zh-tw/cex/kucoin' },
            { text: 'HTX', link: '/zh-tw/cex/htx' },
            { text: 'MEXC', link: '/zh-tw/cex/mexc' }
          ]
        },
        {
          text: 'DEX',
          collapsed: false,
          items: [
            { text: 'Backpack', link: '/zh-tw/dex/backpack' },
            { text: 'Blofin', link: '/zh-tw/dex/blofin' },
            { text: 'Hyperliquid', link: '/zh-tw/dex/hyperliquid' },
            { text: 'Lighter', link: '/zh-tw/dex/lighter' },
            { text: 'Pacifica', link: '/zh-tw/dex/pacifica' },
            { text: 'Paradex', link: '/zh-tw/dex/paradex' },
            { text: 'StandX', link: '/zh-tw/dex/standx' },
            { text: 'Aster', link: '/zh-tw/dex/aster' },
            { text: 'Extended', link: '/zh-tw/dex/extended' },
            { text: 'Apex Omni', link: '/zh-tw/dex/apex-omni' }
          ]
        },
        {
          text: '其他',
          collapsed: false,
          items: [
            { text: '設置頁面', link: '/zh-tw/other/settings-page' },
            { text: '交易頁面', link: '/zh-tw/other/trading-page' },
            { text: '下單操作', link: '/zh-tw/other/order-operations' },
            { text: '風險提示', link: '/zh-tw/other/risk-warning' },
            { text: '常見問題', link: '/zh-tw/other/faq' }
          ]
        },
        {
          text: '部落格',
          collapsed: false,
          items: [
            { text: '所有文章', link: '/zh-tw/blog/' },
            { text: '標籤', link: '/zh-tw/blog/tags/' },
            { text: '分類', link: '/zh-tw/blog/categories/' }
          ]
        }
      ],
      '/zh-cn/': [
        {
          text: '开始使用',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/zh-cn/getting-started/quick-start' },
            { text: '安装部署', link: '/zh-cn/registeration/registration' }
          ]
        },
        {
          text: 'CEX',
          collapsed: false,
          items: [
            { text: 'Binance', link: '/zh-cn/cex/binance' },
            { text: 'Coinbase', link: '/zh-cn/cex/coinbase' },
            { text: 'Bybit', link: '/zh-cn/cex/bybit' },
            { text: 'OKX', link: '/zh-cn/cex/okx' },
            { text: 'Bitget', link: '/zh-cn/cex/bitget' },
            { text: 'Gate', link: '/zh-cn/cex/gate' },
            { text: 'KuCoin', link: '/zh-cn/cex/kucoin' },
            { text: 'HTX', link: '/zh-cn/cex/htx' },
            { text: 'MEXC', link: '/zh-cn/cex/mexc' }
          ]
        },
        {
          text: 'DEX',
          collapsed: false,
          items: [
            { text: 'Backpack', link: '/zh-cn/dex/backpack' },
            { text: 'Blofin', link: '/zh-cn/dex/blofin' },
            { text: 'Hyperliquid', link: '/zh-cn/dex/hyperliquid' },
            { text: 'Lighter', link: '/zh-cn/dex/lighter' },
            { text: 'Pacifica', link: '/zh-cn/dex/pacifica' },
            { text: 'Paradex', link: '/zh-cn/dex/paradex' },
            { text: 'StandX', link: '/zh-cn/dex/standx' },
            { text: 'Aster', link: '/zh-cn/dex/aster' },
            { text: 'Extended', link: '/zh-cn/dex/extended' },
            { text: 'Apex Omni', link: '/zh-cn/dex/apex-omni' }
          ]
        },
        {
          text: '其他',
          collapsed: false,
          items: [
            { text: '设置页面', link: '/zh-cn/other/settings-page' },
            { text: '交易页面', link: '/zh-cn/other/trading-page' },
            { text: '下单操作', link: '/zh-cn/other/order-operations' },
            { text: '风险提示', link: '/zh-cn/other/risk-warning' },
            { text: '常见问题', link: '/zh-cn/other/faq' }
          ]
        },
        {
          text: '博客',
          collapsed: false,
          items: [
            { text: '所有文章', link: '/zh-cn/blog/' },
            { text: '标签', link: '/zh-cn/blog/tags/' },
            { text: '分类', link: '/zh-cn/blog/categories/' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ],
    footer: {
      message: 'Released under the CC BY-NC-ND 4.0 License.',
      copyright: 'Copyright © 2025'
    },
    outline: {
      level: [2, 3]
    }
  }
})
