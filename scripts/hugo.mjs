#!/usr/bin/env node
/**
 * Runs Hugo with this project's configuration and forwards all arguments.
 *
 * Resolution order: $HUGO_BIN -> workspace .tools/hugo -> `hugo` on PATH.
 * `.tools/hugo` exists so a checkout without a system-wide Hugo install can
 * still build; CI installs Hugo via actions-hugo and uses PATH.
 *
 * Configuration: `hugo.toml` is the single config file. Hugo merges config
 * files table-by-table, so `languages.en` would replace `languages.zh`
 * wholesale when both files define the same language — that is why language
 * identity and chrome (locale, contentDir, weight, menus, params) all live in
 * `hugo/hugo.toml`.
 *
 * Before every invocation the authored content is mirrored into the generated
 * English content directory (`hugo/content-en/`), because articles are written
 * once and rendered by both languages.
 *
 * Extra arguments placed after `--` are forwarded untouched, e.g.:
 *   node scripts/hugo.mjs -- --disableFastRender
 */
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { syncContent } from "./lib/sync-content.mjs";

const root = resolve(import.meta.dirname, "..");
const tmpDir = join(root, ".cache", "tmp");
const cacheDir = join(root, ".cache", "hugo");
mkdirSync(tmpDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

syncContent();

const CONFIG = "hugo.toml";

const candidates = [
  process.env.HUGO_BIN,
  join(root, ".tools", "hugo", "hugo.exe"),
  join(root, ".tools", "hugo", "hugo"),
  "hugo",
].filter(Boolean);

const bin = candidates.find((candidate) => candidate === "hugo" || existsSync(candidate));

if (!bin) {
  console.error("Hugo not found. Install Hugo extended >= 0.140, set HUGO_BIN, or place it in .tools/hugo/.");
  process.exit(1);
}

const args = process.argv.slice(2);
if (!args.includes("--config")) {
  args.push("--config", CONFIG);
}

const result = spawnSync(bin, args, {
  stdio: "inherit",
  cwd: root,
  env: {
    ...process.env,
    TEMP: tmpDir,
    TMP: tmpDir,
    HUGO_CACHEDIR: cacheDir,
    // Keep `now` in the author's timezone so today's AI digest check is stable
    // on CI (UTC) and locally.
    TZ: "Asia/Shanghai",
  },
});
process.exit(result.status ?? 1);
