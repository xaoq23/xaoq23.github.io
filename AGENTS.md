# AGENTS.md

Bilingual personal blog. Hugo generates every page and all static HTML; there
is **no client-side framework**, no islands and no client-side routing.
Deployed to GitHub Pages via Actions.

Read this file before making changes. If a rule here conflicts with a request,
surface the conflict instead of silently breaking the architecture.

Production URL: <https://xaoq23.github.io/> (user site, no subpath).

The site is **bilingual in its chrome**: Chinese is the default language at
`/zh/`, English is served from `/en/`. They are peers; Hugo's default-language
redirect sends the repo root `/` to `/zh/`. Articles are written once and
rendered by both languages — there is no per-article translation work.

---

## 1. Stack

| Layer           | Choice                                              |
| --------------- | --------------------------------------------------- |
| Site generator  | Hugo extended >= 0.140 (CI pins 0.168.0)             |
| Theme base      | Blowfish v3.9.0, vendored and modified in place      |
| Styling         | Hugo Pipes + `tokens.css`; theme Tailwind precompiled |
| Scripts         | Node 22 for check/dev wrappers only, no dependencies |
| CI/CD           | GitHub Actions -> GitHub Pages                       |

There are **no npm dependencies**. pnpm is only a convenient script runner; CI
calls the Node scripts directly. Do not reintroduce React, Vite, TypeScript or
any other client-side framework.

---

## 2. Architecture contract (non-negotiable)

**Hugo owns everything.** Routing, layouts, Markdown rendering, SEO/meta tags,
navigation, footer, article body, feeds, sitemap, syntax highlighting and all
page interactivity that can be expressed in HTML/CSS.

Rules:
- No client-side framework, no hydration, no client-side router.
- No `data-island` containers, no Vite manifest, no framework bundles.
- Every page must be fully readable with JavaScript disabled.
- Prefer HTML/CSS solutions (links, `:hover`, `:focus-visible`, `<details>`,
  `scroll-behavior`, form-free filtering) over JavaScript.
- A small amount of vanilla JS is allowed only for progressive enhancement
  that HTML/CSS cannot provide. It must be readable, dependency-free and
  degrade gracefully.
- `pnpm check` fails if generated HTML still references island or framework
  code.

---

## 2b. Bilingual contract

- **Languages.** `zh` is the default (`languageCode = "zh-CN"`, served at
  `/zh/`); `en` (`languageCode = "en-US"`) is served from `/en/`. Neither
  language owns the root: `defaultContentLanguageInSubdir = true`, and Hugo
  emits the `/` → `/zh/` redirect automatically. Do not add a hand-written
  root page or move a language back to the root.
- **Content.** Articles are written **once**, in `hugo/content/`, in whatever
  language they are authored in. `scripts/lib/sync-content.mjs` mirrors that
  tree into `hugo/content-en/` before every Hugo run, and Hugo pairs the two
  trees by relative path. Never create `.en.md`/`.zh.md` pairs and never edit
  `hugo/content-en/` (it is generated and gitignored).
- **UI copy.** Never hardcode user-facing strings in templates. Add the key to
  both `hugo/i18n/en-US.yaml` and `hugo/i18n/zh-CN.yaml` and call `i18n`.
  **Filenames follow `languageCode`, not the language key** — Hugo resolves
  translations by language code, so a `zh.yaml` file is silently ignored.
- **Per-language copy.** Titles, descriptions, hero text, author bio and date
  format live in `[languages.<lang>.params]` in `hugo/hugo.toml`. Language
  params are merged over shared `[params]`, so shared values (name, email,
  links) are declared once.
- **Dates.** Format with `site.Params.dateFormat` and keep an ISO value in the
  `<time datetime>` attribute.
- **Links.** Use `relLangURL` for internal links so both languages keep their
  prefixes. Never hardcode `/en/` or `/zh/` in templates.
- **Discovery.** The header language switcher and `hreflang` alternates work
  because both content trees contain the same relative paths; Hugo pairs them
  automatically. Do not break that by renaming files in only one tree.

---

## 3. Repository layout

```
.
├── hugo/
│   ├── content/                 # articles, authored once (no language suffix)
│   ├── content/ai-daily/        # generated daily AI digest (one file per day)
│   ├── content-en/              # generated mirror — never edit or commit
│   ├── i18n/                    # en-US.yaml / zh-CN.yaml (UI copy)
│   ├── layouts/                 # project templates; overrides theme layouts
│   │   ├── _default/            # baseof, single, list
│   │   └── partials/            # extend-head, favicons, pagination
│   ├── assets/
│   │   ├── css/tokens.css       # SINGLE SOURCE of design tokens
│   │   ├── css/main.css         # site styles; tokens only, no raw values
│   │   └── img/portrait.png     # homepage portrait (fingerprinted)
│   ├── static/404.html          # bilingual root 404 for GitHub Pages
│   ├── themes/blowfish/         # vendored theme (v3.9.0), modified in place
│   └── hugo.toml
├── scripts/                     # hugo/dev-hugo/check wrappers
│   ├── ai_daily.py              # RSS crawler -> content/ai-daily/YYYY-MM-DD.md
│   ├── requirements.txt         # crawler dependency (feedparser)
│   └── lib/sync-content.mjs     # content/ -> content-en/ mirror
├── assert/img.png               # source image for icons + portrait
├── .github/workflows/deploy.yml
├── package.json
└── AGENTS.md
```

