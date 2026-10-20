#!/usr/bin/env node
/**
 * Full local verification, the one command CI and humans share:
 *
 *   1. Hugo build        (mirrors content/ first, then renders both languages)
 *   2. link check        (every local href/src in the public directory resolves)
 *   3. content mirror    (authored and mirrored file counts match)
 *   4. client-side       (no islands / framework bundles are referenced)
 *
 * `SITE_OUT_DIR=.cache/verify node scripts/check.mjs` writes the site
 * elsewhere, which is useful while `pnpm dev:hugo` is running.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outDirOverride = process.env.SITE_OUT_DIR
  ? resolve(root, process.env.SITE_OUT_DIR)
  : null;
const publicDir = outDirOverride ?? join(root, "hugo", "public");
const destinationArgs = outDirOverride ? ["--destination", publicDir] : [];

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
// 1. Hugo build
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
// 2. Link check
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
const htmlFiles = existsSync(publicDir)
  ? walk(publicDir).filter((candidate) => candidate.endsWith(".html"))
  : [];
let checkedLinks = 0;
const broken = [];

if (!existsSync(publicDir)) {
  failures.push("link check (no output directory)");
  console.error(`  ${publicDir} does not exist`);
} else {
  for (const file of htmlFiles) {
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
// 3. Content mirror
// ---------------------------------------------------------------------------
heading("▸ content mirror");

const contentDir = join(root, "hugo", "content");
const mirrorDir = join(root, "hugo", "content-en");
if (existsSync(contentDir)) {
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
// 4. Client-side code
// ---------------------------------------------------------------------------
heading("▸ client-side");

const islandPages = htmlFiles.filter((file) => {
  const html = readFileSync(file, "utf8");
  return html.includes("data-island") || html.includes("/islands/");
});

if (islandPages.length > 0) {
  failures.push("client-side (islands found)");
  console.error(`  ${islandPages.length} page(s) still reference island markup:`);
  for (const file of islandPages.slice(0, 10)) {
    console.error(`    ${file.slice(publicDir.length + 1)}`);
  }
} else {
  console.log("  ok (no islands or framework bundles referenced)");
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
if (!hugoOk) {
  console.error(`✗ build step failed in ${elapsed}s`);
  process.exit(1);
}
console.log(`✓ check passed in ${elapsed}s`);
