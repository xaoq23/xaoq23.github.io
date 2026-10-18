#!/usr/bin/env node
/**
 * Resolves the Hugo binary and forwards all arguments to it.
 *
 * Order: $HUGO_BIN -> workspace .tools/hugo -> `hugo` on PATH.
 * `.tools/hugo` exists so a checkout without a system-wide Hugo install can
 * still build; CI installs Hugo via actions-hugo and uses PATH.
 *
 * Hugo's temp/cache directories are pinned inside the workspace: on Windows
 * the OS temp directory is not always writable, and keeping caches local also
 * makes builds hermetic.
 */
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const tmpDir = join(root, ".cache", "tmp");
const cacheDir = join(root, ".cache", "hugo");
mkdirSync(tmpDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

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

const result = spawnSync(bin, process.argv.slice(2), {
  stdio: "inherit",
  cwd: root,
  env: {
    ...process.env,
    TEMP: tmpDir,
    TMP: tmpDir,
    HUGO_CACHEDIR: cacheDir,
  },
});
process.exit(result.status ?? 1);