- Design tokens live only in `hugo/assets/css/tokens.css`. Never duplicate
  colour/spacing values in templates or other stylesheets.
- Prefer overriding files under `hugo/layouts/`; edit `hugo/themes/blowfish/`
  only when the change is genuinely theme-wide.
- The vendored theme's Tailwind CSS is **precompiled**. New utility classes
  used in Hugo templates will not exist unless the theme CSS is rebuilt, so
  write new Hugo-facing styles with the tokens above instead of inventing
  Tailwind classes.

---

## 4. Commands

```bash
# Local dev server (mirrors content on change)
pnpm dev:hugo                  # http://localhost:1313

# Production build
pnpm build                     # hugo --minify --cleanDestinationDir --source hugo

# Full local verification (must pass before pushing)
pnpm check
```

There is nothing to install: the repository has no npm dependencies. `pnpm` is
optional — the equivalent commands are `node scripts/dev-hugo.mjs`,
`node scripts/hugo.mjs --minify --cleanDestinationDir --source hugo` and
`node scripts/check.mjs`.

`pnpm check` runs: Hugo build (mirrors `content/` first) → link check over the
output directory → content-mirror sanity check → client-side check (no island
or framework code). CI runs the same script.

`make check` / `make build` / `make dev` are thin wrappers; the Node scripts are
the source of truth.

`scripts/hugo.mjs` resolves Hugo from `$HUGO_BIN`, then `.tools/hugo/`, then
`PATH`, and pins Hugo's temp/cache directories under `.cache/`.

---

## 5. Design tokens and visual rules

Style direction: **modern technical editorial**. Neutral gray scale, one
high-saturation accent, generous whitespace, restrained motion.

`hugo/assets/css/tokens.css` is the source of truth. It defines, among others:

- `--font-sans` (Inter + CJK fallbacks), `--font-mono` (JetBrains Mono)
- `--text-base` / `--text-scale`; sizes are derived with `calc()`
- `--leading-body`, `--leading-snug`, `--leading-tight`
- `--measure` (44rem reading column), `--measure-wide`, `--text-hero`
- `--space-unit` (8px) and `--space-1 … --space-16`
- light palette (`--color-bg`, `--color-fg`, `--color-muted`,
  `--color-border`, `--color-accent`, `--color-code-bg`, …)
- dark palette, applied through `html.dark` **and** `html[data-theme="dark"]`
- a "theme bridge" that re-maps Blowfish's RGB triplets
  (`--color-neutral-*`, `--color-primary-*`) onto the same palette

Hard rules:
- All spacing is a multiple of 8px. No arbitrary pixel values.
- Body text 17–18px, line-height 1.7–1.8, content width 680–760px.
- Sans-serif body, mono for code, at most one display font for headings.
- Dark mode is required. The contract is `data-theme` on `<html>` plus
  `localStorage`. Blowfish owns the toggle UI and writes `html.dark`; a small
  vanilla script in `partials/extend-head.html` mirrors that onto
  `data-theme`.
- No layout shift on load: images carry width/height; there is no hydration
  step.
- New colours or spacing values go into `tokens.css`, never inline.

---

## 6. Client-side JavaScript rules

Default answer: **write no JavaScript.**

- If a feature needs interactivity, try HTML/CSS first: `<details>`,
  `:target`, `:focus-within`, CSS transitions, form-free anchors.
- If JavaScript is unavoidable, use plain vanilla ES modules in
  `hugo/assets/js/`, loaded through Hugo Pipes (`js.Build` / `fingerprint`), and
  only on pages that need it.
- No frameworks, no hydration, no client-side router, no global store.
- Keep the script small, accessible (keyboard/focus, `aria-*`) and respectful
  of `prefers-reduced-motion`.
- Never reintroduce `data-island`, Vite manifests or an `islands/` project.

---

## 7. Content conventions

- Posts: `hugo/content/posts/YYYY/MM/slug.md` — **one file per article**, in
  whichever language it is written. Never add `.en.md`/`.zh.md` copies.
- Section indexes are `_index.md` in the same way; the English mirror is
  generated automatically.
- Front matter (YAML): `title`, `date`, `lastmod`, `tags`, `categories`,
  `summary`, `draft`, optional `cover`. The same title/summary is shown by both
  language sites, so write them for the article, not for a locale.
