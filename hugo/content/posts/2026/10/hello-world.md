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
2. **No client-side framework.** No React, no SPA router, no hydration step.
   The only JavaScript is a few lines of vanilla code that keep the theme in
   sync.

## What that buys us

- Every article is readable with JavaScript disabled.
- No framework runtime to download, parse or hydrate.
- There is never a client-side router to debug.

That is the whole contract.
