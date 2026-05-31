# Site Refactoring: React-Only Blog

## Goal

Remove Jekyll/Chirpy dependency entirely. Convert the site to a pure React application that:
- Renders all pages (landing, post listing, article detail, archives, categories, tags, about)
- Processes `_posts/*.md` at build time into static data
- Deploys via GitHub Actions with no Ruby/Jekyll steps

## Architecture

### Config Layer (`homepage/src/config/site.js`)

Single source of truth for all site-level configuration:

```
site.title          → "Xaoq23`s Blog"
site.description    → "记录技术成长，分享编程思考"
site.author         → "zzh"
site.avatar         → "/assets/img/avater.jpg"
site.social.github  → "xaoq23"
site.social.email   → "2105002580@qq.com"
site.nav[]          → [{ label, path }, ...]
```

No hardcoded image paths or account info in components. All references go through `site.*`.

### Data Layer (`scripts/generate-posts.js`)

Build-time script that:

1. Reads `_posts/*.md` from project root
2. Uses `gray-matter` to parse YAML front matter (title, date, categories, tags, pin)
3. Uses `marked` to convert markdown body to HTML string
4. Outputs `homepage/src/data/posts.json`

Post JSON schema:
```json
{
  "title": "Post Title",
  "date": "2024-01-01",
  "categories": ["tech"],
  "tags": ["react"],
  "pin": false,
  "content": "<h1>...</h1>",
  "slug": "hello-world"
}
```

Posts sorted by date descending. Pinned posts float to top.

### Routes (HashRouter)

| Route | Component | Content |
|-------|-----------|---------|
| `/` | `HomePage` | Hero + FeaturedPosts (pinned posts) |
| `/posts` | `PostsPage` | All posts list, paginated |
| `/posts/:slug` | `PostPage` | Single article with markdown-rendered HTML |
| `/archives` | `ArchivesPage` | Posts grouped by year |
| `/categories` | `CategoriesPage` | Category listing with post counts |
| `/tags` | `TagsPage` | Tag cloud with post counts |
| `/about` | `AboutPage` | Static about content |

### Navigation

Order: 展示页 → 文章 → 归档 → 分类 → 标签 → 关于

- 文章 (`/posts`) replaces the old Chirpy blog listing as the main "homepage" for blog content.
- 展示页 (`/`) is the landing/showcase page with Hero and featured posts.

### Build Pipeline

```
npm run build
  ├── node scripts/generate-posts.js  →  homepage/src/data/posts.json
  └── vite build                      →  homepage/dist/
```

Added to `homepage/package.json` as a `prebuild` script.

### CI/CD (`.github/workflows/pages-deploy.yml`)

Simplified to:
1. Checkout
2. Setup Node.js
3. `npm ci && npm run build`
4. Upload `homepage/dist/` as deploy artifact

Removed: Ruby, Jekyll, htmlproofer, configure-pages steps.

## Files to Create

- `homepage/src/config/site.js`
- `scripts/generate-posts.js`
- `homepage/src/pages/PostPage.jsx`
- `homepage/src/data/` (output directory, gitkeep or gitignored?)

## Files to Modify

- `homepage/package.json` — add prebuild script, deps (`gray-matter`, `marked`)
- `homepage/src/App.jsx` — add new routes
- `homepage/src/components/Header.jsx` — update nav from config
- `homepage/src/components/FeaturedPosts.jsx` — use posts data
- `.github/workflows/pages-deploy.yml` — remove Jekyll

## Files to Remove

- `_config.yml`
- `Gemfile`, `Gemfile.lock`
- `_data/`, `_tabs/`, `_includes/`
- Gemfile.lock (if still tracked)

## UI Consistency

All pages share the same React Header and Footer. The Header uses the same responsive hamburger menu. Post pages use a clean article layout matching the site's design language. No Chirpy theme CSS.

## Success Criteria

1. `npm run build` succeeds without Ruby/Jekyll
2. All routes render correct content
3. Blog posts from `_posts/` appear on 文章/归档/分类/标签 pages
4. Individual post pages render markdown content correctly
5. CI deploys to GitHub Pages without errors
6. Config changes (avatar, title, social links) propagate without touching component code

## Non-Goals

- No runtime markdown rendering (build-time only)
- No server-side rendering
- No database or CMS
- No search functionality