- Every post needs a `summary`; it feeds listing pages.
- `hugo/content/ai-daily/YYYY-MM-DD.md` is generated by
  `scripts/ai_daily.py` and committed by the daily workflow. Do not rename the
  files; rerunning the script for an existing date is skipped unless `--force`
  is passed. The section index `ai-daily/_index.md` is hand-written.
- Image assets go under `hugo/content/posts/.../<slug>/` as page bundles; the
  mirror copies them too.
- Never hand-edit `hugo/public/`, `hugo/content-en/`, or any generated file.

---

## 8. Deployment

- `main` is the only deploy branch. Push to `main` triggers
  `.github/workflows/deploy.yml`.
- `.github/workflows/daily-ai.yml` runs on a schedule (`0 0 * * *` UTC =
  08:00 Asia/Shanghai) and on manual dispatch. It installs `feedparser`, runs
  `scripts/ai_daily.py`, commits `hugo/content/ai-daily/` with the
  `github-actions[bot]` identity, then builds and deploys **in the same
  workflow**. Commits pushed with `GITHUB_TOKEN` do not trigger other
  workflows, so do not "simplify" this by relying on the push trigger.
- A run with no new links writes no file and skips the deploy.
- Workflow order for both: checkout -> setup Node/Python -> setup Hugo ->
  `node scripts/check.mjs` -> configure Pages -> upload `hugo/public` -> deploy.
- A red `pnpm check` stops the deploy. Do not bypass it.
- Pages source must be set to **GitHub Actions** in repo settings.
- `baseURL` in `hugo.toml` must exactly match the production URL, including any
  subpath. This is a user site (`xaoq23.github.io`), so there is no subpath.
- Custom domain is configured via `hugo/static/CNAME` plus a DNS CNAME record.
- `hugo/content-en/` is generated output and is gitignored; CI builds it.

---

## 9. Definition of done

A change is complete only when all of the following hold:

- [ ] `pnpm check` passes locally.
- [ ] `hugo --minify` produces zero warnings for both languages.
- [ ] No island markup, framework bundle or client-side router was introduced.
- [ ] Content mirror is clean: authored and mirrored file counts match, and
      every new UI string exists in both i18n files.
- [ ] Daily digest pages build and their source links are valid; the crawler
      still runs with `python scripts/ai_daily.py --date YYYY-MM-DD --force`.
- [ ] Pages render correctly with JavaScript disabled.
- [ ] Lighthouse mobile: Performance >= 90, Accessibility >= 95.
- [ ] Dark mode checked manually; no flash of wrong theme on reload.
- [ ] New colors or spacing values were added to `tokens.css`, not inline.

---

## 10. Do not

- Do not introduce SSR, a meta-framework, a client-side router or a JS
  framework.
- Do not reintroduce React, Vite, TypeScript build steps or an `islands/`
  project.
- Do not add a runtime CSS-in-JS library.
- Do not commit `node_modules/`, `public/`, `.hugo_build.lock`, `.tools/`,
  `.cache/`, or `hugo/content-en/`.
- Do not hardcode colors, font sizes, or spacing outside `tokens.css`.
- Site icons and the portrait derive from `assert/img.png`; replace the source
  and regenerate rather than hand-editing generated PNG/ICO files.
- Do not upgrade Hugo major versions as part of an unrelated task.

---

## 11. Environment notes

- Hugo is not installed system-wide on the author's machine; the binary lives
  in `.tools/hugo/` (gitignored). CI installs it via `peaceiris/actions-hugo`.
- `scripts/hugo.mjs` pins Hugo's temp/cache directories under `.cache/` because
  the OS temp directory is not always writable on Windows.
- There are no npm dependencies, so no install step is needed. pnpm only runs
  the scripts; CI invokes Node directly.

---

## 12. Current state / known gaps

Implemented: vendored theme + project overrides, token-driven CSS, bilingual
chrome as peer subpaths (English at `/en/`, Chinese at `/zh/`, root redirect to
`/zh/`) with single-source articles mirrored into `hugo/content-en/`, custom
homepage with the 「全球编程能力下降一万倍，只有我保持不变？！」 hero and a
fingerprinted portrait, editorial post list, pagination, localized dates,
language switcher + hreflang, bilingual root 404, email
(`2105002580@qq.com`) in the homepage hero, the about pages and Blowfish's
author block, link checking, client-side checks, deploy workflow.

Not implemented: search and tag/year filtering. Both were previously planned as
React islands and were removed with the framework; revisit only with a
dependency-free approach. Tag/category pages use the theme's own term layout.

The AI daily pipeline is live: `scripts/ai_daily.py` writes
`hugo/content/ai-daily/YYYY-MM-DD.md` and `.github/workflows/daily-ai.yml`
commits and deploys it every morning (Asia/Shanghai).
