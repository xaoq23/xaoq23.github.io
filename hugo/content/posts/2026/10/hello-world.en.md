---
title: "Hello, world"
date: 2026-10-18
lastmod: 2026-10-18
tags: ["meta", "hugo"]
categories: ["notes"]
summary: "Why this blog exists, and the two rules that keep it fast."
draft: false
---

This is the first post. It exists mostly to prove the pipeline works: write
Markdown, get HTML, ship it to GitHub Pages.

## Two rules

The architecture is intentionally boring.

1. **Hugo owns the page.** Routing, layouts, Markdown rendering, feeds and
   metadata all come out of Hugo.
2. **React owns isolated widgets.** A React island may only mount inside a
   container that Hugo marks with `data-island`. Nothing else.

## What that buys us

- Every article is readable with JavaScript disabled.
- The homepage ships a fixed, measurable amount of JavaScript.
- There is never a client-side router to debug.

```ts
// islands only touch their own container
for (const el of document.querySelectorAll('[data-island="bento"]')) {
  createRoot(el).render(<Bento items={readItems(el)} />);
}
```

That is the whole contract.
