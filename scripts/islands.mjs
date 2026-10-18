#!/usr/bin/env node
/**
 * Runs the islands toolchain out of `islands/node_modules`.
 *
 * Usage:
 *   node scripts/islands.mjs typecheck
 *   node scripts/islands.mjs build
 *   node scripts/islands.mjs dev
 *
 * The binaries are invoked directly instead of through `pnpm --dir` so the
 * command works identically on Windows (where pnpm's shims and project config
 * resolution are fragile) and on CI.
 */
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const pkgDir = join(root, "islands");
const task = process.argv[2];
const extra = process.argv.slice(3);

const bins = {
  typecheck: join(pkgDir, "node_modules", "typescript", "bin", "tsc"),
  build: join(pkgDir, "node_modules", "vite", "bin", "vite.js"),
  dev: join(pkgDir, "node_modules", "vite", "bin", "vite.js"),
};

const argsByTask = {
  typecheck: ["--noEmit"],
  build: ["build"],
  dev: ["build", "--watch", "--mode", "development"],
};

if (!task || !(task in bins)) {
  console.error("Usage: node scripts/islands.mjs <typecheck|build|dev>");
  process.exit(1);
}

if (!existsSync(bins[task])) {
  console.error(`Missing ${bins[task]}.\nRun: pnpm --dir islands install`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [bins[task], ...argsByTask[task], ...extra], {
  cwd: pkgDir,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
