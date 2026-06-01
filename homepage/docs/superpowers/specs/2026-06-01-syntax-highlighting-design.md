# Syntax Highlighting for Code Blocks

Add syntax highlighting and language labels to markdown-rendered code blocks using highlight.js at build time.

## Motivation

Code blocks currently render as flat single-color text on dark background. Adding token-level color highlighting (keywords, strings, comments, etc.) improves readability and gives a polished IDE-like appearance. Language badges help readers quickly identify the code language.

## Approach

Use `highlight.js` + `marked-highlight` extension during the build step (`generate-posts.mjs`). Tokens get wrapped in `<span class="hljs-*">` at build time — no runtime JS cost. Language badge is added via a custom renderer that copies the language class from `<code>` to `<pre>` as a `data-language` attribute.

## Changes

### 1. Dependencies

Install `highlight.js`:

- `highlight.js` — syntax highlighting engine, used in custom marked renderer

Add to `homepage/package.json` (dependencies or devDependencies).

### 2. Build script: `homepage/scripts/generate-posts.mjs`

Import `highlight.js` and add a custom marked renderer that both highlights tokens and adds `data-language` to `<pre>` (for the CSS badge):

```js
import hljs from "highlight.js";

// Add after the grayMatter / marked imports, before marked.parse() usage

const renderer = new marked.Renderer();
renderer.code = (token) => {
  const lang = token.lang || "";
  const code = lang && hljs.getLanguage(lang)
    ? hljs.highlight(token.text, { language: lang }).value
    : token.text;
  const langAttr = lang ? ` data-language="${lang}"` : "";
  return `<pre${langAttr}><code class="language-${lang}">${code}</code></pre>`;
};
```

Then pass the renderer in `marked.parse()`:

```js
const html = marked.parse(content, { breaks: true, renderer });
```

### 3. CSS: `homepage/src/App.css`

Replace the existing `.article-content pre` and `.article-content pre code` blocks (around lines 459-472) with:

```css
.article-content pre {
  background: #1a1a2e;
  color: #e4e4e7;
  padding: 40px 16px 16px;
  border-radius: var(--radius);
  overflow-x: auto;
  margin-bottom: 20px;
  position: relative;
}

.article-content pre code {
  background: none;
  padding: 0;
  font-size: 0.85rem;
  font-family: "Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace;
}
```

Add the language label pseudo-element:

```css
.article-content pre::before {
  content: attr(data-language);
  position: absolute;
  top: 0;
  left: 0;
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  padding: 6px 12px;
  letter-spacing: 1px;
  font-family: inherit;
}
```

Add token color classes (Palenight-inspired, matching `#1a1a2e` background):

```css
.hljs-keyword,
.hljs-selector-tag,
.hljs-type { color: #c792ea; }

.hljs-string,
.hljs-addition { color: #c3e88d; }

.hljs-comment,
.hljs-quote { color: #546e7a; font-style: italic; }

.hljs-number,
.hljs-literal { color: #f78c6c; }

.hljs-built_in { color: #82aaff; }

.hljs-title.function_ { color: #ffcb6b; }

.hljs-operator { color: #89ddff; }

.hljs-attr { color: #b2ccd6; }

.hljs-variable,
.hljs-template-variable { color: #f07178; }

.hljs-deletion { color: #f07178; }

.hljs-section { color: #ffcb6b; font-weight: bold; }

.hljs-link { text-decoration: underline; }

.hljs-meta { color: #89ddff; }

.hljs-emphasis { font-style: italic; }

.hljs-strong { font-weight: bold; }
```

### 4. Regenerate posts

After the changes, run `npm run regenerate` to rebuild `posts.json` with highlighted HTML.

## Files changed

| File | Change |
|---|---|
| `homepage/package.json` | Add `highlight.js` |
| `homepage/scripts/generate-posts.mjs` | Add import, custom renderer for highlighting + language label |
| `homepage/src/App.css` | Token color rules, language label, code font |
| `homepage/src/data/posts.json` | Regenerated (build output) |

## Not in scope

- Runtime syntax highlighting (all done at build time)
- Inline code styling (keep existing purple background)
- Language-specific behavior beyond what highlight.js auto-detects
