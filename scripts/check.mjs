#!/usr/bin/env node
/**
 * Full local verification, the one command CI and humans share:
 *
 *   1. type check        (islands/tsc --noEmit)
 *   2. islands build     (Vite -> hugo/static/islands + manifest)
 *   3. Hugo build        (hugo --minify --source hugo)
 *   4. link check        (every local href/src in hugo/public resolves)
 *   5. island budget     (reports gzipped homepage island JS)
 *
 * Build order matters: Hugo reads the Vite manifest to emit hashed script tags.
 *
 * `SITE_OUT_DIR=.cache/verify pnpm check` writes the site elsewhere, which is
 * useful while `pnpm dev:hugo` is running (it also renders into hugo/public).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const outDirOverride = process.env.SITE_OUT_DIR
  ? resolve(root, process.env.SITE_OUT_DIR)
  : null;
const publicDir = outDirOverride ?? join(root, "hugo", "public");
const destinationArgs = outDirOverride ? ["--destination", publicDir] : [];
const BUDGET_BYTES = 72 * 1024;

const failures = [];
const started = Date.now();

function heading(text) {
  console.log(`\n\x1b[1m${text}\x1b[0m`);
}

function step(name, command, args, cwd = root) {
  heading(`▸ ${name}`);
  const begin = Date.now();
  try {
    execFileSync(process.execPath, [command, ...args], { cwd, stdio: "inherit" });
    console.log(`  ok (${Date.now() - begin} ms)`);
    return true;
  } catch {
    failures.push(name);
    console.error(`  FAILED (${Date.now() - begin} ms)`);
    return false;
  }
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Type check
// ---------------------------------------------------------------------------
const typecheckOk = step("type check (tsc --noEmit)", join(root, "scripts", "islands.mjs"), ["typecheck"]);

// ---------------------------------------------------------------------------
// 2. Islands build
// ---------------------------------------------------------------------------
const islandsOk = step("islands build (vite)", join(root, "scripts", "islands.mjs"), ["build"]);

// ---------------------------------------------------------------------------
// 3. Hugo build
// ---------------------------------------------------------------------------
const hugoOk = step("hugo build (--minify)", join(root, "scripts", "hugo.mjs"), [
  "--minify",
  "--cleanDestinationDir",
  ...destinationArgs,
  "--source",
  "hugo",
  "--logLevel",
  "warn",
]);

// ---------------------------------------------------------------------------
// 4. Link check
// ---------------------------------------------------------------------------
heading("▸ link check");

function isSkippable(url) {
  const value = url.trim();
  if (!value) return true;
  if (value.startsWith("#")) return true;
  if (value.startsWith("{{") || value.includes("${")) return true;
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value);
}

function resolveTarget(pageFile, url) {
  const clean = decodeURIComponent(url.split("#")[0].split("?")[0]);
  if (!clean) return null;
  const base = clean.startsWith("/") ? publicDir : dirname(pageFile);
  const relative = clean.startsWith("/") ? clean.slice(1) : clean;
  let target = resolve(base, relative);
  if (target.endsWith("\\") || target.endsWith("/")) target = join(target, "index.html");
  if (existsSync(target)) {
    const stat = statSync(target);
    if (stat.isDirectory()) target = join(target, "index.html");
  }
  if (!existsSync(target) && !extname(target)) {
    const withIndex = join(target, "index.html");
    if (existsSync(withIndex)) return withIndex;
  }
  return target;
}

const attrPattern = /\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
let checkedLinks = 0;
const broken = [];

if (!existsSync(publicDir)) {
  failures.push("link check (no hugo/public)");
  console.error("  hugo/public does not exist");
} else {
  for (const file of walk(publicDir).filter((candidate) => candidate.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    for (const match of html.matchAll(attrPattern)) {
      const url = match[1] ?? match[2] ?? match[3] ?? "";
      if (isSkippable(url)) continue;
      checkedLinks += 1;
      const target = resolveTarget(file, url);
      if (target && !existsSync(target)) {
        broken.push(`${file.slice(publicDir.length + 1)} -> ${url}`);
      }
    }
  }

  if (broken.length > 0) {
    failures.push(`link check (${broken.length} broken)`);
    console.error(`  ${broken.length} broken link(s):`);
    for (const line of broken.slice(0, 25)) console.error(`    ${line}`);
    if (broken.length > 25) console.error(`    ... and ${broken.length - 25} more`);
  } else {
    console.log(`  ok (${checkedLinks} local links checked)`);
  }
}

// ---------------------------------------------------------------------------
// 5. Translation coverage
// ---------------------------------------------------------------------------
heading("▸ content mirror");

const contentDir = join(root, "hugo", "content");
const mirrorDir = join(root, "hugo", "content-en");
if (existsSync(contentDir)) {
  // Articles are authored once and mirrored into the English content tree by
  // scripts/lib/sync-content.mjs (run before every Hugo build). The counts must
  // match; a mismatch means the mirror is stale or the sync failed.
  const authored = walk(contentDir).filter((file) => file.endsWith(".md")).length;
  const mirrored = existsSync(mirrorDir)
    ? walk(mirrorDir).filter((file) => file.endsWith(".md")).length
    : 0;
  if (authored !== mirrored) {
    failures.push("content mirror");
    console.error(`  mismatch: ${authored} authored file(s), ${mirrored} mirrored file(s)`);
    console.error("  run: node scripts/lib/sync-content.mjs");
  } else {
    console.log(`  ok (${authored} article file(s) shared by both languages)`);
  }
}

// ---------------------------------------------------------------------------
// 6. Island payload report
// ---------------------------------------------------------------------------
heading("▸ island payload");

function gzippedSize(file) {
  return gzipSync(readFileSync(file), { level: 9 }).length;
}

function homepageIslandScripts() {
  // Both languages are homepages now (`/en/`, `/zh/`); the site root is a
  // redirect. Measure the union of the scripts those pages load.
  const homes = [
    join(publicDir, "en", "index.html"),
    join(publicDir, "zh", "index.html"),
    join(publicDir, "index.html"),
  ].filter((file) => existsSync(file));

  const urls = new Set();
  for (const home of homes) {
    const html = readFileSync(home, "utf8");
    for (const match of html.matchAll(/<script[^>]+src="?([^"\s>]*\/islands\/[^"\s>]+)"?[^>]*>/gi)) {
      urls.add(match[1]);
    }
  }
  return [...urls].map((url) => join(publicDir, decodeURIComponent(url).replace(/^\//, "")));
}

const islandScripts = homepageIslandScripts();
let totalIslandBytes = 0;
for (const script of islandScripts) {
  if (!existsSync(script)) {
    failures.push("island payload (missing script)");
    console.error(`  missing script referenced by homepage: ${script}`);
    continue;
  }
  const size = gzippedSize(script);
  totalIslandBytes += size;
  console.log(`  ${(size / 1024).toFixed(1)} KB gzip  ${script.slice(publicDir.length + 1)}`);
}
console.log(
  `  homepage island JS: ${(totalIslandBytes / 1024).toFixed(1)} KB gzip ` +
    `(budget ${(BUDGET_BYTES / 1024).toFixed(0)} KB)`,
);
if (totalIslandBytes > BUDGET_BYTES) {
  console.warn("  WARNING: over the agreed budget — see AGENTS.md §9 before shipping.");
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
heading("summary");
const elapsed = ((Date.now() - started) / 1000).toFixed(1);
if (failures.length > 0) {
  console.error(`✗ check failed in ${elapsed}s: ${failures.join(", ")}`);
  process.exit(1);
}
if (!typecheckOk || !islandsOk || !hugoOk) {
  console.error(`✗ build steps failed in ${elapsed}s`);
  process.exit(1);
}
console.log(`✓ check passed in ${elapsed}s`);
