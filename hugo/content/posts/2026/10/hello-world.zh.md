---
title: "你好，世界"
date: 2026-10-18
lastmod: 2026-10-18
tags: ["随笔", "hugo"]
categories: ["笔记"]
summary: "这个博客为什么存在，以及让它保持轻快的两条规则。"
draft: false
---

这是第一篇文章。它存在的意义主要是证明整条流水线能跑通：写 Markdown，
得到 HTML，然后发布到 GitHub Pages。

## 两条规则

整体架构刻意保持无聊。

1. **页面归 Hugo 管。** 路由、布局、Markdown 渲染、订阅源和元数据，
   全部由 Hugo 产出。
2. **React 只管孤立的组件。** React 岛只能挂载到 Hugo 用
   `data-island` 标记的容器里，其他地方一律不碰。

## 这样做的好处

- 即使关掉 JavaScript，每篇文章依然可读。
- 首页发送的 JavaScript 有固定、可测量的上限。
- 永远没有客户端路由需要调试。

```ts
// island 只操作自己的容器
for (const el of document.querySelectorAll('[data-island="bento"]')) {
  createRoot(el).render(<Bento items={readItems(el)} />);
}
```

这就是全部约定。
